import {
  streamText,
  generateText,
  CoreMessage,
} from "ai"
import { pickBy } from "lodash"
import { useQuasar } from "quasar"
import { ref, Ref } from "vue"
import { useI18n } from "vue-i18n"

import { useCallApi } from "@/shared/composables"
import { useStorage } from "@/shared/composables/storage/useStorage"
import { getFileUrl } from "@/shared/composables/storage/utils"
import { useUserPerfsStore } from "@/shared/store"
import { ConvertArtifactOptions, Plugin, PluginApi } from "@/shared/types"
import { genId, mimeTypeMatch } from "@/shared/utils/functions"
import sessions from "@/shared/utils/sessions"
import { ExtractArtifactResult } from "@/shared/utils/template/templates"

import { useCreateArtifact } from "@/features/artifacts/composables/useCreateArtifact"
import { getAssistantModelSettings } from "@/features/assistants/utils/assistantUtils"
import { useDialogsStore } from "@/features/dialogs/store"
import { AssistantMessageContent } from "@/features/dialogs/types"
import { storedItemResultContent } from "@/features/dialogs/utils/dialogMessageUtils"

import {
  generateTitle,
  generateArtifactName,
  generateExtractArtifact,
} from "@/services/ai/llm/utils"
import {
  AssistantMapped,
  DialogMessageMapped,
  MessageContentMapped,
  MessageContentResult,
  StoredItemMapped,
} from "@/services/data/supabase/types"

import { useAssistantTools } from "./useAssistantTools"
import { useDialogMessages } from "./useDialogMessages"
import { useDialogModel } from "./useDialogModel"

export const useLlmDialog = (
  workspaceId: Ref<string>,
  dialogId: Ref<string>,
  assistant: Ref<AssistantMapped>
) => {
  const dialogsStore = useDialogsStore()
  const { createArtifact } = useCreateArtifact(workspaceId)

  const { data: perfs } = useUserPerfsStore()
  const { t, locale } = useI18n()
  const $q = useQuasar()
  const { dialog, updateMessage, addMessage, dialogItems, switchActiveMessage, getMessageContents } = useDialogMessages(dialogId)

  const { model, sdkModel, systemSdkModel } = useDialogModel(dialog, assistant)
  const { callApi } = useCallApi(workspaceId, dialogId)
  const storage = useStorage()
  const { getAssistantTools } = useAssistantTools(assistant, workspaceId, dialogId)
  const isStreaming = ref(false)

  const genTitle = async (contents: Readonly<MessageContentMapped[]>) => {
    try {
      const title = await generateTitle(
        systemSdkModel.value,
        contents,
        locale.value
      )
      await dialogsStore.updateDialog({ id: dialogId.value, name: title })

      return title
    } catch (e) {
      console.error(e)
      $q.notify({ message: t("dialogView.summarizeFailed"), color: "negative" })
    }
  }

  const genArtifactName = async (content: string, lang?: string) => {
    const name = await generateArtifactName(systemSdkModel.value, content, lang)

    return name
  }

  const extractArtifact = async (
    message: DialogMessageMapped,
    text: string,
    pattern,
    options: ConvertArtifactOptions
  ) => {
    const name = options.name || (await genArtifactName(text, options.lang))
    const id = await createArtifact({
      name,
      language: options.lang,
      versions: [
        {
          date: new Date().toISOString(),
          text,
        },
      ],
      tmp: text,
    })

    if (options.reserveOriginal) return

    const to = `> ${t("dialogView.convertedToArtifact")}: <router-link to="?openArtifact=${id}">${name}</router-link>\n`
    const index = message.message_contents.findIndex((c) =>
      ["assistant-message", "user-message"].includes(c.type)
    )

    await updateMessage(message.id, {
      message_contents: message.message_contents.map((c, i) =>
        i === index
          ? { ...c, text: c.text.replace(pattern, to) }
          : c
      ),
    })
  }

  async function autoExtractArtifact(
    message: DialogMessageMapped,
    contents: MessageContentMapped[]
  ) {
    const text = await generateExtractArtifact(systemSdkModel.value, contents)
    const object: ExtractArtifactResult = JSON.parse(text)

    if (!object.found) return

    const reg = new RegExp(`(\`{3,}.*\\n)?(${object.regex})(\\s*\`{3,})?`)
    const content = message.message_contents.find(
      (c) => c.type === "assistant-message"
    )
    const match = content.text.match(reg)

    if (!match) return

    await extractArtifact(message, match[2], reg, {
      name: object.name,
      lang: object.language,
      reserveOriginal: perfs.artifactsReserveOriginal,
    })
  }

  /**
   * Sets up a new message for LLM response streaming
   * Creates the assistant message and empty user message
   *
   * @param targetId - ID of the target message to respond to
   * @returns Object containing message ID, content and content array
   */
  async function setupMessageForStreaming(targetId: string) {
    // In case the last message is in "inputing" status
    if (targetId) {
      await updateMessage(targetId, {
        status: "default",
      })
    }

    // Create initial message content
    const messageContent: AssistantMessageContent = {
      type: "assistant-message",
      text: "",
    }
    const contents: MessageContentMapped[] = [messageContent]

    // Add assistant message
    const { id } = await addMessage(
      targetId,
      {
        type: "assistant",
        assistant_id: assistant.value.id,
        message_contents: contents,
        status: "pending",
        generating_session: sessions.id,
        model_name: model.value.name,
      },
    )

    // In case of "regenerate action"
    if (targetId) {
      await switchActiveMessage(id)
    }

    // Add empty user message
    await addMessage(id, {
      type: "user",
      message_contents: [
        {
          type: "user-message",
          text: "",
          stored_items: [],
        },
      ],
      status: "inputing",
    })

    return { id, messageContent, contents }
  }

  /**
   * Creates an update function for a specific message
   *
   * @param id - ID of the message to update
   * @returns Function that updates the message with given content
   */
  function createMessageUpdater(id: string) {
    return async (contentUpdate: Partial<DialogMessageMapped> = {}) => {
      await updateMessage(id, contentUpdate)
    }
  }

  /**
   * Handles a tool call from the LLM
   *
   * @param plugin - Plugin to call
   * @param api - API to invoke
   * @param args - Arguments for the API call
   * @param contents - Current message contents
   * @param updateFn - Function to update the message
   * @returns Result of the tool call
   */
  async function handleToolCall(
    plugin: Plugin,
    api: PluginApi,
    args: any,
    contents: MessageContentMapped[],
    updateFn: (update?: Partial<DialogMessageMapped>) => Promise<void>
  ) {
    // Create tool content
    const content: MessageContentMapped = {
      type: "assistant-tool",
      plugin_id: plugin.id,
      name: api.name,
      args,
      status: "calling",
    }

    // Add to message
    contents.push(content)
    await updateFn({ message_contents: contents })

    // Call API
    const { result: apiResult, error } = await callApi(plugin, api, args)
    const storedItems = await storage.saveApiResultItems(
      apiResult,
      { dialog_id: dialogId.value }
    )

    content.stored_items = storedItems

    // Handle result or error
    if (error) {
      content.status = "failed"
      content.error = error
    } else {
      content.status = "completed"
      // Save result based on stored items without arrayBuffer
      const contentResult = storedItems.map((i) => {
        const { type, mime_type, content_text, file_url } = i

        return pickBy(
          { type, mime_type, content_text, file_url },
          (v) => v !== undefined
        ) as MessageContentResult
      })
      content.result = contentResult
    }

    await updateFn({ message_contents: contents })

    return { result: apiResult, error }
  }

  /**
   * Processes a streaming response from the LLM
   *
   * @param params - Parameters for the streamText function
   * @param id - ID of the message
   * @param messageContent - Content of the assistant message
   * @param contents - All message contents
   * @param updateFn - Function to update the message
   * @returns Stream text result
   */
  async function processStreamingResponse(
    params: any,
    id: string,
    messageContent: AssistantMessageContent,
    contents: MessageContentMapped[],
    updateFn: (update?: Partial<DialogMessageMapped>) => Promise<void>
  ) {
    // Start streaming
    const result = streamText(params)
    await updateFn({ status: "streaming" })

    // Process stream chunks
    for await (const part of result.fullStream) {
      if (part.type === "text-delta") {
        messageContent.text += part.textDelta
        await updateFn({ message_contents: contents })
      } else if (part.type === "reasoning") {
        messageContent.reasoning =
          (messageContent.reasoning ?? "") + part.textDelta
        await updateFn({ message_contents: contents })
      } else if (part.type === "error") {
        throw part.error
      }
    }

    return result
  }

  /**
   * Processes a non-streaming response from the LLM
   *
   * @param params - Parameters for the generateText function
   * @param messageContent - Content of the assistant message
   * @returns Generate text result
   */
  async function processNonStreamingResponse(
    params: any,
    messageContent: AssistantMessageContent
  ) {
    const result = await generateText(params)
    messageContent.text = result.text
    messageContent.reasoning = result.reasoning

    return result
  }

  /**
   * Finalizes a successful response
   *
   * @param id - ID of the message
   * @param contents - All message contents
   * @param result - Result from the LLM
   * @param updateFn - Function to update the message
   */
  async function finalizeResponse(
    id: string,
    contents: MessageContentMapped[],
    result: any,
    updateFn: (update?: Partial<DialogMessageMapped>) => Promise<void>
  ) {
    const usage = await result.usage
    const warnings = (await result.warnings).map((w) =>
      w.type === "unsupported-setting" || w.type === "unsupported-tool"
        ? w.details
        : w.message
    )

    await updateFn({
      message_contents: contents,
      status: "default",
      generating_session: null,
      warnings,
      usage,
    })
  }

  /**
   * Handles post-response actions like artifact extraction and title generation
   *
   * @param message - The message to process
   */
  async function handlePostResponseActions(message: DialogMessageMapped) {
    // Auto extract artifacts if enabled
    if (perfs.artifactsAutoExtract) {
      await autoExtractArtifact(message, getMessageContents(-3, -1))
    }

    // Auto generate title if enabled and it's a new dialog
    if (perfs.autoGenTitle && dialogItems.value.length === 4) {
      await genTitle(getMessageContents())
    }
  }

  /**
   * Handles errors during streaming
   *
   * @param id - ID of the message
   * @param contents - All message contents
   * @param error - The error that occurred
   * @param updateFn - Function to update the message
   */
  async function handleStreamingError(
    id: string,
    contents: MessageContentMapped[],
    error: any,
    updateFn: (update?: Partial<DialogMessageMapped>) => Promise<void>
  ) {
    console.error(error)
    await updateFn({
      message_contents: contents,
      error: error.message || error.toString(),
      status: "failed",
      generating_session: null,
    })
  }

  /**
   * Streams the LLM response for a given target message.
   * Handles the entire streaming process including message creation,
   * tool invocation, and updating message status.
   *
   * @param targetId - ID of the target message to respond to
   * @param abortController - Optional controller to abort the streaming
   */
  async function streamLlmResponse(
    targetId: string,
    abortController: AbortController | null = null
  ) {
    let id: string
    let messageContent: AssistantMessageContent
    let contents: MessageContentMapped[]

    isStreaming.value = true

    try {
      // Step 1: Setup message
      ({ id, messageContent, contents } = await setupMessageForStreaming(targetId))
      const updateFn = createMessageUpdater(id)

      // Step 2: Setup tools
      const toolCallHandler = (plugin, api, args) =>
        handleToolCall(plugin, api, args, contents, updateFn)

      const { noRoundtrip, tools, systemPrompt } =
        await getAssistantTools(toolCallHandler)

      // Step 3: Prepare model parameters
      const settings = getAssistantModelSettings(
        assistant.value,
        noRoundtrip ? { maxSteps: 1 } : {}
      )

      const messages = getChainMessages()

      if (systemPrompt) {
        messages.unshift({
          role: assistant.value.prompt_role,
          content: systemPrompt,
        })
      }

      const params = {
        model: sdkModel.value,
        messages,
        tools,
        ...settings,
        abortSignal: abortController?.signal,
      }

      // Step 4: Process response (streaming or not)
      let result

      if (assistant.value.stream) {
        result = await processStreamingResponse(
          params, id, messageContent, contents, updateFn
        )
      } else {
        result = await processNonStreamingResponse(params, messageContent)
        await updateFn({ message_contents: contents })
      }

      // Step 5: Finalize response
      await finalizeResponse(id, contents, result, updateFn)

      // Step 6: Handle post-response actions
      const message = dialogItems.value.at(-2).message // last non-inputing = NOT EMPTY message
      await handlePostResponseActions(message)
    } catch (error) {
      // Handle errors
      await handleStreamingError(id, contents, error, createMessageUpdater(id))
    } finally {
      isStreaming.value = false
    }
  }

  /**
   * Gets relevant dialog items based on context window and filters out inputing messages
   * @returns Flattened array of message contents
   */
  function getRelevantDialogItems(): MessageContentMapped[] {
    return dialogItems.value
      .slice(-assistant.value.context_num || 0)
      .filter((item) => item.message.status !== "inputing")
      .map((item) => item.message.message_contents)
      .flat()
  }

  /**
   * Processes text-based stored items (file, quote, or plain text)
   * @param item The stored item to process
   * @returns Processed text item or null
   */
  function processTextItem(item: StoredItemMapped) {
    if (item.type === "file") {
      return {
        type: "text" as const,
        text: `<file_content filename="${item.name}">\n${item.content_text}\n</file_content>`,
      }
    } else if (item.type === "quote") {
      return {
        type: "text" as const,
        text: `<quote name="${item.name}">${item.content_text}</quote>`,
      }
    } else {
      return { type: "text" as const, text: item.content_text }
    }
  }

  /**
   * Processes non-text stored items (images, files)
   * @param item The stored item to process
   * @returns Processed media item or null if not supported
   */
  function processNonTextItem(item: StoredItemMapped) {
    if (!mimeTypeMatch(item.mime_type, model.value.inputTypes.user)) {
      return null
    } else if (item.mime_type.startsWith("image/")) {
      return {
        type: "image" as const,
        image: getFileUrl(item.file_url),
        mimeType: item.mime_type,
      }
    } else {
      return {
        type: "file" as const,
        mimeType: item.mime_type,
        data: getFileUrl(item.file_url),
      }
    }
  }

  /**
   * Processes stored items from a message
   * @param storedItems Array of stored items
   * @returns Array of processed items
   */
  function processStoredItems(storedItems: StoredItemMapped[]) {
    return storedItems.map((item) => {
      if (item.content_text != null) {
        return processTextItem(item)
      } else {
        return processNonTextItem(item)
      }
    }).filter(Boolean) // Remove nulls
  }

  /**
   * Processes a user message
   * @param content The message content
   * @returns CoreMessage for the user message
   */
  function processUserMessage(content: MessageContentMapped): CoreMessage {
    return {
      role: "user",
      content: [
        { type: "text", text: content.text },
        ...processStoredItems(content.stored_items),
      ],
    }
  }

  /**
   * Processes an assistant message
   * @param content The message content
   * @returns CoreMessage for the assistant message
   */
  function processAssistantMessage(content: MessageContentMapped): CoreMessage {
    return {
      role: "assistant",
      content: [{ type: "text", text: content.text }],
    }
  }

  /**
   * Processes an assistant tool call and its result
   * @param content The tool call content
   * @returns Array of CoreMessages for the tool call and result
   */
  function processAssistantTool(content: MessageContentMapped): CoreMessage[] {
    if (content.status !== "completed") return []

    const { name, args, result, plugin_id } = content
    const id = genId()

    // Create tool call message
    const toolCallMessage: CoreMessage = {
      role: "assistant",
      content: [
        {
          type: "tool-call",
          toolName: `${plugin_id}-${name}`,
          toolCallId: id,
          args,
        },
      ],
    }

    // Create tool result message
    const resultContent = result.map((i) => storedItemResultContent(i))
    const toolResultMessage: CoreMessage = {
      role: "tool",
      content: [
        {
          type: "tool-result",
          toolName: `${plugin_id}-${name}`,
          toolCallId: id,
          result: resultContent,
        },
      ],
    }

    return [toolCallMessage, toolResultMessage]
  }

  /**
   * Builds a list of messages for the LLM chain from dialog history
   * @returns Array of CoreMessages for the LLM
   */
  function getChainMessages(): CoreMessage[] {
    const messages = getRelevantDialogItems()
    let result: CoreMessage[] = []

    console.log("-----getChainMessages", dialogItems.value, messages)

    for (const content of messages) {
      if (content.type === "user-message") {
        result.push(processUserMessage(content))
      } else if (content.type === "assistant-message") {
        result.push(processAssistantMessage(content))
      } else if (content.type === "assistant-tool") {
        result = result.concat(processAssistantTool(content))
      }
    }

    return result
  }

  return {
    genTitle,
    extractArtifact,
    streamLlmResponse,
    isStreaming,
  }
}

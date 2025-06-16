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
import { Assistant } from "@/services/data/types/assistant"
import { DialogMessageNested, DialogMessageNestedUpdate } from "@/services/data/types/dialogMessage"
import { MessageContentNested, MessageContentNestedUpdate } from "@/services/data/types/messageContents"
import { StoredItem, StoredItemResult } from "@/services/data/types/storedItem"

import { useAssistantTools } from "./useAssistantTools"
import { useDialogMessages } from "./useDialogMessages"
import { useDialogModel } from "./useDialogModel"

export const useLlmDialog = (
  workspaceId: Ref<string>,
  dialogId: Ref<string>,
  assistant: Ref<Assistant>
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

  const genTitle = async (contents: Readonly<MessageContentNested[]>) => {
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
    message: DialogMessageNested,
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
    const index = message.messageContents.findIndex((c) =>
      ["assistant-message", "user-message"].includes(c.type)
    )

    await updateMessage(message.id, {
      messageContents: message.messageContents.map((c, i) =>
        i === index
          ? { ...c, text: c.text.replace(pattern, to) }
          : c
      ),
    })
  }

  async function autoExtractArtifact(
    message: DialogMessageNested,
    contents: MessageContentNested[]
  ) {
    const text = await generateExtractArtifact(systemSdkModel.value, contents)
    const object: ExtractArtifactResult = JSON.parse(text)

    if (!object.found) return

    const reg = new RegExp(`(\`{3,}.*\\n)?(${object.regex})(\\s*\`{3,})?`)
    const content = message.messageContents.find(
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
    const contents: MessageContentNestedUpdate[] = [messageContent]

    // Add assistant message
    const { id, messageContents } = await addMessage(
      targetId,
      {
        type: "assistant",
        assistantId: assistant.value.id,
        messageContents: contents,
        status: "pending",
        generatingSession: sessions.id,
        modelName: model.value.name,
      },
    )

    // In case of "regenerate action"
    if (targetId) {
      await switchActiveMessage(id)
    }

    // Add empty user message
    await addMessage(id, {
      type: "user",
      messageContents: [
        {
          type: "user-message",
          text: "",
        },
      ],
      status: "inputing",
    })

    return { id, messageContent, contents: messageContents }
  }

  /**
   * Creates an update function for a specific message
   *
   * @param id - ID of the message to update
   * @returns Function that updates the message with given content
   */
  function createMessageUpdater(id: string) {
    return async (contentUpdate: Partial<DialogMessageNested> = {}) => {
      console.log("---createMessageUpdater contentUpdate", contentUpdate)
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
    contents: MessageContentNestedUpdate[],
    updateFn: (update?: Partial<DialogMessageNestedUpdate>) => Promise<void>
  ) {
    // Create tool content
    const content: MessageContentNestedUpdate = {
      type: "assistant-tool",
      pluginId: plugin.id,
      name: api.name,
      args,
      status: "calling",
    }

    // Add to message
    contents.push(content)
    await updateFn({ messageContents: contents })

    // Call API
    const { result: apiResult, error } = await callApi(plugin, api, args)
    const storedItems = await storage.saveApiResultItems(
      apiResult,
      { dialogId: dialogId.value }
    )

    content.storedItems = storedItems

    // Handle result or error
    if (error) {
      content.status = "failed"
      content.error = error
    } else {
      content.status = "completed"
      // Save result based on stored items without arrayBuffer
      const contentResult = storedItems.map((i) => {
        const { type, mimeType, contentText, fileUrl } = i

        return pickBy(
          { type, mimeType, contentText, fileUrl },
          (v) => v !== undefined
        ) as StoredItemResult
      })
      content.result = contentResult
    }

    await updateFn({ ...content, messageContents: contents })

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
    contents: MessageContentNested[],
    updateFn: (update?: Partial<DialogMessageNested>) => Promise<void>
  ) {
    // Start streaming
    const result = streamText(params)
    await updateFn({ status: "streaming" })

    // Process stream chunks
    for await (const part of result.fullStream) {
      if (part.type === "text-delta") {
        messageContent.text += part.textDelta
        await updateFn({ messageContents: contents })
      } else if (part.type === "reasoning") {
        messageContent.reasoning =
          (messageContent.reasoning ?? "") + part.textDelta
        await updateFn({ messageContents: contents })
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
    contents: MessageContentNested[],
    result: any,
    updateFn: (update?: Partial<DialogMessageNested>) => Promise<void>
  ) {
    const usage = await result.usage
    const warnings = (await result.warnings).map((w) =>
      w.type === "unsupported-setting" || w.type === "unsupported-tool"
        ? w.details
        : w.message
    )

    await updateFn({
      messageContents: contents,
      status: "default",
      generatingSession: null,
      warnings,
      usage,
    })
  }

  /**
   * Handles post-response actions like artifact extraction and title generation
   *
   * @param message - The message to process
   */
  async function handlePostResponseActions(message: DialogMessageNested) {
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
    contents: MessageContentNested[],
    error: any,
    updateFn: (update?: Partial<DialogMessageNested>) => Promise<void>
  ) {
    console.error(error)
    await updateFn({
      messageContents: contents,
      error: error.message || error.toString(),
      status: "failed",
      generatingSession: null,
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
    let contents: MessageContentNested[]

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
          role: assistant.value.promptRole,
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
        await updateFn({ messageContents: contents })
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
  function getRelevantDialogItems(): MessageContentNested[] {
    return dialogItems.value
      .slice(-assistant.value.contextNum || 0)
      .filter((item) => item.message.status !== "inputing")
      .map((item) => item.message.messageContents as MessageContentNested[])
      .flat()
  }

  /**
   * Processes text-based stored items (file, quote, or plain text)
   * @param item The stored item to process
   * @returns Processed text item or null
   */
  function processTextItem(item: StoredItem) {
    if (item.type === "file") {
      return {
        type: "text" as const,
        text: `<file_content filename="${item.name}">\n${item.contentText}\n</file_content>`,
      }
    } else if (item.type === "quote") {
      return {
        type: "text" as const,
        text: `<quote name="${item.name}">${item.contentText}</quote>`,
      }
    } else {
      return { type: "text" as const, text: item.contentText }
    }
  }

  /**
   * Processes non-text stored items (images, files)
   * @param item The stored item to process
   * @returns Processed media item or null if not supported
   */
  function processNonTextItem(item: StoredItem) {
    if (!mimeTypeMatch(item.mimeType, model.value.inputTypes.user)) {
      return null
    } else if (item.mimeType.startsWith("image/")) {
      return {
        type: "image" as const,
        image: getFileUrl(item.fileUrl),
        mimeType: item.mimeType,
      }
    } else {
      return {
        type: "file" as const,
        mimeType: item.mimeType,
        data: getFileUrl(item.fileUrl),
      }
    }
  }

  /**
   * Processes stored items from a message
   * @param storedItems Array of stored items
   * @returns Array of processed items
   */
  function processStoredItems(storedItems: StoredItem[]) {
    return storedItems.map((item) => {
      if (item.contentText != null) {
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
  function processUserMessage(content: MessageContentNested): CoreMessage {
    return {
      role: "user",
      content: [
        { type: "text", text: content.text },
        ...processStoredItems(content.storedItems),
      ],
    }
  }

  /**
   * Processes an assistant message
   * @param content The message content
   * @returns CoreMessage for the assistant message
   */
  function processAssistantMessage(content: MessageContentNested): CoreMessage {
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
  function processAssistantTool(content: MessageContentNested): CoreMessage[] {
    if (content.status !== "completed") return []

    const { name, args, result, pluginId } = content
    const id = genId()

    // Create tool call message
    const toolCallMessage: CoreMessage = {
      role: "assistant",
      content: [
        {
          type: "tool-call",
          toolName: `${pluginId}-${name}`,
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
          toolName: `${pluginId}-${name}`,
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

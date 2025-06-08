import { useDialogsStore } from "src/stores/dialogs"
import { generateTitle, generateArtifactName, generateExtractArtifact } from "src/services/llm/utils"
import { computed, ref, Ref, toRef } from "vue"
import { useUserPerfsStore } from "src/stores/user-perfs"
import { useGetModel } from "../get-model"
import { useI18n } from "vue-i18n"
import { AssistantMapped, DialogMapped, DialogMessageMapped, MessageContentMapped, MessageContentResult, StoredItemMapped, WorkspaceMapped } from "@/services/supabase/types"
import { useQuasar, throttle } from "quasar"
import { ConvertArtifactOptions, Plugin, PluginApi, PluginPrompt } from "@/utils/types"
import { useCreateArtifact } from "../create-artifact"
import { ExtractArtifactResult, PluginsPrompt } from "src/utils/templates"
import { engine } from "src/utils/template-engine"
import { AssistantMessageContent } from "@/common/types/dialogs"
import sessions from 'src/utils/sessions'
import { useCallApi } from "../call-api"
import { useAssistantTools } from "./useAssistantTools"
import { getAssistantModelSettings } from "src/utils/assistant-utils"
import { streamText, generateText, StreamTextResult, GenerateTextResult, CoreMessage } from "ai"
import { useUserDataStore } from "src/stores/user-data"
import { useStorage } from "src/composables/storage/useStorage"
import { FILES_BUCKET, getFileUrl } from "src/composables/storage/utils"
import { useDialogChain, useDialogModel, useDialogView } from "../useDialogView"
import { pickBy } from "lodash"

export const useLlmDialog = (workspace: Ref<WorkspaceMapped>, dialog: Ref<DialogMapped>, assistant: Ref<AssistantMapped>) => {
  const dialogsStore = useDialogsStore()
  const { createArtifact } = useCreateArtifact(toRef(workspace.value, 'id'))

  const { data: perfs } = useUserPerfsStore()
  const { t, locale } = useI18n()
  const $q = useQuasar()
  const { model, sdkModel, systemSdkModel } = useDialogModel(dialog, assistant)
  const { callApi } = useCallApi(workspace, dialog)
  const storage = useStorage(FILES_BUCKET)
  const { getAssistantTools } = useAssistantTools(assistant, workspace, dialog)
  const isStreaming = ref(false)

  const {
    chain, messageMap, getDialogContents, getChainMessages
  } = useDialogView(dialog, assistant, workspace)

  const genTitle = async (contents: Readonly<MessageContentMapped[]>) => {
    try {
      const title = await generateTitle(systemSdkModel.value, contents, locale.value)
      await dialogsStore.updateDialog({ id: dialog.value.id, name: title })
      return title
    } catch (e) {
      console.error(e)
      $q.notify({ message: t('dialogView.summarizeFailed'), color: 'negative' })
    }
  }

  const genArtifactName = async (content: string, lang?: string) => {
    const name = await generateArtifactName(systemSdkModel.value, content, lang)
    return name
  }

  const extractArtifact = async (message: DialogMessageMapped, text: string, pattern, options: ConvertArtifactOptions) => {
    const name = options.name || await genArtifactName(text, options.lang)
    const id = await createArtifact({
      name,
      language: options.lang,
      versions: [{
        date: new Date().toISOString(),
        text
      }],
      tmp: text
    })
    if (options.reserveOriginal) return
    const to = `> ${t('dialogView.convertedToArtifact')}: <router-link to="?openArtifact=${id}">${name}</router-link>\n`
    const index = message.message_contents.findIndex(c => ['assistant-message', 'user-message'].includes(c.type))

    await dialogsStore.updateDialogMessage(dialog.value.id, message.id, {
      message_contents: message.message_contents.map((c, i) => i === index ? {
        ...c,
        text: c.text.replace(pattern, to)
      } : c)
    })
  }

  async function autoExtractArtifact(message: DialogMessageMapped, contents: MessageContentMapped[]) {
    const text = await generateExtractArtifact(systemSdkModel.value, contents)
    const object: ExtractArtifactResult = JSON.parse(text)
    if (!object.found) return
    const reg = new RegExp(`(\`{3,}.*\\n)?(${object.regex})(\\s*\`{3,})?`)
    const content = message.message_contents.find(c => c.type === 'assistant-message')
    const match = content.text.match(reg)
    if (!match) return
    await extractArtifact(message, match[2], reg, {
      name: object.name,
      lang: object.language,
      reserveOriginal: perfs.artifactsReserveOriginal
    })
  }

  async function stream(target:string | null, insert = false, abortController: AbortController | null = null) {
    if (target) {
      await dialogsStore.updateDialogMessage(dialog.value.id, target, { status: 'default' })
    }
    const messageContent: AssistantMessageContent = {
      type: 'assistant-message',
      text: ''
    }
    const contents: MessageContentMapped[] = [messageContent]

    const { id } = await dialogsStore.addDialogMessage(dialog.value.id, target, {
      type: 'assistant',
      assistant_id: assistant.value.id,
      message_contents: contents,
      status: 'pending',
      generating_session: sessions.id,
      model_name: model.value.name
    }, insert)
    !insert && await dialogsStore.addDialogMessage(dialog.value.id, id, {
      type: 'user',
      message_contents: [{
        type: 'user-message',
        text: '',
        stored_items: []
      }],
      status: 'inputing'
    })

    isStreaming.value = true

    // const update = throttle(() => dialogsStore.updateDialogMessage(props.id, id, { message_contents: contents }), 50)
    const update = async () => await dialogsStore.updateDialogMessage(dialog.value.id, id, { message_contents: contents })

    async function callTool(plugin: Plugin, api: PluginApi, args) {
      const content: MessageContentMapped = {
        type: 'assistant-tool',
        plugin_id: plugin.id,
        name: api.name,
        args,
        status: 'calling'
      }

      contents.push(content)

      await update()

      const { result: apiResult, error } = await callApi(plugin, api, args)
      const storedItems: StoredItemMapped[] = await Promise.all(apiResult.map(r => storage.apiResultItemToStoredItem(r, dialog.value.id)))

      content.stored_items = storedItems
      if (error) {
        content.status = 'failed'
        content.error = error
      } else {
        content.status = 'completed'
        // Save result based on stored items MAPPED without arrayBuffer
        const contentResult = storedItems.map(i => {
          const { type, mime_type, content_text, file_url } = i
          return pickBy({ type, mime_type, content_text, file_url }, (v) => v !== undefined) as MessageContentResult
        })
        content.result = contentResult
      }
      await update()

      // Return RAW API Result WITH arrayBuffer
      return { result: apiResult, error }
    }

    const { noRoundtrip, tools, systemPrompt } = await getAssistantTools(callTool)

    try {
      const settings = getAssistantModelSettings(assistant.value, noRoundtrip ? { maxSteps: 1 } : {})
      const messages = getChainMessages()

      if (systemPrompt) {
        messages.unshift({ role: assistant.value.prompt_role, content: systemPrompt })
      }

      const params = {
        model: sdkModel.value,
        messages,
        tools,
        ...settings,
        abortSignal: abortController?.signal
      }

      let result: StreamTextResult<any, any> | GenerateTextResult<any, any>
      if (assistant.value.stream) {
        result = streamText(params)
        await dialogsStore.updateDialogMessage(dialog.value.id, id, { status: 'streaming' })
        for await (const part of result.fullStream) {
          if (part.type === 'text-delta') {
            messageContent.text += part.textDelta
            await update()
          } else if (part.type === 'reasoning') {
            messageContent.reasoning = (messageContent.reasoning ?? '') + part.textDelta
            await update()
          } else if (part.type === 'error') {
            throw part.error
          }
        }
      } else {
        result = await generateText(params)
        messageContent.text = result.text
        messageContent.reasoning = result.reasoning
      }

      const usage = await result.usage
      const warnings = (await result.warnings).map(w => (w.type === 'unsupported-setting' || w.type === 'unsupported-tool') ? w.details : w.message)
      await dialogsStore.updateDialogMessage(dialog.value.id, id, { message_contents: contents, status: 'default', generating_session: null, warnings, usage })
    } catch (e) {
      console.error(e)
      // if (e.data?.error?.type === 'budget_exceeded') {
      //   $q.notify({
      //     message: t('dialogView.errors.insufficientQuota'),
      //     color: 'err-c',
      //     textColor: 'on-err-c',
      //     actions: [{ label: t('dialogView.recharge'), color: 'on-sur', handler() { router.push('/account') } }]
      //   })
      // }
      await dialogsStore.updateDialogMessage(dialog.value.id, id, { message_contents: contents, error: e.message || e.toString(), status: 'failed', generating_session: null })
    }
    const message = messageMap.value[chain.value.at(-2)]

    perfs.artifactsAutoExtract && autoExtractArtifact(message, getDialogContents(-3, -1))
    perfs.autoGenTitle && chain.value.length === 4 && genTitle(getDialogContents())
    isStreaming.value = false
  }

  return {
    genTitle,
    extractArtifact,
    stream,
    isStreaming
  }
}

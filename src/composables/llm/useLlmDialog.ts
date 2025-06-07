import { useDialogsStore } from "src/stores/dialogs"
import { generateTitle, generateArtifactName, generateExtractArtifact } from "src/services/llm/utils"
import { computed, Ref, toRef } from "vue"
import { useUserPerfsStore } from "src/stores/user-perfs"
import { useGetModel } from "../get-model"
import { useI18n } from "vue-i18n"
import { DialogMapped, DialogMessageMapped, MessageContentMapped, WorkspaceMapped } from "@/services/supabase/types"
import { useQuasar } from "quasar"
import { ConvertArtifactOptions, PluginPrompt } from "@/utils/types"
import { useCreateArtifact } from "../create-artifact"
import { ExtractArtifactResult, PluginsPrompt } from "src/utils/templates"
import { engine } from "src/utils/template-engine"

export const useLlmDialog = (workspace: Ref<WorkspaceMapped>, dialog: Ref<DialogMapped>) => {
  const dialogsStore = useDialogsStore()
  const { createArtifact } = useCreateArtifact(toRef(workspace.value, 'id'))

  const { data: perfs } = useUserPerfsStore()
  const { getModel, getSdkModel } = useGetModel()
  const { t, locale } = useI18n()
  const $q = useQuasar()

  const systemSdkModel = computed(() => getSdkModel(perfs.systemProvider, perfs.systemModel))

  const genTitle = async (contents: MessageContentMapped[]) => {
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

  function getSystemPrompt(pluginPrompts: PluginPrompt[], promptTemplate: string, rolePrompt: string, vars: Record<string, any>) {
    try {
      const prompt = engine.parseAndRenderSync(promptTemplate, {
        ...vars,
        _pluginsPrompt: pluginPrompts.length
          ? engine.parseAndRenderSync(PluginsPrompt, { plugins: pluginPrompts })
          : '',
        _rolePrompt: rolePrompt
      })
      return prompt.trim() ? prompt : undefined
    } catch (e) {
      console.error(e)
      $q.notify({ message: t('dialogView.promptParseFailed'), color: 'negative' })
      throw e
    }
  }

  return {
    genTitle,
    genArtifactName,
    extractArtifact,
    autoExtractArtifact,
    getSystemPrompt
  }
}

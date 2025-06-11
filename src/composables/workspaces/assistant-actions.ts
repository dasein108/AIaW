import { Validator } from "@cfworker/json-schema"
import { useQuasar } from "quasar"
import { defaultModelSettings } from "src/common/consts"
import { useAssistantsStore } from "@/app/store"
import { AssistantDefaultPrompt } from "src/utils/templates"
import { MarketAssistantSchema } from "src/utils/types"
import { toRaw } from "vue"
import { useI18n } from "vue-i18n"

export function useAssistantActions () {
  const assistantsStore = useAssistantsStore()
  const $q = useQuasar()
  const { t } = useI18n()

  function add (item, workspaceId) {
    if (!new Validator(MarketAssistantSchema).validate(item).valid) {
      $q.notify({
        message: t("assistantsMarket.formatError"),
        color: "negative",
      })

      return
    }

    const {
      name,
      avatar,
      prompt,
      promptVars,
      promptTemplate,
      model,
      modelSettings,
      author,
      homepage,
      description,
    } = toRaw(item)
    assistantsStore
      .add({
        name,
        avatar,
        prompt,
        prompt_vars: promptVars ?? [],
        prompt_template: promptTemplate ?? AssistantDefaultPrompt,
        workspace_id: workspaceId,
        model,
        model_settings: modelSettings ?? { ...defaultModelSettings },
        author,
        homepage,
        description,
      })
      .then(() => {
        $q.notify({
          message: t("assistantsMarket.added"),
        })
      })
      .catch((err) => {
        console.error(err)
        $q.notify({
          message: t("assistantsMarket.addError"),
          color: "negative",
        })
      })
  }

  return {
    add,
  }
}

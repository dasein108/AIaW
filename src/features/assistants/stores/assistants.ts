/* eslint-disable camelcase */
import { throttle } from "lodash"
import { defineStore } from "pinia"
import { defaultModelSettings } from "src/common/consts"
import { supabase } from "src/services/supabase/client"
import { ref } from "vue"
import { useI18n } from "vue-i18n"
import { useUserLoginCallback } from "@/features/auth/composables/useUserLoginCallback"
import { AssistantDefaultPrompt } from "@/features/plugins/utils/templates"
import { AssistantMapped, Assistant } from "@/services/supabase/types"
import { defaultAvatar, defaultTextAvatar } from "@/shared/utils/functions"

function mapAssistantTypes (item: Assistant): AssistantMapped {
  const { avatar, ...rest } = item

  return {
    avatar: avatar ?? defaultTextAvatar(item.name),
    ...rest,
  } as AssistantMapped
}

export const useAssistantsStore = defineStore("assistants", () => {
  const assistants = ref<AssistantMapped[]>([])
  const isLoaded = ref(false)
  const fetchAssistants = async () => {
    const { data, error } = await supabase.from("user_assistants").select("*")

    if (error) {
      console.error("Error fetching assistants:", error)
    }

    console.log("[DEBUG] Fetch assistants", data)

    assistants.value = data.map(mapAssistantTypes)
    isLoaded.value = true
  }

  const init = async () => {
    assistants.value = []
    isLoaded.value = false
    await fetchAssistants()
  }

  useUserLoginCallback(init)

  const { t } = useI18n()

  async function add (props: Partial<Assistant> = {}) {
    const { data, error } = await supabase
      .from("user_assistants")
      .insert({
        name: t("stores.assistants.newAssistant"),
        avatar: defaultAvatar("AI"),
        workspace_id: null,
        prompt: "",
        prompt_template: AssistantDefaultPrompt,
        prompt_vars: [],
        provider: null,
        model: null,
        model_settings: { ...defaultModelSettings },
        plugins: {},
        prompt_role: "system",
        stream: true,
        ...props,
      })
      .select()
      .single()

    if (error) {
      console.error("Error adding assistant:", error)
    }

    assistants.value.push(mapAssistantTypes(data))

    return data
  }

  async function update (id: string, changes) {
    const { data, error } = await supabase
      .from("user_assistants")
      .update(changes)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating assistant:", error)

      return null
    }

    assistants.value = assistants.value.map((a) =>
      a.id === id ? mapAssistantTypes(data) : a
    )

    return data
  }

  const throttledUpdate = throttle(async (assistant: Assistant) => {
    await update(assistant.id, assistant)
  }, 2000)

  async function put (assistant: Assistant) {
    if (assistant.id) {
      return throttledUpdate(assistant)
    }

    return add(assistant)
  }

  async function delete_ (id: string) {
    const { error } = await supabase
      .from("user_assistants")
      .delete()
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error deleting assistant:", error)

      return null
    }

    assistants.value = assistants.value.filter((a) => a.id !== id)
  }

  return {
    init,
    assistants,
    add,
    update,
    put,
    delete: delete_,
    isLoaded,
  }
})

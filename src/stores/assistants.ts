/* eslint-disable camelcase */
import { defineStore } from 'pinia'
import { defaultModelSettings } from 'src/utils/db'
import { defaultAvatar, genId } from 'src/utils/functions'
import { AssistantDefaultPrompt } from 'src/utils/templates'
import { useI18n } from 'vue-i18n'
import { supabase } from 'src/services/supabase/client'
import { AssistantMapped, Assistant } from '@/services/supabase/types'
import { ref } from 'vue'
import { AssistantPlugins, Avatar, Model, ModelSettings, PromptVar, Provider } from '@/utils/types'

function mapWorkspaceTypes(item: Assistant): AssistantMapped {
  const { avatar, prompt_vars, prompt_role, provider, model, model_settings, plugins, ...rest } = item
  return {
    avatar: (avatar ?? { type: 'text', text: item.name.slice(0, 1) }) as Avatar,
    prompt_vars: (prompt_vars ?? []) as PromptVar[],
    provider: provider as Provider,
    model: model as Model,
    model_settings: model_settings as ModelSettings,
    plugins: plugins as AssistantPlugins,
    prompt_role: prompt_role as 'system' | 'user' | 'assistant',
    ...rest
  }
}

export const useAssistantsStore = defineStore('assistants', () => {
  const assistants = ref<AssistantMapped[]>([])
  const isLoaded = ref(false)
  const fetchAssistants = async () => {
    const { data, error } = await supabase.from('user_assistants').select('*')
    if (error) {
      console.error('Error fetching assistants:', error)
    }
    assistants.value = data.map(mapWorkspaceTypes)
    isLoaded.value = true
  }

  const init = async () => {
    await fetchAssistants()
  }

  const { t } = useI18n()
  async function add(props: Partial<Assistant> = {}) {
    // return await db.assistants.add({
    //   name: t('stores.assistants.newAssistant'),
    //   id: genId(),
    //   avatar: defaultAvatar('AI'),
    //   workspaceId: '$root',
    //   prompt: '',
    //   promptTemplate: AssistantDefaultPrompt,
    //   promptVars: [],
    //   provider: null,
    //   model: null,
    //   modelSettings: { ...defaultModelSettings },
    //   plugins: {},
    //   promptRole: 'system',
    //   stream: true,
    //   ...props
    // })
    const { data, error } = await supabase.from('user_assistants').insert({
      name: t('stores.assistants.newAssistant'),
      avatar: defaultAvatar('AI'),
      workspace_id: null,
      prompt: '',
      prompt_template: AssistantDefaultPrompt,
      prompt_vars: {},
      provider: null,
      model: null,
      model_settings: { ...defaultModelSettings },
      plugins: {},
      prompt_role: 'system',
      stream: true,
      ...props
    }).select().single()

    if (error) {
      console.error('Error adding assistant:', error)
    }
    assistants.value.push(mapWorkspaceTypes(data))
    return data
  }

  async function update(id: string, changes) {
    const { data, error } = await supabase.from('user_assistants').update(changes).eq('id', id).select().single()
    if (error) {
      console.error('Error updating assistant:', error)
      return null
    }
    assistants.value = assistants.value.map(a => a.id === id ? mapWorkspaceTypes(data) : a)
    return data
    // return await db.assistants.update(id, changes)
  }

  async function put(assistant: Assistant) {
    if (assistant.id) {
      return update(assistant.id, assistant)
    }
    return add(assistant)
  }

  async function delete_(id: string) {
    // return await db.assistants.delete(id)
    const { data, error } = await supabase.from('user_assistants').delete().eq('id', id).select().single()
    if (error) {
      console.error('Error deleting assistant:', error)
      return null
    }
    assistants.value = assistants.value.filter(a => a.id !== id)
  }

  return {
    init,
    assistants,
    add,
    update,
    put,
    delete: delete_,
    isLoaded
  }
})

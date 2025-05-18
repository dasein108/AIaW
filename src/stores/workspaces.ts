import { defineStore } from 'pinia'
import { DefaultWsIndexContent } from 'src/utils/templates'
import { useI18n } from 'vue-i18n'
import { supabase } from 'src/services/supabase/client'
import { useWorkspacesWithSubscription } from 'src/composables/workspaces/useWorkspacesWithSubscription'
import type { WorkspaceMapped } from '@/services/supabase/types'

export const useWorkspacesStore = defineStore('workspaces', () => {
  const { workspaces, isLoaded } = useWorkspacesWithSubscription()
  // const workspaces = useLiveQuery(() => db.workspaces.toArray(), { initialValue: [] as Workspace[] })
  const { t } = useI18n()
  // watch(workspaces, (val) => {
  //   console.log('=---workspaces store', val)
  // })

  async function addWorkspace(props: Partial<WorkspaceMapped>) {
    const workspace = {
      name: t('stores.workspaces.newWorkspace'),
      type: 'workspace',
      avatar: { type: 'icon', icon: 'sym_o_deployed_code' },
      vars: {},
      index_content: DefaultWsIndexContent,
      parent_id: null,
      ...props
    }
    const { data, error } = await supabase.from('workspaces').insert(workspace).select().single()

    if (error) {
      console.error('❌ Failed to add workspace:', error.message)
      return null
    }

    return data

    // if return await db.workspaces.add({
    //   id: genId(),
    //   name: t('stores.workspaces.newWorkspace'),
    //   avatar: { type: 'icon', icon: 'sym_o_deployed_code' },
    //   type: 'workspace',
    //   parentId: '$root',
    //   prompt: '',
    //   index_content: DefaultWsIndexContent,
    //   vars: {},
    //   listOpen: {
    //     assistants: true,
    //     artifacts: false,
    //     dialogs: true
    //   },
    //   ...props
    // } as Workspace)
  }

  async function updateItem(id: string, changes: Partial<WorkspaceMapped>) {
    const { data, error } = await supabase.from('workspaces').update(changes).eq('id', id).select().single()
    if (error) {
      console.error('❌ Failed to update workspace:', error.message)
      return null
    }
    return data
  }
  async function insertItem(workspace: WorkspaceMapped) {
    const { data, error } = await supabase.from('workspaces').insert(workspace).select().single()
    if (error) {
      console.error('❌ Failed to put workspace:', error.message)
      return null
    }
    return data
  }
  async function putItem(workspace: WorkspaceMapped) {
    if (workspace.id) {
      return await updateItem(workspace.id, workspace)
    }
    return await insertItem(workspace)
  }

  async function deleteItem(id: string) {
    const { data, error } = await supabase.from('workspaces').delete().eq('id', id)
    if (error) {
      console.error('❌ Failed to delete workspace:', error.message)
      return false
    }
    return true
  }

  return {
    isLoaded,
    workspaces,
    addWorkspace,
    updateItem,
    putItem,
    deleteItem
  }
})

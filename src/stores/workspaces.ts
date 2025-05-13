import { defineStore } from 'pinia'
import { useLiveQuery } from 'src/composables/live-query'
import { db } from 'src/utils/db'
import { genId } from 'src/utils/functions'
import { DefaultWsIndexContent } from 'src/utils/templates'
import { useI18n } from 'vue-i18n'
import { supabase } from 'src/services/supabase/client'
import { useWorkspaces } from 'src/components/social/composable/useWorkspaces'
import type { WorkspaceMapped } from '@/services/supabase/types'
import { watch } from 'vue'

export const useWorkspacesStore = defineStore('workspaces', () => {
  const { workspaces } = useWorkspaces()
  // const workspaces = useLiveQuery(() => db.workspaces.toArray(), { initialValue: [] as Workspace[] })
  const { t } = useI18n()
  watch(workspaces, (val) => {
    console.log('=---workspaces store', val)
  })

  async function addWorkspace(props: Partial<WorkspaceMapped>) {
    const workspace = {
      name: t('stores.workspaces.newWorkspace'),
      type: 'workspace',
      metadata: {
        avatar: { type: 'icon', icon: 'sym_o_deployed_code' },
        vars: {},
        indexContent: DefaultWsIndexContent
      },
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
    //   indexContent: DefaultWsIndexContent,
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

  async function putItem(workspace: WorkspaceMapped) {
    const { data, error } = await supabase.from('workspaces').insert(workspace).select().single()
    if (error) {
      console.error('❌ Failed to put workspace:', error.message)
      return null
    }
    return data
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
    workspaces,
    addWorkspace,
    updateItem,
    putItem,
    deleteItem
  }
})

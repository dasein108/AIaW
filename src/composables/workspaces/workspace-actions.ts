import { toRaw } from 'vue'
import { useWorkspacesStore } from 'src/stores/workspaces'
import { useQuasar } from 'quasar'
import { dialogOptions } from 'src/utils/values'
import PickAvatarDialog from 'src/components/PickAvatarDialog.vue'
import SelectWorkspaceDialog from 'src/components/SelectWorkspaceDialog.vue'
import { defaultAvatar, genId } from 'src/utils/functions'
import { useAssistantsStore } from 'src/stores/assistants'
import { useI18n } from 'vue-i18n'
import { useUserDataStore } from 'src/stores/user-data'
import { useCheckLogin } from '../auth/useCheckLogin'
import { useUserPerfsStore } from 'src/stores/user-perfs'

export function useWorkspaceActions() {
  const workspacesStore = useWorkspacesStore()
  const assistantsStore = useAssistantsStore()
  const userDataStore = useUserDataStore()
  const userPerfsStore = useUserPerfsStore()
  const $q = useQuasar()
  const { t } = useI18n()
  const { ensureLogin } = useCheckLogin()
  function addWorkspace(parentId = null) {
    ensureLogin()

    $q.dialog({
      title: t('workspace.newWorkspace'),
      prompt: {
        model: '',
        type: 'text',
        isValid: v => !!v.trim(),
        label: t('workspace.name')
      },
      cancel: true,
      ok: t('workspace.create'),
      ...dialogOptions
    }).onOk(async name => {
      const workspace = await workspacesStore.addWorkspace({ name: name.trim(), parent_id: parentId, type: 'workspace', is_public: true })
      const assistant = await assistantsStore.add({
        name: t('workspace.defaultAssistant'),
        workspace_id: workspace.id,
        avatar: defaultAvatar('AI'),
        provider: userPerfsStore.perfs.provider,
        model: userPerfsStore.perfs.model,
      })
      userDataStore.data.defaultAssistantIds[workspace.id] = assistant.id
    })
  }
  function addFolder(parentId = null) {
    ensureLogin()

    $q.dialog({
      title: t('workspace.newFolder'),
      prompt: {
        model: '',
        type: 'text',
        isValid: v => !!v.trim(),
        label: t('workspace.name')
      },
      cancel: true,
      ok: t('workspace.create'),
      ...dialogOptions
    }).onOk(name => {
      workspacesStore.addWorkspace({ name: name.trim(), parent_id: parentId, type: 'folder' })
    })
  }
  function renameItem(item) {
    if (item) {
      $q.dialog({
        title: t('workspace.rename'),
        prompt: {
          model: item.name,
          type: 'text',
          isValid: v => !!v.trim() && v !== item.name,
          label: t('workspace.name')
        },
        cancel: true,
        ...dialogOptions
      }).onOk(newName => {
        workspacesStore.updateItem(item.id, { name: newName.trim() })
      })
    }
  }
  function changeAvatar(item) {
    $q.dialog({
      component: PickAvatarDialog,
      componentProps: { model: item.avatar, defaultTab: 'icon' }
    }).onOk(avatar => {
      workspacesStore.updateItem(item.id, { avatar: toRaw(avatar) })
    })
  }
  function moveItem({ id }, exclude?: string[]) {
    $q.dialog({
      component: SelectWorkspaceDialog,
      componentProps: {
        accept: 'folder',
        exclude
      }
    }).onOk(parentId => {
      workspacesStore.updateItem(id, { parent_id: parentId })
    })
  }
  function deleteItem({ id, type, name }) {
    $q.dialog({
      title: type === 'workspace' ? t('workspace.deleteWorkspace') : t('workspace.deleteFolder'),
      message: type === 'workspace' ? t('workspace.confirmDeleteWorkspace', { name }) : t('workspace.confirmDeleteFolder', { name }),
      cancel: true,
      ok: {
        label: t('workspace.delete'),
        color: 'err',
        flat: true
      },
      ...dialogOptions
    }).onOk(() => { workspacesStore.deleteItem(id) })
  }

  return { addWorkspace, addFolder, renameItem, changeAvatar, moveItem, deleteItem }
}

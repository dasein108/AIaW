<template>
  <q-list>
    <q-item
      clickable
      @click="addItem"
      text-sec
      item-rd
    >
      <q-item-section
        avatar
        min-w-0
      >
        <q-icon name="sym_o_add_comment" />
      </q-item-section>
      <q-item-section>
        {{ $t('dialogList.createDialog') }}
      </q-item-section>
    </q-item>
    <q-item
      v-for="dialog in [...dialogs].reverse()"
      :key="dialog.id"
      clickable
      :to="{ path: `/workspaces/${workspace.id}/dialogs/${dialog.id}`, query: route.query }"
      active-class="bg-sec-c text-on-sec-c"
      item-rd
      min-h="40px"
    >
      <q-item-section>
        {{ dialog.name }}
      </q-item-section>
      <q-menu
        context-menu
      >
        <q-list style="min-width: 100px">
          <menu-item
            icon="sym_o_edit"
            :label="$t('dialogList.renameTitle')"
            @click="renameItem(dialog)"
          />
          <menu-item
            icon="sym_o_auto_fix"
            :label="$t('dialogList.summarizeDialog')"
            @click="router.push(`/workspaces/${workspace.id}/dialogs/${dialog.id}#genTitle`)"
          />
          <menu-item
            icon="sym_o_content_copy"
            :label="$t('dialogList.copyContent')"
            @click="router.push(`/workspaces/${workspace.id}/dialogs/${dialog.id}#copyContent`)"
          />
          <menu-item
            icon="sym_o_move_item"
            :label="$t('dialogList.moveTo')"
            @click="moveItem(dialog)"
          />
          <menu-item
            icon="sym_o_delete"
            :label="$t('dialogList.delete')"
            @click="deleteItem(dialog)"
            hover:text-err
          />
        </q-list>
      </q-menu>
    </q-item>
  </q-list>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar'
import { isPlatformEnabled } from 'src/utils/functions'
import { dialogOptions } from 'src/utils/values'
import { computed, inject, Ref, toRef } from 'vue'
import { useI18n } from 'vue-i18n'
import SelectWorkspaceDialog from './SelectWorkspaceDialog.vue'
import { useCreateDialog } from 'src/composables/create-dialog'
import MenuItem from './MenuItem.vue'
import { useUserPerfsStore } from 'src/stores/user-perfs'
import { useListenKey } from 'src/composables/listen-key'
import { useRouter, useRoute } from 'vue-router'
import { useDialogsStore } from 'src/stores/dialogs'
import { Workspace } from '@/services/supabase/types'
import { useCheckLogin } from 'src/composables/auth/useCheckLogin'

const { t } = useI18n()
const workspace: Ref<Workspace> = inject('workspace')

const $q = useQuasar()
const router = useRouter()
const route = useRoute()
const { ensureLogin } = useCheckLogin()
const { createDialog } = useCreateDialog(workspace.value.id)
const dialogsStore = useDialogsStore()
const dialogs = computed(() => Object.values(dialogsStore.dialogs))

async function addItem() {
  ensureLogin()

  await createDialog()
}

function renameItem({ id, name }) {
  $q.dialog({
    title: t('dialogList.renameTitle'),
    prompt: {
      model: name,
      type: 'text',
      label: t('dialogList.title'),
      isValid: v => v.trim() && v !== name
    },
    cancel: true,
    ...dialogOptions
  }).onOk(newName => {
    dialogsStore.updateDialog({ id, name: newName.trim() })
  })
}
function moveItem({ id }) {
  $q.dialog({
    component: SelectWorkspaceDialog,
    componentProps: {
      accept: 'workspace'
    }
  }).onOk(workspaceId => {
    dialogsStore.updateDialog({ id, workspace_id: workspaceId })
  })
}
function deleteItem({ id, name }) {
  $q.dialog({
    title: t('dialogList.deleteConfirmTitle'),
    message: t('dialogList.deleteConfirmMessage', { name }),
    cancel: true,
    ok: {
      label: t('dialogList.deleteConfirmOk'),
      color: 'err',
      flat: true
    },
    ...dialogOptions
  }).onOk(() => {
    dialogsStore.removeDialog(id)
  })
}

const { perfs } = useUserPerfsStore()

if (isPlatformEnabled(perfs.enableShortcutKey)) {
  useListenKey(toRef(perfs, 'createDialogKey'), addItem)
}
</script>

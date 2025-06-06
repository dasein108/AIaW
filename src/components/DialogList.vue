<template>
  <q-list>
    <q-item
      m-0
      p-0
    >
      <q-btn
        flat
        dense
        no-caps
        no-padding
        no-margin
        icon="sym_o_search"
        @click.prevent.stop="showSearchDialog = true"
      >
        <q-tooltip>
          {{ $t('dialogList.searchDialogs') }}
        </q-tooltip>
      </q-btn>
      <add-dialog-item :workspace-id="props.workspaceId" />
    </q-item>
    <q-item
      v-for="dialog in [...dialogs].reverse()"
      :key="dialog.id"
      clickable
      :to="{ path: `/workspaces/${props.workspaceId}/dialogs/${dialog.id}`, query: route.query }"
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
            @click="router.push(`/workspaces/${props.workspaceId}/dialogs/${dialog.id}#genTitle`)"
          />
          <menu-item
            icon="sym_o_content_copy"
            :label="$t('dialogList.copyContent')"
            @click="router.push(`/workspaces/${props.workspaceId}/dialogs/${dialog.id}#copyContent`)"
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
  <search-dialog
    v-model="showSearchDialog"
    :workspace-id
  />
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar'
import { isPlatformEnabled } from 'src/utils/functions'
import { dialogOptions } from 'src/utils/values'
import { computed, inject, ref, Ref, toRef } from 'vue'
import { useI18n } from 'vue-i18n'
import SelectWorkspaceDialog from './SelectWorkspaceDialog.vue'
import MenuItem from './MenuItem.vue'
import { useRouter, useRoute } from 'vue-router'
import { useDialogsStore } from 'src/stores/dialogs'
import { Workspace } from '@/services/supabase/types'
import { useWorkspacesStore } from 'src/stores/workspaces'
import { storeToRefs } from 'pinia'
import AddDialogItem from './AddDialogItem.vue'
import SearchDialog from './SearchDialog.vue'

const { t } = useI18n()
const props = defineProps<{
  workspaceId: string
}>()

const $q = useQuasar()
const router = useRouter()
const route = useRoute()
const dialogsStore = useDialogsStore()
const { dialogs: workspaceDialogs } = storeToRefs(dialogsStore)
const dialogs = computed(() => Object.values(workspaceDialogs.value).filter(item => item.workspace_id === props.workspaceId))
const showSearchDialog = ref(false)

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
</script>

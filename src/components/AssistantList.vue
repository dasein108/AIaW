<template>
  <q-item
    v-for="assistant in assistants"
    :key="assistant.id"
    clickable
    active-class="route-active"
    item-rd
    py-1.5
    min-h-0
    @click="setDefaultAssistant(assistant.id)"
  >
    <q-item-section
      avatar
      min-w-0
      v-close-popup
    >
      <a-avatar
        size="30px"
        :avatar="assistant.avatar"
      />
    </q-item-section>
    <q-item-section>
      {{ assistant.name }}
    </q-item-section>
    <q-menu
      context-menu
    >
      <q-list style="min-width: 100px">
        <menu-item
          v-if="!workspaceId"
          icon="sym_o_add_comment"
          :label="$t('assistantsExpansion.createDialog')"
          @click="createDialog({ assistant_id: assistant.id })"
        />
        <menu-item
          v-if="!workspaceId "
          icon="sym_o_move_item"
          :label="$t('assistantsExpansion.moveToGlobal')"
          @click="move(assistant.id, null)"
        />
        <menu-item
          icon="sym_o_move_item"
          :label="$t('assistantsExpansion.moveToWorkspace')"
          @click="moveToWorkspace(assistant.id)"
        />
        <menu-item
          icon="sym_o_delete"
          :label="$t('assistantsExpansion.delete')"
          @click="deleteItem(assistant)"
          hover:text-err
        />
        <menu-item
          icon="sym_o_settings"
          :label="$t('assistantsExpansion.settings')"
          :to="getLink(assistant.id)"
          hover:text-primary
        />
      </q-list>
    </q-menu>
  </q-item>
  <q-item
    clickable
    @click="addItem"
    text-sec
    item-rd
    min-h="42px"
  >
    <q-item-section
      avatar
      min-w-0
    >
      <q-icon name="sym_o_add" />
    </q-item-section>
    <q-item-section>
      {{ $t('assistantsExpansion.createAssistant') }}
    </q-item-section>
  </q-item>
</template>
<script setup lang="ts">
import { computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useAssistantsStore } from 'src/stores/assistants'
import { useRouter, useRoute } from 'vue-router'
import AAvatar from 'src/components/AAvatar.vue'
import SelectWorkspaceDialog from 'src/components/SelectWorkspaceDialog.vue'
import { useCreateDialog } from 'src/composables/create-dialog'
import MenuItem from 'src/components/MenuItem.vue'
import { dialogOptions } from 'src/utils/values'
import { defaultAvatar } from 'src/utils/functions'
import { useUserPerfsStore } from 'src/stores/user-perfs'
import { useWorkspacesStore } from 'src/stores/workspaces'
import { useUserDataStore } from 'src/stores/user-data'

const { t } = useI18n()

const route = useRoute()
const workspaceId = computed(() => route.params.workspaceId as string)

const assistantsStore = useAssistantsStore()
const userPerfsStore = useUserPerfsStore()
const workspacesStore = useWorkspacesStore()
const { data: userData } = storeToRefs(useUserDataStore())
const { data: perfs } = storeToRefs(useUserPerfsStore())
watch(perfs, (newVal, oldVal) => {
  console.log('perfs changed', newVal)
})

const assistants = computed(() => assistantsStore.assistants.filter(a => a.workspace_id === workspaceId.value || a.workspace_id == null))
const defaultAssistantId = computed(() => workspaceId.value ? userData.value.defaultAssistantIds[workspaceId.value] : null)

function getLink(id) {
  return workspaceId.value ? `/assistants/${id}` : `/workspaces/${workspaceId.value}/assistants/${id}`
}
const router = useRouter()
async function addItem() {
  const assistant = await assistantsStore.add({
    name: 'New Assistant',
    workspace_id: workspaceId.value,
    avatar: defaultAvatar("AI"),
    provider: perfs.value.provider,
    model: perfs.value.model,
  })
  router.push(getLink(assistant.id))
}

function setDefaultAssistant(id) {
  userData.value.defaultAssistantIds[workspaceId.value] = id
}

function move(id, workspaceId) {
  assistantsStore.update(id, { workspaceId })
}
const $q = useQuasar()
function moveToWorkspace(id) {
  $q.dialog({
    component: SelectWorkspaceDialog,
    componentProps: {
      accept: 'workspace'
    }
  }).onOk(workspaceId => {
    move(id, workspaceId)
  })
}
function deleteItem({ id, name }) {
  $q.dialog({
    title: t('assistantsExpansion.deleteConfirmTitle'),
    message: t('assistantsExpansion.deleteConfirmMessage', { name }),
    cancel: true,
    ok: {
      label: t('assistantsExpansion.delete'),
      color: 'err',
      flat: true
    },
    ...dialogOptions
  }).onOk(() => {
    assistantsStore.delete(id)
  })
}

const { createDialog } = useCreateDialog(workspaceId.value)
</script>

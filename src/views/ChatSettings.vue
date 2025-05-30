<template>
  <view-common-header
    @toggle-drawer="$emit('toggle-drawer')"
  >
    <q-toolbar-title>
      {{ $t('chatsPage.chatSettings') }}
      <q-chip
        size="md"
        v-if="workspace"
      >
        <a-avatar
          :avatar="workspace?.avatar"
          size="md"
        />
        {{ workspace?.name }}
      </q-chip>
    </q-toolbar-title>
  </view-common-header>
  <q-page-container bg-sur-c-low>
    <q-page
      flex
      flex-col
      :style-fn="pageFhStyle"
    >
      <notification-panel
        v-if="!isPageLoaded"
        :title="$t('common.loading')"
      />
      <notification-panel
        v-else-if="!isAdmin"
        :title="$t('common.noAdmin')"
        :warning="true"
      />
      <notification-panel
        v-if="currentChat && currentChat.type === 'private'"
        :title="$t('chatsPage.privateChat')"
        :warning="true"
      />
      <q-list v-else-if="currentChat">
        <q-item>
          <q-item-section>
            {{ $t('chatsPage.isPublic') }}
          </q-item-section>
          <q-item-section side>
            <q-toggle v-model="chatPublic" />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            {{ $t('chatsPage.name') }}
          </q-item-section>
          <q-item-section>
            <q-input
              v-model="chat.name"
              autogrow
              filled
              clearable
              placeholder="Name of chat..."
            />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            {{ $t('chatsPage.description') }}
          </q-item-section>
          <q-item-section>
            <q-input
              v-model="chat.description"
              autogrow
              filled
              clearable
              placeholder="Description of workspace..."
            />
          </q-item-section>
        </q-item>
        <q-item
          clickable
          v-ripple
          @click="pickAvatar"
        >
          <q-item-section>
            {{ $t('chatsPage.avatar') }}
          </q-item-section>
          <q-item-section side>
            <a-avatar :avatar="chat.avatar" />
          </q-item-section>
        </q-item>
        <q-separator spaced />
      </q-list>
    </q-page>
  </q-page-container>
</template>

<script setup lang="ts">
import ViewCommonHeader from 'src/components/ViewCommonHeader.vue'

import { QPageContainer, QPage, useQuasar } from 'quasar'
import { pageFhStyle } from 'src/utils/functions'
import { useChatsStore } from 'src/stores/chats'
import { computed, ref, toRaw, toRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useWorkspacesStore } from 'src/stores/workspaces'
import PickAvatarDialog from 'src/components/PickAvatarDialog.vue'
import { syncRef } from 'src/composables/sync-ref'
import AAvatar from 'src/components/AAvatar.vue'
import NotificationPanel from 'src/components/common/NotificationPanel.vue'
import { useIsChatAdmin } from 'src/composables/chats/useChatAdmin'
const { t } = useI18n()
const $q = useQuasar()

defineEmits(['toggle-drawer'])

const props = defineProps<{
  id: string
}>()

const chatsStore = useChatsStore()
const workspaceStore = useWorkspacesStore()

const workspace = computed(() => workspaceStore.workspaces.find(workspace => workspace.id === chat.value?.workspace_id))
const currentChat = computed(() => chatsStore.chats.find(chat => chat.id === props.id))
const isPageLoaded = computed(() => currentChat.value !== undefined)

const { isAdmin } = useIsChatAdmin(currentChat)

const chat = syncRef(
  currentChat,
  val => { chatsStore.putItem(toRaw(val)) },
  { valueDeep: true }
)

const chatPublic = ref(chat.value?.type === 'workspace')

watch(chatPublic, (newVal) => {
  if (newVal) {
    chatsStore.update(currentChat.value!.id, { type: 'workspace' })
  } else {
    chatsStore.update(currentChat.value!.id, { type: 'group' })
  }
})

function pickAvatar() {
  $q.dialog({
    component: PickAvatarDialog,
    componentProps: { model: chat.value?.avatar, defaultTab: 'icon' }
  }).onOk(avatar => {
    chatsStore.update(currentChat.value!.id, { avatar })
  })
}
</script>

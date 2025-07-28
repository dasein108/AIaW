<template>
  <page-view-with-drawer
    :title="$t('chatsPage.chatSettings')"
    @toggle-drawer="$emit('toggle-drawer')"
  >
    <template #drawer>
      <settings-drawer />
    </template>
    <template #page>
      <div
        v-if="workspace?.avatar"
        class="q-mb-md"
      />

      <notification-panel
        v-if="!isPageLoaded"
        :title="$t('common.loading')"
      />
      <notification-panel
        v-else-if="!isAdmin"
        :title="$t('common.noAdmin')"
        :warning="true"
      >
        <div class="text-body2 text-white">
          Only workspace administrators can modify chat settings. If you need to make changes, please contact:
        </div>
        <div class="q-mt-sm q-ml-md text-white">
          <div>• Workspace owner</div>
          <div>• Current administrators</div>
        </div>
      </notification-panel>
      <notification-panel
        v-else-if="chat && chat.type === 'private'"
        :title="$t('chatsPage.privateChat')"
        :warning="true"
      />

      <settings-list v-else-if="chat">
        <q-item-label
          header
        >
          {{ $t("chatsPage.chatSettings") }}
        </q-item-label>
        <q-item>
          <q-item-section>
            {{ $t("chatsPage.workspace") }}
          </q-item-section>
          <q-item-section side>
            <q-chip size="md">
              <a-avatar
                :avatar="workspace.avatar"
                size="md"
              />
              {{ workspace?.name }}
            </q-chip>
          </q-item-section>
        </q-item>
        <q-separator spaced />
        <q-item v-if="chat">
          <q-item-section>
            {{ $t("chatsPage.name") }}
          </q-item-section>
          <q-item-section>
            <a-input
              :model-value="chat.name"
              @update:model-value="handleNameUpdate"
              autogrow
              filled
              clearable
              placeholder="Name of chat..."
            />
          </q-item-section>
        </q-item>
        <q-item v-if="chat">
          <q-item-section>
            {{ $t("chatsPage.description") }}
          </q-item-section>
          <q-item-section>
            <a-input
              :model-value="chat.description"
              @update:model-value="handleDescriptionUpdate"
              autogrow
              filled
              clearable
              placeholder="Description of chat..."
            />
          </q-item-section>
        </q-item>
        <q-item
          v-if="chat"
          clickable
          v-ripple
          @click="pickAvatar"
        >
          <q-item-section>
            {{ $t("chatsPage.avatar") }}
          </q-item-section>
          <q-item-section side>
            <a-avatar :avatar="chat.avatar" />
          </q-item-section>
        </q-item>
      </settings-list>

      <!-- Sticky Save Button -->
      <sticky-save-button
        @click="saveChat"
        :loading="chatsStore.isSaving"
        :disabled="!chatsStore.hasChanges"
        :show="chat && chat.type !== 'private'"
      />
    </template>
  </page-view-with-drawer>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia"
import { useQuasar } from "quasar"
import { computed, toRaw } from "vue"

import AAvatar from "@/shared/components/avatar/AAvatar.vue"
import PickAvatarDialog from "@/shared/components/avatar/PickAvatarDialog.vue"
import AInput from "@/shared/components/global/AInput.js"
import SettingsDrawer from "@/shared/components/layout/settings/SettingsDrawer.vue"
import NotificationPanel from "@/shared/components/NotificationPanel.vue"
import SettingsList from "@/shared/components/panels/SettingsList.vue"
import StickySaveButton from "@/shared/components/StickySaveButton.vue"

import { useChatsStore } from "@/features/chats/store"
import { useRightsManagement } from "@/features/workspaces/composables/useRightsManagement"
import { useWorkspacesStore } from "@/features/workspaces/store"

import PageViewWithDrawer from "@/pages/common/SidebarPageLayout.vue"
const $q = useQuasar()

defineEmits(["toggle-drawer"])

const props = defineProps<{
  id: string
}>()

const chatsStore = useChatsStore()
const { chats } = storeToRefs(chatsStore)
const workspaceStore = useWorkspacesStore()

const chatId = computed(() => props.id)
const chat = computed(() => chats.value.find(c => c.id === chatId.value))

// Method to handle name update with error handling
async function handleNameUpdate(value: string) {
  if (!chat.value) return

  try {
    await chatsStore.update(chat.value.id, { name: String(value) })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error updating chat name'
    })
  }
}

// Method to handle description update with error handling
async function handleDescriptionUpdate(value: string) {
  if (!chat.value) return

  try {
    await chatsStore.update(chat.value.id, { description: String(value) })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error updating chat description'
    })
  }
}

const workspace = computed(() => workspaceStore.workspaces.find(w => w.id === chat.value?.workspaceId))

const isPageLoaded = computed(() => chat.value !== undefined)
const { isUserWorkspaceAdmin } = useRightsManagement()
const isAdmin = computed(() => isUserWorkspaceAdmin(chat.value?.workspaceId))

async function saveChat() {
  if (!chat.value) return

  try {
    await chatsStore.update(chat.value.id, toRaw(chat.value))
    $q.notify({
      type: 'positive',
      message: 'Chat settings saved'
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error saving chat settings'
    })
  }
}

function pickAvatar () {
  if (!chat.value) return

  $q.dialog({
    component: PickAvatarDialog,
    componentProps: { model: chat.value.avatar, defaultTab: "icon" },
  }).onOk(async (avatar) => {
    if (chat.value) {
      await chatsStore.update(chat.value.id, { avatar })
    }
  })
}
</script>

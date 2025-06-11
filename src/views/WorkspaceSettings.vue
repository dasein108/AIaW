<template>
  <view-common-header @toggle-drawer="$emit('toggle-drawer')">
    <q-toolbar-title>
      {{ $t("workspaceSettings.title") }}
    </q-toolbar-title>
  </view-common-header>

  <q-page-container>
    <q-page bg-sur>
      <loading-panel v-if="!isLoaded" />
      <notification-panel
        v-else-if="!isAdmin"
        :title="$t('common.noAdmin')"
        :warning="true"
      />
      <q-list v-else>
        <q-item>
          <q-item-section>
            {{ $t("workspacePage.isPublic") }}
          </q-item-section>
          <q-item-section side>
            <q-toggle v-model="workspace.is_public" />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            {{ $t("workspacePage.name") }}
          </q-item-section>
          <q-item-section>
            <q-input
              v-model="workspace.name"
              autogrow
              filled
              clearable
              placeholder="Name of workspace..."
            />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            {{ $t("workspacePage.description") }}
          </q-item-section>
          <q-item-section>
            <q-input
              v-model="workspace.description"
              autogrow
              filled
              clearable
              placeholder="Description of workspace..."
            />
          </q-item-section>
        </q-item>
        <q-separator spaced />

        <q-item>
          <q-item-section>
            {{ $t("workspaceSettings.defaultAssistant") }}
          </q-item-section>
          <q-item-section side>
            <q-select
              class="min-w-150px"
              filled
              dense
              v-model="userDataStore.data.defaultAssistantIds[workspace.id]"
              :options="assistantOptions"
              emit-value
              map-options
            >
              <template #option="{ itemProps, opt }">
                <assistant-item
                  v-bind="itemProps"
                  :assistant="opt.assistant"
                />
              </template>
            </q-select>
          </q-item-section>
        </q-item>
        <q-item
          clickable
          v-ripple
          @click="pickAvatar"
        >
          <q-item-section>
            {{ $t("workspaceSettings.avatar") }}
          </q-item-section>
          <q-item-section side>
            <a-avatar :avatar="workspace.avatar" />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section avatar>
            {{ $t("workspaceSettings.homeContent") }}
          </q-item-section>
          <q-item-section pl-4>
            <a-input
              filled
              v-model="workspace.index_content"
              autogrow
              clearable
            />
          </q-item-section>
        </q-item>
      </q-list>
      <q-separator spaced />
      <q-item-label header>
        {{ $t("workspaceSettings.variables") }}
      </q-item-label>
      <vars-input
        v-model="workspace.vars"
        :input-props="{
          filled: true,
          autogrow: true,
          clearale: true,
          placeholder: $t('workspaceSettings.inputPlaceholder'),
        }"
      />
      <workspace-members
        v-if="!workspace.is_public"
        :workspace-id="workspace.id"
      />
    </q-page>
  </q-page-container>
</template>

<script setup lang="ts">
import { useQuasar } from "quasar"
import AAvatar from "src/components/AAvatar.vue"
import AssistantItem from "src/components/AssistantItem.vue"
import LoadingPanel from "src/components/common/LoadingPanel.vue"
import NotificationPanel from "src/components/common/NotificationPanel.vue"
import PickAvatarDialog from "src/components/PickAvatarDialog.vue"
import VarsInput from "src/components/VarsInput.vue"
import ViewCommonHeader from "src/components/ViewCommonHeader.vue"
import WorkspaceMembers from "src/components/workspace/WorkspaceMembers.vue"
import { useSetTitle } from "src/composables/set-title"
import { syncRef } from "src/composables/sync-ref"
import { useIsWorkspaceAdmin } from "src/composables/workspaces/useIsWorkspaceAdmin"
import { computed, Ref, inject, toRaw, watch } from "vue"
import { useI18n } from "vue-i18n"
import { useAssistantsStore, useUserDataStore, useWorkspacesStore } from "@/app/store"
import { WorkspaceMapped } from "@/services/supabase/types"
const { t } = useI18n()

defineEmits(["toggle-drawer"])
const userDataStore = useUserDataStore()
const store = useWorkspacesStore()
const workspace = syncRef(
  inject("workspace") as Ref<WorkspaceMapped>,
  (val) => {
    store.putItem(toRaw(val))
  },
  { valueDeep: true }
)

const workspaceId = computed(() => workspace.value.id)
const { isAdmin, isLoaded } = useIsWorkspaceAdmin(workspaceId)

watch(isAdmin, (newVal) => {
  console.log("----isAdmin", newVal)
})
const assistantsStore = useAssistantsStore()
const assistantOptions = computed(() =>
  assistantsStore.assistants
    .filter((a) => [workspace.value.id, null].includes(a.workspace_id))
    .map((a) => ({
      label: a.name,
      value: a.id,
      assistant: a,
    }))
)

const $q = useQuasar()

function pickAvatar () {
  $q.dialog({
    component: PickAvatarDialog,
    componentProps: { model: workspace.value.avatar, defaultTab: "icon" },
  }).onOk((avatar) => {
    workspace.value.avatar = avatar
  })
}

useSetTitle(
  computed(() => `${t("workspaceSettings.title")} - ${workspace.value?.name}`)
)
</script>

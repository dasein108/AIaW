<template>
  <q-item clickable>
    <q-item-section avatar>
      <a-avatar :avatar="activeWorkspace?.avatar || {type: 'icon', icon: 'sym_o_question_mark'}" />
    </q-item-section>
    <q-item-section>
      {{ activeWorkspace?.name || 'Select a workspace...' }}
    </q-item-section>

    <q-item-section side>
      <q-icon name="sym_o_chevron_right" />
    </q-item-section>
    <q-menu
      anchor="top right"
      self="top left"
      square
      class="no-shadow p-0"
    >
      <workspace-nav />
    </q-menu>
  </q-item>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useUserDataStore } from 'src/stores/user-data'
import { useWorkspacesStore } from 'src/stores/workspaces'
import WorkspaceNav from 'src/components/WorkspaceNav.vue'
import AAvatar from 'src/components/AAvatar.vue'
import { storeToRefs } from 'pinia'

const { workspaces } = storeToRefs(useWorkspacesStore())
const { data, ready } = storeToRefs(useUserDataStore())

const lastWorkspaceId = computed(() =>
  data.value.lastWorkspaceId
)
const activeWorkspace = computed(() => workspaces.value.find(ws => ws.id === lastWorkspaceId.value))

</script>

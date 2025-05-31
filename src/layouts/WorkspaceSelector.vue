<template>
  <q-item clickable>
    <q-item-section avatar>
      <a-avatar
        :avatar="avatar"
        :key="avatarKey(avatar)"
      />
    </q-item-section>
    <q-item-section>
      {{ workspace?.name || 'Select a workspace...' }}
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
import WorkspaceNav from 'src/components/WorkspaceNav.vue'
import AAvatar from 'src/components/AAvatar.vue'
import { IconAvatar } from 'src/utils/types'
import { avatarKey } from 'src/utils/functions'
import { useActiveWorkspace } from 'src/composables/workspaces/useActiveWorkspace'

const { workspace } = useActiveWorkspace()

const avatar = computed(() => workspace.value?.avatar || { type: 'icon', icon: 'sym_o_question_mark' } as IconAvatar)

</script>

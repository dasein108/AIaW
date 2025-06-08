<template>
  <q-item clickable>
    <q-item-section
      avatar
      ml-10
    >
      <a-avatar
        :avatar="avatar"
        size="sm"
        :key="avatarKey(avatar)"
      />
    </q-item-section>
    <q-item-section>
      {{ assistant?.name || "Select a assistant..." }}
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
      <assistant-list :workspace-id="workspace.id" />
    </q-menu>
  </q-item>
</template>
<script setup lang="ts">
import AAvatar from "src/components/AAvatar.vue"
import AssistantList from "src/components/AssistantList.vue"
import { useActiveWorkspace } from "src/composables/workspaces/useActiveWorkspace"
import { avatarKey } from "src/utils/functions"
import { IconAvatar } from "src/utils/types"
import { computed } from "vue"

const { assistant, workspace } = useActiveWorkspace()

const avatar = computed(
  () =>
    assistant.value?.avatar ||
    ({ type: "icon", icon: "sym_o_question_mark" } as IconAvatar)
)
</script>

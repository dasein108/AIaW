<template>
  <!-- <add-dialog-item :workspace-id="workspaceId" /> -->
  <q-tabs
    v-model="activeTab"
    no-caps
    inline-label
    indicator-color="primary"
    active-color="primary"
    color="primary"
  >
    <q-tab
      name="dialogs"
      :label="$t('mainLayout.dialogs')"
      class="q-px-sm"
    />
    <q-tab
      name="chats"
      :label="$t('mainLayout.chats')"
      class="q-px-sm"
    />
  </q-tabs>

  <q-tab-panels
    v-model="activeTab"
    animated
  >
    <q-tab-panel name="dialogs">
      <dialog-list :workspace-id="workspaceId" />
    </q-tab-panel>

    <q-tab-panel name="chats">
      <chat-list :workspace-id="workspaceId" />
    </q-tab-panel>
  </q-tab-panels>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import DialogList from 'src/components/DialogList.vue'
import ChatList from 'src/components/chats/ChatList.vue'
import { useActiveWorkspace } from 'src/composables/workspaces/useActiveWorkspace'

const { workspace } = useActiveWorkspace()
const workspaceId = computed(() => workspace.value?.id as string)

const tabs = ref(['chats', 'dialogs'])

const activeTab = ref('dialogs')

</script>

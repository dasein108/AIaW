<template>
  <q-tabs
    v-if="workspaceId"
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

const route = useRoute()
const workspaceId = computed(() => route.params.workspaceId as string)

const tabs = ref(['chats', 'dialogs'])

const activeTab = ref('dialogs')

</script>

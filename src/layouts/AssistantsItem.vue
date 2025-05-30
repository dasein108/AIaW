<template>
  <q-item clickable>
    <q-item-section
      avatar
      ml-10
    >
      <a-avatar
        :avatar="activeAssistant?.avatar || {type: 'icon', icon: 'sym_o_question_mark'}"
        size="sm"
      />
    </q-item-section>
    <q-item-section>
      {{ activeAssistant?.name || 'Select a assistant...' }}
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
      <assistant-list />
    </q-menu>
  </q-item>
</template>
<script setup lang="ts">
import { useQuasar } from 'quasar'
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAssistantsStore } from 'src/stores/assistants'
import { useRouter, useRoute } from 'vue-router'
import AAvatar from 'src/components/AAvatar.vue'
import { useUserDataStore } from 'src/stores/user-data'
import AssistantList from 'src/components/AssistantList.vue'

const route = useRoute()
const workspaceId = computed(() => route.params.workspaceId as string)

const assistantsStore = useAssistantsStore()
const { data: userData } = storeToRefs(useUserDataStore())

const defaultAssistantId = computed(() => workspaceId.value ? userData.value.defaultAssistantIds[workspaceId.value] : null)
const activeAssistant = computed(() => assistantsStore.assistants.find(a => a.id === defaultAssistantId.value))

const router = useRouter()

const $q = useQuasar()

</script>

<template>
  <q-expansion-item
    header-class="text-lg py-0"
    expand-icon-class="important:pl-2"
  >
    <template #header>
      <q-item-section>
        Social
      </q-item-section>
      <q-item-section side>
        <q-btn
          flat
          dense
          round
          icon="sym_o_search"
          :title="'Search social'"
          @click.prevent.stop="showSearchDialog = true"
        />
      </q-item-section>
    </template>
    <template #default>
      <chat-list />
      <search-chats
        v-model="showSearchDialog"
        :workspace-id
      />
    </template>
  </q-expansion-item>
</template>

<script setup lang="ts">
import ChatList from './ChatList.vue'
import SearchChats from './SearchChats.vue'
import { ref, toRef } from 'vue'
import { useUserPerfsStore } from 'src/stores/user-perfs'
import { useListenKey } from 'src/composables/listen-key'
import { isPlatformEnabled } from 'src/utils/functions'

defineProps<{
  workspaceId: string
}>()

const showSearchDialog = ref(false)

const { perfs } = useUserPerfsStore()
if (isPlatformEnabled(perfs.enableShortcutKey)) {
  useListenKey(toRef(perfs, 'searchDialogKey'), () => {
    showSearchDialog.value = true
  })
}
</script>

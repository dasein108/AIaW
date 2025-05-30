<template>
  <q-list>
    <q-item
      clickable
      @click="addItem"
      text-sec
      item-rd
      v-if="userStore.isLoggedIn && workspaceId"
    >
      <q-item-section
        avatar
        min-w-0
      >
        <q-icon name="sym_o_add_comment" />
      </q-item-section>
      <q-item-section>
        {{ 'Create public chat' }}
      </q-item-section>
    </q-item>
    <chat-list-item
      v-for="chat in [...chats].reverse()"
      :key="chat.id"
      :chat="chat"
      v-model:selected="selected"
    />
  </q-list>
</template>

<script setup lang="ts">
import { isPlatformEnabled } from 'src/utils/functions'
import { toRef } from 'vue'
import { useUserPerfsStore } from 'src/stores/user-perfs'
import { useListenKey } from 'src/composables/listen-key'
import { useUserStore } from 'src/stores/user'
import { useWorkspaceChats } from '../../composables/chats/useWorkspaceChats'
import ChatListItem from './ChatListItem.vue'

const props = defineProps<{
  workspaceId: string | null
}>()

const { chats, addChat } = useWorkspaceChats(toRef(props, 'workspaceId'))
const userStore = useUserStore()

const selected = defineModel<string>()

async function addItem() {
  await addChat({
    name: 'New chat',
    type: 'workspace',
  })
}

const { data: perfs } = useUserPerfsStore()

if (isPlatformEnabled(perfs.enableShortcutKey)) {
  useListenKey(toRef(perfs, 'createSocialKey'), addItem)
}
</script>

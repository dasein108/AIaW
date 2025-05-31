<template>
  <q-list>
    <q-item>
      <q-item-section>
        <q-btn
          icon="sym_o_search"
          flat
          dense
          no-caps
          no-padding
          no-margin
          @click.prevent.stop="showSearchDialog = true"
        >
          <q-tooltip>
            Search chats
          </q-tooltip>
        </q-btn>
      </q-item-section>
      <q-item-section>
        <q-btn
          flat
          icon="sym_o_question_answer"
          dense
          no-caps
          @click="addItem"
        >
          <q-tooltip>
            Create a new chat
          </q-tooltip>
        </q-btn>
      </q-item-section>
      <q-item-section>
        <q-btn
          icon="sym_o_3p"
          flat
          dense
          no-caps
          no-padding
          no-margin
          @click.prevent.stop="showUserSelectDialog"
        >
          <q-tooltip>
            Chat with user
          </q-tooltip>
        </q-btn>
      </q-item-section>
    </q-item>
    <chat-list-item
      v-for="chat in [...chats].reverse()"
      :key="chat.id"
      :chat="chat"
      v-model:selected="selected"
    />
  </q-list>
  <search-chats
    v-model="showSearchDialog"
    :workspace-id="workspaceId"
  />
</template>

<script setup lang="ts">
import { isPlatformEnabled } from 'src/utils/functions'
import { ref, toRef } from 'vue'
import { useUserPerfsStore } from 'src/stores/user-perfs'
import { useListenKey } from 'src/composables/listen-key'
import { useUserStore } from 'src/stores/user'
import { useWorkspaceChats } from '../../composables/chats/useWorkspaceChats'
import ChatListItem from './ChatListItem.vue'
import UserListDialog from './UserListDialog.vue'
import { useChatsStore } from 'src/stores/chats'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import SearchChats from './SearchChats.vue'

const props = defineProps<{
  workspaceId: string | null
}>()
const $q = useQuasar()
const chatsStore = useChatsStore()
const { chats, addChat } = useWorkspaceChats(toRef(props, 'workspaceId'))
const userStore = useUserStore()
const router = useRouter()

const showSearchDialog = ref(false)
const showUserSelectDialog = () => {
  $q.dialog({
    component: UserListDialog,
    componentProps: {
      currentUserId: userStore.currentUserId
    }
  }).onOk((userId) => {
    onSelectUser(userId)
  })
}

const onSelectUser = async (userId: string) => {
  const chatId = await chatsStore.startPrivateChatWith(userId)
  router.push(props.workspaceId ? `/workspaces/${props.workspaceId}/chats/${chatId}` : `/chats/${chatId}`)
}

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

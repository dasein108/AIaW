<template>
  <q-expansion-item
    header-class="text-lg py-0"
    expand-icon-class="important:pl-2"
  >
    <template #header>
      <q-item-section>
        Chats
      </q-item-section>
      <q-item-section side>
        <div>
          <q-btn
            flat
            dense
            round
            icon="sym_o_search"
            :title="'Search chats'"
            @click.prevent.stop="showSearchDialog = true"
          />
          <q-btn
            flat
            dense
            round
            icon="sym_o_person_add"
            :title="'Create user chat'"
            @click.prevent.stop="showUserSelectDialog"
          />
        </div>
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
import { inject, ref, toRef } from 'vue'
import { useUserPerfsStore } from 'src/stores/user-perfs'
import { useListenKey } from 'src/composables/listen-key'
import { isPlatformEnabled } from 'src/utils/functions'
import { useQuasar } from 'quasar'
import UserListDialog from './UserListDialog.vue'
import { supabase } from 'src/services/supabase/client'
import { Chat, ChatMember, Profile } from '@/services/supabase/types'
import { useRouter } from 'vue-router'
import { UserProvider } from '@/services/supabase/userProvider'

const $q = useQuasar()
const router = useRouter()
const { currentUser } = inject<UserProvider>('user')

const props = defineProps<{
  workspaceId: string
}>()

const showUserSelectDialog = () => {
  $q.dialog({
    component: UserListDialog,
    componentProps: {
      currentUserId: currentUser.value?.id
    }
  }).onOk((user) => {
    onSelectUser(user)
  })
}

const onSelectUser = async (user: Profile) => {
  const { data: chat, error } = await supabase.from('chats').insert({
    name: user.name,
    is_group: false,
    is_public: false,
    owner_id: currentUser.value?.id
  } as Chat).select().single()

  const { data: chatMember, error: chatMemberError } = await supabase.from('chat_members').insert({
    user_id: user.id,
    chat_id: chat.id
  } as ChatMember)

  router.push(`/workspaces/${props.workspaceId}/chats/${chat.id}`)
}

const showSearchDialog = ref(false)

const { perfs } = useUserPerfsStore()
if (isPlatformEnabled(perfs.enableShortcutKey)) {
  useListenKey(toRef(perfs, 'searchDialogKey'), () => {
    showSearchDialog.value = true
  })
}
</script>

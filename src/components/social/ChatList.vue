<template>
  <q-list>
    <q-item
      clickable
      @click="addItem"
      text-sec
      item-rd
      v-if="isLoggedIn"
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
    <q-item
      v-for="chat in [...chats].reverse()"
      :key="chat.id"
      clickable
      :to="{ path: `/workspaces/${workspace.id}/chats/${chat.id}`, query: route.query }"
      active-class="bg-sec-c text-on-sec-c"
      item-rd
      min-h="40px"
    >
      <div class="row items-center justify-between">
        <q-icon
          class="q-mr-md"
          size="sm"
          :name="chat.is_group ? 'sym_o_groups' : 'sym_o_person'"
        />
        <span>{{ chat.name }}</span>
      </div>
      <q-menu
        context-menu
      >
        <q-list style="min-width: 100px">
          <menu-item
            icon="sym_o_edit"
            :label="'Rename'"
            @click="renameItem(chat)"
          />
          <menu-item
            icon="sym_o_delete"
            :label="'Delete'"
            @click="deleteItem(chat)"
            hover:text-err
          />
        </q-list>
      </q-menu>
    </q-item>
  </q-list>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar'
import { isPlatformEnabled } from 'src/utils/functions'
import { dialogOptions } from 'src/utils/values'
import { inject, Ref, toRef } from 'vue'
// import { useI18n } from 'vue-i18n' #TODO: implement i18n
import MenuItem from '../MenuItem.vue'
import { useUserPerfsStore } from 'src/stores/user-perfs'
import { useListenKey } from 'src/composables/listen-key'
import { useRoute } from 'vue-router'
import { supabase } from 'src/services/supabase/client'
import { useChats } from 'src/components/social/composable/useChats'
import { Workspace } from '@/utils/types'
import type { Chat } from '@/services/supabase/types'
import { UserProvider } from '@/services/supabase/userProvider'
const { chats } = useChats()
const { isLoggedIn } = inject<UserProvider>('user')
const $q = useQuasar()
const route = useRoute()
const workspace: Ref<Workspace> = inject('workspace')

console.log('chats', chats.value)
async function addItem() {
  await supabase.from('chats').insert({
    name: 'New chat',
    is_public: true,
    is_group: true
  })
}

function renameItem(chat: Chat) {
  $q.dialog({
    title: 'Rename chat',
    prompt: {
      model: chat.name,
      type: 'text',
      label: 'Chat name',
      isValid: v => v.trim() && v !== chat.name
    },
    cancel: true,
    ...dialogOptions
  }).onOk(async newName => {
    await supabase.from('chats').update({ name: newName.trim() }).eq('id', chat.id)
  })
}

function deleteItem(chat: Chat) {
  console.log('deleteItem', chat.id, chat.name)

  $q.dialog({
    title: 'Delete chat',
    message: 'Are you sure you want to delete this chat?',
    cancel: true,
    ...dialogOptions
  }).onOk(async () => {
    const { error } = await supabase
      .rpc('delete_chat_if_authorized', { chat_id: chat.id })
    if (error) {
      console.error('error', error)
      $q.notify({
        message: error.message,
        color: 'negative'
      })
    }
  })
}

const { perfs } = useUserPerfsStore()

if (isPlatformEnabled(perfs.enableShortcutKey)) {
  useListenKey(toRef(perfs, 'createSocialKey'), addItem)
}
</script>

<template>
  <q-list>
    <q-item
      clickable
      @click="addItem"
      text-sec
      item-rd
    >
      <q-item-section
        avatar
        min-w-0
      >
        <q-icon name="sym_o_add_comment" />
      </q-item-section>
      <q-item-section>
        {{ 'Create channel' }}
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
      <q-item-section>
        {{ chat.name }}
      </q-item-section>
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
const { chats } = useChats()
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
    title: 'Rename channel',
    prompt: {
      model: chat.name,
      type: 'text',
      label: 'Channel name',
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
    title: 'Delete channel',
    message: 'Are you sure you want to delete this channel?',
    cancel: true,
    ...dialogOptions
  }).onOk(async () => {
    await supabase.from('chats').delete().eq('id', chat.id)
  })
}

const { perfs } = useUserPerfsStore()

if (isPlatformEnabled(perfs.enableShortcutKey)) {
  useListenKey(toRef(perfs, 'createSocialKey'), addItem)
}
</script>

<template>
  <view-common-header @toggle-drawer="$emit('toggle-drawer')">
    <div>{{ chat?.name }}</div>
    <q-space />
  </view-common-header>
  <q-page-container bg-sur-c-low>
    <q-page
      flex
      flex-col
      :style-fn="pageFhStyle"
    >
      <div
        grow
        bg-sur
        of-y-auto
        py-4
        px-4
        ref="scrollContainer"
        pos-relative
        :class="{ 'rd-r-lg': rightDrawerAbove }"
        @scroll="onScroll"
      >
        <template
          v-for="i in messages"
          :key="i"
        >
          <chat-message-item
            class="message-item"
            :message="i"
            :scroll-container
          />
        </template>
      </div>
      <div
        bg-sur-c-low
        p-2
        pos-relative
      >
        <div
          v-if="isPlatformEnabled(perfs.dialogScrollBtn)"
          pos-absolute
          top--1
          right-2
          flex="~ col"
          text-sec
          translate-y="-100%"
          z-1
        >
          <q-btn
            flat
            round
            dense
            icon="sym_o_first_page"
            rotate-90
            @click="scroll('top')"
          />
          <q-btn
            flat
            round
            dense
            icon="sym_o_keyboard_arrow_up"
            @click="scroll('up')"
          />
          <q-btn
            flat
            round
            dense
            icon="sym_o_keyboard_arrow_down"
            @click="scroll('down')"
          />
          <q-btn
            flat
            round
            dense
            icon="sym_o_last_page"
            rotate-90
            @click="scroll('bottom')"
          />
        </div>
        <div
          style="display: flex; align-items: stretch; height: 56px"
          v-if="userStore.isLoggedIn"
        >
          <a-input
            ref="messageInput"
            style="flex: 1 1 0%"
            max-h-50vh
            of-y-auto
            v-model="inputMessage"
            outlined
            autogrow
            clearable
            :debounce="30"
            :placeholder="$t('dialogView.chatPlaceholder')"
            @keydown.enter="onEnter"
          />

          <q-btn
            unelevated
            class="h-full flex items-center"
            @click="send"
          >
            <q-icon :name="'sym_o_send'" />
            <span class="q-ml-sm">{{ $t("dialogView.send") }}</span>
          </q-btn>
        </div>
        <div
          v-else
          class="h-full flex items-center justify-center"
          style="font-size: 16px; color: var(--q-text-secondary); height: 56px"
        >
          Authenticate to send messages...
        </div>
      </div>
    </q-page>
  </q-page-container>
</template>

<script setup lang="ts">
import { QPageContainer, QPage, useQuasar } from "quasar"
import { computed, inject, nextTick, ref, watch } from "vue"

import { useUiStateStore } from "@/shared/store/uiState"
import { useUserStore } from "@/shared/store/user"
import { useUserPrefsStore } from "@/shared/store/userPrefs"
import {
  almostEqual,
  isPlatformEnabled,
  pageFhStyle,
} from "@/shared/utils/functions"

import ChatMessageItem from "@/features/chats/components/ChatMessageItem.vue"
import { useChatsStore } from "@/features/chats/store"
import { useChatMessagesStore } from "@/features/chats/store/chatMessages"

import { ChatMapped, ChatMessageWithProfile } from "@/services/data/supabase/types"

import ViewCommonHeader from "@/layouts/components/ViewCommonHeader.vue"
const props = defineProps<{
  id: string
}>()

const scrollContainer = ref<HTMLElement>()
const { data: perfs } = useUserPrefsStore()
const lockingBottom = ref(false)
let lastScrollTop

function scrollListener () {
  const container = scrollContainer.value

  if (container.scrollTop < lastScrollTop) {
    lockingBottom.value = false
  }

  lastScrollTop = container.scrollTop
}
// function lockBottom() {
//   lockingBottom.value && scroll('bottom', 'auto')
// }
watch(lockingBottom, (val) => {
  if (val) {
    lastScrollTop = scrollContainer.value.scrollTop
    scrollContainer.value.addEventListener("scroll", scrollListener)
  } else {
    lastScrollTop = null
    scrollContainer.value.removeEventListener("scroll", scrollListener)
  }
})

function getEls () {
  const container = scrollContainer.value
  const items: HTMLElement[] = Array.from(
    document.querySelectorAll(".message-item")
  )

  return { container, items }
}

function scroll (
  action: "up" | "down" | "top" | "bottom",
  behavior: "smooth" | "auto" = "smooth"
) {
  const { container, items } = getEls()

  if (action === "top") {
    container.scrollTo({ top: 0, behavior })

    return
  } else if (action === "bottom") {
    container.scrollTo({ top: container.scrollHeight, behavior })

    return
  }

  function itemInView (item: HTMLElement, container: HTMLElement) {
    return (
      item.offsetTop <= container.scrollTop + container.clientHeight &&
      item.offsetTop + item.clientHeight > container.scrollTop
    )
  }
  // Get current position
  const index = items.findIndex((item) => itemInView(item, container))
  const itemTypes = items.map((i) =>
    i.clientHeight > container.clientHeight ? "partial" : "entire"
  )
  let position: "start" | "inner" | "end" | "out"
  const item = items[index]
  const type = itemTypes[index]

  if (type === "partial") {
    if (almostEqual(container.scrollTop, item.offsetTop, 5)) {
      position = "start"
    } else if (
      almostEqual(
        container.scrollTop + container.clientHeight,
        item.offsetTop + item.clientHeight,
        5
      )
    ) {
      position = "end"
    } else if (
      container.scrollTop + container.clientHeight <
      item.offsetTop + item.clientHeight
    ) {
      position = "inner"
    } else {
      position = "out"
    }
  } else {
    if (almostEqual(container.scrollTop, item.offsetTop, 5)) {
      position = "start"
    } else {
      position = "out"
    }
  }

  // Scroll
  let top

  if (type === "entire") {
    if (action === "up") {
      if (position === "start") {
        if (index === 0) return

        top =
          itemTypes[index - 1] === "entire"
            ? items[index - 1].offsetTop
            : items[index - 1].offsetTop +
              items[index - 1].clientHeight -
              container.clientHeight
      } else {
        top = item.offsetTop
      }
    } else {
      if (index === items.length - 1) return

      top = items[index + 1].offsetTop
    }
  } else {
    if (action === "up") {
      if (position === "start") {
        if (index === 0) return

        top =
          itemTypes[index - 1] === "entire"
            ? items[index - 1].offsetTop
            : items[index - 1].offsetTop +
              items[index - 1].clientHeight -
              container.clientHeight
      } else if (position === "out") {
        top = item.offsetTop + item.clientHeight - container.clientHeight
      } else {
        top = item.offsetTop
      }
    } else {
      if (position === "end" || position === "out") {
        if (index === items.length - 1) return

        top = items[index + 1].offsetTop
      } else {
        top = item.offsetTop + item.clientHeight - container.clientHeight
      }
    }
  }

  container.scrollTo({ top: top + 2, behavior: "smooth" })
}
const rightDrawerAbove = inject("rightDrawerAbove")

const chatsStore = useChatsStore()
const chatMessagesStore = useChatMessagesStore()
const messages = computed<ChatMessageWithProfile[]>(
  () => chatMessagesStore.messagesByChat[props.id] ?? []
)
const chat = computed<ChatMapped>(() =>
  chatsStore.chats.find((chat) => chat.id === props.id)
)

watch(
  () => props.id,
  (newId) => {
    chatMessagesStore.fetchMessages(newId)
  },
  { immediate: true }
)

const uiStateStore = useUiStateStore()
const userStore = useUserStore()
const scrollTops = uiStateStore.dialogScrollTops
const $q = useQuasar()

function onScroll (ev) {
  scrollTops[props.id] = ev.target.scrollTop
}
// watch(() => liveData.value.dialog?.id, id => {
//   if (!id) return
//   nextTick(() => {
//     scrollContainer.value?.scrollTo({ top: scrollTops[id] ?? 0 })
//   })
// })

watch(
  () => messages.value.length,
  (newLength, oldLength) => {
    if (newLength > oldLength) {
      // New message added
      nextTick().then(() => {
        scroll("bottom")
      })
    }
  }
)

async function send () {
  chatMessagesStore
    .add({
      chat_id: props.id,
      sender_id: userStore.currentUserId,
      content: inputMessage.value,
    })
    .catch((error) => {
      console.error("error", error)
      $q.notify({
        message: error.message,
        color: "negative",
      })
    })

  inputMessage.value = ""
}

function onEnter (ev) {
  if (ev.ctrlKey || ev.shiftKey) return

  send()
  ev.preventDefault()
}

const inputMessage = ref("")

defineEmits(["toggle-drawer"])
</script>

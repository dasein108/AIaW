<template>
  <div
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
      title="Scroll to Top"
      @click="scrollToTop"
    />
    <q-btn
      flat
      round
      dense
      icon="sym_o_keyboard_arrow_up"
      title="Scroll Up"
      @click="scrollUp"
    />
    <q-btn
      flat
      round
      dense
      icon="sym_o_keyboard_arrow_down"
      title="Scroll Down"
      @click="scrollDown"
    />
    <q-btn
      flat
      round
      dense
      icon="sym_o_last_page"
      rotate-90
      title="Scroll to Bottom"
      @click="scrollToBottom"
    />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  scrollContainer: HTMLElement | null
}>()

const emit = defineEmits<{
  switchTo: [target: 'prev' | 'next' | 'first' | 'last']
  regenerateCurr: []
  editCurr: []
  focusInput: []
}>()

// Basic scroll functions
function scrollToTop() {
  props.scrollContainer?.scrollTo({ top: 0, behavior: 'smooth' })
}

function scrollToBottom() {
  props.scrollContainer?.scrollTo({
    top: props.scrollContainer.scrollHeight,
    behavior: 'smooth'
  })
}

function scrollUp() {
  if (!props.scrollContainer) return

  const container = props.scrollContainer
  const items: HTMLElement[] = Array.from(document.querySelectorAll('.message-item'))
  const visibleIndex = items.findIndex(item =>
    item.offsetTop > container.scrollTop &&
    item.offsetTop < container.scrollTop + container.clientHeight
  )
  if (visibleIndex > 0) {
    container.scrollTo({ top: items[visibleIndex - 1].offsetTop, behavior: 'smooth' })
  }
}

function scrollDown() {
  if (!props.scrollContainer) return

  const container = props.scrollContainer
  const items: HTMLElement[] = Array.from(document.querySelectorAll('.message-item'))
  const visibleIndex = items.findIndex(item =>
    item.offsetTop > container.scrollTop &&
    item.offsetTop < container.scrollTop + container.clientHeight
  )
  if (visibleIndex !== -1 && visibleIndex < items.length - 1) {
    container.scrollTo({ top: items[visibleIndex + 1].offsetTop, behavior: 'smooth' })
  }
}
</script>

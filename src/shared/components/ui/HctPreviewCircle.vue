<template>
  <div
    :style="style"
    rd-full
  />
</template>

<script setup>
import { Hct, hexFromArgb } from "@material/material-color-utilities"
import { computed } from "vue"

const props = defineProps({
  hue: {
    type: Number,
    required: true,
  },
  chroma: {
    type: Number,
    default: 48,
  },
  tone: {
    type: Number,
    default: 45,
  },
  size: {
    type: Number,
    default: 32,
  },
})
const style = computed(() => ({
  backgroundColor: hexFromArgb(
    Hct.from(props.hue, props.chroma, props.tone).toInt()
  ),
  width: `${props.size}px`,
  height: `${props.size}px`,
}))
</script>

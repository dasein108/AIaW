<template>
  <div
    cursor-ew-resize
    @mousedown="onMouseDown"
  />
</template>

<!--
  NOTE: This component should be renamed to DraggableSeparator.vue
  The current name has a typo ('Dragable' instead of 'Draggable')
-->

<script setup lang="ts">
const props = defineProps<{
  reverse?: boolean
  min?: number
  max?: number
}>()
const model = defineModel<number>()

function onMouseDown (ev: MouseEvent) {
  const initial = model.value
  const startX = ev.clientX

  function onMouseMove (ev: MouseEvent) {
    const delta = ev.clientX - startX
    let res = initial + (props.reverse ? -delta : delta)
    const { min = -Infinity, max = Infinity } = props

    if (res < min) res = min

    if (res > max) res = max

    model.value = res
  }
  addEventListener("mousemove", onMouseMove)
  addEventListener(
    "mouseup",
    () => {
      removeEventListener("mousemove", onMouseMove)
    },
    { once: true }
  )
}
</script>

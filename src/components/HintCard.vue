<template>
  <div
    w="175px"
    mx-a
  >
    <img
      :src="imgUrl"
      w-full
      h-a
    >
    <div text="on-sur-var center">
      {{ message }}
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  imgUrl: string
  message: string
}>()
</script>

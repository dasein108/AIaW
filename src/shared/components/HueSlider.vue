<template>
  <q-slider
    v-model="model"
    selection-color="transparent"
    color="white"
    track-size="20px"
    :min="0"
    :max="360"
  />
</template>

<script setup lang="ts">
const model = defineModel<number>()
</script>

<style lang="scss" scoped>
.q-slider :is(.q-slider__track) {
  background: linear-gradient(
    to right,
    #984061,
    #8f4e00,
    #566500,
    #006b5b,
    #006590,
    #684fa4,
    #984061
  );
}
</style>

<template>
  <div
    flex
    items-center
    justify-between
    class="w-full"
  >
    <div class="btn-container">
      <q-btn
        @click="back"
        v-if="back"
        :icon="'sym_o_keyboard_arrow_left'"
        dense
        flat
        round
        size="lg"
        mr-2
      />
    </div>
    <div class="w-full">
      <slot />
    </div>
    <div class="btn-container">
      <q-btn
        @click="next"
        v-if="next"
        :icon="'sym_o_keyboard_arrow_right'"
        dense
        flat
        round
        size="lg"
        ml-2
      />
    </div>
  </div>
</template>
<script setup lang="ts">

defineProps<{
  next?:() => void
  back?: () => void
}>()

</script>
<style scoped>
.btn-container {
  width: 50px;
}
</style>

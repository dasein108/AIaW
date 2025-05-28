<template>
  <q-btn
    flat
    dense
    size="xs"
    icon="sym_o_more_vert"
    @click.prevent.stop="showMenu"
  />
</template>

<script setup lang="ts">
import { QMenu } from 'quasar'
import { Ref } from 'vue'

const props = defineProps<{
  menuRef: Ref<QMenu | null>
}>()

function showMenu(e: Event) {
  props.menuRef?.value?.show(e)
}
</script>

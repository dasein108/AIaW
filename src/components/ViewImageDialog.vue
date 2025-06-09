<template>
  <q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
    maximized
  >
    <img
      :src="url"
      object-contain
      max-w-100vw
      max-h-100vh
    >
  </q-dialog>
</template>

<script setup lang="ts">
import { useDialogPluginComponent } from "quasar"

defineProps<{
  url: string
}>()

defineEmits([...useDialogPluginComponent.emits])

const { dialogRef, onDialogHide } = useDialogPluginComponent()
</script>

<template>
  <q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
  >
    <q-card
      important:md:max-w="720px"
      important:lg:max-w="960px"
      min-w="300px"
    >
      <q-card-section bg-sur-c-low>
        <md-preview
          :model-value="markdown"
          v-bind="mdPreviewProps"
          bg-sur-c-low
          max-h="50vh"
        />
      </q-card-section>
      <q-card-actions bg-sur-c-low>
        <q-btn
          flat
          color="primary"
          icon="sym_o_check_small"
          :label="$t('viewFileDialog.ok')"
          @click="onDialogOK"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { MdPreview } from "md-editor-v3"
import { useDialogPluginComponent } from "quasar"

import { useMdPreviewProps } from "@/shared/composables/mdPreviewProps"

defineProps<{
  markdown: string
}>()

defineEmits([...useDialogPluginComponent.emits])

const { dialogRef, onDialogHide, onDialogOK } = useDialogPluginComponent()

const mdPreviewProps = useMdPreviewProps()
</script>

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
      <q-card-section v-if="title">
        <div class="text-h6">
          {{ title }}
        </div>
      </q-card-section>
      <q-card-section bg-sur-c-low>
        <md-preview
          :model-value="markdown"
          v-bind="mdPreviewProps"
          bg-sur-c-low
          max-h="70vh"
        />
      </q-card-section>
      <q-card-actions
        bg-sur-c-low
        class="row justify-end"
      >
        <template
          v-for="action in customActions"
          :key="action.label"
        >
          <q-btn
            flat
            class="ml-2"
            color="primary"
            :icon="action.icon"
            :label="action.label"
            @click="action.onClick().finally(() => {
              onDialogOK()
            })"
          />
        </template>
        <template v-if="!customActions || customActions.length === 0">
          <q-btn
            flat
            color="primary"
            icon="sym_o_check_small"
            :label="$t('viewFileDialog.ok')"
            @click="onDialogOK"
          />
        </template>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { MdPreview } from "md-editor-v3"
import { useDialogPluginComponent } from "quasar"

import { useMdPreviewProps } from "@/shared/composables/mdPreviewProps"
type CustomAction = {
  label: string
  icon: string
  onClick: () => Promise<void>
}
defineProps<{
  markdown: string
  title?: string
  customActions?: CustomAction[]
}>()

defineEmits([...useDialogPluginComponent.emits])

const { dialogRef, onDialogHide, onDialogOK } = useDialogPluginComponent()

const mdPreviewProps = useMdPreviewProps()
</script>

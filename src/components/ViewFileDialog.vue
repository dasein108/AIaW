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
        <div class="text-h6">
          {{ file.name }}
        </div>
      </q-card-section>
      <q-card-section
        p-0
        bg-sur-c-low
      >
        <div v-if="file.content_text">
          <md-preview
            :model-value="markdown"
            v-bind="mdPreviewProps"
            bg-sur-c-low
            max-h="70vh"
          />
        </div>
        <div v-if="file.content_buffer">
          <q-list>
            <q-item>
              <q-item-section>
                {{ $t('viewFileDialog.fileSize') }}
              </q-item-section>
              <q-item-section side>
                {{ sizeStr(file.content_buffer.length) }}
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                {{ $t('viewFileDialog.fileType') }}
              </q-item-section>
              <q-item-section side>
                {{ file.mime_type }}
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </q-card-section>
      <q-card-actions
        bg-sur-c-low
      >
        <copy-btn
          v-if="file.content_text"
          flat
          :label="$t('viewFileDialog.copy')"
          color="primary"
          :value="file.content_text"
        />
        <q-btn
          v-if="file.content_buffer"
          flat
          :label="$t('viewFileDialog.download')"
          color="primary"
          icon="sym_o_download"
          @click="download"
        />
        <q-space />
        <q-btn
          flat
          color="primary"
          :label="$t('viewFileDialog.ok')"
          @click="onDialogOK"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { MdPreview } from 'md-editor-v3'
import { useDialogPluginComponent } from 'quasar'
import { wrapCode, wrapQuote } from 'src/utils/functions'
import { StoredItem } from 'src/utils/types'
import { codeExtensions } from 'src/utils/values'
import { computed } from 'vue'
import CopyBtn from './CopyBtn.vue'
import { useMdPreviewProps } from 'src/composables/md-preview-props'
import { exportFile } from 'src/utils/platform-api'

const props = defineProps<{
  file: StoredItem
}>()

defineEmits([
  ...useDialogPluginComponent.emits
])

const { dialogRef, onDialogHide, onDialogOK } = useDialogPluginComponent()

function sizeStr(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  else return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

const markdown = computed(() => {
  const { file } = props
  if (file.type === 'quote') return wrapQuote(file.content_text)
  const splits = file.name.split('.')
  if (splits.length < 2) return file.content_text
  const ext = splits.at(-1)
  return codeExtensions.includes(ext)
    ? wrapCode((file.content_text), ext)
    : (file.content_text)
})

function download() {
  exportFile(props.file.name, props.file.content_buffer)
}

const mdPreviewProps = useMdPreviewProps()
</script>

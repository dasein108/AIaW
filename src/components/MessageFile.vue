<template>
  <q-chip
    :label="file.name"
    :removable
    :icon
    icon-remove="sym_o_close"
    @remove="$emit('remove')"
    @click="viewFile"
    clickable
  />
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar'
import { StoredItemMapped } from '@/services/supabase/types'
import ViewFileDialog from './ViewFileDialog.vue'
import { computed } from 'vue'
import { codeExtensions } from 'src/utils/values'

const props = defineProps<{
  file: StoredItemMapped,
  removable?: boolean
}>()

defineEmits(['remove'])

const $q = useQuasar()
function viewFile() {
  $q.dialog({
    component: ViewFileDialog,
    componentProps: {
      file: props.file
    }
  })
}

const icon = computed(() => {
  const ext = props.file.name.split('.').pop()
  if (codeExtensions.includes(ext)) {
    return 'sym_o_code'
  }
  return 'sym_o_description'
})
</script>

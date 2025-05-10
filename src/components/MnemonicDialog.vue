<template>
  <q-dialog
    v-model="isOpen"
    persistent
  >
    <q-card style="min-width: 350px">
      <q-card-section>
        <div class="text-h6">
          Connect with Mnemonic
        </div>
      </q-card-section>

      <q-card-section>
        <q-input
          v-model="mnemonic"
          type="textarea"
          label="Enter mnemonic phrase"
          :rules="[val => !!val || 'Mnemonic is required']"
          autogrow
        />
      </q-card-section>

      <q-card-actions
        align="right"
        class="text-primary"
      >
        <q-btn
          flat
          label="Cancel"
          @click="onCancel"
        />
        <q-btn
          flat
          label="Connect"
          @click="onConnect"
          :disable="!mnemonic"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'connect': [mnemonic: string]
}>()

const isOpen = ref(props.modelValue)
const mnemonic = ref('')

watch(() => props.modelValue, (newVal) => {
  isOpen.value = newVal
})

watch(isOpen, (newVal) => {
  emit('update:modelValue', newVal)
})

const onCancel = () => {
  isOpen.value = false
  mnemonic.value = ''
}

const onConnect = () => {
  emit('connect', mnemonic.value)
  mnemonic.value = ''
  isOpen.value = false
}
</script>

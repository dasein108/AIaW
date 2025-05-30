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
          class="q-mb-md"
        />
        <q-input
          v-model="pin"
          type="password"
          label="PIN code"
          :rules="[
            val => !!val || 'PIN is required',
            val => val.length === 4 || 'PIN must be 4 digits'
          ]"
          mask="####"
          unmasked-value
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
          :disable="!isFormValid"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'connect': [mnemonic: string, pin: string]
}>()

const isOpen = ref(props.modelValue)
const mnemonic = ref('')
const pin = ref('')

const isFormValid = computed(() => {
  return mnemonic.value && pin.value.length === 4
})

watch(() => props.modelValue, (newVal) => {
  isOpen.value = newVal
})

watch(isOpen, (newVal) => {
  emit('update:modelValue', newVal)
})

const onCancel = () => {
  isOpen.value = false
  mnemonic.value = ''
  pin.value = ''
}

const onConnect = () => {
  emit('connect', mnemonic.value, pin.value)
  mnemonic.value = ''
  pin.value = ''
  isOpen.value = false
}
</script>

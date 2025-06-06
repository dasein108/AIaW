<template>
  <q-dialog
    v-model="isVisible"
    persistent
    maximized
    :no-esc-dismiss="true"
    :no-backdrop-dismiss="true"
  >
    <q-card class="full-width full-height bg-primary text-white">
      <q-card-section class="full-height column justify-center items-center">
        <div class="text-h4 q-mb-lg">
          Enter PIN Code
        </div>

        <q-input
          v-model="pin"
          type="password"
          mask="####"
          unmasked-value
          outlined
          dark
          class="pin-input"
          :rules="[val => val.length === 4 || 'PIN must be 4 digits']"
          @keyup.enter="handleSubmit"
        >
          <template #prepend>
            <q-icon name="sym_o_lock" />
          </template>
        </q-input>

        <q-btn
          label="Confirm"
          color="secondary"
          class="q-mt-lg"
          :disable="pin.length !== 4"
          @click="handleSubmit"
        />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const isVisible = ref(false)
const pin = ref('')

const emit = defineEmits<{(e: 'submit', pin: string): void}>()

const show = () => {
  isVisible.value = true
  pin.value = ''
}

const hide = () => {
  isVisible.value = false
}

const handleSubmit = () => {
  if (pin.value.length === 4) {
    emit('submit', pin.value)
    hide()
  } else {
    $q.notify({
      type: 'negative',
      message: 'Please enter a 4-digit PIN code'
    })
  }
}

defineExpose({
  show,
  hide
})
</script>

<style lang="scss" scoped>
.pin-input {
  width: 200px;
  :deep(.q-field__control) {
    background: rgba(255, 255, 255, 0.1);
  }
}
</style>

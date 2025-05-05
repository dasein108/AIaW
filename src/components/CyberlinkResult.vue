<template>
  <div class="cyberlink-result">
    <div>Cyber transacion:</div>
    <pre v-if="result && !result.id">{{ result }}</pre>
    <div
      v-if="!isDeclined"
      class="button-group"
    >
      <button
        @click="handleAccept"
        class="accept-button"
      >
        Accept
      </button>
      <button
        @click="handleDecline"
        class="decline-button"
      >
        Decline
      </button>
    </div>
    <div
      v-else
      class="declined-message"
    >
      Transaction Declined!
    </div>
  </div>
</template>

<script setup lang="ts">
import { KeplerWallet } from '@/lib/contexts/kepler/KeplerWallet'
import { computed, ComputedRef, inject, ref } from 'vue'

const props = defineProps<{ result: any }>()
const itemMap = inject<ComputedRef>('itemMap')
const wallet = inject<KeplerWallet>('kepler')
const result = computed(() => JSON.parse(itemMap.value[props.result[0]].contentText))
const isDeclined = ref(false)

const handleAccept = async () => {
  const tx = await wallet.executeTransaction(result.value)
  console.log('Transaction executed', tx)
}

const handleDecline = () => {
  isDeclined.value = true
}
</script>

<style scoped>
.cyberlink-result {
  padding: 12px;
  margin: 8px 0;
}

.button-group {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

button {
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: 500;
}

.accept-button {
  background-color: #4CAF50;
  color: white;
}

.decline-button {
  background-color: #f44336;
  color: white;
}

.declined-message {
  color: #f44336;
  font-weight: 500;
  margin-top: 12px;
}
</style>

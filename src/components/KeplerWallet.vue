<template>
  <div class="kepler-wallet">
    <div
      v-if="!walletState.isConnected"
      class="not-connected"
    >
      <q-btn
        color="primary"
        @click="connectWallet"
        label="Connect Wallet"
      />
    </div>
    <div
      v-else
      class="connected"
    >
      <div class="address">
        {{ walletState.address }}
      </div>
      <q-btn
        color="grey"
        outline
        @click="disconnectWallet"
        label="Disconnect"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import { KeplerWallet } from '@/services/kepler/KeplerWallet'

const wallet = inject<KeplerWallet>('kepler')

const walletState = computed(() => wallet.state.value)

const connectWallet = async () => {
  try {
    await wallet.connect()
  } catch (error) {
    console.error('Failed to connect wallet:', error)
    // You might want to show an error message to the user here
  }
}

const disconnectWallet = async () => {
  try {
    await wallet.disconnect()
  } catch (error) {
    console.error('Failed to disconnect wallet:', error)
  }
}
</script>

<style scoped>
.kepler-wallet {
  padding: 1rem;
  border-radius: 8px;
  background-color: var(--q-background-soft);
}

.not-connected,
.connected {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.address {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-family: monospace;
  word-break: break-all;
}

</style>

<template>
  <div class="kepler-wallet">
    <div
      v-if="!isWeb3Connected"
      class="not-connected"
    >
      <q-btn
        color="primary"
        @click="connectWallet"
        :loading="isLoading"
        label="Connect Wallet"
        :disable="!hasKeplr || isLoading"
      />
    </div>
    <div
      v-else
      class="connected"
    >
      <span
        v-if="walletAddress"
        class="address"
        @click="copyAddress"
        title="Click to copy address"
        style="cursor: pointer;"
      >
        {{ walletAddress }}
      </span>
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
import { useQuasar } from "quasar"
import { computed, inject } from "vue"

import { useWalletAuth } from "@/features/auth/composables/useWalletAuth"
import { useAuthStore } from "@/features/auth/store/auth"

import { KeplerWallet } from "@/services/blockchain/kepler/KeplerWallet"

const hasKeplr = computed(() => typeof window !== "undefined" && window.keplr)
const keplerWallet = inject<KeplerWallet>("kepler")
const authStore = useAuthStore()
const { authenticateWithWallet, isLoading } = useWalletAuth()

const isWeb3Connected = computed(() => authStore.isGranterActuallyConnected)
const walletAddress = computed(() => authStore.walletInfo?.address || "")

const connectWallet = async () => {
  try {
    await authenticateWithWallet()
  } catch (error) {
    console.error("Failed to connect wallet:", error)
  }
}

const disconnectWallet = async () => {
  try {
    await keplerWallet?.disconnect()
    authStore.disconnect()
  } catch (error) {
    console.error("Failed to disconnect wallet:", error)
  }
}

const $q = useQuasar()

const copyAddress = async () => {
  if (!walletAddress.value) return

  try {
    await navigator.clipboard.writeText(walletAddress.value)
    $q.notify({ message: "Address copied!", color: "positive" })
  } catch (e) {
    $q.notify({ message: "Failed to copy address", color: "negative" })
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
  justify-content: flex-end;
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

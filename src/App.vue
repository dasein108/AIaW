<template>
  <router-view />
  <pin-modal
    v-model="showPinModal"
    @submit="handlePinSubmit"
  />
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useFirstVisit } from './composables/first-visit'
import { useLoginDialogs } from './composables/login-dialogs'
import { useSetTheme } from './composables/set-theme'
import { useSubscriptionNotify } from './composables/subscription-notify'
import { onMounted, provide, ref, inject } from 'vue'
import { checkUpdate, ready } from './utils/update'
import { createKeplerWallet } from './services/kepler/KeplerWallet'
import { createCosmosSigner } from './services/cosmos/CosmosWallet'
import { IsTauri, IsWeb } from './utils/platform-api'
import { WalletService } from './services/authz/wallet-service'
// import { createDbService } from './services/database/Db'

import { createUserProvider } from './services/supabase/userProvider'
import { useQuasar } from 'quasar'
import { usePinModal } from './composables/use-pin-modal'
import PinModal from './components/PinModal.vue'
import { getMnemonic } from './stores/tauri-store'
import { EncryptionService } from './services/encryption/EncryptionService'
import type { CosmosWallet } from './services/cosmos/CosmosWallet'
import { useAuthStore } from './stores/auth'

defineOptions({
  name: 'App'
})

const $q = useQuasar()
const router = useRouter()
const { showPinModal, checkEncryptedMnemonic } = usePinModal()

// Create and provide wallets
const keplerWallet = createKeplerWallet()
provide('kepler', keplerWallet)

let cosmosWallet: CosmosWallet | null = null
if (IsTauri) {
  cosmosWallet = createCosmosSigner()
  provide('cosmos', cosmosWallet)
}
// provide('db', createDbService())

// Provide user provider
const userProvider = createUserProvider()

provide('user', userProvider)

useSetTheme()
useLoginDialogs()
useFirstVisit()
useSubscriptionNotify()

router.afterEach(to => {
  if (to.meta.title) {
    document.title = `${to.meta.title} - AI as Workspace`
  }
})

// Check if user is authenticated
router.beforeEach(async (to, from, next) => {
  if (to.meta.requiresAuth && !userProvider.isLoggedIn.value) {
    $q.notify({
      message: 'Please login to access this page',
      color: 'negative'
    })
    return next('/')
  }

  return next()
})

const handlePinSubmit = async (pin: string) => {
  try {
    if (IsTauri) {
      if (!cosmosWallet) {
        throw new Error('Cosmos wallet not initialized')
      }

      const encryptedMnemonic = await getMnemonic()
      if (encryptedMnemonic) {
        const mnemonic = await EncryptionService.decryptMnemonic(encryptedMnemonic, pin)
        await cosmosWallet.connectWithMnemonic(mnemonic, pin)

        // Initialize WalletService after successful PIN verification
        const authStore = useAuthStore()
        await authStore.initializeFromStorage(cosmosWallet, pin)

        showPinModal.value = false
      }
    }

    if (IsWeb) {
      // if (!keplerWallet?.state.value.isConnected) {
      //   throw new Error('Kepler wallet not initialized')
      // }

      const authStore = useAuthStore()
      await authStore.connectWithExternalSigner(keplerWallet.getOfflineSigner())
      const encryptedMnemonic = authStore.walletInfo?.mnemonic
      if (encryptedMnemonic) {
        await authStore.connectGranteeWallet(encryptedMnemonic, pin)
      }

      showPinModal.value = false
    }
  } catch (error) {
    console.error('[App] Error during PIN verification', error)
    $q.notify({
      message: 'Invalid PIN code',
      color: 'negative'
    })
  }
}

onMounted(async () => {
  ready()
  checkUpdate()
  // Check for encrypted mnemonic on startup
  await checkEncryptedMnemonic()
  const authStore = useAuthStore()
  authStore.connectWithExternalSigner(keplerWallet.getOfflineSigner())

  console.log('[MOUNT] WALLET', cosmosWallet)
  const walletService = WalletService.getInstance()
  console.log('[MOUNT] WALLET SERVICE', walletService)
  console.log('[MOUNT] WALLET INFO', authStore)
})

</script>

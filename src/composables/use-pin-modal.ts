import { ref } from 'vue'
import { getMnemonic } from '../stores/tauri-store'
import { IsTauri } from '../utils/platform-api'
import { useAuthStore } from 'src/stores/auth'

export function usePinModal() {
  const showPinModal = ref(false)

  const checkEncryptedMnemonic = async () => {
    const authStore = useAuthStore()
    const hasMnemonic = !!(IsTauri ? await getMnemonic() : authStore.walletInfo?.mnemonic)

    if (hasMnemonic) {
      showPinModal.value = true
      return true
    }

    return false
  }

  return {
    showPinModal,
    checkEncryptedMnemonic
  }
}

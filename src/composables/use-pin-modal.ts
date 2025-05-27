import { ref } from 'vue'
import { getMnemonic } from '../stores/tauri-store'
import { IsTauri } from '../utils/platform-api'

export function usePinModal() {
  const showPinModal = ref(false)

  const checkEncryptedMnemonic = async () => {
    const encryptedMnemonic = IsTauri ? await getMnemonic() : null
    console.log('[CHECK] ENCRYPTED MNEMONIC', encryptedMnemonic)
    if (encryptedMnemonic) {
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

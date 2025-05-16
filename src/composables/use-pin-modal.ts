import { ref } from 'vue'
import { getMnemonic } from '../stores/tauri-store'
import { IsTauri } from '../utils/platform-api'

export function usePinModal() {
  const showPinModal = ref(false)

  const checkEncryptedMnemonic = async () => {
    if (!IsTauri) return false

    const encryptedMnemonic = await getMnemonic()
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

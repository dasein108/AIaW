import { useAuthStore } from "@/features/auth/store/auth"
import { ref } from "vue"
import { getMnemonic } from "@/shared/store/tauri-store"
import { IsTauri } from "@/shared/utils/platformApi"

export function usePinModal () {
  const showPinModal = ref(false)

  const checkEncryptedMnemonic = async () => {
    const authStore = useAuthStore()
    const hasMnemonic = !!(IsTauri
      ? await getMnemonic()
      : authStore.walletInfo?.mnemonic)

    if (hasMnemonic) {
      showPinModal.value = true

      return true
    }

    return false
  }

  return {
    showPinModal,
    checkEncryptedMnemonic,
  }
}

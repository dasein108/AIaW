import { ref } from "vue"
import { useAuthStore } from "@/features/auth/stores/auth"
import { getMnemonic } from "@/shared/store/tauri-store"
import { IsTauri } from "@/shared/utils/platform-api"

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

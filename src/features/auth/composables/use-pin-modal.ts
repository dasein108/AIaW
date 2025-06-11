import { useAuthStore } from "@/app/store"
import { ref } from "vue"
import { getMnemonic } from "@/app/store"
import { IsTauri } from "../utils/platform-api"

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

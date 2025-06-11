import { storeToRefs } from "pinia"
import { useUserStore } from "@/app/store"
import { watch } from "vue"

export function useUserLoginCallback (onLogin: () => Promise<void>) {
  const { isInitialized, currentUserId } = storeToRefs(useUserStore())

  watch(
    () => [currentUserId.value, isInitialized.value],
    ([newId, newInit], old) => {
      const [oldId] = old ?? []

      if (newId !== oldId || !oldId) {
        if (newInit) {
          onLogin()
        }
      }
    }
  )
}

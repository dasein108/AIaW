import { useUserStore } from "src/stores/user"
import { watch } from "vue"

export function useUserLoginCallback(onLogin: () => Promise<void>) {
  const userStore = useUserStore()

  watch(
    () => userStore.currentUserId,
    (newId, oldId) => {
      if (newId !== oldId || !oldId) {
        onLogin()
      }
    },
    { immediate: true }
  )
}

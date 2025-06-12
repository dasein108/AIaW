import { useQuasar } from "quasar"
import { ref, watch } from "vue"
import { useUserPerfsStore } from "src/stores/user-perfs"

export function useSetTheme () {
  const $q = useQuasar()
  const userPerfsStore = useUserPerfsStore()
  const theme = ref<"auto" | "light" | "dark">(
    userPerfsStore.data.darkMode === "auto"
      ? "auto"
      : userPerfsStore.data.darkMode
        ? "dark"
        : "light"
  )

  watch(
    () => theme.value,
    (val) => {
      userPerfsStore.data.darkMode = val === "auto" ? "auto" : val === "dark"

      switch (val) {
        case "auto":
          $q.dark.set("auto")
          break
        case "light":
          $q.dark.set(false)
          break
        case "dark":
          $q.dark.set(true)
          break
      }
    },
    { immediate: true }
  )

  return {
    theme,
  }
}

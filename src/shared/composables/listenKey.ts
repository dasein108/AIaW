import { ShortcutKey } from "@/shared/types"
import { onActivated, onDeactivated, onMounted, onUnmounted, Ref } from "vue"

export function useListenKey (
  shortcutKey: Ref<ShortcutKey>,
  callback,
  prevent = true
) {
  const listener = (event) => {
    if (!shortcutKey.value) return

    const {
      key,
      withCtrl = false,
      withShift = false,
      withAlt = false,
    } = shortcutKey.value

    if (
      event.code === key &&
      event.ctrlKey === withCtrl &&
      event.shiftKey === withShift &&
      event.altKey === withAlt
    ) {
      callback()
      prevent && event.preventDefault()
    }
  }
  const addListener = () => {
    document.addEventListener("keydown", listener)
  }
  const removeListener = () => {
    document.removeEventListener("keydown", listener)
  }
  onMounted(addListener)
  onUnmounted(removeListener)
  onActivated(addListener)
  onDeactivated(removeListener)
}

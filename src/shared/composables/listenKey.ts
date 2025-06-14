import { onActivated, onDeactivated, onMounted, onUnmounted, Ref } from "vue"

import { ShortcutKey } from "@/shared/types"

/**
 * Composable for handling keyboard shortcuts with lifecycle management
 *
 * Sets up a keydown event listener that triggers a callback when a specific
 * keyboard shortcut is pressed. The listener is automatically added and removed
 * during component lifecycle events (mounted, unmounted, activated, deactivated).
 *
 * @param shortcutKey - Reference to a ShortcutKey configuration
 * @param callback - Function to call when the shortcut is triggered
 * @param prevent - Whether to prevent the default browser behavior (default: true)
 * @example
 * const enterKey = ref({ key: 'Enter' });
 * useListenKey(enterKey, () => {
 *   console.log('Enter key pressed');
 * });
 *
 * // With modifier keys
 * const saveKey = ref({ key: 'KeyS', withCtrl: true });
 * useListenKey(saveKey, saveDocument);
 */
export function useListenKey(
  shortcutKey: Ref<ShortcutKey>,
  callback: () => void,
  prevent = true
): void {
  /**
   * Event handler for keydown events
   * Checks if the pressed key matches the configured shortcut
   */
  const listener = (event: KeyboardEvent): void => {
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

  /**
   * Adds the keydown event listener to the document
   */
  const addListener = (): void => {
    document.addEventListener("keydown", listener)
  }

  /**
   * Removes the keydown event listener from the document
   */
  const removeListener = (): void => {
    document.removeEventListener("keydown", listener)
  }

  // Add and remove listeners with component lifecycle
  onMounted(addListener)
  onUnmounted(removeListener)
  onActivated(addListener)
  onDeactivated(removeListener)
}

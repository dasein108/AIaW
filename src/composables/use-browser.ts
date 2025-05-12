import { computed } from 'vue'

export function useBrowser() {
  const isBrowser = computed(() => typeof window !== 'undefined' && window.keplr)

  return {
    isBrowser
  }
}

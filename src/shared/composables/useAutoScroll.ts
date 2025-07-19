import { ComputedRef, onUnmounted, ref, Ref, watch } from 'vue'

export interface UseAutoScrollOptions {
  /**
   * Scroll behavior - smooth or instant
   */
  behavior?: 'auto' | 'smooth'
  /**
   * Debounce delay in milliseconds to prevent excessive scrolling
   */
  debounceMs?: number
  /**
   * Whether to observe character data changes (useful for streaming text)
   */
  observeCharacterData?: boolean
}

/**
 * Composable for automatic scrolling based on content changes
 * Replaces the need for manual 'rendered' event emissions
 */
export function useAutoScroll(
  scrollContainer: Ref<HTMLElement | null>,
  shouldScroll: ComputedRef<boolean>,
  options: UseAutoScrollOptions = {}
) {
  const {
    behavior = 'smooth',
    debounceMs = 16, // ~60fps
    observeCharacterData = true
  } = options

  const observer = ref<MutationObserver | null>(null)
  const debounceTimer = ref<number | null>(null)

  /**
   * Scroll to a specific position
   */
  const scroll = (position: 'top' | 'bottom' = 'bottom') => {
    if (!scrollContainer.value) return

    const container = scrollContainer.value
    const targetPosition = position === 'bottom'
      ? container.scrollHeight - container.clientHeight
      : 0

    container.scrollTo({
      top: targetPosition,
      behavior
    })
  }

  /**
   * Debounced scroll function to prevent excessive calls
   */
  const debouncedScroll = (position: 'top' | 'bottom' = 'bottom') => {
    if (debounceTimer.value) {
      clearTimeout(debounceTimer.value)
    }

    debounceTimer.value = window.setTimeout(() => {
      if (shouldScroll.value) {
        requestAnimationFrame(() => scroll(position))
      }
    }, debounceMs)
  }

  /**
   * Set up the MutationObserver to watch for content changes
   */
  const setupObserver = () => {
    if (!scrollContainer.value) return

    // Clean up existing observer
    if (observer.value) {
      observer.value.disconnect()
    }

    // Create new observer
    observer.value = new MutationObserver((mutations) => {
      // Only scroll if we should be auto-scrolling
      if (!shouldScroll.value) return

      // Check if any mutations are relevant (content changes, new elements, etc.)
      const hasRelevantChanges = mutations.some(mutation =>
        mutation.type === 'childList' ||
        (observeCharacterData && mutation.type === 'characterData')
      )

      if (hasRelevantChanges) {
        debouncedScroll('bottom')
      }
    })

    // Start observing
    observer.value.observe(scrollContainer.value, {
      childList: true,
      subtree: true,
      characterData: observeCharacterData,
      characterDataOldValue: false // We don't need old values for performance
    })
  }

  /**
   * Manually trigger scroll (useful for initial setup or external triggers)
   */
  const scrollToBottom = () => debouncedScroll('bottom')
  const scrollToTop = () => debouncedScroll('top')

  /**
   * Check if container is currently scrolled to bottom (within threshold)
   */
  const isAtBottom = (threshold = 10) => {
    if (!scrollContainer.value) return false

    const { scrollTop, scrollHeight, clientHeight } = scrollContainer.value

    return scrollHeight - scrollTop - clientHeight <= threshold
  }

  // Watch for changes in container or shouldScroll state
  watch(
    [scrollContainer, shouldScroll],
    ([container, should]) => {
      if (container && should) {
        setupObserver()
      } else if (observer.value) {
        observer.value.disconnect()
      }
    },
    { immediate: true }
  )

  // Cleanup on component unmount
  onUnmounted(() => {
    if (observer.value) {
      observer.value.disconnect()
    }

    if (debounceTimer.value) {
      clearTimeout(debounceTimer.value)
    }
  })

  return {
    scroll,
    scrollToBottom,
    scrollToTop,
    isAtBottom,
    debouncedScroll
  }
}

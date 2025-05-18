import { StoredItem, AvatarImage } from 'src/utils/types'
import { onUnmounted, Ref, ref, watch } from 'vue'

const objectURLs: {
  [id: string]: { url: string, active: number }
} = {}

export function useFileURL(file: Ref<StoredItem | AvatarImage>) {
  const url = ref(null)
  function mount({ id, contentBuffer, mimeType }: StoredItem | AvatarImage) {
    if (objectURLs[id]) {
      objectURLs[id].active++
      url.value = objectURLs[id].url
    } else {
      const blob = new Blob([contentBuffer], { type: mimeType })
      url.value = URL.createObjectURL(blob)
      objectURLs[id] = { url: url.value, active: 1 }
    }
  }
  function unmount({ id }) {
    objectURLs[id].active--
    if (objectURLs[id].active === 0) {
      URL.revokeObjectURL(objectURLs[id].url)
      delete objectURLs[id]
    }
  }
  watch(file, (to, from) => {
    to && mount(to)
    from && unmount(from)
  }, { immediate: true })
  onUnmounted(() => {
    file.value && unmount(file.value)
  })
  return url
}

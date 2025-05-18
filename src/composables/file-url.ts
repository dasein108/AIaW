import { AvatarImage } from 'src/utils/types'
import { StoredItem } from '@/services/supabase/types'
import { onUnmounted, Ref, ref, watch } from 'vue'

const objectURLs: {
  [id: string]: { url: string, active: number }
} = {}

export function useFileURL(file: Ref<StoredItem | AvatarImage>) {
  const url = ref(null)
  function mount({ id, content_buffer, mime_type }: StoredItem | AvatarImage) {
    if (objectURLs[id]) {
      objectURLs[id].active++
      url.value = objectURLs[id].url
    } else {
      const blob = new Blob([content_buffer], { type: mime_type })
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

import { Ref, ref, watch } from 'vue'
import { db } from 'src/utils/db'
import { useFileURL } from './file-url'
import { AvatarImage } from 'src/utils/types'

export function useAvatarImage(imageId: Ref<string>) {
  const image = ref<AvatarImage>(null)
  console.log("---useAvatarImage imageId", imageId.value)
  watch(imageId, to => {
    if (to) {
      db.avatarImages.get(to).then(i => {
        image.value = i
      })
    } else {
      image.value = null
    }
  }, { immediate: true })
  return useFileURL(image)
}

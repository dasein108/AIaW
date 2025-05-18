import { Ref } from 'vue'
import { getAvatarUrl } from './storage/utils'

export function useAvatarImage(imageId: Ref<string>) {
  // const image = ref<AvatarImage>(null)
  // console.log("---useAvatarImage imageId", imageId.value)
  // watch(imageId, to => {
  //   if (to) {
  //     db.avatarImages.get(to).then(i => {
  //       image.value = i
  //     })
  //   } else {
  //     image.value = null
  //   }
  // }, { immediate: true })
  // return useFileURL(image)
  return getAvatarUrl(imageId.value)
}

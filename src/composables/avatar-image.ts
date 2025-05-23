import { Ref } from 'vue'
import { getAvatarUrl } from './storage/utils'

export function useAvatarImage(imageId: Ref<string>) {
  return getAvatarUrl(imageId.value)
}

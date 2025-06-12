import { Ref } from "vue"
import { getAvatarUrl } from "@/composables/storage/utils"

export function useAvatarImage (imageId: Ref<string>) {
  return getAvatarUrl(imageId.value)
}

import { BucketName } from "./types"

export const BASE_URL = `${process.env.SUPABASE_URL}/storage/v1/object/public/`

export const getAvatarUrl = (id: string) => {
  return `${BASE_URL}${'avatar.images' as BucketName}/${id}`
}

export const getFileUrl = (id: string) => {
  return `${BASE_URL}${'files' as BucketName}/${id}`
}

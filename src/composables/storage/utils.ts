export const AVATAR_BUCKET = 'avatar.images'
export const FILES_BUCKET = 'files'
export const BASE_URL = `${process.env.SUPABASE_URL}/storage/v1/object/public/`

export const getAvatarUrl = (id: string) => {
  return `${BASE_URL}${AVATAR_BUCKET}/${id}`
}

export const getFileUrl = (id: string) => {
  return `${BASE_URL}${FILES_BUCKET}/${id}`
}

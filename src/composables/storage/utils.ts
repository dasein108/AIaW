export const STORAGE_BUCKET = 'avatar.images'
export const BASE_AVATAR_URL = process.env.SUPABASE_URL + '/storage/v1/object/public/' + STORAGE_BUCKET

export const getAvatarUrl = (id: string) => {
  return BASE_AVATAR_URL + '/' + id
}

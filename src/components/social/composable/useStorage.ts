import { supabase } from 'src/services/supabase/client'

const STORAGE_BUCKET = 'avatar.images'

export function useStorage() {
  const uploadFile = async (file: File) => {
    const { data, error } = await supabase.storage.from(STORAGE_BUCKET).upload(file.name, file)
    if (error) {
      console.error('Error uploading file:', error)
      throw error
    }
    return data.path
  }

  const getFileUrl = async (path: string) => {
    const { data, error } = await supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path)
    if (error) {
      console.error('Error getting file url:', error)
    }
    return data
  }

  const deleteFile = async (path: string) => {
    const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([path])
    if (error) {
      console.error('Error deleting file:', error)
    }
  }

  return { uploadFile, getFileUrl, deleteFile }
}

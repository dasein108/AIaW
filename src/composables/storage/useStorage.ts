import { supabase } from 'src/services/supabase/client'
import { STORAGE_BUCKET } from './utils'

export function useStorage() {
  const uploadFile = async (file: File) => {
    console.log("---uploadFile", file)
    const { data, error } = await supabase.storage.from(STORAGE_BUCKET).upload(file.name, file)
    console.log("---uploadFile data", data)
    if (error) {
      console.error('Error uploading file:', error)
      throw error
    }
    return data.path
  }

  const getFileUrl = async (path: string) => {
    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path)
    console.log("---getFileUrl data", data)
    return data.publicUrl
  }

  const deleteFile = async (path: string) => {
    const cleanPath = path.replace(/^avatar\.images\//, '')
    console.log("---deleteFile path:", cleanPath)

    const { data, error } = await supabase.storage.from(STORAGE_BUCKET).remove([cleanPath])
    console.log("---deleteFile result:", { data, error })

    if (error) {
      console.error('Error deleting file:', error)
    }
  }

  return { uploadFile, getFileUrl, deleteFile }
}

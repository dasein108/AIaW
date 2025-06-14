import { fileTypeFromBuffer } from "file-type"
import { supabase } from "@/services/data/supabase/client"
import { genId } from "@/shared/utils/functions"
import { BASE_URL } from "./utils"
import { StoredItemMapped } from "@/services/data/supabase/types"
import { ApiResultItem } from "@/shared/types"
import { BucketName } from "./types"

/**
 * Detects the MIME type and file extension from an ArrayBuffer containing file data
 *
 * @param arrayBuffer - The ArrayBuffer containing the raw file data to analyze
 * @returns Promise resolving to an object with MIME type and extension properties, or null if detection fails
 * @throws Error if the buffer is invalid or cannot be processed
 *
 * @example
 * ```typescript
 * const buffer = await file.arrayBuffer()
 * const fileType = await detectMimeType(buffer)
 * if (fileType) {
 *   console.log(`Type: ${fileType.mime}, Extension: ${fileType.ext}`)
 * }
 * ```
 */
async function detectMimeType (arrayBuffer: ArrayBuffer) {
  const uint8Array = new Uint8Array(arrayBuffer)
  const fileType = await fileTypeFromBuffer(uint8Array)

  if (fileType) {
    console.log(`Detected: ${fileType.mime}, Extension: ${fileType.ext}`)

    return fileType
  } else {
    console.log("MIME type not detected")

    return null
  }
}

/**
 * Composable hook for managing file storage operations with Supabase Storage
 *
 * Provides a comprehensive set of methods for file upload, download, deletion,
 * URL generation, and specialized handling of API result items. Supports multiple
 * storage buckets including files, avatars, and other media types.
 *
 * @returns Object containing all storage operation methods and utilities
 *
 * @example
 * ```typescript
 * const { uploadFile, getFileUrl, deleteFile } = useStorage()
 *
 * // Upload a file
 * const path = await uploadFile(file, 'files')
 *
 * // Get public URL
 * const url = await getFileUrl(path, 'files')
 *
 * // Delete the file
 * await deleteFile(path, 'files')
 * ```
 */
export function useStorage () {
  /**
   * Uploads a file to the specified Supabase storage bucket
   *
   * @param file - The File object to upload to storage
   * @param bucketName - The target storage bucket name (defaults to 'files')
   * @returns Promise resolving to the storage path of the uploaded file
   * @throws Error if the upload operation fails or bucket is inaccessible
   *
   * @example
   * ```typescript
   * const file = document.querySelector('input[type="file"]').files[0]
   * const path = await uploadFile(file, 'documents')
   * ```
   */
  const uploadFile = async (file: File, bucketName: BucketName = 'files') => {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(file.name, file)
    console.log("---uploadFile data", data)

    if (error) {
      console.error("Error uploading file:", error)
      throw error
    }

    return data.path
  }

  /**
   * Uploads a file specifically to the avatar images bucket
   *
   * @param file - The File object containing the avatar image to upload
   * @returns Promise resolving to the storage path of the uploaded avatar
   * @throws Error if the upload operation fails
   *
   * @example
   * ```typescript
   * const avatarFile = document.querySelector('#avatar-input').files[0]
   * const path = await uploadAvatar(avatarFile)
   * ```
   */
  const uploadAvatar = async (file: File) => {
    return uploadFile(file, 'avatar.images')
  }

  /**
   * Deletes an avatar file from the avatar images bucket
   *
   * @param path - The storage path of the avatar file to delete
   * @returns Promise that resolves when deletion is complete
   * @throws Error if deletion fails or file doesn't exist
   *
   * @example
   * ```typescript
   * await deleteAvatar('user123/avatar_abc123.jpg')
   * ```
   */
  const deleteAvatar = async (path: string) => {
    return deleteFile(path, 'avatar.images')
  }

  /**
   * Generates a public URL for accessing a file in the storage bucket
   *
   * @param path - The storage path of the file within the bucket
   * @param bucketName - The storage bucket name (defaults to 'files')
   * @returns Promise resolving to the public URL string for the file
   *
   * @example
   * ```typescript
   * const url = await getFileUrl('documents/report.pdf', 'files')
   * // Returns: https://your-project.supabase.co/storage/v1/object/public/files/documents/report.pdf
   * ```
   */
  const getFileUrl = async (path: string, bucketName: BucketName = 'files') => {
    const { data } = supabase.storage.from(bucketName).getPublicUrl(path)
    console.log("---getFileUrl data", data)

    return data.publicUrl
  }

  /**
   * Permanently deletes a file from the specified storage bucket
   *
   * @param path - The storage path of the file to delete
   * @param bucketName - The storage bucket name (defaults to 'files')
   * @returns Promise that resolves when deletion is complete
   * @throws Error if deletion fails or file doesn't exist
   *
   * @example
   * ```typescript
   * await deleteFile('temp/upload_123.txt', 'files')
   * ```
   */
  const deleteFile = async (path: string, bucketName: BucketName = 'files') => {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .remove([path])
    console.log("---deleteFile result:", { data, error })

    if (error) {
      console.error("Error deleting file:", error)
    }
  }

  /**
   * Retrieves the file size in bytes by making a HEAD request to the file URL
   *
   * @param path - The storage path of the file to check
   * @param bucketName - The storage bucket name (defaults to 'files')
   * @returns Promise resolving to the file size in bytes, or null if size cannot be determined
   *
   * @example
   * ```typescript
   * const size = await getFileSizeByUrl('documents/large-file.pdf', 'files')
   * if (size) {
   *   console.log(`File size: ${size} bytes`)
   * }
   * ```
   */
  const getFileSizeByUrl = async (path: string, bucketName: BucketName = 'files'): Promise<number | null> => {
    try {
      const response = await fetch(`${BASE_URL}${bucketName}/${path}`, {
        method: "HEAD",
      })
      const length = response.headers.get("Content-Length")

      return length ? parseInt(length, 10) : null
    } catch (error) {
      console.error("Failed to fetch file size:", error)

      return null
    }
  }

  /**
   * Uploads an API result item that contains file data to storage
   *
   * Processes the file buffer, detects MIME type, generates a unique filename,
   * and uploads to the default files bucket.
   *
   * @param item - The API result item containing file data with contentBuffer property
   * @returns Promise resolving to StoredItemMapped object with file metadata, or null if item is not a file
   * @throws Error if MIME type detection fails or upload operation fails
   *
   * @example
   * ```typescript
   * const apiItem = { type: 'file', contentBuffer: buffer, name: 'document.pdf' }
   * const storedItem = await uploadApiResultItem(apiItem)
   * if (storedItem) {
   *   console.log(`Uploaded to: ${storedItem.file_url}`)
   * }
   * ```
   */
  const uploadApiResultItem = async (item: ApiResultItem) => {
    if (item.type === "file") {
      const fileType = await detectMimeType(item.contentBuffer)

      if (fileType) {
        // remove extension from name
        const name =
          (item.name || "").replace(`.${fileType.ext}`, "") +
          `_${genId()}.${fileType.ext}`

        const buffer = item.contentBuffer
        const file = new File([buffer], name, { type: fileType.mime })
        const path = await uploadFile(file)

        return {
          name,
          file_url: path,
          mime_type: fileType.mime,
          type: "file", // fileType.mime.startsWith('image/') ? 'image' : 'file'
        } as StoredItemMapped
      } else {
        throw Error("Failed to detect mime type")
      }
    }

    return null
  }

  /**
   * Saves an API result item to storage, handling both file and text content types
   *
   * For file items: uploads the file to storage and returns combined metadata.
   * For text items: returns the text content along with provided metadata.
   * Merges the result with additional stored item data.
   *
   * @param item - The API result item to process and save
   * @param storedItemData - Additional metadata to merge with the stored item
   * @returns Promise resolving to complete StoredItemMapped object, or null if processing fails
   *
   * @example
   * ```typescript
   * const item = { type: 'text', contentText: 'Hello world' }
   * const metadata = { user_id: '123', created_at: new Date() }
   * const stored = await saveApiResultItem(item, metadata)
   * ```
   */
  // TODO: move outside storage
  const saveApiResultItem = async (
    item: ApiResultItem,
    storedItemData: Partial<StoredItemMapped>
  ): Promise<StoredItemMapped | null> => {
    if (item.type === "file") {
      const fileItem = await uploadApiResultItem(item)

      if (fileItem) {
        return {
          ...fileItem,
          ...storedItemData,
        }
      }
    }

    // Text items store in DB, not in storage
    return {
      content_text: item.contentText,
      type: item.type,
      ...storedItemData,
    }
  }

  /**
   * Saves multiple API result items concurrently using parallel processing
   *
   * Processes all items simultaneously for better performance when handling
   * multiple files or text items.
   *
   * @param items - Array of API result items to process and save
   * @param storedItemData - Common metadata to apply to all stored items
   * @returns Promise resolving to array of StoredItemMapped objects (or null for failed items)
   *
   * @example
   * ```typescript
   * const items = [fileItem1, textItem1, fileItem2]
   * const metadata = { workspace_id: 'ws123', user_id: 'user456' }
   * const results = await saveApiResultItems(items, metadata)
   * const successCount = results.filter(r => r !== null).length
   * ```
   */
  const saveApiResultItems = async (
    items: ApiResultItem[],
    storedItemData: Partial<StoredItemMapped>
  ) => {
    return Promise.all(items.map((item) => saveApiResultItem(item, storedItemData)))
  }

  return {
    uploadAvatar,
    deleteAvatar,
    uploadFile,
    getFileUrl,
    deleteFile,
    getFileSizeByUrl,
    uploadApiResultItem,
    saveApiResultItem,
    saveApiResultItems
  }
}

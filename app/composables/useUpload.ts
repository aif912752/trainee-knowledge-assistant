import { toast } from 'vue-sonner'
import { apiFetch } from './useApi'
import { uploadDocumentSchema } from '~~/shared/validations'
interface UploadedDocument {
  id: number
  filename: string
  originalName: string
  fileType: string
  fileSize: number
  contentLength: number
}

export interface UploadResponse {
  success: boolean
  data: {
    document: UploadedDocument
  }
  message?: string
}

/**
 * File upload composable
 * Handles file validation and upload
 */
export function useUpload() {
  const isLoading = ref(false)
  const error = ref<string>('')

  /**
   * Validate file type and size using shared schema
   */
  function validateFile(file: File): { valid: boolean; error?: string } {
    const result = uploadDocumentSchema.safeParse({ file })

    if (!result.success) {
      const firstError = result.error.errors?.[0]
      return {
        valid: false,
        error: firstError?.message || 'ไฟล์ไม่ถูกต้อง',
      }
    }

    return { valid: true }
  }

  /**
   * Upload file to server
   */
  async function uploadFile(file: File): Promise<UploadResponse> {
    isLoading.value = true
    error.value = ''

    // Validate file
    const validation = validateFile(file)
    if (!validation.valid) {
      error.value = validation.error || 'ไฟล์ไม่ถูกต้อง'
      toast.error('ไฟล์ไม่ถูกต้อง', {
        description: error.value,
      })
      throw new Error(error.value)
    }

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await apiFetch<UploadResponse>('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.success) {
        toast.success('อัปโหลดสำเร็จ', {
          description: `"${response.data.document.originalName}" ถูกอัปโหลดเรียบร้อยแล้ว`,
        })
      }

      return response
    } catch (err: any) {
      error.value = err.friendlyMessage || err.data?.error || 'อัปโหลดล้มเหลว'
      toast.error('อัปโหลดล้มเหลว', {
        description: error.value,
      })
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Format file size for display
   */
  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / 1024 / 1024).toFixed(2) + ' MB'
  }

  /**
   * Get file icon based on type
   */
  function getFileIcon(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase()
    return ext === 'pdf' ? '📄' : '📝'
  }

  return {
    isLoading: readonly(isLoading),
    error: readonly(error),
    validateFile,
    uploadFile,
    formatFileSize,
    getFileIcon,
  }
}

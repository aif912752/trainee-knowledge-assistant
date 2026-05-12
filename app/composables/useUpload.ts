import { toast } from 'vue-sonner'
import { apiFetch } from './useApi'
import type { Document } from '~~/types/document'

export interface UploadResponse {
  success: boolean
  document: Document
}

/**
 * File upload composable
 * Handles file validation and upload
 */
export function useUpload() {
  const isLoading = ref(false)
  const error = ref<string>('')

  /**
   * Validate file type and size
   */
  function validateFile(file: File): { valid: boolean; error?: string } {
    // Check file type
    const validTypes = ['application/pdf', 'text/plain']
    const validExtensions = ['.pdf', '.txt']
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()

    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
      return {
        valid: false,
        error: 'อนุญาตเฉพาะไฟล์ PDF และ TXT เท่านั้น',
      }
    }

    // Check file size (5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `ขนาดไฟล์ต้องไม่เกิน 5MB (ไฟล์ของคุณ: ${(file.size / 1024 / 1024).toFixed(2)}MB)`,
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
          description: `"${response.document.original_name}" ถูกอัปโหลดเรียบร้อยแล้ว`,
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

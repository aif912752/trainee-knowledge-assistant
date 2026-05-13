import { UnauthorizedError, ValidationError, handleApiError } from '~~/server/utils/errors'
import { successResponse } from '~~/server/utils/response'
import { promises as fs } from 'fs'
import { join } from 'path'

/**
 * Delete a document
 * DELETE /api/documents/[id]
 */
export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user

    if (!user) {
      return handleApiError(event, new UnauthorizedError('กรุณาเข้าสู่ระบบ'))
    }

    const id = getRouterParam(event, 'id')
    if (!id) {
      return handleApiError(event, new ValidationError('ไม่พบ ID เอกสาร'))
    }

    const db = event.context.db

    // Get document to verify ownership
    const document = db.prepare(
      'SELECT id, filename, file_path FROM documents WHERE id = ? AND user_id = ?'
    ).get(id, user.id) as any

    if (!document) {
      return handleApiError(event, new ValidationError('ไม่พบเอกสารหรือคุณไม่มีสิทธิ์เข้าถึง'))
    }

    // Delete file from disk if exists
    if (document.file_path) {
      try {
        const filePath = join(process.cwd(), 'uploads', document.file_path)
        await fs.unlink(filePath)
      } catch (err) {
        console.warn('Failed to delete file from disk:', err)
        // Continue anyway, delete from DB
      }
    }

    // Delete from database
    db.prepare('DELETE FROM documents WHERE id = ? AND user_id = ?').run(id, user.id)

    return successResponse(event, {}, 'ลบเอกสารสำเร็จ')
  } catch (error) {
    return handleApiError(event, error)
  }
})

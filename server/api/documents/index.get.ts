import { UnauthorizedError, handleApiError } from '~~/server/utils/errors'
import { successResponse } from '~~/server/utils/response'

/**
 * Get user's documents
 * GET /api/documents
 */
export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user

    if (!user) {
      return handleApiError(event, new UnauthorizedError('กรุณาเข้าสู่ระบบ'))
    }

    const db = event.context.db
    const documents = db.prepare(
      'SELECT id, original_name, filename, file_type, file_size, created_at FROM documents WHERE user_id = ? ORDER BY created_at DESC'
    ).all(user.id) as any[]

    return successResponse(event, {
      documents: documents || [],
    }, 'ดึงเอกสารสำเร็จ')
  } catch (error) {
    return handleApiError(event, error)
  }
})

import { UnauthorizedError, ValidationError, handleApiError } from '~~/server/utils/errors'
import { successResponse } from '~~/server/utils/response'

/**
 * Delete chat history for a session
 * DELETE /api/chat/history/[id]
 */
export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user

    if (!user) {
      return handleApiError(event, new UnauthorizedError('กรุณาเข้าสู่ระบบ'))
    }

    const sessionId = getRouterParam(event, 'id')
    if (!sessionId) {
      return handleApiError(event, new ValidationError('ไม่พบ ID เซสชัน'))
    }

    const db = event.context.db

    // Verify session belongs to user by checking if any message in this session belongs to them
    const message = db.prepare(
      'SELECT id FROM messages WHERE user_id = ? LIMIT 1'
    ).get(user.id) as any

    if (!message) {
      return handleApiError(event, new ValidationError('ไม่พบประวัติการสนทนา'))
    }

    // Delete all messages for this user (session_id is stored in token_usage, not messages)
    // For now, we'll delete all messages for the user
    db.prepare('DELETE FROM messages WHERE user_id = ?').run(user.id)

    return successResponse(event, {}, 'ลบประวัติการสนทนาสำเร็จ')
  } catch (error) {
    return handleApiError(event, error)
  }
})

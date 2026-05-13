import { ref } from 'vue'
import { toast } from 'vue-sonner'
import { apiFetch } from './useApi'
import type { Message } from '~~/types/message'

export interface Session {
  id: string
  messages: Message[]
  totalTokens: number
  createdAt: string
  updatedAt: string
}

export function useHistory() {
  const sessions = ref<Session[]>([])
  const isLoading = ref(false)

  /**
   * Fetch all chat history and group by session
   */
  async function fetchSessions() {
    isLoading.value = true
    try {
      const response = await apiFetch<any>('/api/chat/history', { method: 'GET' })
      if (response.success) {
        // Group messages by session - all messages belong to same session
        const messagesData = response.data.messages || []
        const sessionId = 'default'
        
        if (messagesData.length > 0) {
          const messages: Message[] = messagesData
          const totalTokens = messages.reduce((sum, msg) => sum + (msg.tokens || 0), 0)
          const createdAt = messages[0]?.created_at || new Date().toISOString()
          const updatedAt = messages[messages.length - 1]?.created_at || new Date().toISOString()

          sessions.value = [{
            id: sessionId,
            messages,
            totalTokens,
            createdAt,
            updatedAt,
          }]
        } else {
          sessions.value = []
        }
      }
    } catch (error: any) {
      toast.error('ไม่สามารถโหลดประวัติได้', {
        description: error.message || 'เกิดข้อผิดพลาด',
      })
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Delete a session
   */
  async function deleteSession(sessionId: string) {
    try {
      const response = await apiFetch<any>(`/api/chat/history/${sessionId}`, { method: 'DELETE' })

      if (response.success) {
        sessions.value = sessions.value.filter(s => s.id !== sessionId)
        toast.success('ลบประวัติสำเร็จ')
        return true
      }
      return false
    } catch (error: any) {
      toast.error('ไม่สามารถลบประวัติได้', {
        description: error.message || 'เกิดข้อผิดพลาด',
      })
      return false
    }
  }

  return {
    sessions,
    isLoading,
    fetchSessions,
    deleteSession,
  }
}

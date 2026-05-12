import { toast } from 'vue-sonner'
import type { Message } from '~~/types/message'
import type { ApiSuccessResponse } from '~~/shared/api-response'

type ChatResponse = ApiSuccessResponse<{
  message: Message
  usage: {
    input: number
    output: number
    total: number
  }
}>

type HistoryResponse = ApiSuccessResponse<{
  messages: Message[]
}>

type UsageResponse = ApiSuccessResponse<{
  usage: {
    total: number
    sessions: any[]
  }
}>

/**
 * Chat composable
 * Handles messaging and history
 */
export function useChat() {
  const messages = ref<Message[]>([])
  const isLoading = ref(false)
  const isFetchingHistory = ref(false)
  const totalTokens = ref(0)
  const sessionId = ref(`session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`)

  /**
   * Fetch chat history
   */
  async function fetchHistory(documentId?: number) {
    isFetchingHistory.value = true
    try {
      const response = await apiFetch<HistoryResponse>('/api/chat/history', {
        query: { documentId }
      })
      if (response.success) {
        messages.value = response.data.messages
      }
    } catch (err) {
      console.error('Failed to fetch history:', err)
    } finally {
      isFetchingHistory.value = false
    }
  }

  /**
   * Fetch token usage
   */
  async function fetchUsage() {
    try {
      const response = await apiFetch<UsageResponse>('/api/chat/usage')
      if (response.success) {
        totalTokens.value = response.data.usage.total
      }
    } catch (err) {
      console.error('Failed to fetch usage:', err)
    }
  }

  /**
   * Send message to AI
   */
  async function sendMessage(text: string, documentId?: number) {
    if (!text.trim() || isLoading.value) return

    // Optimistic update: Add user message locally
    const tempUserMessage: Message = {
      id: -1,
      user_id: 0, // Will be set by server
      document_id: documentId || null,
      role: 'user',
      content: text,
      tokens: 0,
      created_at: new Date().toISOString()
    }
    messages.value.push(tempUserMessage)

    isLoading.value = true
    try {
      const response = await apiFetch<ChatResponse>('/api/chat', {
        method: 'POST',
        headers: {
          'x-chat-session-id': sessionId.value
        },
        body: {
          message: text,
          documentId
        }
      })

      if (response.success) {
        // Replace temp message with server message if needed, or just refresh history
        // For simplicity, we just add the assistant message
        messages.value.push(response.data.message)
        // Update usage
        await fetchUsage()
      }
      return response
    } catch (err: any) {
      const errorMsg = err.data?.error || 'ไม่สามารถส่งข้อความได้'
      toast.error('เกิดข้อผิดพลาด', {
        description: errorMsg
      })
      // Remove the optimistic message on failure?
      messages.value = messages.value.filter(m => m.id !== -1)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Clear chat history
   */
  async function clearChat() {
    try {
      const response = await apiFetch<any>('/api/chat/history', {
        method: 'DELETE'
      })
      if (response.success) {
        messages.value = []
        toast.success('ล้างประวัติสำเร็จ')
      }
    } catch (err) {
      toast.error('ไม่สามารถล้างประวัติได้')
    }
  }

  return {
    messages,
    isLoading,
    isFetchingHistory,
    totalTokens,
    sessionId,
    fetchHistory,
    fetchUsage,
    sendMessage,
    clearChat
  }
}

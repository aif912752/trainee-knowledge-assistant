import { toast } from 'vue-sonner'
import type { Message } from '~~/types/message'
import type { ApiSuccessResponse } from '~~/shared/api-response'
import { parseChatStreamChunk } from '~~/shared/chat-stream'

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
  const isTyping = ref(false)
  const isFetchingHistory = ref(false)
  const totalTokens = ref(0)
  const sessionId = ref(`session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`)

  /**
   * Fetch chat history
   */
  async function fetchHistory(documentId?: number) {
    isFetchingHistory.value = true
    try {
      const response = await api.get<HistoryResponse>('/api/chat/history', { documentId })
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
      const response = await api.get<UsageResponse>('/api/chat/usage')
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
      created_at: new Date().toISOString(),
      model: null
    }
    messages.value.push(tempUserMessage)

    // Optimistic update: Add assistant placeholder
    const tempAssistantMessage: Message = {
      id: -2,
      user_id: 0,
      document_id: documentId || null,
      role: 'assistant',
      content: '',
      tokens: 0,
      created_at: new Date().toISOString(),
      model: null
    }
    messages.value.push(tempAssistantMessage)

    isLoading.value = true
    isTyping.value = true
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-chat-session-id': sessionId.value
        },
        body: JSON.stringify({ message: text, documentId, stream: true })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || errorData.error || 'ไม่สามารถส่งข้อความได้')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (reader) {
        let buffer = ''
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          isTyping.value = false // Data started flowing

          // Add new chunk to buffer and split by lines
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || '' // Keep the last incomplete line

          // Parse complete lines
          for (const line of lines) {
            const parsed = parseChatStreamChunk(line + '\n')
            if (parsed.content) tempAssistantMessage.content += parsed.content
            if (parsed.model && !tempAssistantMessage.model) tempAssistantMessage.model = parsed.model
          }
        }
        
        // Process any remaining buffer
        if (buffer) {
          const parsed = parseChatStreamChunk(buffer)
          if (parsed.content) tempAssistantMessage.content += parsed.content
        }
      }

      // Re-fetch to sync exact DB IDs and Token counts in the background
      await fetchUsage()
      fetchHistory(documentId) 
      
      return { success: true }
    } catch (err: any) {
      toast.error('เกิดข้อผิดพลาด', {
        description: err.message || 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์'
      })
      // Remove the optimistic messages on failure
      messages.value = messages.value.filter(m => m.id !== -1 && m.id !== -2)
      throw err
    } finally {
      isLoading.value = false
      isTyping.value = false
    }
  }

  /**
   * Clear chat history
   */
  async function clearChat() {
    try {
      const response = await api.delete<any>('/api/chat/history')
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
    isTyping,
    isFetchingHistory,
    totalTokens,
    sessionId,
    fetchHistory,
    fetchUsage,
    sendMessage,
    clearChat
  }
}

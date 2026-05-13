import { toast } from 'vue-sonner'
import type { Message } from '~~/types/message'
import type { ApiSuccessResponse } from '~~/shared/api-response'
import { ChatStreamParser } from '~~/shared/chat-stream'
import { estimateTokens } from '~~/shared/tokens'
import { apiFetch } from './useApi'

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
  async function sendMessage(text: string, documentId?: number, useStreaming = true) {
    if (!text.trim() || isLoading.value) return

    // 1. Add user message optimistically
    const userMsgId = Date.now()
    messages.value.push({
      id: userMsgId,
      user_id: 0,
      document_id: documentId || null,
      role: 'user',
      content: text,
      tokens: estimateTokens(text),
      created_at: new Date().toISOString(),
      model: null
    })

    // 2. Add empty assistant message for streaming
    const assistantMsgId = userMsgId + 1
    messages.value.push({
      id: assistantMsgId,
      user_id: 0,
      document_id: documentId || null,
      role: 'assistant',
      content: '',
      tokens: 0,
      created_at: new Date().toISOString(),
      model: null
    })

    isLoading.value = true
    try {
      if (useStreaming) {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-chat-session-id': sessionId.value
          },
          body: JSON.stringify({
            message: text,
            documentId,
            stream: true
          })
        })

        if (!response.ok) {
          throw new Error('Streaming failed')
        }

        const reader = response.body?.getReader()
        const decoder = new TextDecoder()
        const parser = new ChatStreamParser()
        
        if (!reader) throw new Error('No reader')

        let accumulatedContent = ''
        isTyping.value = true

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          
          isTyping.value = false // Data is coming

          const chunk = decoder.decode(value, { stream: true })
          const parsed = parser.parse(chunk)

          if (parsed.error) {
            throw new Error(parsed.error.message)
          }

          if (parsed.content) {
            accumulatedContent += parsed.content
            // Update assistant message content
            const msg = messages.value.find(m => m.id === assistantMsgId)
            if (msg) {
              msg.content = accumulatedContent
              if (parsed.model && !msg.model) {
                msg.model = parsed.model
              }
              // Update tokens on the fly (estimation)
              msg.tokens = estimateTokens(accumulatedContent)
            }
          }

          // If stream provides final usage
          if (parsed.usage) {
             const msg = messages.value.find(m => m.id === assistantMsgId)
             if (msg) {
               msg.tokens = parsed.usage.output
             }
          }
        }
        
        // Final flush if any
        const finalParsed = parser.flush()
        if (finalParsed.content) {
          accumulatedContent += finalParsed.content
          const msg = messages.value.find(m => m.id === assistantMsgId)
          if (msg) {
            msg.content = accumulatedContent
            msg.tokens = estimateTokens(accumulatedContent)
          }
        }
        
        // Refresh usage after stream ends
        await fetchUsage()
      } else {
        // Fallback to non-streaming if needed
        const response = await apiFetch<ChatResponse>('/api/chat', {
          method: 'POST',
          headers: { 'x-chat-session-id': sessionId.value },
          body: { message: text, documentId }
        })
        
        if (response.success) {
          // Replace the placeholder assistant message
          messages.value = messages.value.filter(m => m.id !== assistantMsgId)
          messages.value.push(response.data.message)
          await fetchUsage()
        }
      }
    } catch (err: any) {
      console.error('Chat error:', err)
      
      const errorMsg = err.message || 'ไม่สามารถส่งข้อความได้'
      
      // Update assistant message with error instead of deleting
      const msg = messages.value.find(m => m.id === assistantMsgId)
      if (msg) {
        msg.content = `⚠️ **ข้อผิดพลาด:** ${errorMsg}`
      } else {
        // If message was somehow not added, add it now
        messages.value.push({
          id: assistantMsgId,
          user_id: 0,
          document_id: documentId || null,
          role: 'assistant',
          content: `⚠️ **ข้อผิดพลาด:** ${errorMsg}`,
          tokens: 0,
          created_at: new Date().toISOString(),
          model: 'error'
        })
      }
      
      toast.error('เกิดข้อผิดพลาด', {
        description: errorMsg
      })
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

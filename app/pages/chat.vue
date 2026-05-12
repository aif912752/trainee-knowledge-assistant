<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue'
import { Send, Bot, User, Trash2, ArrowLeft, Loader2, Sparkles, FileText } from 'lucide-vue-next'
import { useChat } from '~/composables/useChat'
import { useUpload } from '~/composables/useUpload'
import { useRoute, useRouter } from 'vue-router'

definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const router = useRouter()
const { messages, isLoading, isFetchingHistory, totalTokens, fetchHistory, fetchUsage, sendMessage, clearChat } = useChat()
const { formatFileSize } = useUpload()

const inputMessage = ref('')
const scrollContainer = ref<HTMLElement | null>(null)
const selectedDocumentId = ref<number | undefined>(
  route.query.documentId ? parseInt(route.query.documentId as string, 10) : undefined
)

// Auto-scroll to bottom when messages change
watch(messages, () => {
  nextTick(() => {
    if (scrollContainer.value) {
      scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight
    }
  })
}, { deep: true })

onMounted(async () => {
  await Promise.all([
    fetchHistory(selectedDocumentId.value),
    fetchUsage()
  ])
})

const handleSend = async () => {
  if (!inputMessage.value.trim() || isLoading.value) return
  
  const text = inputMessage.value
  inputMessage.value = ''
  
  try {
    await sendMessage(text, selectedDocumentId.value)
  } catch (err) {
    // Error is handled in composable with toast
    inputMessage.value = text // Restore input on failure
  }
}

const handleClear = async () => {
  if (confirm('คุณแน่ใจหรือไม่ว่าต้องการล้างประวัติการสนทนาทั้งหมด?')) {
    await clearChat()
  }
}

const formatTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <div class="flex flex-col h-screen bg-slate-50 dark:bg-slate-950">
    <!-- Header -->
    <header class="flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-900 border-b shadow-sm shrink-0">
      <div class="flex items-center gap-4">
        <Button variant="ghost" size="icon" @click="router.push('/')">
          <ArrowLeft class="w-5 h-5" />
        </Button>
        <div>
          <h1 class="text-xl font-bold flex items-center gap-2">
            <Sparkles class="w-5 h-5 text-indigo-500" />
            แชทกับผู้ช่วย AI
          </h1>
          <p v-if="selectedDocumentId" class="text-xs text-slate-500 flex items-center gap-1">
            <FileText class="w-3 h-3" />
            กำลังสนทนาโดยใช้บริบทจากไฟล์
          </p>
        </div>
      </div>
      
      <div class="flex items-center gap-4">
        <div class="hidden md:flex flex-col items-end">
          <span class="text-xs text-slate-500 uppercase font-bold tracking-wider">Token ที่ใช้ไป</span>
          <span class="text-sm font-mono font-bold text-indigo-600">{{ totalTokens.toLocaleString() }}</span>
        </div>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger as-child>
              <Button variant="outline" size="icon" class="text-slate-500 hover:text-red-500 hover:border-red-200" @click="handleClear">
                <Trash2 class="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>ล้างการสนทนา</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </header>

    <!-- Chat Area -->
    <main 
      ref="scrollContainer"
      class="flex-1 overflow-y-auto p-6 space-y-6"
    >
      <!-- Empty State -->
      <div v-if="messages.length === 0 && !isFetchingHistory" class="h-full flex flex-col items-center justify-center text-center space-y-4">
        <div class="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
          <Bot class="w-10 h-10 text-indigo-600" />
        </div>
        <div class="max-w-md">
          <h2 class="text-2xl font-bold text-slate-800 dark:text-slate-200">เริ่มการสนทนาใหม่</h2>
          <p class="text-slate-500 mt-2">
            สวัสดีครับ! ผมคือผู้ช่วยอัจฉริยะ คุณสามารถถามคำถามทั่วไป หรือถามเกี่ยวกับไฟล์ที่อัปโหลดไว้ก็ได้ครับ
          </p>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isFetchingHistory" class="flex justify-center py-10">
        <Loader2 class="w-8 h-8 text-indigo-500 animate-spin" />
      </div>

      <!-- Message List -->
      <div 
        v-for="msg in messages" 
        :key="msg.id"
        class="flex w-full"
        :class="[msg.role === 'user' ? 'justify-end' : 'justify-start']"
      >
        <div 
          class="flex max-w-[85%] md:max-w-[70%] group"
          :class="[msg.role === 'user' ? 'flex-row-reverse' : 'flex-row']"
        >
          <!-- Avatar -->
          <div 
            class="shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1"
            :class="[msg.role === 'user' ? 'ml-3 bg-slate-200' : 'mr-3 bg-indigo-600']"
          >
            <User v-if="msg.role === 'user'" class="w-4 h-4 text-slate-600" />
            <Bot v-else class="w-4 h-4 text-white" />
          </div>

          <!-- Content -->
          <div class="space-y-1">
            <div 
              class="px-4 py-3 rounded-2xl shadow-sm text-sm"
              :class="[
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none'
              ]"
            >
              <div class="whitespace-pre-wrap leading-relaxed">{{ msg.content }}</div>
            </div>
            
            <div 
              class="flex items-center gap-2 text-[10px] text-slate-400"
              :class="[msg.role === 'user' ? 'justify-end' : 'justify-start']"
            >
              <span>{{ formatTime(msg.created_at) }}</span>
              <span v-if="msg.tokens > 0" class="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                • {{ msg.tokens }} tokens
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Assistant Typing -->
      <div v-if="isLoading" class="flex justify-start">
        <div class="flex flex-row mr-3">
          <div class="shrink-0 w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center mr-3 mt-1">
            <Bot class="w-4 h-4 text-white" />
          </div>
          <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm">
            <div class="flex gap-1.5 h-4 items-center">
              <span class="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span class="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span class="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer Input -->
    <footer class="p-6 bg-white dark:bg-slate-900 border-t shrink-0">
      <div class="max-w-4xl mx-auto relative">
        <textarea
          v-model="inputMessage"
          placeholder="พิมพ์ข้อความของคุณที่นี่..."
          class="w-full pl-4 pr-14 py-3 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none transition-all shadow-inner min-h-[54px] max-h-32 text-sm"
          rows="1"
          @keydown.enter.prevent="handleSend"
        ></textarea>
        <Button 
          class="absolute right-2 bottom-2 rounded-xl h-9 w-9 p-0 bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all active:scale-95"
          :disabled="!inputMessage.trim() || isLoading"
          @click="handleSend"
        >
          <Send class="w-4 h-4" />
        </Button>
      </div>
      <p class="text-[10px] text-center text-slate-400 mt-3">
        AI อาจให้ข้อมูลที่คลาดเคลื่อน โปรดตรวจสอบข้อมูลที่สำคัญเสมอ
      </p>
    </footer>
  </div>
</template>

<style scoped>
/* Custom scrollbar for chat area */
main::-webkit-scrollbar {
  width: 6px;
}
main::-webkit-scrollbar-track {
  background: transparent;
}
main::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
.dark main::-webkit-scrollbar-thumb {
  background: #334155;
}
</style>

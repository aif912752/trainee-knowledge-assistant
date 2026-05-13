<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import { Bot, FileText, Loader2, Send, Trash2, User } from 'lucide-vue-next'
import { useRoute } from 'vue-router'
import { useChat } from '~/composables/useChat'
import MarkdownRenderer from '~/components/MarkdownRenderer.vue'
import { Button } from '~/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip'

definePageMeta({
  middleware: 'auth',
})

const route = useRoute()
const { messages, isLoading, isTyping, isFetchingHistory, totalTokens, fetchHistory, fetchUsage, sendMessage, clearChat } = useChat()

const inputMessage = ref('')
const scrollContainer = ref<HTMLElement | null>(null)
const selectedDocumentId = ref<number | undefined>(
  route.query.documentId ? parseInt(route.query.documentId as string, 10) : undefined,
)

watch(
  messages,
  () => {
    nextTick(() => {
      if (scrollContainer.value) {
        scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight
      }
    })
  },
  { deep: true },
)

onMounted(async () => {
  await Promise.all([
    fetchHistory(selectedDocumentId.value),
    fetchUsage(),
  ])
})

const handleSend = async () => {
  if (!inputMessage.value.trim() || isLoading.value) return

  const text = inputMessage.value
  inputMessage.value = ''

  try {
    await sendMessage(text, selectedDocumentId.value)
  } catch (err) {
    inputMessage.value = text
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
    minute: '2-digit',
  })
}
</script>

<template>
  <div class="flex h-screen flex-col bg-background text-foreground">
    <AppHeader active="chat" />

    <main ref="scrollContainer" class="min-h-0 flex-1 overflow-y-auto">
      <div class="mx-auto flex min-h-full w-full max-w-4xl flex-col px-4 py-6 sm:px-6">
        <div v-if="selectedDocumentId" class="mb-4">
          <span class="inline-flex items-center gap-1.5 rounded-md border bg-card px-3 py-1.5 text-xs text-muted-foreground shadow-sm">
            <FileText class="size-3.5 text-primary" />
            ใช้บริบทจากเอกสารที่เลือก
          </span>
        </div>

        <div v-if="messages.length === 0 && !isFetchingHistory" class="flex flex-1 items-center justify-center py-12 text-center">
          <div class="max-w-lg">
            <div class="mx-auto mb-5 flex size-16 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
              <Bot class="size-8" />
            </div>
            <h2 class="text-2xl font-bold">เริ่มการสนทนาใหม่</h2>
            <p class="mt-3 leading-7 text-muted-foreground">
              ถามคำถามทั่วไป หรือถามจากไฟล์ที่อัปโหลดไว้ ระบบจะตอบโดยอ้างอิงบริบทที่เกี่ยวข้อง
            </p>
          </div>
        </div>

        <div v-if="isFetchingHistory" class="flex flex-1 items-center justify-center py-12">
          <Loader2 class="size-8 animate-spin text-primary" />
        </div>

        <div v-if="messages.length > 0" class="space-y-6">
          <div
            v-for="msg in messages"
            :key="msg.id"
            class="flex w-full"
            :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
          >
            <div class="group flex max-w-[92%] gap-3 sm:max-w-[78%]" :class="msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'">
              <div
                class="mt-1 flex size-8 shrink-0 items-center justify-center rounded-lg"
                :class="msg.role === 'user' ? 'bg-secondary text-secondary-foreground' : 'bg-primary text-primary-foreground'"
              >
                <User v-if="msg.role === 'user'" class="size-4" />
                <Bot v-else class="size-4" />
              </div>

              <div class="min-w-0 space-y-1">
                <div v-if="msg.role === 'assistant' && msg.model" class="px-1 text-[10px] font-medium text-muted-foreground uppercase tracking-tight">
                  {{ msg.model }}
                </div>
                <div
                  class="rounded-xl px-4 py-3 text-sm shadow-sm"
                  :class="[
                    msg.role === 'user'
                      ? 'rounded-tr-sm bg-primary text-primary-foreground selection:bg-white/25 selection:text-white'
                      : 'rounded-tl-sm border bg-card text-card-foreground selection:bg-orange-100 selection:text-orange-900',
                  ]"
                >
                  <div v-if="msg.role === 'user'" class="whitespace-pre-wrap wrap-break-word leading-7">{{ msg.content }}</div>
                  <MarkdownRenderer v-else :content="msg.content" />
                </div>

                <div
                  class="flex items-center gap-2 text-[10px] text-muted-foreground/70"
                  :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
                >
                  <span>{{ formatTime(msg.created_at) }}</span>
                  <template v-if="msg.tokens > 0">
                    <span class="mx-0.5 select-none">·</span>
                    <span class="font-medium text-primary/80">{{ msg.tokens }} tokens</span>
                  </template>
                  <span v-if="msg.role === 'assistant' && isTyping && msg.id === messages[messages.length - 1]?.id" class="flex items-center gap-1 text-primary">
                    <span class="size-1 rounded-full bg-current animate-pulse"></span>
                    <span class="size-1 rounded-full bg-current animate-pulse [animation-delay:0.2s]"></span>
                    <span class="size-1 rounded-full bg-current animate-pulse [animation-delay:0.4s]"></span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="isLoading && !messages.some(m => m.role === 'assistant' && m.content)" class="flex justify-start">
            <div class="flex gap-3">
              <div class="mt-1 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Bot class="size-4" />
              </div>
              <div class="rounded-xl rounded-tl-sm border bg-card px-4 py-3 shadow-sm">
                <div class="flex items-center gap-2">
                  <div class="flex gap-1">
                    <span class="size-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:-0.3s]"></span>
                    <span class="size-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:-0.15s]"></span>
                    <span class="size-1.5 rounded-full bg-muted-foreground/60 animate-bounce"></span>
                  </div>
                  <span class="text-xs text-muted-foreground">กำลังคิด...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <footer class="shrink-0 border-t bg-background/95 px-4 py-4 backdrop-blur-xl sm:px-6">
      <div class="mx-auto w-full max-w-4xl">
        <div class="relative rounded-xl border bg-card p-2 shadow-sm">
          <textarea
            v-model="inputMessage"
            placeholder="พิมพ์ข้อความของคุณที่นี่..."
            class="block max-h-32 min-h-[48px] w-full resize-none rounded-lg bg-transparent py-3 pl-3 pr-14 text-sm leading-6 outline-none placeholder:text-muted-foreground focus:ring-0"
            rows="1"
            @keydown.enter.prevent="handleSend"
          ></textarea>
          <Button
            class="absolute bottom-2 right-2 size-10 rounded-lg p-0"
            :disabled="!inputMessage.trim() || isLoading"
            @click="handleSend"
          >
            <Send class="size-4" />
          </Button>
        </div>
        <div class="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
          <p>AI อาจให้ข้อมูลคลาดเคลื่อน โปรดตรวจสอบข้อมูลสำคัญเสมอ</p>
          <div class="flex items-center gap-2">
            <span class="font-mono text-primary">{{ totalTokens.toLocaleString() }}</span>
            <span>tokens</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger as-child>
                  <Button variant="ghost" size="icon-sm" class="text-muted-foreground hover:text-destructive" @click="handleClear">
                    <Trash2 class="size-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>ล้างการสนทนา</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
main::-webkit-scrollbar {
  width: 6px;
}

main::-webkit-scrollbar-track {
  background: transparent;
}

main::-webkit-scrollbar-thumb {
  background: color-mix(in srgb, var(--muted-foreground) 35%, transparent);
  border-radius: 999px;
}
</style>

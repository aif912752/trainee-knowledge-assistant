<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import { Bot, FileText, Loader2, Send, Sparkles, Trash2, User } from 'lucide-vue-next'
import { useRoute } from 'vue-router'
import { useChat } from '~/composables/useChat'

definePageMeta({
  middleware: 'auth',
})

const route = useRoute()
const { messages, isLoading, isFetchingHistory, totalTokens, fetchHistory, fetchUsage, sendMessage, clearChat } = useChat()

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

    <section class="shrink-0 border-b bg-background/90">
      <div class="mx-auto flex min-h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div class="min-w-0">
          <h1 class="flex items-center gap-2 truncate text-lg font-bold">
            <span class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Sparkles class="size-4" />
            </span>
            แชทกับผู้ช่วย AI
          </h1>
          <p v-if="selectedDocumentId" class="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            <FileText class="size-3.5" />
            ใช้บริบทจากเอกสารที่เลือก
          </p>
        </div>
        <div class="flex items-center gap-2">
          <div class="hidden rounded-lg border bg-card px-3 py-2 text-right md:block">
            <span class="block text-[11px] font-medium uppercase text-muted-foreground">Token ที่ใช้ไป</span>
            <span class="block font-mono text-sm font-bold text-primary">{{ totalTokens.toLocaleString() }}</span>
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger as-child>
                <Button variant="outline" size="icon" class="text-muted-foreground hover:text-destructive" @click="handleClear">
                  <Trash2 class="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>ล้างการสนทนา</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </section>

    <main ref="scrollContainer" class="min-h-0 flex-1 overflow-y-auto">
      <div class="mx-auto flex min-h-full w-full max-w-4xl flex-col px-4 py-6 sm:px-6">
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
                <div
                  class="rounded-xl px-4 py-3 text-sm shadow-sm"
                  :class="[
                    msg.role === 'user'
                      ? 'rounded-tr-sm bg-primary text-primary-foreground'
                      : 'rounded-tl-sm border bg-card text-card-foreground',
                  ]"
                >
                  <div class="whitespace-pre-wrap break-words leading-7">{{ msg.content }}</div>
                </div>

                <div
                  class="flex items-center gap-2 text-[11px] text-muted-foreground"
                  :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
                >
                  <span>{{ formatTime(msg.created_at) }}</span>
                  <span v-if="msg.tokens > 0" class="opacity-0 transition-opacity group-hover:opacity-100">
                    {{ msg.tokens }} tokens
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="isLoading" class="flex justify-start">
            <div class="flex gap-3">
              <div class="mt-1 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Bot class="size-4" />
              </div>
              <div class="rounded-xl rounded-tl-sm border bg-card px-4 py-3 shadow-sm">
                <div class="flex h-5 items-center gap-1.5">
                  <span class="size-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:-0.3s]"></span>
                  <span class="size-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:-0.15s]"></span>
                  <span class="size-1.5 rounded-full bg-muted-foreground/60 animate-bounce"></span>
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
        <p class="mt-3 text-center text-[11px] text-muted-foreground">
          AI อาจให้ข้อมูลคลาดเคลื่อน โปรดตรวจสอบข้อมูลสำคัญเสมอ
        </p>
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

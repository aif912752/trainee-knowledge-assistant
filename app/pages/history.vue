<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { MessageSquare, Trash2, Calendar, Zap, Loader2, Search, Filter, MoreVertical, Eye } from 'lucide-vue-next'
import { useHistory, type Session } from '~/composables/useHistory'
import type { Message } from '~~/types/message'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '~/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/components/ui/alert-dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'

definePageMeta({
  middleware: 'auth',
})

const router = useRouter()
const { sessions, isLoading, fetchSessions, deleteSession } = useHistory()

const searchQuery = ref('')
const filterRole = ref<'all' | 'user' | 'assistant'>('all')
const deleteDialogOpen = ref(false)
const sessionToDelete = ref<Session | null>(null)
const selectedSession = ref<Session | null>(null)

const filteredSessions = computed(() => {
  let filtered = sessions.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(session =>
      session.messages.some(msg =>
        msg.content.toLowerCase().includes(query)
      )
    )
  }

  return filtered.sort((a, b) =>
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )
})

const filteredMessages = computed(() => {
  if (!selectedSession.value) return []

  let filtered = selectedSession.value.messages

  if (filterRole.value !== 'all') {
    filtered = filtered.filter(msg => msg.role === filterRole.value)
  }

  return filtered
})

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatTime = (dateStr: string): string => {
  const date = new Date(dateStr)
  return date.toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

const getPreview = (content: string, length: number = 100): string => {
  if (content.length <= length) return content
  return content.substring(0, length) + '...'
}

const handleDeleteSession = async () => {
  if (!sessionToDelete.value) return

  const success = await deleteSession(sessionToDelete.value.id)
  if (success && selectedSession.value?.id === sessionToDelete.value.id) {
    selectedSession.value = null
  }

  deleteDialogOpen.value = false
  sessionToDelete.value = null
}

const openDeleteDialog = (session: Session) => {
  sessionToDelete.value = session
  deleteDialogOpen.value = true
}

const selectSession = (session: Session) => {
  selectedSession.value = session
}

onMounted(() => {
  fetchSessions()
})
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <AppHeader active="history" />

    <section class="border-b bg-background/90">
      <div class="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div>
          <h1 class="text-lg font-bold">ประวัติการใช้งาน</h1>
          <p class="text-xs text-muted-foreground">ตรวจสอบบทสนทนาและการใช้ token ย้อนหลัง</p>
        </div>
        <Button variant="outline" class="gap-2" @click="fetchSessions">
          <Loader2 v-if="isLoading" class="size-4 animate-spin" />
          <span v-else>รีเฟรช</span>
        </Button>
      </div>
    </section>

    <main class="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <div class="grid gap-6 lg:grid-cols-[320px_1fr]">
        <!-- Sessions List -->
        <aside class="space-y-4">
          <div class="relative">
            <Search class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-primary" />
            <Input
              v-model="searchQuery"
              placeholder="ค้นหาประวัติ..."
              class="pl-10 bg-card border-primary/30 focus:border-primary"
            />
          </div>

          <!-- Empty State -->
          <div v-if="!isLoading && sessions.length === 0" class="flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-secondary/35 py-8 text-center">
            <MessageSquare class="mb-2 size-8 text-muted-foreground" />
            <p class="text-sm text-muted-foreground">ยังไม่มีประวัติการสนทนา</p>
          </div>

          <!-- Sessions -->
          <div v-else class="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
            <div
              v-for="session in filteredSessions"
              :key="session.id"
              class="group relative rounded-lg border bg-card p-3 cursor-pointer transition-all hover:border-primary/35 hover:shadow-md"
              :class="selectedSession?.id === session.id ? 'border-primary bg-primary/5' : ''"
              @click="selectSession(session)"
            >
              <div class="flex items-start justify-between gap-2">
                <div class="min-w-0 flex-1">
                  <p class="text-xs font-semibold text-muted-foreground">{{ formatDate(session.createdAt) }}</p>
                  <p class="mt-1 line-clamp-2 text-sm leading-5">
                    {{ getPreview(session.messages[0]?.content || 'ไม่มีข้อความ', 60) }}
                  </p>
                  <div class="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                    <MessageSquare class="size-3" />
                    <span>{{ session.messages.length }} ข้อความ</span>
                    <span class="mx-1">·</span>
                    <Zap class="size-3" />
                    <span>{{ session.totalTokens }} tokens</span>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button variant="ghost" size="icon-sm" class="opacity-0 group-hover:opacity-100">
                      <MoreVertical class="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem @click.stop="selectSession(session)" class="gap-2">
                      <Eye class="size-4" />
                      ดู
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      @click.stop="openDeleteDialog(session)"
                      class="gap-2 text-destructive focus:text-destructive"
                    >
                      <Trash2 class="size-4" />
                      ลบ
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </aside>

        <!-- Messages Detail -->
        <div class="space-y-4">
          <div v-if="!selectedSession" class="flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-secondary/35 py-16 text-center">
            <MessageSquare class="mb-4 size-12 text-muted-foreground" />
            <p class="text-muted-foreground">เลือกประวัติการสนทนาเพื่อดูรายละเอียด</p>
          </div>

          <div v-else class="space-y-4">
            <!-- Session Info -->
            <Card class="rounded-lg">
              <CardHeader>
                <div class="flex items-start justify-between">
                  <div>
                    <CardTitle class="flex items-center gap-2">
                      <Calendar class="size-5 text-primary" />
                      {{ formatDate(selectedSession.createdAt) }}
                    </CardTitle>
                    <CardDescription class="mt-1">
                      {{ selectedSession.messages.length }} ข้อความ · {{ selectedSession.totalTokens }} tokens
                    </CardDescription>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    class="gap-2"
                    @click="openDeleteDialog(selectedSession)"
                  >
                    <Trash2 class="size-4" />
                    ลบ
                  </Button>
                </div>
              </CardHeader>
            </Card>

            <!-- Filter -->
            <div class="flex gap-2">
              <Button
                v-for="role in ['all', 'user', 'assistant']"
                :key="role"
                :variant="filterRole === role ? 'default' : 'outline'"
                size="sm"
                @click="filterRole = role as any"
              >
                {{ role === 'all' ? 'ทั้งหมด' : role === 'user' ? 'คำถาม' : 'คำตอบ' }}
              </Button>
            </div>

            <!-- Messages -->
            <div class="space-y-3 max-h-[calc(100vh-400px)] overflow-y-auto">
              <div
                v-for="msg in filteredMessages"
                :key="msg.id"
                class="rounded-lg border bg-card p-4"
                :class="msg.role === 'user' ? 'border-primary/20 bg-primary/5' : 'border-muted/50'"
              >
                <div class="flex items-start justify-between gap-3 mb-2">
                  <div class="flex items-center gap-2">
                    <span class="inline-flex items-center gap-1.5 rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
                      {{ msg.role === 'user' ? '👤 คุณ' : '🤖 AI' }}
                    </span>
                    <span class="text-xs text-muted-foreground">{{ formatTime(msg.created_at) }}</span>
                  </div>
                  <div class="flex items-center gap-1 text-xs text-muted-foreground">
                    <Zap class="size-3" />
                    <span>{{ msg.tokens }} tokens</span>
                  </div>
                </div>
                <div class="text-sm leading-6 whitespace-pre-wrap wrap-break-word">
                  {{ msg.content }}
                </div>
                <div v-if="msg.model" class="mt-2 text-xs text-muted-foreground">
                  Model: {{ msg.model }}
                </div>
              </div>

              <div v-if="filteredMessages.length === 0" class="flex items-center justify-center py-8 text-center">
                <p class="text-sm text-muted-foreground">ไม่มีข้อความ</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Delete Confirmation Dialog -->
    <AlertDialog :open="deleteDialogOpen" @update:open="deleteDialogOpen = $event">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>ลบประวัติการสนทนา?</AlertDialogTitle>
          <AlertDialogDescription>
            คุณแน่ใจหรือไม่ว่าต้องการลบประวัติการสนทนาทั้งหมด? การกระทำนี้ไม่สามารถยกเลิกได้
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
          <AlertDialogAction @click="handleDeleteSession" class="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            ลบ
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>

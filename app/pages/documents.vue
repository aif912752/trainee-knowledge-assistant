<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { FileText, Trash2, MessageSquare, Upload, Loader2, Search, Filter, MoreVertical, Eye, Download } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
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

definePageMeta({
  middleware: 'auth',
})

const router = useRouter()

interface Document {
  id: number
  original_name: string
  filename: string
  file_type: string
  file_size: number
  created_at: string
}

const documents = ref<Document[]>([])
const isLoading = ref(false)
const searchQuery = ref('')
const sortBy = ref<'date' | 'name' | 'size'>('date')
const deleteDialogOpen = ref(false)
const documentToDelete = ref<Document | null>(null)

const filteredDocuments = computed(() => {
  let filtered = documents.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(doc =>
      doc.original_name.toLowerCase().includes(query)
    )
  }

  // Sort
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'name':
        return a.original_name.localeCompare(b.original_name)
      case 'size':
        return b.file_size - a.file_size
      case 'date':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
  })

  return filtered
})

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

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

const getFileIcon = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase()
  if (ext === 'pdf') return '📄'
  if (ext === 'txt') return '📝'
  return '📋'
}

const fetchDocuments = async () => {
  isLoading.value = true
  try {
    const response = await $fetch<any>('/api/documents')
    if (response.success) {
      documents.value = response.data.documents || []
    }
  } catch (error: any) {
    toast.error('ไม่สามารถโหลดเอกสารได้', {
      description: error.message || 'เกิดข้อผิดพลาด',
    })
  } finally {
    isLoading.value = false
  }
}

const handleDelete = async () => {
  if (!documentToDelete.value) return

  try {
    const response = await $fetch<any>(`/api/documents/${documentToDelete.value.id}`, {
      method: 'DELETE',
    })

    if (response.success) {
      documents.value = documents.value.filter(d => d.id !== documentToDelete.value!.id)
      toast.success('ลบเอกสารสำเร็จ')
    }
  } catch (error: any) {
    toast.error('ไม่สามารถลบเอกสารได้', {
      description: error.message || 'เกิดข้อผิดพลาด',
    })
  } finally {
    deleteDialogOpen.value = false
    documentToDelete.value = null
  }
}

const openDeleteDialog = (doc: Document) => {
  documentToDelete.value = doc
  deleteDialogOpen.value = true
}

const goToChat = (docId: number) => {
  router.push(`/chat?documentId=${docId}`)
}

onMounted(() => {
  fetchDocuments()
})
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <AppHeader active="documents" />

    <section class="border-b bg-background/90">
      <div class="mx-auto flex min-h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div>
          <h1 class="text-lg font-bold">คลังเอกสาร</h1>
          <p class="text-xs text-muted-foreground">จัดการไฟล์ที่อัปโหลดและเลือกบริบทสำหรับการถามตอบ</p>
        </div>
        <Button class="gap-2" @click="router.push('/upload')">
          <Upload class="size-4" />
          อัปโหลดใหม่
        </Button>
      </div>
    </section>

    <main class="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <!-- Empty State -->
      <div v-if="!isLoading && documents.length === 0" class="flex flex-col items-center justify-center rounded-xl border-2 border-dashed bg-secondary/35 py-16 text-center">
        <div class="mb-4 flex size-16 items-center justify-center rounded-xl bg-card text-primary ring-1 ring-border">
          <FileText class="size-8" />
        </div>
        <h2 class="text-lg font-semibold">ยังไม่มีเอกสาร</h2>
        <p class="mt-2 text-sm text-muted-foreground">
          เริ่มต้นโดยการอัปโหลดไฟล์ PDF หรือ TXT เพื่อใช้เป็นบริบทให้ AI
        </p>
        <Button class="mt-6 gap-2" @click="router.push('/upload')">
          <Upload class="size-4" />
          อัปโหลดเอกสาร
        </Button>
      </div>

      <!-- Documents List -->
      <div v-else class="space-y-4">
        <!-- Search and Filter -->
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div class="relative flex-1">
            <Search class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-primary" />
            <Input
              v-model="searchQuery"
              placeholder="ค้นหาเอกสาร..."
              class="pl-10 bg-card border-primary/30 focus:border-primary"
            />
          </div>
          <div class="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button variant="outline" size="sm" class="gap-2">
                  <Filter class="size-4" />
                  เรียงลำดับ: {{ sortBy === 'date' ? 'วันที่' : sortBy === 'name' ? 'ชื่อ' : 'ขนาด' }}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem @click="sortBy = 'date'" :class="sortBy === 'date' ? 'bg-secondary' : ''">
                  วันที่
                </DropdownMenuItem>
                <DropdownMenuItem @click="sortBy = 'name'" :class="sortBy === 'name' ? 'bg-secondary' : ''">
                  ชื่อ
                </DropdownMenuItem>
                <DropdownMenuItem @click="sortBy = 'size'" :class="sortBy === 'size' ? 'bg-secondary' : ''">
                  ขนาด
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="flex items-center justify-center py-12">
          <Loader2 class="size-8 animate-spin text-primary" />
        </div>

        <!-- Documents Grid -->
        <div v-else class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="doc in filteredDocuments"
            :key="doc.id"
            class="group flex flex-col gap-3 rounded-lg border bg-card p-4 transition-all hover:border-primary/35 hover:shadow-md"
          >
            <!-- Header -->
            <div class="flex items-start justify-between gap-2">
              <div class="flex items-start gap-3 min-w-0 flex-1">
                <span class="mt-0.5 text-2xl">{{ getFileIcon(doc.filename) }}</span>
                <div class="min-w-0 flex-1">
                  <h3 class="truncate font-semibold text-sm leading-5">{{ doc.original_name }}</h3>
                  <p class="text-xs text-muted-foreground">{{ formatFileSize(doc.file_size) }}</p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button variant="ghost" size="icon-sm" class="opacity-0 group-hover:opacity-100">
                    <MoreVertical class="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem @click="goToChat(doc.id)" class="gap-2">
                    <MessageSquare class="size-4" />
                    ถามเกี่ยวกับไฟล์นี้
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    @click="openDeleteDialog(doc)"
                    class="gap-2 text-destructive focus:text-destructive"
                  >
                    <Trash2 class="size-4" />
                    ลบ
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <!-- Info -->
            <div class="space-y-1 text-xs text-muted-foreground">
              <p>{{ doc.file_type.toUpperCase() }}</p>
              <p>{{ formatDate(doc.created_at) }}</p>
            </div>

            <!-- Action Button -->
            <Button
              variant="secondary"
              size="sm"
              class="w-full gap-2 mt-auto"
              @click="goToChat(doc.id)"
            >
              <MessageSquare class="size-4" />
              ถามเกี่ยวกับไฟล์นี้
            </Button>
          </div>
        </div>

        <!-- No Results -->
        <div v-if="!isLoading && filteredDocuments.length === 0 && searchQuery" class="flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-secondary/35 py-12 text-center">
          <Search class="mb-3 size-8 text-muted-foreground" />
          <p class="text-sm text-muted-foreground">ไม่พบเอกสารที่ตรงกับ "{{ searchQuery }}"</p>
        </div>
      </div>
    </main>

    <!-- Delete Confirmation Dialog -->
    <AlertDialog :open="deleteDialogOpen" @update:open="deleteDialogOpen = $event">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>ลบเอกสาร?</AlertDialogTitle>
          <AlertDialogDescription>
            คุณแน่ใจหรือไม่ว่าต้องการลบ "{{ documentToDelete?.original_name }}"? การกระทำนี้ไม่สามารถยกเลิกได้
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
          <AlertDialogAction @click="handleDelete" class="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            ลบ
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>

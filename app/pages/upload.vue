<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { AlertCircle, Check, FileText, Loader2, MessageSquare, Upload, X } from 'lucide-vue-next'

const router = useRouter()

const { isLoading: isUploading, validateFile, uploadFile: uploadDocument, formatFileSize, getFileIcon } = useUpload()

const selectedFile = ref<File | null>(null)
const uploadResult = ref<{ id: number; filename: string; originalName: string } | null>(null)
const dragOver = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    validateAndSetFile(file)
  }
}

function validateAndSetFile(file: File) {
  uploadResult.value = null

  const validation = validateFile(file)
  if (!validation.valid) {
    return
  }

  selectedFile.value = file
}

function handleDragOver(event: DragEvent) {
  event.preventDefault()
  dragOver.value = true
}

function handleDragLeave(event: DragEvent) {
  event.preventDefault()
  dragOver.value = false
}

function handleDrop(event: DragEvent) {
  event.preventDefault()
  dragOver.value = false

  const file = event.dataTransfer?.files[0]
  if (file) {
    validateAndSetFile(file)
  }
}

function removeFile() {
  selectedFile.value = null
  uploadResult.value = null
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

async function uploadFile() {
  if (!selectedFile.value) return

  try {
    const response = await uploadDocument(selectedFile.value)

    if (response.success) {
      uploadResult.value = {
        id: response.data.document.id,
        filename: response.data.document.filename,
        originalName: response.data.document.originalName,
      }
    }
  } catch (error) {
    // Error is already handled by composable
  }
}

function goToChat() {
  if (uploadResult.value) {
    router.push(`/chat?documentId=${uploadResult.value.id}`)
  } else {
    router.push('/chat')
  }
}
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <AppHeader active="upload" />

    <section class="border-b bg-background/90">
      <div class="mx-auto flex min-h-16 w-full max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div>
          <h1 class="text-lg font-bold">อัปโหลดเอกสาร</h1>
          <p class="text-xs text-muted-foreground">เพิ่มไฟล์เพื่อใช้เป็นบริบทให้ AI</p>
        </div>
        <Button variant="outline" class="gap-2" @click="router.push('/chat')">
          <MessageSquare class="size-4" />
          แชท
        </Button>
      </div>
    </section>

    <main class="mx-auto grid w-full max-w-5xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_320px] lg:py-10">
      <section>
        <Card class="rounded-xl shadow-sm">
          <CardHeader>
            <div class="mb-2 flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Upload class="size-5" />
            </div>
            <CardTitle class="text-2xl">เลือกไฟล์สำหรับฐานความรู้</CardTitle>
            <CardDescription>
              รองรับไฟล์ PDF และ TXT ขนาดสูงสุด 5MB
            </CardDescription>
          </CardHeader>

          <CardContent class="space-y-6">
            <div
              v-if="!selectedFile"
              class="flex min-h-[300px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-all"
              :class="dragOver ? 'border-primary bg-primary/5 shadow-sm' : 'border-border bg-secondary/35 hover:border-primary/45 hover:bg-secondary/60'"
              @click="() => fileInputRef?.click()"
              @dragover="handleDragOver"
              @dragleave="handleDragLeave"
              @drop="handleDrop"
            >
              <div class="mb-5 flex size-16 items-center justify-center rounded-xl bg-card text-primary ring-1 ring-border">
                <Upload class="size-8" />
              </div>
              <p class="font-semibold">
                ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์
              </p>
              <p class="mt-2 text-sm text-muted-foreground">
                PDF หรือ TXT สูงสุด 5MB
              </p>
              <input
                ref="fileInputRef"
                type="file"
                accept=".pdf,.txt,application/pdf,text/plain"
                class="hidden"
                @change="handleFileSelect"
              />
            </div>

            <div v-else class="space-y-4">
              <div class="flex items-center gap-4 rounded-xl border bg-secondary/45 p-4">
                <div class="flex size-12 shrink-0 items-center justify-center rounded-lg bg-card text-2xl ring-1 ring-border">
                  {{ getFileIcon(selectedFile.name) }}
                </div>
                <div class="min-w-0 flex-1">
                  <p class="truncate font-semibold">{{ selectedFile.name }}</p>
                  <p class="text-sm text-muted-foreground">{{ formatFileSize(selectedFile.size) }}</p>
                </div>
                <Button variant="ghost" size="icon" @click="removeFile">
                  <X class="size-4" />
                </Button>
              </div>

              <div v-if="uploadResult" class="flex items-start gap-3 rounded-xl border border-chart-1/35 bg-chart-1/10 p-4">
                <span class="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-card text-chart-4 ring-1 ring-chart-1/25">
                  <Check class="size-4" />
                </span>
                <div class="min-w-0 flex-1">
                  <p class="font-semibold text-chart-4">อัปโหลดสำเร็จ</p>
                  <p class="truncate text-sm text-muted-foreground">{{ uploadResult.originalName }}</p>
                </div>
              </div>

              <div class="grid gap-3 sm:grid-cols-2">
                <Button variant="outline" class="h-11" @click="removeFile">
                  เลือกไฟล์ใหม่
                </Button>
                <Button class="h-11" :disabled="isUploading || !!uploadResult" @click="uploadFile">
                  <Loader2 v-if="isUploading" class="size-4 animate-spin" />
                  <Upload v-else class="size-4" />
                  {{ isUploading ? 'กำลังอัปโหลด...' : uploadResult ? 'อัปโหลดแล้ว' : 'อัปโหลด' }}
                </Button>
              </div>

              <Button v-if="uploadResult" variant="default" class="h-11 w-full gap-2" @click="goToChat">
                <MessageSquare class="size-4" />
                ไปที่หน้าแชท
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <aside class="space-y-4">
        <Card class="rounded-xl">
          <CardHeader>
            <CardTitle class="flex items-center gap-2 text-lg">
              <AlertCircle class="size-5 text-primary" />
              ข้อกำหนดไฟล์
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul class="space-y-3 text-sm text-muted-foreground">
              <li class="flex gap-2">
                <Check class="mt-0.5 size-4 shrink-0 text-primary" />
                รองรับไฟล์ PDF และ TXT เท่านั้น
              </li>
              <li class="flex gap-2">
                <Check class="mt-0.5 size-4 shrink-0 text-primary" />
                ขนาดไฟล์สูงสุด 5MB
              </li>
              <li class="flex gap-2">
                <Check class="mt-0.5 size-4 shrink-0 text-primary" />
                ชื่อไฟล์จะถูกจัดเก็บเป็นชื่อสุ่มเพื่อความปลอดภัย
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card class="rounded-xl border-primary/20 bg-primary text-primary-foreground">
          <CardHeader>
            <CardTitle class="flex items-center gap-2 text-lg">
              <FileText class="size-5" />
              หลังอัปโหลด
            </CardTitle>
            <CardDescription class="text-primary-foreground/80">
              ระบบจะนำเนื้อหาไฟล์ไปใช้เป็นบริบทสำหรับตอบคำถามในหน้าแชท
            </CardDescription>
          </CardHeader>
        </Card>
      </aside>
    </main>
  </div>
</template>

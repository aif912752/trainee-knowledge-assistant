<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Upload, FileText, X, Check, AlertCircle } from 'lucide-vue-next';

const router = useRouter();

// Use upload composable
const { isLoading: isUploading, validateFile, uploadFile: uploadDocument, formatFileSize, getFileIcon } = useUpload();

// State
const selectedFile = ref<File | null>(null);
const uploadResult = ref<{ id: number; filename: string; originalName: string } | null>(null);
const dragOver = ref(false);

// File input ref
const fileInputRef = ref<HTMLInputElement | null>(null);

/**
 * Handle file selection from input
 */
function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (file) {
    validateAndSetFile(file);
  }
}

/**
 * Validate and set file
 */
function validateAndSetFile(file: File) {
  // Reset result
  uploadResult.value = null;

  // Validate using composable
  const validation = validateFile(file);
  if (!validation.valid) {
    // Composable already handles toast
    return;
  }

  selectedFile.value = file;
}

/**
 * Handle drag and drop events
 */
function handleDragOver(event: DragEvent) {
  event.preventDefault();
  dragOver.value = true;
}

function handleDragLeave(event: DragEvent) {
  event.preventDefault();
  dragOver.value = false;
}

function handleDrop(event: DragEvent) {
  event.preventDefault();
  dragOver.value = false;

  const file = event.dataTransfer?.files[0];
  if (file) {
    validateAndSetFile(file);
  }
}

/**
 * Remove selected file
 */
function removeFile() {
  selectedFile.value = null;
  uploadResult.value = null;
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
}

/**
 * Upload file
 */
async function uploadFile() {
  if (!selectedFile.value) return;

  try {
    const response = await uploadDocument(selectedFile.value);

    if (response.success) {
      uploadResult.value = {
        id: response.document.id,
        filename: response.document.filename,
        originalName: response.document.original_name,
      };
    }
  } catch (error) {
    // Error is already handled by composable
  }
}

/**
 * Go to chat page
 */
function goToChat() {
  if (uploadResult.value) {
    router.push(`/chat?doc=${uploadResult.value.id}`);
  } else {
    router.push('/chat');
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
    <div class="w-full max-w-2xl">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-2">
          อัปโหลดเอกสาร
        </h1>
        <p class="text-slate-600 dark:text-slate-400">
          อัปโหลดไฟล์ PDF หรือ TXT เพื่อเริ่มคุยกับ AI
        </p>
      </div>

      <!-- Upload Card -->
      <Card>
        <CardHeader>
          <CardTitle>เลือกไฟล์</CardTitle>
          <CardDescription>
            รองรับไฟล์ PDF และ TXT (สูงสุด 5MB)
          </CardDescription>
        </CardHeader>

        <CardContent class="space-y-6">
          <!-- Upload Area -->
          <div
            v-if="!selectedFile"
            class="border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer"
            :class="dragOver ? 'border-primary bg-primary/5' : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600'"
            @click="() => fileInputRef?.click()"
            @dragover="handleDragOver"
            @dragleave="handleDragLeave"
            @drop="handleDrop"
          >
            <Upload class="w-12 h-12 mx-auto mb-4 text-slate-400" />
            <p class="text-slate-700 dark:text-slate-300 mb-2">
              ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์
            </p>
            <p class="text-sm text-slate-500 dark:text-slate-500">
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

          <!-- Selected File -->
          <div v-else class="space-y-4">
            <!-- File Info -->
            <div class="flex items-center gap-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <div class="text-3xl">{{ getFileIcon(selectedFile.name) }}</div>
              <div class="flex-1 min-w-0">
                <p class="font-medium text-slate-900 dark:text-slate-100 truncate">
                  {{ selectedFile.name }}
                </p>
                <p class="text-sm text-slate-500 dark:text-slate-500">
                  {{ formatFileSize(selectedFile.size) }}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                @click="removeFile"
              >
                <X class="w-4 h-4" />
              </Button>
            </div>

            <!-- Upload Result -->
            <div v-if="uploadResult" class="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <Check class="w-5 h-5 text-green-600 dark:text-green-400" />
              <div class="flex-1">
                <p class="font-medium text-green-800 dark:text-green-300">
                  อัปโหลดสำเร็จ!
                </p>
                <p class="text-sm text-green-600 dark:text-green-400">
                  {{ uploadResult.originalName }}
                </p>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex gap-3">
              <Button
                variant="outline"
                class="flex-1"
                @click="removeFile"
              >
                เลือกไฟล์ใหม่
              </Button>
              <Button
                class="flex-1"
                :disabled="isUploading"
                @click="uploadFile"
              >
                <Upload v-if="!isUploading" class="w-4 h-4 mr-2" />
                {{ isUploading ? 'กำลังอัปโหลด...' : 'อัปโหลด' }}
              </Button>
            </div>

            <!-- Go to Chat -->
            <div v-if="uploadResult" class="pt-4 border-t border-slate-200 dark:border-slate-700">
              <Button
                variant="default"
                class="w-full"
                @click="goToChat"
              >
                <FileText class="w-4 h-4 mr-2" />
                ไปที่หน้าแชท
              </Button>
            </div>
          </div>

          <!-- Requirements -->
          <div class="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <AlertCircle class="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div class="text-sm text-blue-800 dark:text-blue-300">
              <p class="font-medium mb-1">ข้อกำหนดไฟล์:</p>
              <ul class="list-disc list-inside space-y-1 text-blue-700 dark:text-blue-400">
                <li>รองรับไฟล์ PDF และ TXT เท่านั้น</li>
                <li>ขนาดไฟล์สูงสุด 5MB</li>
                <li>ชื่อไฟล์จะถูกจัดเก็บเป็นชื่อสุ่มเพื่อความปลอดภัย</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

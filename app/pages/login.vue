<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { loginSchema } from '~~/shared/validations'
import { toast } from 'vue-sonner'
import { api } from '~~/app/utils/api'

// Define form schema type
type LoginFormValues = {
  username: string
  password: string
}

// State
const isLoading = ref(false)
const errorMessage = ref('')

// Initialize vee-validate form
const { defineField, handleSubmit, errors } = useForm<LoginFormValues>({
  validationSchema: toTypedSchema(loginSchema),
  initialValues: {
    username: '',
    password: ''
  }
})

// Define form fields
const [username, usernameAttrs] = defineField('username')
const [password, passwordAttrs] = defineField('password')

// Handle form submission
const onSubmit = handleSubmit(async (values) => {
  errorMessage.value = ''

  try {
    isLoading.value = true

    const response = await api.post<{ success: boolean, user?: any }>('/api/auth/login', values)

    if (response.success) {
      toast.success('เข้าสู่ระบบสำเร็จ', {
        description: 'ยินดีต้อนรับกลับเข้าสู่ระบบ'
      })
      // Redirect to home page on success
      await navigateTo('/')
    }
  } catch (error: any) {
    // Error is already processed by apiFetch, just use the message
    errorMessage.value = error.friendlyMessage
    
    toast.error('เข้าสู่ระบบไม่สำเร็จ', {
      description: errorMessage.value
    })
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-muted/30 p-4">
    <div class="w-full max-w-[400px]">
      <Card class="border-none shadow-xl">
        <CardHeader class="space-y-1 pb-6 text-center">
          <div class="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-2">
            <LucideLogIn class="w-6 h-6 text-primary" />
          </div>
          <CardTitle class="text-2xl font-bold tracking-tight">
            ยินดีต้อนรับ
          </CardTitle>
          <CardDescription>
            กรุณาเข้าสู่ระบบเพื่อใช้งาน Assistant
          </CardDescription>
        </CardHeader>

        <CardContent>
          <!-- Error Alert -->
          <div v-if="errorMessage" class="mb-4 rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
            <LucideAlertCircle class="w-4 h-4" />
            {{ errorMessage }}
          </div>

          <!-- Login Form -->
          <form @submit="onSubmit" class="space-y-5">
            <!-- Username Field -->
            <div class="space-y-2">
              <Label for="username">ชื่อผู้ใช้</Label>
              <Input
                id="username"
                v-model="username"
                v-bind="usernameAttrs"
                type="text"
                placeholder="ระบุชื่อผู้ใช้ของคุณ"
                :disabled="isLoading"
                autocomplete="username"
                :class="{ 'border-destructive focus-visible:ring-destructive': errors.username }"
              />
              <p v-if="errors.username" class="text-xs text-destructive">
                {{ errors.username }}
              </p>
            </div>

            <!-- Password Field -->
            <div class="space-y-2">
              <Label for="password">รหัสผ่าน</Label>
              <Input
                id="password"
                v-model="password"
                v-bind="passwordAttrs"
                type="password"
                placeholder="ระบุรหัสผ่านของคุณ"
                :disabled="isLoading"
                autocomplete="current-password"
                :class="{ 'border-destructive focus-visible:ring-destructive': errors.password }"
              />
              <p v-if="errors.password" class="text-xs text-destructive">
                {{ errors.password }}
              </p>
            </div>

            <!-- Submit Button -->
            <Button
              type="submit"
              class="w-full h-11 text-base font-semibold transition-all"
              :disabled="isLoading"
            >
              <LucideLoader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
              <span v-if="!isLoading">เข้าสู่ระบบ</span>
              <span v-else>กำลังตรวจสอบข้อมูล...</span>
            </Button>
          </form>

          <!-- Demo Credentials Hint -->
          <div class="mt-6 p-4 rounded-lg bg-secondary/50 border border-border/50 text-xs">
            <p class="font-bold text-secondary-foreground mb-1 flex items-center gap-1">
              <LucideInfo class="w-3 h-3 text-primary" />
              Demo Credentials:
            </p>
            <div class="grid grid-cols-2 gap-2 mt-2">
              <div class="bg-background p-2 rounded border border-border/40">
                <span class="text-muted-foreground block">User:</span>
                <code class="font-mono text-primary font-bold">admin</code>
              </div>
              <div class="bg-background p-2 rounded border border-border/40">
                <span class="text-muted-foreground block">Pass:</span>
                <code class="font-mono text-primary font-bold">admin123</code>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Footer -->
      <p class="mt-6 text-center text-xs text-muted-foreground">
        Mini Knowledge Assistant © 2025
      </p>
    </div>
  </div>
</template>

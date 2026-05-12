<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { AlertCircle, Info, Loader2, LockKeyhole, LogIn, Sparkles } from 'lucide-vue-next'
import { loginSchema } from '~~/shared/validations'

const { login, isLoading: isAuthLoading } = useAuth()

const errorMessage = ref('')

const { defineField, handleSubmit, errors } = useForm({
  validationSchema: toTypedSchema(loginSchema),
  initialValues: {
    username: '',
    password: '',
  },
})

const [username, usernameAttrs] = defineField('username')
const [password, passwordAttrs] = defineField('password')

const onSubmit = handleSubmit(async (values) => {
  errorMessage.value = ''

  try {
    const response = await login(values)

    if (response.success) {
      window.location.href = '/'
    }
  } catch (error: any) {
    errorMessage.value = error.friendlyMessage || error.data?.error || 'เข้าสู่ระบบไม่สำเร็จ'
  }
})
</script>

<template>
  <div class="min-h-screen bg-background">
    <main class="grid min-h-screen lg:grid-cols-[1fr_480px]">
      <section class="hidden border-r bg-card lg:flex">
        <div class="flex w-full flex-col justify-between p-10">
          <div class="flex items-center gap-3">
            <span class="flex size-11 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm shadow-primary/20">
              <Sparkles class="size-5" />
            </span>
            <div>
              <p class="font-bold">Knowledge Assistant</p>
              <p class="text-sm text-muted-foreground">Trainee knowledge workspace</p>
            </div>
          </div>

          <div class="max-w-xl">
            <div class="mb-5 inline-flex items-center gap-2 rounded-md bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
              <LockKeyhole class="size-3.5" />
              Secure internal access
            </div>
            <h1 class="text-4xl font-bold tracking-normal">
              เข้าถึงเอกสารและผู้ช่วย AI ของทีมได้ในที่เดียว
            </h1>
            <p class="mt-4 text-base leading-7 text-muted-foreground">
              ระบบนี้ช่วยให้ผู้ใช้ค้นหาคำตอบจากเอกสารที่อัปโหลดและสนทนากับ AI ผ่านหน้าจอที่ออกแบบสำหรับการทำงานประจำวัน
            </p>
          </div>

          <div class="grid max-w-xl grid-cols-3 gap-3 text-sm">
            <div class="rounded-lg border bg-background p-4">
              <span class="block text-muted-foreground">รองรับ</span>
              <span class="mt-1 block font-semibold">PDF/TXT</span>
            </div>
            <div class="rounded-lg border bg-background p-4">
              <span class="block text-muted-foreground">ขนาดไฟล์</span>
              <span class="mt-1 block font-semibold">สูงสุด 5MB</span>
            </div>
            <div class="rounded-lg border bg-background p-4">
              <span class="block text-muted-foreground">สถานะ</span>
              <span class="mt-1 block font-semibold text-primary">พร้อมใช้งาน</span>
            </div>
          </div>
        </div>
      </section>

      <section class="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
        <div class="w-full max-w-[420px]">
          <div class="mb-8 text-center lg:hidden">
            <div class="mx-auto mb-4 flex size-12 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm shadow-primary/20">
              <Sparkles class="size-6" />
            </div>
            <h1 class="text-2xl font-bold">Knowledge Assistant</h1>
            <p class="mt-1 text-sm text-muted-foreground">เข้าสู่ระบบเพื่อใช้งานพื้นที่ความรู้ของทีม</p>
          </div>

          <Card class="rounded-xl shadow-md">
            <CardHeader class="pb-5">
              <div class="mb-2 flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <LogIn class="size-5" />
              </div>
              <CardTitle class="text-2xl">ยินดีต้อนรับ</CardTitle>
              <CardDescription>
                กรุณาเข้าสู่ระบบเพื่อใช้งาน Assistant
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div
                v-if="errorMessage"
                class="mb-4 flex items-start gap-2 rounded-lg border border-destructive/25 bg-destructive/10 p-3 text-sm text-destructive"
              >
                <AlertCircle class="mt-0.5 size-4 shrink-0" />
                <span>{{ errorMessage }}</span>
              </div>

              <form class="space-y-5" @submit="onSubmit">
                <div class="space-y-2">
                  <Label for="username">ชื่อผู้ใช้</Label>
                  <Input
                    id="username"
                    v-model="username"
                    v-bind="usernameAttrs"
                    type="text"
                    placeholder="ระบุชื่อผู้ใช้ของคุณ"
                    :disabled="isAuthLoading"
                    autocomplete="username"
                    class="h-11 bg-background"
                    :class="{ 'border-destructive focus-visible:ring-destructive/30': errors.username }"
                  />
                  <p v-if="errors.username" class="text-xs text-destructive">
                    {{ errors.username }}
                  </p>
                </div>

                <div class="space-y-2">
                  <Label for="password">รหัสผ่าน</Label>
                  <Input
                    id="password"
                    v-model="password"
                    v-bind="passwordAttrs"
                    type="password"
                    placeholder="ระบุรหัสผ่านของคุณ"
                    :disabled="isAuthLoading"
                    autocomplete="current-password"
                    class="h-11 bg-background"
                    :class="{ 'border-destructive focus-visible:ring-destructive/30': errors.password }"
                  />
                  <p v-if="errors.password" class="text-xs text-destructive">
                    {{ errors.password }}
                  </p>
                </div>

                <Button type="submit" class="h-11 w-full font-semibold" :disabled="isAuthLoading">
                  <Loader2 v-if="isAuthLoading" class="size-4 animate-spin" />
                  <span>{{ isAuthLoading ? 'กำลังตรวจสอบข้อมูล...' : 'เข้าสู่ระบบ' }}</span>
                </Button>
              </form>

              <div class="mt-6 rounded-lg border bg-secondary/60 p-4 text-xs">
                <p class="mb-3 flex items-center gap-2 font-semibold text-secondary-foreground">
                  <Info class="size-3.5 text-primary" />
                  Demo Credentials
                </p>
                <div class="grid grid-cols-2 gap-2">
                  <div class="rounded-md border bg-background p-3">
                    <span class="block text-muted-foreground">User</span>
                    <code class="font-mono font-bold text-primary">admin</code>
                  </div>
                  <div class="rounded-md border bg-background p-3">
                    <span class="block text-muted-foreground">Pass</span>
                    <code class="font-mono font-bold text-primary">admin123</code>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <p class="mt-6 text-center text-xs text-muted-foreground">
            Mini Knowledge Assistant © 2025
          </p>
        </div>
      </section>
    </main>
  </div>
</template>

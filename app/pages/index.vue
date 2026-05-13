<script setup lang="ts">
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  ChevronRight,
  FileText,
  History,
  MessageSquare,
  Sparkles,
  Upload,
} from 'lucide-vue-next'

definePageMeta({
  middleware: 'auth',
})

const { data: authData } = await useFetch('/api/auth/me')

const isAuthenticated = computed(() => (authData.value?.success && authData.value.data.authenticated) || false)
const user = computed(() => authData.value?.data.user)

if (!isAuthenticated.value) {
  await navigateTo('/login')
}

const features = [
  {
    title: 'พูดคุยกับ AI',
    description: 'ถามคำถามจากเอกสารหรือสนทนาทั่วไปกับผู้ช่วย AI',
    icon: MessageSquare,
    path: '/chat',
    accent: 'bg-primary/10 text-primary ring-primary/15',
    available: true,
  },
  {
    title: 'อัปโหลดเอกสาร',
    description: 'เพิ่มไฟล์ PDF หรือ TXT เพื่อสร้างฐานความรู้ส่วนตัว',
    icon: Upload,
    path: '/upload',
    accent: 'bg-accent text-accent-foreground ring-accent-foreground/10',
    available: true,
  },
  {
    title: 'คลังเอกสาร',
    description: 'จัดการไฟล์ที่อัปโหลดและเลือกบริบทสำหรับการถามตอบ',
    icon: FileText,
    path: '/documents',
    accent: 'bg-chart-1/15 text-chart-4 ring-chart-1/20',
    available: true,
  },
  {
    title: 'ประวัติการใช้งาน',
    description: 'ตรวจสอบบทสนทนาและการใช้ token ย้อนหลัง',
    icon: History,
    path: '',
    accent: 'bg-chart-2/20 text-primary ring-chart-2/25',
    available: false,
  },
]

const quickSteps = [
  {
    title: 'อัปโหลดไฟล์',
    description: 'รองรับ PDF และ TXT ขนาดไม่เกิน 5MB เพื่อใช้เป็นบริบทให้ AI',
  },
  {
    title: 'ถามจากบริบท',
    description: 'เลือกเอกสารแล้วส่งคำถาม ระบบจะใช้เนื้อหาไฟล์ประกอบคำตอบ',
  },
  {
    title: 'ติดตามการใช้งาน',
    description: 'ดูจำนวน token ที่ใช้เพื่อควบคุมโควตาการสนทนาในแต่ละวัน',
  },
]

const openFeature = (feature: (typeof features)[number]) => {
  if (feature.available && feature.path) {
    navigateTo(feature.path)
  }
}
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <AppHeader active="dashboard" />

    <main class="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
      <section class="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <div class="rounded-xl border bg-card p-6 shadow-sm md:p-8">
          <div class="mb-8 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div class="max-w-2xl">
              <div class="mb-4 inline-flex items-center gap-2 rounded-md border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                <BadgeCheck class="size-3.5 text-primary" />
                พร้อมใช้งานสำหรับทีมฝึกงาน
              </div>
              <h1 class="text-3xl font-bold tracking-normal md:text-4xl">
                สวัสดี, <span class="text-primary">{{ user?.username }}</span>
              </h1>
              <p class="mt-3 text-base leading-7 text-muted-foreground">
                ค้นหาความรู้จากเอกสาร อัปโหลดข้อมูลใหม่ และถามตอบกับ AI ได้จากพื้นที่ทำงานเดียว
              </p>
            </div>
            <Button size="lg" class="w-full gap-2 md:w-auto" @click="navigateTo('/chat')">
              เริ่มถาม AI
              <ArrowRight class="size-4" />
            </Button>
          </div>

          <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card
              v-for="feature in features"
              :key="feature.title"
              class="group gap-4 rounded-lg p-4 py-4 transition-all"
              :class="feature.available ? 'cursor-pointer hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-md' : 'opacity-75'"
              @click="openFeature(feature)"
            >
              <div class="flex items-start justify-between gap-3">
                <span :class="['flex size-11 items-center justify-center rounded-lg ring-1', feature.accent]">
                  <component :is="feature.icon" class="size-5" />
                </span>
                <span
                  v-if="!feature.available"
                  class="rounded-md bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground"
                >
                  เร็วๆ นี้
                </span>
                <ChevronRight v-else class="size-4 text-muted-foreground transition-colors group-hover:text-primary" />
              </div>
              <div>
                <h2 class="font-semibold">{{ feature.title }}</h2>
                <p class="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">{{ feature.description }}</p>
              </div>
            </Card>
          </div>
        </div>

        <aside class="grid gap-4">
          <Card class="overflow-hidden rounded-xl border-primary/20 bg-primary text-primary-foreground shadow-md shadow-primary/15">
            <CardHeader>
              <CardTitle class="flex items-center gap-2 text-lg">
                <Sparkles class="size-5" />
                AI Workspace
              </CardTitle>
              <CardDescription class="text-primary-foreground/80">
                ผู้ช่วยสำหรับค้นหาและสรุปความรู้จากเอกสาร
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div class="grid grid-cols-2 gap-3 text-sm">
                <div class="rounded-lg bg-white/12 p-3 ring-1 ring-white/15">
                  <span class="block text-xs text-primary-foreground/70">ไฟล์สูงสุด</span>
                  <span class="mt-1 block font-semibold">5MB</span>
                </div>
                <div class="rounded-lg bg-white/12 p-3 ring-1 ring-white/15">
                  <span class="block text-xs text-primary-foreground/70">ชนิดไฟล์</span>
                  <span class="mt-1 block font-semibold">PDF, TXT</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card class="rounded-xl">
            <CardHeader>
              <CardTitle class="flex items-center gap-2 text-lg">
                <BookOpen class="size-5 text-primary" />
                เริ่มต้นใช้งาน
              </CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
              <div v-for="(step, index) in quickSteps" :key="step.title" class="flex gap-3">
                <span class="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-secondary text-xs font-bold text-secondary-foreground">
                  {{ index + 1 }}
                </span>
                <div>
                  <p class="text-sm font-semibold">{{ step.title }}</p>
                  <p class="text-sm leading-6 text-muted-foreground">{{ step.description }}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>
      </section>
    </main>
  </div>
</template>

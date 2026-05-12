<script setup lang="ts">
import { 
  LayoutDashboard, 
  MessageSquare, 
  Upload, 
  Settings, 
  LogOut, 
  User as UserIcon,
  ChevronRight,
  Sparkles,
  FileText,
  History
} from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~~/app/components/ui/dropdown-menu'

// Define middleware for authentication
definePageMeta({
  middleware: 'auth'
})

// Check authentication on server side
const { data: authData } = await useFetch('/api/auth/me')

const isAuthenticated = computed(() => authData.value?.authenticated || false)
const user = computed(() => authData.value?.user)

// Redirect to login if not authenticated (double check)
if (!isAuthenticated.value) {
  await navigateTo('/login')
}

// State for UI
const isLoggingOut = ref(false)

// Handle Logout
const handleLogout = async () => {
  try {
    isLoggingOut.value = true
    const response = await api.post<{ success: boolean }>('/api/auth/logout')
    
    if (response.success) {
      toast.success('ออกจากระบบสำเร็จ', {
        description: 'ขอบคุณที่ใช้งานระบบ'
      })
      await navigateTo('/login')
    }
  } catch (error: any) {
    toast.error('เกิดข้อผิดพลาด', {
      description: error.friendlyMessage || 'ไม่สามารถออกจากระบบได้'
    })
  } finally {
    isLoggingOut.value = false
  }
}

// Features list for dashboard
const features = [
  {
    title: 'พูดคุยกับ AI',
    description: 'สอบถามข้อมูลจากเอกสารหรือคุยทั่วไปด้วย Claude AI',
    icon: MessageSquare,
    path: '/chat',
    color: 'bg-orange-500',
    borderColor: 'border-orange-200'
  },
  {
    title: 'อัปโหลดเอกสาร',
    description: 'อัปโหลดไฟล์ PDF หรือ TXT เพื่อสร้างฐานข้อมูลส่วนตัว',
    icon: Upload,
    path: '/upload',
    color: 'bg-blue-500',
    borderColor: 'border-blue-200'
  },
  {
    title: 'คลังเอกสาร',
    description: 'จัดการและเลือกเอกสารที่คุณอัปโหลดไว้',
    icon: FileText,
    path: '/documents',
    color: 'bg-purple-500',
    borderColor: 'border-purple-200'
  },
  {
    title: 'ประวัติการใช้งาน',
    description: 'ดูย้อนหลังการสนทนาและการใช้ Token',
    icon: History,
    path: '/history',
    color: 'bg-green-500',
    borderColor: 'border-green-200'
  }
]
</script>

<template>
  <div class="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
    <!-- Navigation Bar -->
    <header class="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur-md">
      <div class="container mx-auto px-4 h-16 flex items-center justify-between">
        <div class="flex items-center gap-2 select-none">
          <div class="bg-primary w-9 h-9 rounded-lg flex items-center justify-center shadow-md shadow-primary/20">
            <Sparkles class="w-5 h-5 text-white" />
          </div>
          <span class="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">
            Knowledge Assistant
          </span>
        </div>

        <div class="flex items-center gap-4">
          <!-- User Profile Dropdown -->
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button variant="ghost" class="relative h-10 w-10 rounded-full p-0 overflow-hidden border border-border/40 hover:border-primary/40 transition-colors">
                <div class="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                  <UserIcon class="h-5 w-5" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" class="w-56 mt-2">
              <DropdownMenuLabel class="font-normal flex flex-col space-y-1">
                <span class="text-sm font-semibold leading-none">{{ user?.username }}</span>
                <span class="text-xs leading-none text-muted-foreground italic">ผู้ดูแลระบบ</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem @click="navigateTo('/profile')" class="cursor-pointer">
                <UserIcon class="mr-2 h-4 w-4" />
                <span>โปรไฟล์ของคุณ</span>
              </DropdownMenuItem>
              <DropdownMenuItem @click="navigateTo('/settings')" class="cursor-pointer">
                <Settings class="mr-2 h-4 w-4" />
                <span>ตั้งค่าระบบ</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                @click="handleLogout" 
                class="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                :disabled="isLoggingOut"
              >
                <LogOut class="mr-2 h-4 w-4" />
                <span>{{ isLoggingOut ? 'กำลังออก...' : 'ออกจากระบบ' }}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 container mx-auto px-4 py-8 md:py-12">
      <!-- Hero Section -->
      <div class="mb-12">
        <h2 class="text-3xl font-extrabold text-slate-900 md:text-4xl">
          สวัสดี, <span class="text-primary">{{ user?.username }}</span> 👋
        </h2>
        <p class="mt-2 text-lg text-slate-500 max-w-2xl">
          ยินดีต้อนรับกลับเข้าสู่ระบบ ค้นหาความรู้และจัดการเอกสารของคุณด้วยพลังของ AI
        </p>
      </div>

      <!-- Feature Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card 
          v-for="feature in features" 
          :key="feature.title"
          class="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border-none shadow-sm overflow-hidden"
          @click="navigateTo(feature.path)"
        >
          <CardHeader class="pb-4">
            <div 
              :class="[feature.color, 'w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-2 shadow-lg transition-transform group-hover:scale-110 duration-300']"
            >
              <component :is="feature.icon" class="w-6 h-6" />
            </div>
            <CardTitle class="text-xl group-hover:text-primary transition-colors">
              {{ feature.title }}
            </CardTitle>
            <CardDescription class="line-clamp-2">
              {{ feature.description }}
            </CardDescription>
          </CardHeader>
          <CardFooter class="pt-0 flex justify-end">
            <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <ChevronRight class="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
            </div>
          </CardFooter>
        </Card>
      </div>

      <!-- Token Usage Info / Quick Start -->
      <div class="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card class="lg:col-span-2 border-slate-200/60 shadow-sm overflow-hidden bg-gradient-to-br from-white to-slate-50">
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Sparkles class="w-5 h-5 text-primary" />
              การเริ่มต้นใช้งาน
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="flex gap-4 p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
              <div class="bg-blue-50 text-blue-600 w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold">1</div>
              <div>
                <h4 class="font-semibold text-slate-800">อัปโหลดไฟล์ของคุณ</h4>
                <p class="text-sm text-slate-500">รองรับไฟล์ PDF และ TXT (ขนาดไม่เกิน 5MB) ข้อมูลจะถูกประมวลผลเป็นฐานความรู้</p>
              </div>
            </div>
            <div class="flex gap-4 p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
              <div class="bg-orange-50 text-orange-600 w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold">2</div>
              <div>
                <h4 class="font-semibold text-slate-800">ถาม-ตอบกับ AI</h4>
                <p class="text-sm text-slate-500">เลือกเอกสารที่ต้องการ แล้วพิมพ์คำถามที่สงสัย AI จะค้นหาคำตอบจากไฟล์โดยเฉพาะ</p>
              </div>
            </div>
            <div class="flex gap-4 p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
              <div class="bg-purple-50 text-purple-600 w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold">3</div>
              <div>
                <h4 class="font-semibold text-slate-800">ติดตามการใช้งาน</h4>
                <p class="text-sm text-slate-500">ตรวจสอบโควต้าการใช้งาน Token เพื่อบริหารจัดการการใช้งานแชทในแต่ละวัน</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Right Side Panel -->
        <div class="space-y-6">
          <Card class="bg-primary text-primary-foreground shadow-lg shadow-primary/20 border-none overflow-hidden relative">
            <Sparkles class="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 rotate-12" />
            <CardHeader>
              <CardTitle>Claude 3.5 Sonnet</CardTitle>
              <CardDescription class="text-primary-foreground/80">Model ปัจจุบันที่ใช้งาน</CardDescription>
            </CardHeader>
            <CardContent>
              <p class="text-sm font-light">โมเดล AI ที่มีความชาญฉลาดที่สุดในการประมวลผลเอกสารและให้คำตอบที่แม่นยำ</p>
            </CardContent>
          </Card>

          <Card class="border-slate-200/60 shadow-sm">
            <CardHeader class="pb-2">
              <CardTitle class="text-sm uppercase tracking-wider text-slate-400 font-bold">ระบบช่วยเหลือ</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" class="w-full justify-start gap-2 mb-2">
                <MessageSquare class="w-4 h-4" />
                <span>คู่มือการใช้งาน</span>
              </Button>
              <Button variant="outline" class="w-full justify-start gap-2">
                <Settings class="w-4 h-4" />
                <span>รายงานปัญหา</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="mt-auto py-8 border-t bg-white">
      <div class="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
        <p>© 2025 Mini Knowledge Assistant. All rights reserved.</p>
        <div class="flex gap-6">
          <a href="#" class="hover:text-primary transition-colors">นโยบายความเป็นส่วนตัว</a>
          <a href="#" class="hover:text-primary transition-colors">ข้อตกลงการใช้งาน</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.container {
  max-width: 1280px;
}
</style>

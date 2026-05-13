<script setup lang="ts">
import { LogOut, MessageSquare, Sparkles, Upload, User as UserIcon, FileText } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~~/app/components/ui/dropdown-menu'

const props = defineProps<{
  active?: 'dashboard' | 'chat' | 'upload' | 'documents'
}>()

const { data: authData } = useFetch('/api/auth/me')
const user = computed(() => authData.value?.data.user)
const isLoggingOut = ref(false)

const navItems = [
  { key: 'dashboard', label: 'แดชบอร์ด', path: '/', icon: Sparkles },
  { key: 'chat', label: 'แชท', path: '/chat', icon: MessageSquare },
  { key: 'upload', label: 'อัปโหลด', path: '/upload', icon: Upload },
  { key: 'documents', label: 'คลังเอกสาร', path: '/documents', icon: FileText },
] as const

const handleLogout = async () => {
  try {
    isLoggingOut.value = true
    const response = await api.post<{ success: boolean }>('/api/auth/logout')

    if (response.success) {
      toast.success('ออกจากระบบสำเร็จ', {
        description: 'ขอบคุณที่ใช้งานระบบ',
      })
      await navigateTo('/login')
    }
  } catch (error: any) {
    toast.error('เกิดข้อผิดพลาด', {
      description: error.friendlyMessage || 'ไม่สามารถออกจากระบบได้',
    })
  } finally {
    isLoggingOut.value = false
  }
}
</script>

<template>
  <header class="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-xl">
    <div class="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
      <button class="flex items-center gap-3 text-left" @click="navigateTo('/')">
        <span class="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm shadow-primary/20">
          <Sparkles class="size-5" />
        </span>
        <span>
          <span class="block text-base font-bold leading-tight">Knowledge Assistant</span>
          <span class="block text-xs text-muted-foreground">Trainee knowledge workspace</span>
        </span>
      </button>

      <div class="flex items-center gap-2">
        <nav class="hidden items-center gap-1 sm:flex">
          <Button
            v-for="item in navItems"
            :key="item.key"
            :variant="props.active === item.key ? 'secondary' : 'ghost'"
            class="gap-2"
            @click="navigateTo(item.path)"
          >
            <component :is="item.icon" class="size-4" />
            {{ item.label }}
          </Button>
        </nav>

        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="ghost" class="size-10 rounded-lg p-0">
              <span class="flex size-9 items-center justify-center rounded-md bg-card text-muted-foreground ring-1 ring-border">
                <UserIcon class="size-4" />
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="mt-2 w-56">
            <DropdownMenuLabel class="font-normal">
              <span class="block text-sm font-semibold">{{ user?.username }}</span>
              <span class="block text-xs text-muted-foreground">ผู้ดูแลระบบ</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              v-for="item in navItems"
              :key="item.key"
              class="cursor-pointer"
              @click="navigateTo(item.path)"
            >
              <component :is="item.icon" class="mr-2 size-4" />
              {{ item.label }}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              class="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
              :disabled="isLoggingOut"
              @click="handleLogout"
            >
              <LogOut class="mr-2 size-4" />
              {{ isLoggingOut ? 'กำลังออกจากระบบ...' : 'ออกจากระบบ' }}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  </header>
</template>

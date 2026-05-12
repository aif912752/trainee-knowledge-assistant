<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { loginSchema } from '~~/shared/validations'

// Define form schema type
type LoginFormValues = {
  username: string
  password: string
}

// State
const isLoading = ref(false)
const errorMessage = ref('')

// Initialize vee-validate form
const { defineField, handleSubmit, errors, resetForm } = useForm<LoginFormValues>({
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

    const response = await $fetch('/api/auth/login', {
      method: 'POST',
      body: values
    })

    if (response.success) {
      // Redirect to home page on success
      await navigateTo('/')
    } else {
      errorMessage.value = response.error || 'Login failed'
    }
  } catch (error: any) {
    console.error('Login error:', error)
    errorMessage.value = error.data?.error || 'Invalid username or password'
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="w-full max-w-md">
      <Card>
        <CardHeader class="space-y-1">
          <CardTitle class="text-2xl font-bold text-center">
            Sign in to your account
          </CardTitle>
          <CardDescription class="text-center">
            Enter your username and password below
          </CardDescription>
        </CardHeader>

        <CardContent>
          <!-- Error Alert -->
          <div v-if="errorMessage" class="mb-4 rounded-md bg-red-50 border border-red-200 p-4">
            <div class="flex">
              <svg class="h-5 w-5 text-red-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
              <div class="ml-3">
                <p class="text-sm font-medium text-red-800">
                  {{ errorMessage }}
                </p>
              </div>
            </div>
          </div>

          <!-- Login Form -->
          <form @submit="onSubmit" class="space-y-4">
            <!-- Username Field -->
            <div class="space-y-2">
              <Label for="username">Username</Label>
              <Input
                id="username"
                v-model="username"
                v-bind="usernameAttrs"
                type="text"
                placeholder="Enter your username"
                :disabled="isLoading"
                autocomplete="username"
                :class="{ 'border-red-500 focus-visible:ring-red-500': errors.username }"
              />
              <p v-if="errors.username" class="text-sm text-red-600">
                {{ errors.username }}
              </p>
              <p class="text-xs text-gray-500">
                Demo: <span class="font-mono bg-gray-100 px-1 rounded">admin</span>
              </p>
            </div>

            <!-- Password Field -->
            <div class="space-y-2">
              <Label for="password">Password</Label>
              <Input
                id="password"
                v-model="password"
                v-bind="passwordAttrs"
                type="password"
                placeholder="Enter your password"
                :disabled="isLoading"
                autocomplete="current-password"
                :class="{ 'border-red-500 focus-visible:ring-red-500': errors.password }"
              />
              <p v-if="errors.password" class="text-sm text-red-600">
                {{ errors.password }}
              </p>
              <p class="text-xs text-gray-500">
                Demo: <span class="font-mono bg-gray-100 px-1 rounded">admin123</span>
              </p>
            </div>

            <!-- Submit Button -->
            <Button
              type="submit"
              class="w-full"
              :disabled="isLoading"
            >
              <span v-if="!isLoading">Sign in</span>
              <span v-else>Signing in...</span>
            </Button>
          </form>
        </CardContent>
      </Card>

      <!-- Footer -->
      <p class="mt-4 text-center text-sm text-gray-500">
        Mini Knowledge Assistant © 2025
      </p>
    </div>
  </div>
</template>

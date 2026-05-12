<script setup lang="ts">
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
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">
              Mini Knowledge Assistant
            </h1>
            <p class="text-sm text-gray-500 mt-1">
              Welcome, <span class="font-medium">{{ user?.username || 'User' }}</span>
            </p>
          </div>
          <div class="flex gap-2">
            <Button variant="outline" size="sm" @click="navigateTo('/upload')">
              Upload Document
            </Button>
            <Button variant="ghost" size="sm" @click="navigateTo('/chat')">
              Chat
            </Button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Chat Card -->
        <Card class="hover:shadow-lg transition-shadow cursor-pointer" @click="navigateTo('/chat')">
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              Chat with AI
            </CardTitle>
            <CardDescription>
              Start a conversation with AI assistant
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p class="text-sm text-gray-600">
              Ask questions and get intelligent responses powered by Claude AI.
            </p>
          </CardContent>
        </Card>

        <!-- Upload Card -->
        <Card class="hover:shadow-lg transition-shadow cursor-pointer" @click="navigateTo('/upload')">
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload Document
            </CardTitle>
            <CardDescription>
              Upload PDF or TXT files to chat with
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p class="text-sm text-gray-600">
              Upload your documents and ask questions about their content.
            </p>
          </CardContent>
        </Card>
      </div>

      <!-- Welcome Message -->
      <div class="mt-12">
        <Card>
          <CardHeader>
            <CardTitle>Welcome to Mini Knowledge Assistant!</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <p class="text-gray-700">
              This is a simple AI-powered knowledge assistant that allows you to:
            </p>
            <ul class="list-disc list-inside space-y-2 text-gray-600">
              <li>Chat with AI assistant (Claude Haiku)</li>
              <li>Upload PDF and TXT documents</li>
              <li>Ask questions about your uploaded documents</li>
              <li>Track token usage for each session</li>
            </ul>
            <div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p class="text-sm text-blue-800">
                <strong>Getting Started:</strong> Click on "Chat with AI" to start a conversation, or "Upload Document" to add a file.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  </div>
</template>

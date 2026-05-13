<script setup lang="ts">
import { computed } from 'vue'
import MarkdownIt from 'markdown-it'
import highlightjs from 'highlight.js'
import 'highlight.js/styles/github-dark.css' // You can change this to any theme you like

const props = defineProps<{
  content: string
}>()

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: (str, lang) => {
    if (lang && highlightjs.getLanguage(lang)) {
      try {
        return `<pre class="hljs"><code>${
          highlightjs.highlight(str, { language: lang, ignoreIllegals: true }).value
        }</code></pre>`
      } catch (__) {}
    }

    return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`
  },
})

const renderedContent = computed(() => {
  return md.render(props.content || '')
})
</script>

<template>
  <div class="markdown-body" v-html="renderedContent"></div>
</template>

<style>
.markdown-body {
  @apply text-sm leading-relaxed;
}

.markdown-body p {
  @apply mb-4 last:mb-0;
}

.markdown-body h1,
.markdown-body h2,
.markdown-body h3,
.markdown-body h4,
.markdown-body h5,
.markdown-body h6 {
  @apply font-bold mt-6 mb-3 first:mt-0;
}

.markdown-body h1 { @apply text-2xl; }
.markdown-body h2 { @apply text-xl; }
.markdown-body h3 { @apply text-lg; }

.markdown-body ul,
.markdown-body ol {
  @apply pl-6 mb-4;
}

.markdown-body ul { @apply list-disc; }
.markdown-body ol { @apply list-decimal; }

.markdown-body li {
  @apply mb-1;
}

.markdown-body blockquote {
  @apply border-l-4 border-primary/30 pl-4 italic my-4 text-muted-foreground;
}

.markdown-body code {
  @apply bg-muted px-1.5 py-0.5 rounded font-mono text-[0.9em] text-primary;
}

.markdown-body pre {
  @apply my-4 p-4 rounded-lg bg-[#0d1117] overflow-x-auto;
}

.markdown-body pre code {
  @apply p-0 bg-transparent text-gray-200 text-[0.85em] leading-normal;
}

.markdown-body a {
  @apply text-primary hover:underline underline-offset-4;
}

.markdown-body table {
  @apply w-full border-collapse mb-4;
}

.markdown-body th,
.markdown-body td {
  @apply border border-border px-3 py-2 text-left;
}

.markdown-body th {
  @apply bg-muted font-bold;
}

.markdown-body hr {
  @apply my-6 border-border;
}
</style>

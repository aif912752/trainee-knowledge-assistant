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
  font-size: 0.875rem;
  line-height: 1.625;
}

.markdown-body p {
  margin-bottom: 1rem;
}

.markdown-body p:last-child {
  margin-bottom: 0;
}

.markdown-body h1,
.markdown-body h2,
.markdown-body h3,
.markdown-body h4,
.markdown-body h5,
.markdown-body h6 {
  font-weight: 700;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
}

.markdown-body h1:first-child,
.markdown-body h2:first-child,
.markdown-body h3:first-child {
  margin-top: 0;
}

.markdown-body h1 {
  font-size: 1.5rem;
}

.markdown-body h2 {
  font-size: 1.25rem;
}

.markdown-body h3 {
  font-size: 1.125rem;
}

.markdown-body ul,
.markdown-body ol {
  padding-left: 1.5rem;
  margin-bottom: 1rem;
}

.markdown-body ul {
  list-style-type: disc;
}

.markdown-body ol {
  list-style-type: decimal;
}

.markdown-body li {
  margin-bottom: 0.25rem;
}

.markdown-body blockquote {
  border-left: 4px solid rgb(224 93 56 / 0.3);
  padding-left: 1rem;
  font-style: italic;
  margin-top: 1rem;
  margin-bottom: 1rem;
  color: hsl(var(--muted-foreground));
}

.markdown-body code {
  background-color: hsl(var(--muted));
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-family: var(--font-mono);
  font-size: 0.9em;
  color: hsl(var(--primary));
}

.markdown-body pre {
  margin-top: 1rem;
  margin-bottom: 1rem;
  padding: 1rem;
  border-radius: 0.5rem;
  background-color: #0d1117;
  overflow-x: auto;
}

.markdown-body pre code {
  padding: 0;
  background-color: transparent;
  color: #e5e5e5;
  font-size: 0.85em;
  line-height: 1.5;
}

.markdown-body a {
  color: hsl(var(--primary));
  text-decoration: underline;
  text-underline-offset: 4px;
}

.markdown-body a:hover {
  text-decoration-thickness: 2px;
}

.markdown-body table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
}

.markdown-body th,
.markdown-body td {
  border: 1px solid hsl(var(--border));
  padding: 0.5rem 0.75rem;
  text-align: left;
}

.markdown-body th {
  background-color: hsl(var(--muted));
  font-weight: 700;
}

.markdown-body hr {
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;
  border-color: hsl(var(--border));
}
</style>

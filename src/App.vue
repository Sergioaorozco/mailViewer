<script setup>
import { ref, computed } from 'vue'
import FileUpload from 'primevue/fileupload'
import PostalMime from 'postal-mime'

const parsedEmails = ref([])
const error = ref(null)
const selectedEmail = ref(null)
const isLoading = ref(false);
const hasEmails = computed(() => parsedEmails.value.length > 0)

const handleUpload = async ({ files }) => {
  const file = files?.[0]
  if (!file) return
  if (!file.name.endsWith('.mbox')) {
    error.value = 'Please upload a valid .mbox file.'
    return
  }

  error.value = null
  isLoading.value = true
  parsedEmails.value = []

  const reader = file.stream().getReader()
  const decoder = new TextDecoder('utf-8')
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })

    // Split out complete messages
    const parts = buffer.split(/\nFrom .*\r?\n/)
    buffer = parts.pop() // keep last incomplete message

    for (const raw of parts) {
      try {
        const email = await PostalMime.parse(raw);
        parsedEmails.value.push({
          subject: email.subject || '',
          from: email.from?.text || '',
          to: email.to?.text || '',
          date: email.date || '',
          text: email.text || '',
          html: email.html || '',
          attachments: email.attachments || []
        })
      } catch (e) {
        console.error('PostalMime parse error:', e)
      }
    }
  }

  // parse leftover buffer
  if (buffer.trim()) {
    try {
      const email = await PostalMime.parse(buffer)
      parsedEmails.value.push(email)
    } catch (e) {
      console.error('PostalMime parse error (leftover):', e)
    }
  }
  isLoading.value = false;
}
</script>

<template>
  <main class="p-5">
    <h1 class="text-zinc-800 dark:text-zinc-200 font-bold text-5xl mb-2">Backup Mail</h1>
    <FileUpload auto customUpload @uploader="handleUpload" @clear="parsedEmails = []" />
    <div v-if="error" class="error">{{ error }}</div>
  </main>

    <!-- Loader -->
  <div v-if="isLoading" class="flex justify-center items-center py-6">
    <div class="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
    <span class="ml-3 text-blue-600 dark:text-blue-300">Parsing emails...</span>
  </div>

  <section v-if="hasEmails && !isLoading">
    <input type="text" placeholder="Search emails..." class="mb-4 p-2 border rounded w-full" />
    <div class="flex">
      <article class="w-1/3 p-5 rounded-lg overflow-clip">
        <ul class="rounded-lg overflow-clip border">
          <li
            v-for="email in parsedEmails"
            :key="email.subject + email.date"
            @click="selectedEmail = email.html"
            class="bg-zinc-100 hover:bg-zinc-300 dark:bg-zinc-900 dark:hover:bg-zinc-800 px-3 py-2 border-b border-zinc-300 dark:border-b-zinc-800 last:border-none"
          >
            {{ email.subject }}
          </li>
        </ul>
      </article>
    </div>

    <article class="p-5 w-2/3">
      <iframe v-if="selectedEmail" :srcdoc="selectedEmail" class="w-full h-full" frameborder="0"></iframe>
    </article>
  </section>
</template>

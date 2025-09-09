<script setup>
import { ref, computed } from 'vue'
import FileUpload from 'primevue/fileupload'
import PostalMime from 'postal-mime'
import PaperClipIcon from '@/assets/paperClipIcon.vue';

const parsedEmails = ref([])
const error = ref(null)
const selectedEmail = ref({})
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

    const parts = buffer.split(/\r?\nFrom\s/);
    buffer = parts.pop() // keep last incomplete message

    for(const raw of parts) {
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

const donwloadAttachment = ( attachment) => {
  try {
    const blob = new Blob([attachment.content], { type: attachment.mimeType});
    // Create a temporary URL for the blob
    const url = URL.createObjectURL(blob);

    // Temporary link element
    const link = document.createElement('a');
    link.href = url;
    link.download = attachment.filename || 'attachment';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the temporary URL to free memory
    URL.revokeObjectURL(url);
  } catch (e) {

  }
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

  <section class="p-5" v-if="hasEmails">
    <div class="flex">
      <article class="w-1/3">
        <input type="text" placeholder="Search emails..." class="mb-4 p-2 w-full rounded" />
        <ul class="rounded-lg overflow-clip border border-zinc-300 dark:border-zinc-800">
          <li class="bg-lime-400 px-4 py-4 text-zinc-800 font-semibold">Emails</li>
          <li
            v-for="email in parsedEmails"
            :key="email.subject + email.date"
            @click="selectedEmail = email"
            class="bg-zinc-100 hover:bg-zinc-300 dark:bg-zinc-900 dark:hover:bg-zinc-800 px-3 py-2 border-b border-zinc-300 dark:border-b-zinc-800 last:border-none"
          >
            {{ email.subject }}
          </li>
        </ul>
      </article>
      <article class="p-5 w-2/3 rounded-lg overflow-clip">
        <div class="border border-zinc-700 rounded-lg p-4 mb-4 bg-zinc-900" v-if="selectedEmail.subject">
          <p>{{ selectedEmail.subject }}</p>
          <p>From: {{ selectedEmail.from }}</p>
          <p>To: {{ selectedEmail.to }}</p>
          <p>Date: {{  new Date(selectedEmail.date).toLocaleDateString() }}</p>
          <ul>
            <li>Attachments:</li>
            <li class="flex gap-x-3" v-for="file in selectedEmail.attachments">
              <button class="flex gap-x-3 px-3 py-2 rounded-md bg-zinc-600" @click="donwloadAttachment">
                <i><PaperClipIcon /></i>
                {{file.filename}}
              </button>
            </li>
          </ul>
        </div>
        <iframe v-if="selectedEmail" :srcdoc="selectedEmail.html" class="w-full h-full" frameborder="0"></iframe>
      </article>
    </div>

  </section>
</template>

<script setup>
import EmailViewer from '@/components/EmailViewer.vue';
import GlobalLoader from '@/components/GlobalLoader.vue';
import { Upload, Mail } from 'lucide-vue-next';
import { ref, computed } from 'vue';
import PostalMime from 'postal-mime'

const parsedEmails = ref([])
const error = ref(null)
const isLoading = ref(false);

const hasEmails = computed(() => parsedEmails?.value.length > 0);

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
</script>

<template>
  <main class="p-5" v-if="!hasEmails">
    <section class="flex gap-x-3 justify-center text-xl items-center mb-5">
      <Mail class="size-9"></Mail>
      <h1>Email Viewer</h1>
    </section>
    <section class="flex flex-col justify-center items-center gap-y-4 border rounded-lg p-4 w-1/2 mx-auto">
        <i class="flex p-3 rounded-full bg-zinc-200"><Upload class="text-zinc-500"/></i>
        <h1 class="text-zinc-800 font-bold text-xl mb-2">Cargar Archivo .Mbox</h1>
        <div v-if="error" class="error">{{ error }}</div>
    </section>
  </main>
  <EmailViewer v-else :emails="parsedEmails" />
</template>

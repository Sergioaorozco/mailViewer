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
  <main class="p-5 max-w-2xl mx-auto" v-if="!hasEmails">
    <section class="mb-5 flex flex-col gap-y-2 items-center justify-center">
      <div class="flex gap-x-3 justify-center text-xl items-center">
        <Mail class="size-9"></Mail>
        <h1>Email Viewer</h1>
      </div>
      <div>
        <p class="text-zinc-500">Visualiza tus emails desde archivos .mbox</p>
      </div>
    </section>
    <section
      class="flex flex-col justify-center items-center gap-y-4 border-2 border-dashed hover:border-zinc-700 transition-colors duration-200 hover:bg-yellow-50 group rounded-lg p-8">
      <i class="flex p-3 rounded-full bg-zinc-200 group-hover:bg-yellow-200 transition-colors duration-150">
        <Upload class="text-zinc-500 group-hover:text-yellow-800" />
      </i>
      <h2 class="text-zinc-800 font-bold text-xl mb-2">Cargar Archivo .Mbox</h2>
      <p class="text-zinc-500 text-pretty text-center">Arrastra y suelta tu archivo aquí o haz clic para seleccionar</p>
      <div v-if="error" class="error">{{ error }}</div>
    </section>
    <section>
      <div class="mt-6 p-4 bg-zinc-100 rounded-lg">
        <div class="flex items-start gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            class="lucide lucide-circle-alert w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" aria-hidden="true">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" x2="12" y1="8" y2="12"></line>
            <line x1="12" x2="12.01" y1="16" y2="16"></line>
          </svg>
          <div class="text-sm">
            <p class="font-medium mb-2">¿Qué son los archivos .mbox?</p>
            <p class="text-muted-foreground text-pretty">Los archivos .mbox son una forma estándar de almacenar múltiples mensajes
              de correo electrónico en un solo archivo. Puedes exportar tus emails desde la mayoría de clientes de
              correo (Gmail, Thunderbird, Outlook, etc.) en este formato.</p>
          </div>
        </div>
      </div>
    </section>
  </main>
  <EmailViewer v-else :emails="parsedEmails" />
</template>

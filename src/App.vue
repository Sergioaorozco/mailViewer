<script setup>
import EmailViewer from '@/components/EmailViewer.vue'
import { Upload, Mail } from 'lucide-vue-next'
import { ref, computed } from 'vue'
import PostalMime from 'postal-mime'

const parsedEmails = ref([])
const error = ref(null)
const isDragging = ref(false)
const hasEmails = computed(() => parsedEmails.value.length > 0)

// ✅ Always convert to Uint8Array before parsing
const parseEmailChunk = async (raw) => {
  try {
    const data =
      raw instanceof Uint8Array
        ? raw
        : new TextEncoder().encode(typeof raw === 'string' ? raw : String(raw ?? ''))
    return await PostalMime.parse(data)
  } catch (err) {
    console.error('PostalMime parse error:', err)
    return null
  }
}

// ✅ Normalize data for EmailViewer
const mapEmailData = (email) => ({
  subject: email?.subject || '(No Subject)',
  from: email?.from?.text || 'Unknown Sender',
  to: email?.to?.text || 'Unknown Recipient',
  date: email?.date || '',
  text: email?.text || '',
  html: email?.html || '',
  attachments: email?.attachments || [],
})

const handleUpload = async (files) => {
  const file = files?.[0]
  if (!file) return
  if (!file.name.endsWith('.mbox')) {
    error.value = 'Please upload a valid .mbox file.'
    return
  }

  error.value = null
  parsedEmails.value = []

  const text = await file.text()
  const parts = text.split(/\r?\nFrom\s/)

  for (const raw of parts) {
    const trimmed = raw?.trim?.()
    if (!trimmed) continue

    const emailText = `From ${trimmed}`
    const email = await parseEmailChunk(emailText)
    if (!email) continue

    parsedEmails.value.push(mapEmailData(email))
  }
}

const handleFileChange = (e) => handleUpload(e.target.files)
const handleDrop = (e) => {
  e.preventDefault()
  isDragging.value = false
  handleUpload(e.dataTransfer.files)
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
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop="handleDrop"
      :class="isDragging ? 'border-yellow-700 bg-yellow-50' : 'border-zinc-300 hover:border-yellow-700 hover:bg-yellow-50'"
      class="flex flex-col justify-center items-center gap-y-4 border-2 border-dashed transition-colors duration-200 group rounded-lg p-8">
      <i
        :class="isDragging ? 'bg-yellow-200' : 'bg-zinc-200'"
        class="flex p-3 rounded-full bg-zinc-200 group-hover:bg-yellow-200 transition-colors duration-150">
        <Upload
        :class="isDragging ? 'text-yellow-800': 'text-zinc-500'"
         class="text-zinc-500 group-hover:text-yellow-800" />
      </i>
      <h2 class="text-zinc-800 font-bold text-xl mb-2">Cargar Archivo .Mbox</h2>
      <p class="text-zinc-500 text-pretty text-center">Arrastra y suelta tu archivo aquí o haz clic para seleccionar</p>
      <div v-if="error" class="error">{{ error }}</div>
      <label
        class="inline-flex items-center justify-center gap-2 hover:bg-yellow-800 duration-300 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-zinc-800 text-white hover:bg-zinc/90 h-10 px-4 py-2 cursor-pointer"><svg
          xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
          class="lucide lucide-file-text w-4 h-4" aria-hidden="true">
          <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path>
          <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
          <path d="M10 9H8"></path>
          <path d="M16 13H8"></path>
          <path d="M16 17H8"></path>
        </svg>Seleccionar archivo<input type="file" accept=".mbox" class="hidden" @change="handleFileChange"></label>
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
            <p class="text-muted-foreground text-pretty">Los archivos .mbox son una forma estándar de almacenar
              múltiples mensajes
              de correo electrónico en un solo archivo. Puedes exportar tus emails desde la mayoría de clientes de
              correo (Gmail, Thunderbird, Outlook, etc.) en este formato.</p>
          </div>
        </div>
      </div>
    </section>
  </main>
  <EmailViewer v-else :emails="parsedEmails" />
</template>

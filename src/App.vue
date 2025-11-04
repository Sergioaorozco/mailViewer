<script setup>
import EmailViewer from '@/components/EmailViewer.vue'
import { Upload, Mail } from 'lucide-vue-next'
import { ref, computed } from 'vue'
import PostalMime from 'postal-mime'

const parsedEmails = ref([]);
const error = ref(null);
const isDragging = ref(false);
const hasEmails = computed(() => parsedEmails.value.length > 0);
const uploadedFilename = ref(null);
const isLoading = ref(false);

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
  to: [...email?.to] || 'Unknown Recipient',
  fromName: email?.from?.name || 'Unknown Sender',
  fromAddress: email?.from?.address || 'Unknown Sender',
  emailID: email?.messageId || '',
  initialChars: formatChars(email?.from?.name),
  date: email?.date || '',
  text: email?.text || '',
  html: email?.html || '',
  attachments: email?.attachments || [],
})


const formatChars = (name) => {
  if(!name) return 'NA';
  const splittedName = name.trim().split(' ');

  return splittedName.length === 1
    ? splittedName[0].substring(0,2).toUpperCase()
    : splittedName[0][0] + splittedName[1][0].toUpperCase();
}


const handleUpload = async (files) => {
  const file = files?.[0]
  if (!file) return
  if (!file.name.endsWith('.mbox')) {
    error.value = 'Please upload a valid .mbox file.'
    return
  }

  error.value = null
  uploadedFilename.value = file.name
  parsedEmails.value = []

  try {
    isLoading.value = true;
    const reader = new FileReader()
    const chunkSize = 1024 * 1024 // 1MB chunks
    let offset = 0
    let buffer = ''

    reader.onload = async (e) => {
      const chunk = e.target.result
      buffer += chunk

      // Find complete email boundaries
      const emailBoundaries = buffer.split(/\r?\nFrom\s/)
      
      // Process all complete emails except the last one (might be incomplete)
      for (let i = 0; i < emailBoundaries.length - 1; i++) {
        const trimmed = emailBoundaries[i]?.trim?.()
        if (!trimmed) continue

        const emailText = `From ${trimmed}`
        const email = await parseEmailChunk(emailText)
        if (!email) continue

        parsedEmails.value.push(mapEmailData(email))
      }

      // Keep the last (potentially incomplete) email in the buffer
      buffer = emailBoundaries[emailBoundaries.length - 1]

      // Continue reading if there's more
      offset += chunkSize
      if (offset < file.size) {
        readNextChunk()
      } else if (buffer.trim()) {
        // Process the final chunk
        const emailText = `From ${buffer.trim()}`
        const email = await parseEmailChunk(emailText)
        if (email) {
          parsedEmails.value.push(mapEmailData(email))
        }
        isLoading.value = false;
      } else {
        isLoading.value = false;
      }
    }

    reader.onerror = () => {
      error.value = 'Error reading file'
      isLoading.value = false;
    }

    const readNextChunk = () => {
      const blob = file.slice(offset, offset + chunkSize)
      reader.readAsText(blob)
    }

    // Start reading
    readNextChunk()
  } catch (err) {
    error.value = 'Error processing file: ' + err.message
    isLoading.value = false;
    console.error('File processing error:', err)
  }
}

const handleFileChange = (e) => handleUpload(e.target.files)
const handleDrop = (e) => {
  e.preventDefault()
  isDragging.value = false
  handleUpload(e.dataTransfer.files)
}

const resetViewer = () => {
  parsedEmails.value = []
  uploadedFilename.value = null
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
  <EmailViewer v-else :isLoading="isLoading" :emails="parsedEmails" :uploadedFilename="uploadedFilename" @resetEmails="resetViewer" />
</template>

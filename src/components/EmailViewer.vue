<script setup>
// Dependencies
import { computed, ref } from 'vue';
import { Mail } from 'lucide-vue-next';
import PaperClipIcon from '../assets/PaperClipIcon.vue';

// Props
const props = defineProps({
  emails: {
    type: Array,
    default: [],
    required: true,
  },
  uploadedFilename: {
    type: String,
    default: '',
    required: false,
  }
}
)

// References
const selectedEmail = ref({})

// Methods
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
    console.error('An error download the attachtment');
  }
}

</script>

<template>
  <section class="p-5 flex gap-x-3 text-xl justify-between items-center">
    <div class="flex gap-x-2 items-center">
      <Mail class="size-9"></Mail>
      <span class="leading-none">
        <h1>Email Viewer</h1>
        <h2 class="text-zinc-600 font-light">{{ uploadedFilename }}</h2>
      </span>
    </div>
    <button
      class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"><svg
        xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-upload w-4 h-4"
        aria-hidden="true">
        <path d="M12 3v12"></path>
        <path d="m17 8-5-5-5 5"></path>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      </svg>Nuevo archivo
    </button>
  </section>
  <section class="p-5">
    <div class="flex gap-x-3 h-[calc(100vh-120px)]">
      <article class="w-1/3 flex flex-col rounded-lg border border-zinc-300">
        <div class="border-b border-zinc-200">
          <div class="relative"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
              class="lucide lucide-search absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground"
              aria-hidden="true">
              <path d="m21 21-4.34-4.34"></path>
              <circle cx="11" cy="11" r="8"></circle>
            </svg><input placeholder="Buscar emails..."
              class="flex h-16 w-full rounded-md px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-10 pr-10"
              value="">
          </div>
        </div>
        <ul class="flex-1 overflow-y-auto">
          <li v-for="email in emails" :key="email.subject + email.date" @click="selectedEmail = email"
            class="bg-white hover:bg-zinc-100 px-3 py-2 min-h-20 border-b border-zinc-300 last:border-none">
            <span class="flex items-start gap-x-3">
              <p class="p-3 rounded-full size-10 flex justify-center items-center bg-zinc-200">SA</p>
              <p> {{ email.subject }}</p>
            </span>
          </li>
        </ul>
      </article>
      <article class="w-2/3 border border-zinc-20- rounded-lg overflow-clip">
        <div class="border-b border-zinc-200 p-4 mb-4 bg-white" v-if="selectedEmail.subject">
          <p>{{ selectedEmail.subject }}</p>
          <p>From: {{ selectedEmail.from }}</p>
          <p>To: {{ selectedEmail.to }}</p>
          <p>Date: {{ new Date(selectedEmail.date).toLocaleDateString() }}</p>
          <ul>
            <li>Attachments:</li>
            <li class="flex gap-x-3" v-for="file in selectedEmail.attachments">
              <button class="flex gap-x-3 px-3 py-2 rounded-md bg-zinc-100" @click="donwloadAttachment">
                <i>
                  <PaperClipIcon />
                </i>
                {{file.filename}}
              </button>
            </li>
          </ul>
        </div>
        <div v-if="selectedEmail">
          <iframe :srcdoc="selectedEmail.html" class="w-full h-full" frameborder="0"></iframe>
        </div>
        <div v-else class="flex justify-center items-center w-full h-full">
          <Mail class="size-9"></Mail>
          <p>Selecciona un email para ver su contenido</p>
        </div>
      </article>
    </div>
  </section>
</template>
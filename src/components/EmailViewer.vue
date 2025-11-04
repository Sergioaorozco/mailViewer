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
});

// Emits
const emit = defineEmits(['reset-emails']);

// References
const selectedEmail = ref({})
const filterText = defineModel();

// Methods
const clearFilter = () => {
  filterText.value = '';
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
    console.error('An error download the attachtment');
  }
}

const showFilteredEmails = computed(() => {
  selectedEmail.value = {};
  const orderEmails = props.emails.sort((a,b) => new Date(b.date) - new Date(a.date));
  if(!filterText.value) return orderEmails;
  return orderEmails.filter(email => 
    email.subject.toLowerCase().includes(filterText.value.toLowerCase()) ||
    email.fromAddress.toLowerCase().includes(filterText.value.toLowerCase()) ||
    email.fromName.toLowerCase().includes(filterText.value.toLowerCase())
  )
});

const formatDate = (date)  =>{
  if(!date) return 'Invalid Date';

  const dateToString = new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return dateToString;
}

</script>

<template>
  <section class="p-5 flex gap-x-3 text-xl justify-between items-center">
    <div class="flex gap-x-2 items-center">
      <i class="size-14 flex items-center justify-center bg-zinc-200 text-zinc-700 rounded-full">
        <Mail class="size-8"></Mail>
      </i>
      <span class="leading-none">
        <h1>Email Viewer</h1>
        <h2 class="text-zinc-600 font-light">{{ uploadedFilename }}</h2>
      </span>
    </div>
    <button @click="$emit('reset-emails')"
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
          <div class="relative">
            <svg v-if="!filterText" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
              class="lucide lucide-search absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground"
              aria-hidden="true">
              <path d="m21 21-4.34-4.34"></path>
              <circle cx="11" cy="11" r="8"></circle>
            </svg>
            <svg v-else @click="clearFilter" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
              class="icon icon-tabler icons-tabler-outline icon-tabler-x absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 cursor-pointer">
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M18 6l-12 12" />
              <path d="M6 6l12 12" />
            </svg>
            <input
              class="flex h-16 w-full rounded-md px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-10 pr-10"
              placeholder="Buscar emails..." v-model="filterText" type="text" autocomplete="false">
          </div>
        </div>
        <ul class="flex-1 overflow-y-auto">
          <li v-if="!showFilteredEmails.length" class="px-3 py-4 bg-yellow-100 flex gap-x-2 items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
              class="lucide lucide-circle-alert w-5 h-5 text-zinc-800 mt-0.5 flex-shrink-0" aria-hidden="true">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" x2="12" y1="8" y2="12"></line>
              <line x1="12" x2="12.01" y1="16" y2="16"></line>
            </svg>
            No se encontraron emails que coincidan con "{{ filterText }}"
          </li>
          <li v-for="email in showFilteredEmails" :key="email.subject + email.date" @click="selectedEmail = email"
            class="bg-white hover:bg-zinc-100 px-3 py-2 min-h-20 border-b group border-zinc-300 last:border-none cursor-pointer"
            :class="selectedEmail.emailID === email.emailID ? 'bg-yellow-50 hover:bg-yellow-100' : ''"
          >
            <div class="flex justify-between items-start gap-x-3">
              <div class="flex gap-x-2">
                <p :class="[selectedEmail.emailID === email.emailID ? 'bg-yellow-300 group-hover:bg-yellow-400': '','p-3 rounded-full size-10 flex justify-center items-center bg-zinc-200']">{{email.initialChars}}
                </p>
                <span class="flex flex-col">
                  <p class="font-semibold"> {{ email.fromName }}</p>
                  <p class="text-zinc-600 text-sm overflow-ellipsis"> {{ email.subject }}</p>
                </span>
              </div>
              <div class="flex items-center gap-1 text-xs text-zinc-500 whitespace-nowrap"><svg
                  xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                  class="lucide lucide-calendar w-4 h-4" aria-hidden="true">
                  <path d="M8 2v4"></path>
                  <path d="M16 2v4"></path>
                  <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                  <path d="M3 10h18"></path>
                </svg><span>{{ formatDate(email.date) }}</span>
              </div>
            </div>
          </li>
        </ul>
      </article>
      <article class="w-2/3 border border-zinc-300 rounded-lg overflow-clip">
        <div class="border-b border-zinc-200 px-4 pt-4 pb-8 bg-white" v-if="selectedEmail.subject">
          <p class="text-xl font-semibold">{{ selectedEmail.subject }}</p>
          <div class="flex items-start gap-x-3 mt-2">
            <p class="p-3 rounded-full size-10 flex justify-center items-center bg-yellow-300 mt-1">
              {{selectedEmail.initialChars}}</p>
            <div class="flex-col w-full">
              <div class="flex justify-between items-start w-full">
                <span>
                  <p>{{ selectedEmail.fromName }}</p>
                  <p class="text-zinc-500">{{ selectedEmail.fromAddress }}</p>
                </span>
                <div class="flex items-center self-start gap-1 text-sm text-zinc-500"><svg
                    xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                    class="lucide lucide-calendar w-4 h-4" aria-hidden="true">
                    <path d="M8 2v4"></path>
                    <path d="M16 2v4"></path>
                    <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                    <path d="M3 10h18"></path>
                  </svg><span>{{ formatDate(selectedEmail.date) }}</span>
                </div>
              </div>
              <ul v-if="selectedEmail.attachments.length" class="flex gap-x-2 text-sm mt-3 flex-wrap gap-2">
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
          </div>
        </div>
        <iframe v-if="selectedEmail.subject" :srcdoc="selectedEmail.html" class="w-full h-full"
          frameborder="0"></iframe>
        <div v-else class="flex flex-col justify-center items-center w-full h-full text-zinc-400">
          <Mail class="size-14"></Mail>
          <p class="text-zinc-600">Selecciona un email para ver su contenido</p>
        </div>
      </article>
    </div>
  </section>
</template>
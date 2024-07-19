<script setup>
import {ref, computed } from 'vue';
import PostalMime from 'postal-mime';
const renderedEmail = ref([]);
const fileName = ref([]);
const isLoading = ref(false);
const selectedEmail = ref({});
// Computed property for total emails
const totalEmails = computed(() => renderedEmail.value.length);

function handleEmail(event){
  const uploadedFiles = event.target.files;
  for(const file of uploadedFiles) {
    fileName.value.push(file.name)
    const reader = new FileReader();
    reader.onload = async (event) => {
      try{
        const EmailData = event.target.result;
        const emails = splitMboxData(EmailData);
        isLoading.value = true;
  
        for(const email of emails) {
          const parsedEmail = await PostalMime.parse(email)
          const emailResult = await PostalMime.parse(parsedEmail.text)
          selectedEmail.value = renderedEmail.value[0];
          renderedEmail.value.push(emailResult);
        }
      }catch(error){
        console.error('Error Parsing Email:', error)
      }finally {
        isLoading.value = false;
      }
    }
    reader.readAsText(file);
  }
}

function splitMboxData(mboxData) {
  return mboxData.split(/^From [^ ]* .*$/gm).slice(1);
}


function selectEmail(email) {
  selectedEmail.value = email
}

function downloadFile(file) {
  // Check if attachment data is available (e.g., `file.content`)
  if (file.content) {
    const blob = new Blob([file.content], { type: file.contentType || 'application/octet-stream' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.filename;
    link.click();
    window.URL.revokeObjectURL(url);
  } else {
    console.error('Attachment data not found');
  }
}

</script>

<template>
  <div class="px-5 py-5">
    <h1>Email Viewer</h1>
    <div class="flex items-center justify-center w-full">
    <label for="dropzone-file" class="flex flex-col items-center justify-center w-full min-h-32 py-5 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-neutral-50 hover:bg-gray-100">
        <div class="flex gap-x-2 mb-2 items-center justify-center">
            <svg class="w-8 h-8 text-gray-700" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
            </svg>
            <p class="text-xl text-gray-500"><span class="font-semibold">Click to upload</span> or drag and drop</p>
          </div>
          <p v-if="!fileName.length" class="text-sm text-center text-neutral-600">Accepted files: MBOX Files</p>
          <div v-else class="font-bold text-center">
            <p v-for="name in fileName" :key="name">{{ name }}</p>
          </div>
        <input id="dropzone-file" type="file" @change="handleEmail" accept=".mbox" class="hidden" :multiple="true" />
    </label>
</div> 
  </div>
  <main class="flex px-12 gap-x-2 my-5" v-if="renderedEmail[0]">
    <section class="w-1/3 px-2">
      <div class="w-full bg-emerald-300 py-2 px-3 rounded-t-lg">
        <p>Total Emails: {{ totalEmails }} </p>
      </div>
      <ul class="flex flex-col border border-neutral-200 overflow-y-auto h-full">
        <li @click="selectEmail(email, index)"
          :class="selectedEmail === renderedEmail[index] ? '!bg-emerald-700 text-white hover:!bg-emerald-600' : 'bg-neutral-50 hover:bg-neutral-200'"
          class="flex gap-x-4 py-4 px-2 items-start text-sm cursor-pointer border-b last:border-b-0 border-b-neutral-200"
          v-for="(email, index) in renderedEmail" :key="email.date">
          <figure class="flex flex-col gap-y-2 justify-center items-center">
            <img width="40px" height="40px" src="./assets/mailIcon.svg" alt="Icon "
              class="bg-emerald-200 rounded-full p-2">
            <img width="40px" height="40px" v-if="email.attachments.length" src="./assets/paperClip.svg" alt="Icon "
              class="bg-yellow-200 rounded-full p-2">
          </figure>
          <ul class="w-4/5 overflow-hidden">
            <li class="font-bold">Asunto: <span class="font-normal block truncate">{{ email.subject }}</span></li>
            <li class="font-bold">De: <span class="font-normal">{{ email.from.name }}</span></li>
            <li class="font-bold">Para: <span class="font-normal" v-for="recipient in email.to">{{ recipient.name
                }}</span></li>
            <li class="font-bold">Fecha: <span class="font-normal">{{ new Date(email.date).toDateString() }} - {{ new
                Date(email.date).toLocaleTimeString() }}</span></li>
          </ul>
        </li>
      </ul>
    </section>
    <section class="w-10/12 sticky top-2 h-screen" v-if="selectedEmail">
      <div class="border border-neutral-200 rounded-lg">
        <ul class="EmailRows py-2">
          <li class="font-bold">Asunto: <span class="font-normal">{{selectedEmail.subject}}</span></li>
          <li class="font-bold">De: <span class="font-normal">{{selectedEmail.from.name}} - {{
              selectedEmail.from.address }}</span></li>
          <li class="font-bold">Para: <span class="font-normal" v-for="recipient in selectedEmail.to">{{recipient.name}}
              - {{ recipient.address }}</span></li>
          <li class="font-bold">Fecha: <span class="font-normal">{{ new Date(selectedEmail.date).toDateString() }} - {{
              new Date(selectedEmail.date).toLocaleTimeString() }}</span></li>
          <li class="font-bold" v-if="selectedEmail.attachments.length">Archivos Adjuntos:
            <div class="flex mt-4">
              <span v-for="file in selectedEmail.attachments" @click="downloadFile(file)"
                class="bg-neutral-100 flex hover:bg-neutral-200 rounded-lg px-3 py-2 mr-2 cursor-pointer">
                <img class="inline-block" src="./assets/paperClip.svg" width="20px" height="20px">
                <p>{{ file.filename }}</p>
              </span>
            </div>
          </li>
        </ul>
      </div>
      <div class="h-full">
        <iframe class="mt-3 border w-full border-neutral-200 rounded-lg h-full" v-if="selectedEmail" :srcdoc="selectedEmail.html"></iframe>
      </div>
    </section>
  </main>
</template>

<style lang="css">

</style>

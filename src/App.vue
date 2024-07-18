<script setup>
import {ref, computed } from 'vue';
import mailIcon from "./assets/mailIcon.svg"
import PostalMime from 'postal-mime';
const renderedEmail = ref([]);
const isLoading = ref(false);
const selectedEmail = ref({});
// Computed property for total emails
const totalEmails = computed(() => renderedEmail.value.length);

function handleEmail(event){
  const uploadedFiles = event.target.files[0];
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
  reader.readAsText(uploadedFiles);
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
  <input type="file" name="emailInput" id="emailMBox" @change="handleEmail">
  <main class="flex px-12 gap-x-2 my-5" v-if="renderedEmail[0]">
    <section class="w-1/3 px-2">
      <div class="w-full bg-emerald-300 py-2 px-3 rounded-t-lg">
        <p>Total Emails: {{ totalEmails }} </p>
      </div>
      <div class="flex flex-col">
        <div @click="selectEmail(email, index)" :class="selectedEmail === renderedEmail[index] ? '!bg-emerald-700 text-white hover:!bg-emerald-600' : 'bg-neutral-50 hover:bg-neutral-200'" class="flex gap-x-4 py-4 px-2 items-start text-sm border border-neutral-200 cursor-pointer" v-for="(email, index) in renderedEmail" :key="email.date">
          <figure class="flex flex-col gap-y-2 justify-center items-center">
            <img width="40px" height="40px" src="./assets/mailIcon.svg" alt="Icon " class="bg-emerald-200 rounded-full p-2">
            <img width="40px" height="40px" v-if="email.attachments.length" src="./assets/paperClip.svg" alt="Icon " class="bg-yellow-200 rounded-full p-2">
          </figure>
          <ul class="w-4/5 overflow-hidden">
            <li class="font-bold">Asunto: <span class="font-normal truncate">{{ email.subject }}</span></li>
            <li class="font-bold">De: <span class="font-normal">{{ email.from.name }}</span></li>
            <li class="font-bold">Para: <span class="font-normal" v-for="recipient in email.to">{{ recipient.name }}</span></li>
            <li class="font-bold">Fecha: <span class="font-normal">{{ new Date(email.date).toLocaleString() }}</span></li>
          </ul>

        </div>
      </div>
    </section>
    <section class="w-10/12" v-if="selectedEmail">
      <div class="border border-neutral-200 rounded-lg">
        <ul class="EmailRows py-2">
          <li class="font-bold">Asunto: <span class="font-normal">{{selectedEmail.subject}}</span></li>
          <li class="font-bold">De: <span class="font-normal">{{selectedEmail.from.name}} - {{ selectedEmail.from.address }}</span></li>
          <li class="font-bold">Para: <span class="font-normal" v-for="recipient in selectedEmail.to">{{recipient.name}} - {{ recipient.address }}</span></li>
          <li class="font-bold">Fecha: <span class="font-normal">{{new Date(selectedEmail.date).toLocaleString()}}</span></li>
          <li class="font-bold" v-if="selectedEmail.attachments.length">Archivos Adjuntos:
            <div class="flex mt-4">
              <span v-for="file in selectedEmail.attachments" @click="downloadFile(file)" class="bg-neutral-100 flex hover:bg-neutral-200 rounded-lg px-3 py-2 mr-2 cursor-pointer">
                <img class="inline-block" src="./assets/paperClip.svg" width="20px" height="20px">
                <p>{{ file.filename }}</p>
              </span>
            </div>
          </li>
        </ul>
      </div>
      <div class="mt-3 p-5 border border-neutral-200 rounded-lg"  v-if="selectedEmail">
        <div v-html="selectedEmail.html"></div>
      </div>
    </section>
  </main>
</template>

<style lang="css">

</style>

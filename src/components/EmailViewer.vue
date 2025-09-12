<script setup>
// Dependencies
import { computed, ref } from 'vue';

// Props
const props = defineProps([
  {emails: {
    type: Array,
    default: []
  }}
])

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
    <section class="p-5">
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
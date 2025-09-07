<script setup>
import { ref, computed } from 'vue'
import { FileUpload } from 'primevue'
import PostalMime from 'postal-mime'

const parsedEmails = ref([]);
const error = ref(null);
let hasEmails = computed(() => parsedEmails.value.length > 0);

const handleUpload = async ({files}) => {
  const file = files?.[0]
  if (!file) return
  if (!file.name.endsWith('.mbox')) {
    error.value = 'Please upload a valid .mbox file.'
    return
  }

  const mboxText = await file.text()
  const rawMessages = mboxText.split(/\nFrom .*\r?\n/).filter(Boolean)

  const out = []
  for (const raw of rawMessages) {
    try {
      const email = await PostalMime.parse(raw);
      out.push({
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
  parsedEmails.value = out
  console.log(parsedEmails.value);
}
</script>

<template>
  <FileUpload auto customUpload @uploader="handleUpload" />
  <div v-if="error" class="error">{{ error }}</div>

  <!-- Display Emails  -->
  <section class="flex" v-if="hasEmails">
     <article class="w-1/3 p-5 rounded-lg overflow-clip" >
      <ul class="rounded-lg overflow-clip border">
        <li class="bg-zinc-100 hover:bg-zinc-300 dark:bg-zinc-900 dark:hover:bg-zinc-800 px-3 py-2 border-b-zinc-300 dark:border-b-zinc-800 border-b last:border-none" v-for="email in parsedEmails">
          {{ email.subject }}
        </li>
      </ul>
     </article>
     <article class="w-2/3">
      <iframe src="" class="w-full h-full" frameborder="0"></iframe>
     </article>
  </section>
</template>

import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import FileUpload from 'primevue/fileupload';

const app = createApp(App);
app.component('FileUpload',FileUpload);
app.use(PrimeVue);
app.mount('#app');

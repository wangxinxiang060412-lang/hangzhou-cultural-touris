import { createApp } from 'vue'
import App from './App.vue'
import { siteLocale } from './i18n/site'
import router from './router'
import './styles/globals.css'

document.documentElement.lang = siteLocale.value

createApp(App).use(router).mount('#app')

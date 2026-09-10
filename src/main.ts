import { createApp } from 'vue'
import App from './App.vue'
import { siteLocale } from './i18n/site'
import router from './router'
import { pinia } from './stores/pinia'
import { restoreSession } from './stores/auth'
import './styles/globals.css'

document.documentElement.lang = siteLocale.value

await restoreSession()

createApp(App).use(pinia).use(router).mount('#app')

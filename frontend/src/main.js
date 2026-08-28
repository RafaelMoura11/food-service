import { createApp } from 'vue'
import './assets/scss/app.scss'
import App from './App.vue'
import { createAppRouter } from './router'

createApp(App).use(createAppRouter()).mount('#app')

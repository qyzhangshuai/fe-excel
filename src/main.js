import { createApp } from 'vue'
import '@/styles/reset.css';
import App from './App.vue'
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';

import router from './router'
import LayoutWrap from '@/components/layout-wrap.vue'

const app = createApp(App)

app.component('LayoutWrap', LayoutWrap)

app.use(Antd)
    .use(router)

    .mount('#app')

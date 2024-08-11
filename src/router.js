import { createWebHistory, createRouter } from 'vue-router'


const routes = [
    { path: '/', redirect: '/excel-hospital' },
    { path: '/excel-hospital', component: () => import('@/packages/excel-hospital/index.vue') },
]

const router = createRouter({
    history: createWebHistory('fe'),
    routes,
})

export default router
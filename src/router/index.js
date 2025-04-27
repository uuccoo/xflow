import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    redirect: '/design',
  },
  {
    path: '/design',
    component: () => import('@/views/DesignView.vue'),
    redirect: '/design/basicSettings',
    children: [
      {
        path: 'basicSettings',
        component: () => import('@/components/design/BasicSettings.vue'),
      },
      {
        path: 'formDesign',
        component: () => import('@/components/design/FormDesign.vue'),
      },
      {
        path: 'flowDesign',
        component: () => import('@/components/design/FlowDesign.vue'),
      },
      {
        path: 'moreSettings',
        component: () => import('@/components/design/MoreSettings.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
})

export default router

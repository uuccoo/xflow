import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    redirect: '/home',
  },
  {
    path: '/home',
    component: () => import('@/views/home/HomeView.vue'),
    redirect: '/home/initiate',
    children: [
      {
        path: 'initiate',
        name: 'initiate-approval',
        component: () => import('@/views/approval/InitiateApproval.vue'),
      },
      // 管理相关路由
      {
        path: 'manage-forms',
        name: 'manage-forms',
        component: () => import('@/views/management/ManageForms.vue'),
      },
    ],
  },
  {
    path: '/design',
    component: () => import('@/views/design/Design.vue'),
  },
  {
    path: '/approval-form',
    name: 'approval-form',
    component: () => import('@/views/approval/ApprovalFormView.vue'),
  },
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
})

export default router

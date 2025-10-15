import { createRouter } from 'nativescript-vue';

const router = createRouter({
  routes: [
    {
      path: '/',
      redirect: '/home'
    },
    {
      path: '/home',
      component: () => import('@/views/Tab1Page.vue'),
    },
    {
      path: '/videos',
      component: () => import('@/views/Tab2Page.vue'),
    },
    {
      path: '/short-dramas',
      component: () => import('@/views/ShortDramasPage.vue'),
    },
    {
      path: '/my',
      component: () => import('@/views/MyPage.vue'),
    },
    {
      path: '/dramas-detail/:id',
      component: () => import('@/views/DramasDetail.vue'),
    },
    {
      path: '/analytics-demo',
      component: () => import('@/views/AnalyticsDemo.vue'),
    }
  ]
});

export default router;
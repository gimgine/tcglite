import { createRouter, createWebHashHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import OrderHelperView from '../views/OrderHelperView.vue';
import PricingView from '@/views/PricingView.vue';

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/order-helper',
      name: 'orderHelper',
      component: OrderHelperView
    },
    {
      path: '/pricing',
      name: 'pricing',
      component: PricingView
    }
  ]
});

export default router;

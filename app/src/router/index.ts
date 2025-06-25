import { createRouter, createWebHashHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import OrderHelperView from '../views/OrderHelperView.vue';

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
    }
  ]
});

export default router;

import OrderHelperUpload from '@/components/order-helper/OrderHelperUpload.vue';
import PullSheet from '@/components/order-helper/PullSheet.vue';
import ShippingHelper from '@/components/order-helper/shipping/ShippingHelper.vue';
import pb from '@/util/pocketbase';
import { createRouter, createWebHashHistory } from 'vue-router';

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue')
    },
    {
      path: '/order-helper',
      name: 'orderHelper',
      redirect: '/order-helper/upload',
      component: () => import('@/views/OrderHelperView.vue'),
      children: [
        {
          path: 'upload',
          name: 'upload',
          component: OrderHelperUpload
        },
        {
          path: 'pull-sheet',
          name: 'pullSheet',
          component: PullSheet
        },
        {
          path: 'shipping',
          name: 'shipping',
          component: ShippingHelper
        }
      ]
    },
    {
      path: '/pricing',
      name: 'pricing',
      component: () => import('@/views/PricingView.vue')
    },
    {
      path: '/expenses',
      name: 'expenses',
      component: () => import('@/views/ExpensesView.vue')
    },
    {
      path: '/inventory/:collectionId?',
      name: 'inventory',
      component: () => import('@/views/InventoryView.vue'),
      props: true
    },
    {
      path: '/stats',
      name: 'stats',
      component: () => import('@/views/StatsView.vue')
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/SettingsView.vue')
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('@/views/AdminView.vue')
    }
  ]
});

router.beforeEach((to, _, next) => {
  if (to.name !== 'login' && !pb.authStore.isValid) {
    return router.push({ name: 'login' });
  }
  next();
});

export default router;

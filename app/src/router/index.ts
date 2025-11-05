import OrderHelperUpload from '@/components/order-helper/OrderHelperUpload.vue';
import PullSheet from '@/components/order-helper/PullSheet.vue';
import ShippingHelper from '@/components/order-helper/shipping/ShippingHelper.vue';
import pb from '@/util/pocketbase';
import AdminView from '@/views/AdminView.vue';
import ExpensesView from '@/views/ExpensesView.vue';
import LoginView from '@/views/LoginView.vue';
import PricingView from '@/views/PricingView.vue';
import StatsView from '@/views/StatsView.vue';
import SettingsView from '@/views/SettingsView.vue';
import { createRouter, createWebHashHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import OrderHelperView from '../views/OrderHelperView.vue';
import InventoryView from '@/views/InventoryView.vue';

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/order-helper',
      name: 'orderHelper',
      redirect: '/order-helper/upload',
      component: OrderHelperView,
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
      component: PricingView
    },
    {
      path: '/expenses',
      name: 'expenses',
      component: ExpensesView
    },
    {
      path: '/inventory/:collectionId?',
      name: 'inventory',
      component: InventoryView,
      props: true
    },
    {
      path: '/stats',
      name: 'stats',
      component: StatsView
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminView
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

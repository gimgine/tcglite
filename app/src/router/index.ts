import { createRouter, createWebHashHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import OrderHelperView from '../views/OrderHelperView.vue';
import PricingView from '@/views/PricingView.vue';
import ExpensesView from '@/views/ExpensesView.vue';
import StatsView from '@/views/StatsView.vue';
import OrderHelperUpload from '@/components/order-helper/OrderHelperUpload.vue';
import PullSheet from '@/components/order-helper/PullSheet.vue';
import ShippingHelper from '@/components/order-helper/shipping/ShippingHelper.vue';

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
      path: '/stats',
      name: 'stats',
      component: StatsView
    }
  ]
});

export default router;

import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:headphones',
      order: 4,
      title: $t('page.customerService.title'),
    },
    name: 'CustomerService',
    path: '/customer-service',
    children: [
      // {
      //   name: 'CustomerServiceIndex',
      //   path: '/customer-service',
      //   component: () => import('#/views/customer-service/index.vue'),
      //   meta: {
      //     icon: 'lucide:headphones',
      //     title: $t('page.customerService.index'),
      //   },
      // },
      {
        name: 'CustomerServiceVisitor',
        path: '/customer-service/visitor',
        component: () => import('#/views/customer-service/visitor.vue'),
        meta: {
          icon: 'lucide:user-plus',
          title: $t('page.customerService.visitor'),
        },
      },
      {
        name: 'CustomerServiceCustomerInfo',
        path: '/customer-service/customer-info',
        component: () => import('#/views/customer-service/customer-info.vue'),
        meta: {
          icon: 'lucide:user',
          title: $t('page.customerService.customerInfo'),
        },
      },
      {
        name: 'CustomerServiceFeedback',
        path: '/customer-service/feedback',
        component: () => import('#/views/customer-service/feedback.vue'),
        meta: {
          icon: 'lucide:message-circle',
          title: $t('page.customerService.feedback'),
        },
      },
      {
        name: 'CustomerServiceMeal',
        path: '/customer-service/meal',
        component: () => import('#/views/customer-service/meal.vue'),
        meta: {
          icon: 'lucide:utensils',
          title: $t('page.customerService.meal'),
        },
      },
      {
        name: 'CustomerServiceDailyCheck',
        path: '/customer-service/daily-check',
        component: () => import('#/views/customer-service/daily-check.vue'),
        meta: {
          icon: 'lucide:clipboard-check',
          title: $t('page.customerService.dailyCheck'),
        },
      },
      {
        name: 'CustomerServiceMaintenance',
        path: '/customer-service/maintenance',
        component: () => import('#/views/customer-service/maintenance.vue'),
        meta: {
          icon: 'lucide:wrench',
          title: $t('page.customerService.maintenance'),
        },
      },
      {
        name: 'CustomerServiceMealSample',
        path: '/customer-service/meal-sample',
        component: () => import('#/views/customer-service/meal-sample.vue'),
        meta: {
          icon: 'lucide:utensils-crossed',
          title: $t('page.customerService.mealSample'),
        },
      },
      {
        name: 'CustomerServiceCheckout',
        path: '/customer-service/checkout',
        component: () => import('#/views/customer-service/checkout.vue'),
        meta: {
          icon: 'lucide:log-out',
          title: $t('page.customerService.checkout'),
        },
      },
    ],
  },
];

export default routes;

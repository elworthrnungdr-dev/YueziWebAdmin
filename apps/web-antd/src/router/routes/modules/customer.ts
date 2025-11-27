import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:users',
      order: 1,
      title: $t('page.customer.title'),
    },
    name: 'Customer',
    path: '/customer',
    children: [
      {
        name: 'CustomerIndex',
        path: '/customer',
        component: () => import('#/views/customer/index.vue'),
        meta: {
          icon: 'lucide:user',
          title: $t('page.customer.index'),
        },
      },
      {
        name: 'CustomerContract',
        path: '/customer/contract',
        component: () => import('#/views/customer/contract.vue'),
        meta: {
          icon: 'lucide:file-text',
          title: $t('page.customer.contract'),
        },
      },
      {
        name: 'CustomerPayment',
        path: '/customer/payment',
        component: () => import('#/views/customer/payment.vue'),
        meta: {
          icon: 'lucide:credit-card',
          title: $t('page.customer.payment'),
        },
      },
      {
        name: 'CustomerRehabilitation',
        path: '/customer/rehabilitation',
        component: () => import('#/views/customer/rehabilitation.vue'),
        meta: {
          icon: 'lucide:heart',
          title: $t('page.customer.rehabilitation'),
        },
      },
      {
        name: 'CustomerCheckin',
        path: '/customer/checkin',
        component: () => import('#/views/customer/checkin.vue'),
        meta: {
          icon: 'lucide:home',
          title: $t('page.customer.checkin'),
        },
      },
      {
        name: 'CustomerBaby',
        path: '/customer/baby',
        component: () => import('#/views/customer/baby.vue'),
        meta: {
          icon: 'lucide:baby',
          title: $t('page.customer.baby'),
        },
      },
      {
        name: 'CustomerSupplement',
        path: '/customer/supplement',
        component: () => import('#/views/customer/supplement.vue'),
        meta: {
          icon: 'lucide:file-plus',
          title: $t('page.customer.supplement'),
        },
      },
      {
        name: 'CustomerDiet',
        path: '/customer/diet',
        component: () => import('#/views/customer/diet.vue'),
        meta: {
          icon: 'lucide:utensils-crossed',
          title: $t('page.customer.diet'),
        },
      },
      {
        name: 'CustomerVisitor',
        path: '/customer/visitor',
        component: () => import('#/views/customer/visitor.vue'),
        meta: {
          icon: 'lucide:user-plus',
          title: $t('page.customer.visitor'),
        },
      },
      {
        name: 'CustomerLeave',
        path: '/customer/leave',
        component: () => import('#/views/customer/leave.vue'),
        meta: {
          icon: 'lucide:calendar-x',
          title: $t('page.customer.leave'),
        },
      },
      {
        name: 'CustomerMeal',
        path: '/customer/meal',
        component: () => import('#/views/customer/meal.vue'),
        meta: {
          icon: 'lucide:utensils',
          title: $t('page.customer.meal'),
        },
      },
      {
        name: 'CustomerCall',
        path: '/customer/call',
        component: () => import('#/views/customer/call.vue'),
        meta: {
          icon: 'lucide:phone',
          title: $t('page.customer.call'),
        },
      },
    ],
  },
];

export default routes;

import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:shopping-cart',
      order: 3,
      title: $t('page.sales.title'),
    },
    name: 'Sales',
    path: '/sales',
    children: [
      // {
      //   name: 'SalesIndex',
      //   path: '/sales',
      //   component: () => import('#/views/sales/index.vue'),
      //   meta: {
      //     icon: 'lucide:shopping-cart',
      //     title: $t('page.sales.index'),
      //   },
      // },
      {
        name: 'SalesScript',
        path: '/sales/script',
        component: () => import('#/views/sales/script.vue'),
        meta: {
          icon: 'lucide:message-square',
          title: $t('page.sales.script'),
        },
      },
      {
        name: 'SalesOpportunity',
        path: '/sales/opportunity',
        component: () => import('#/views/sales/opportunity.vue'),
        meta: {
          icon: 'lucide:target',
          title: $t('page.sales.opportunity'),
        },
      },
      {
        name: 'SalesAppointment',
        path: '/sales/appointment',
        component: () => import('#/views/sales/appointment.vue'),
        meta: {
          icon: 'lucide:calendar-check',
          title: $t('page.sales.appointment'),
        },
      },
      {
        name: 'SalesMyCustomer',
        path: '/sales/my-customer',
        component: () => import('#/views/sales/my-customer.vue'),
        meta: {
          icon: 'lucide:user-check',
          title: $t('page.sales.myCustomer'),
        },
      },
      {
        name: 'SalesReport',
        path: '/sales/report',
        component: () => import('#/views/sales/report.vue'),
        meta: {
          icon: 'lucide:bar-chart',
          title: $t('page.sales.report'),
        },
      },
    ],
  },
];

export default routes;

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
    ],
  },
];

export default routes;

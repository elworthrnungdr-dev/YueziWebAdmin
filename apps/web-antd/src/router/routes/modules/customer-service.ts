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
      {
        name: 'CustomerServiceIndex',
        path: '/customer-service',
        component: () => import('#/views/customer-service/index.vue'),
        meta: {
          icon: 'lucide:headphones',
          title: $t('page.customerService.index'),
        },
      },
    ],
  },
];

export default routes;

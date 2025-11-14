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
      {
        name: 'SalesIndex',
        path: '/sales',
        component: () => import('#/views/sales/index.vue'),
        meta: {
          icon: 'lucide:shopping-cart',
          title: $t('page.sales.index'),
        },
      },
    ],
  },
];

export default routes;

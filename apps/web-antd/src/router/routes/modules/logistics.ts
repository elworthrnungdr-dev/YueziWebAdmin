import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:truck',
      order: 8,
      title: $t('page.logistics.title'),
    },
    name: 'Logistics',
    path: '/logistics',
    children: [
      {
        name: 'LogisticsIndex',
        path: '/logistics',
        component: () => import('#/views/logistics/index.vue'),
        meta: {
          icon: 'lucide:map-pin',
          title: $t('page.logistics.index'),
        },
      },
    ],
  },
];

export default routes;

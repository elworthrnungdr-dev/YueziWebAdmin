import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:package',
      order: 7,
      title: $t('page.inventory.title'),
    },
    name: 'Inventory',
    path: '/inventory',
    children: [
      {
        name: 'InventoryIndex',
        path: '/inventory',
        component: () => import('#/views/inventory/index.vue'),
        meta: {
          icon: 'lucide:boxes',
          title: $t('page.inventory.index'),
        },
      },
    ],
  },
];

export default routes;

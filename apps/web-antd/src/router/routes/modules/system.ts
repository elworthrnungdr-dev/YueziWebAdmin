import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:settings',
      order: 11,
      title: $t('page.system.title'),
    },
    name: 'System',
    path: '/system',
    children: [
      {
        name: 'SystemParameter',
        path: '/system/parameter',
        component: () => import('#/views/system/parameter.vue'),
        meta: {
          icon: 'lucide:sliders',
          title: $t('page.system.parameter'),
        },
      },
      {
        name: 'SystemRole',
        path: '/system/role',
        component: () => import('#/views/system/role.vue'),
        meta: {
          icon: 'lucide:user-cog',
          title: $t('page.system.role'),
        },
      },
    ],
  },
];

export default routes;


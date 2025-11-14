import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:shield',
      order: 9,
      title: $t('page.security.title'),
    },
    name: 'Security',
    path: '/security',
    children: [
      {
        name: 'SecurityIndex',
        path: '/index',
        component: () => import('#/views/security/index.vue'),
        meta: {
          icon: 'lucide:lock',
          title: $t('page.security.index'),
        },
      },
    ],
  },
];

export default routes;

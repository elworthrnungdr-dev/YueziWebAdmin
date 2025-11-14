import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:activity',
      order: 6,
      title: $t('page.rehabilitation.title'),
    },
    name: 'Rehabilitation',
    path: '/rehabilitation',
    children: [
      {
        name: 'RehabilitationIndex',
        path: '/rehabilitation',
        component: () => import('#/views/rehabilitation/index.vue'),
        meta: {
          icon: 'lucide:refresh-cw',
          title: $t('page.rehabilitation.index'),
        },
      },
    ],
  },
];

export default routes;

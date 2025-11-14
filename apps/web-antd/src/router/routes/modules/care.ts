import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:heart',
      order: 5,
      title: $t('page.care.title'),
    },
    name: 'Care',
    path: '/care',
    children: [
      {
        name: 'CareIndex',
        path: '/care',
        component: () => import('#/views/care/index.vue'),
        meta: {
          icon: 'lucide:heart',
          title: $t('page.care.index'),
        },
      },
    ],
  },
];

export default routes;

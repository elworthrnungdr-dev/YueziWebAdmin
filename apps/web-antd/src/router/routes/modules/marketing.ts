import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:megaphone',
      order: 2,
      title: $t('page.marketing.title'),
    },
    name: 'Marketing',
    path: '/marketing',
    children: [
      {
        name: 'MarketingIndex',
        path: '/marketing',
        component: () => import('#/views/marketing/index.vue'),
        meta: {
          icon: 'lucide:megaphone',
          title: $t('page.marketing.index'),
        },
      },
    ],
  },
];

export default routes;

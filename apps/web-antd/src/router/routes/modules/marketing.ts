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
      // {
      //   name: 'MarketingIndex',
      //   path: '/marketing',
      //   component: () => import('#/views/marketing/index.vue'),
      //   meta: {
      //     icon: 'lucide:megaphone',
      //     title: $t('page.marketing.index'),
      //   },
      // },
      {
        name: 'MarketingPlatform',
        path: '/marketing/platform',
        component: () => import('#/views/marketing/platform.vue'),
        meta: {
          icon: 'lucide:monitor',
          title: $t('page.marketing.platform'),
        },
      },
      {
        name: 'MarketingMaterial',
        path: '/marketing/material',
        component: () => import('#/views/marketing/material.vue'),
        meta: {
          icon: 'lucide:image',
          title: $t('page.marketing.material'),
        },
      },
      {
        name: 'MarketingAdvertising',
        path: '/marketing/advertising',
        component: () => import('#/views/marketing/advertising.vue'),
        meta: {
          icon: 'lucide:dollar-sign',
          title: $t('page.marketing.advertising'),
        },
      },
      {
        name: 'MarketingLead',
        path: '/marketing/lead',
        component: () => import('#/views/marketing/lead.vue'),
        meta: {
          icon: 'lucide:users',
          title: $t('page.marketing.lead'),
        },
      },
      {
        name: 'MarketingDispatch',
        path: '/marketing/dispatch',
        component: () => import('#/views/marketing/dispatch.vue'),
        meta: {
          icon: 'lucide:send',
          title: $t('page.marketing.dispatch'),
        },
      },
      {
        name: 'MarketingReport',
        path: '/marketing/report',
        component: () => import('#/views/marketing/report.vue'),
        meta: {
          icon: 'lucide:bar-chart',
          title: $t('page.marketing.report'),
        },
      },
    ],
  },
];

export default routes;

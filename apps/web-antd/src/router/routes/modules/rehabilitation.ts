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
      // {
      //   name: 'RehabilitationIndex',
      //   path: '/rehabilitation',
      //   component: () => import('#/views/rehabilitation/index.vue'),
      //   meta: {
      //     icon: 'lucide:refresh-cw',
      //     title: $t('page.rehabilitation.index'),
      //   },
      // },
      {
        name: 'RehabilitationEducationAgreement',
        path: '/rehabilitation/education-agreement',
        component: () => import('#/views/rehabilitation/education-agreement.vue'),
        meta: {
          icon: 'lucide:file-check',
          title: $t('page.rehabilitation.educationAgreement'),
        },
      },
      {
        name: 'RehabilitationProject',
        path: '/rehabilitation/project',
        component: () => import('#/views/rehabilitation/project.vue'),
        meta: {
          icon: 'lucide:list',
          title: $t('page.rehabilitation.rehabilitationProject'),
        },
      },
      {
        name: 'RehabilitationCustomerCardCancel',
        path: '/rehabilitation/customer-card-cancel',
        component: () => import('#/views/rehabilitation/customer-card-cancel.vue'),
        meta: {
          icon: 'lucide:credit-card',
          title: $t('page.rehabilitation.customerCardCancel'),
        },
      },
      {
        name: 'RehabilitationCustomerCardOpen',
        path: '/rehabilitation/customer-card-open',
        component: () => import('#/views/rehabilitation/customer-card-open.vue'),
        meta: {
          icon: 'lucide:credit-card',
          title: $t('page.rehabilitation.customerCardOpen'),
        },
      },
      {
        name: 'RehabilitationReport',
        path: '/rehabilitation/report',
        component: () => import('#/views/rehabilitation/report.vue'),
        meta: {
          icon: 'lucide:bar-chart',
          title: $t('page.rehabilitation.report'),
        },
      },
    ],
  },
];

export default routes;

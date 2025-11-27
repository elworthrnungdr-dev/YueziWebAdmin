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
      // {
      //   name: 'SecurityIndex',
      //   path: '/index',
      //   component: () => import('#/views/security/index.vue'),
      //   meta: {
      //     icon: 'lucide:lock',
      //     title: $t('page.security.index'),
      //   },
      // },
      {
        name: 'SecurityDeviceRegistration',
        path: '/security/device-registration',
        component: () => import('#/views/security/device-registration.vue'),
        meta: {
          icon: 'lucide:monitor',
          title: $t('page.security.deviceRegistration'),
        },
      },
      {
        name: 'SecurityHazardReport',
        path: '/security/hazard-report',
        component: () => import('#/views/security/hazard-report.vue'),
        meta: {
          icon: 'lucide:alert-triangle',
          title: $t('page.security.hazardReport'),
        },
      },
      {
        name: 'SecuritySafetyInspection',
        path: '/security/safety-inspection',
        component: () => import('#/views/security/safety-inspection.vue'),
        meta: {
          icon: 'lucide:search',
          title: $t('page.security.safetyInspection'),
        },
      },
      {
        name: 'SecurityInspectionReminder',
        path: '/security/inspection-reminder',
        component: () => import('#/views/security/inspection-reminder.vue'),
        meta: {
          icon: 'lucide:bell',
          title: $t('page.security.inspectionReminder'),
        },
      },
      {
        name: 'SecurityHealthCertificate',
        path: '/security/health-certificate',
        component: () => import('#/views/security/health-certificate.vue'),
        meta: {
          icon: 'lucide:id-card',
          title: $t('page.security.healthCertificate'),
        },
      },
      {
        name: 'SecuritySecurityPatrol',
        path: '/security/security-patrol',
        component: () => import('#/views/security/security-patrol.vue'),
        meta: {
          icon: 'lucide:map-pin',
          title: $t('page.security.securityPatrol'),
        },
      },
    ],
  },
];

export default routes;

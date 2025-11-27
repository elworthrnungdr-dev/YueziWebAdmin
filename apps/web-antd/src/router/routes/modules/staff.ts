import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:user-circle',
      order: 10,
      title: $t('page.staff.title'),
    },
    name: 'Staff',
    path: '/staff',
    children: [
      {
        name: 'StaffIndex',
        path: '/staff',
        component: () => import('#/views/staff/index.vue'),
        meta: {
          icon: 'lucide:users',
          title: $t('page.staff.index'),
        },
      },
      {
        name: 'StaffDepartment',
        path: '/staff/department',
        component: () => import('#/views/staff/department.vue'),
        meta: {
          icon: 'lucide:building',
          title: $t('page.staff.department'),
        },
      },
    ],
  },
];

export default routes;


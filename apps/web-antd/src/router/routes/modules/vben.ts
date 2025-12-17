import type { RouteRecordRaw } from 'vue-router';

import {
  VBEN_DOC_URL,
  VBEN_ELE_PREVIEW_URL,
  VBEN_GITHUB_URL,
  VBEN_LOGO_URL,
  VBEN_NAIVE_PREVIEW_URL,
  VBEN_TD_PREVIEW_URL,
} from '@vben/constants';
import { SvgTDesignIcon } from '@vben/icons';

import { IFrameView } from '#/layouts';
import { $t } from '#/locales';

// 项目（Vben 官方预览、文档等）相关静态路由，现阶段在菜单中不展示。
// 如果后续需要再次启用，可恢复下方被注释的配置。
// const routes: RouteRecordRaw[] = [
//   {
//     meta: {
//       badgeType: 'dot',
//       icon: VBEN_LOGO_URL,
//       order: 9998,
//       title: $t('demos.vben.title'),
//     },
//     name: 'VbenProject',
//     path: '/vben-admin',
//     children: [
//       { ... },
//     ],
//   },
//   {
//     name: 'VbenAbout',
//     path: '/vben-admin/about',
//     component: () => import('#/views/_core/about/index.vue'),
//     meta: {
//       icon: 'lucide:copyright',
//       title: $t('demos.vben.about'),
//       order: 9999,
//     },
//   },
//   {
//     name: 'Profile',
//     path: '/profile',
//     component: () => import('#/views/_core/profile/index.vue'),
//     meta: {
//       icon: 'lucide:user',
//       hideInMenu: true,
//       title: $t('page.auth.profile'),
//     },
//   },
// ];

// 只保留实际使用的 Profile 路由（不在菜单中显示）
const routes: RouteRecordRaw[] = [
  {
    name: 'Profile',
    path: '/profile',
    component: () => import('#/views/_core/profile/index.vue'),
    meta: {
      icon: 'lucide:user',
      hideInMenu: true,
      title: $t('page.auth.profile'),
    },
  },
];

export default routes;

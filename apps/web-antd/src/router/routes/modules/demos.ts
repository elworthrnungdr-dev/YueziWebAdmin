import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

// 演示栏目路由（已暂时禁用）：
// 如果后续需要再次启用演示菜单，可以恢复下面注释的配置。
// const routes: RouteRecordRaw[] = [
//   {
//     meta: {
//       icon: 'ic:baseline-view-in-ar',
//       keepAlive: true,
//       order: 1000,
//       title: $t('demos.title'),
//     },
//     name: 'Demos',
//     path: '/demos',
//     children: [
//       {
//         meta: {
//           title: $t('demos.antd'),
//         },
//         name: 'AntDesignDemos',
//         path: '/demos/ant-design',
//         component: () => import('#/views/demos/antd/index.vue'),
//       },
//     ],
//   },
// ];

const routes: RouteRecordRaw[] = [];

export default routes;

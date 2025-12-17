import type {
  ComponentRecordType,
  GenerateMenuAndRoutesOptions,
} from '@vben/types';

import { generateAccessible } from '@vben/access';
import { preferences } from '@vben/preferences';

import { message } from 'ant-design-vue';

import { getAllMenusApi } from '#/api';
import { BasicLayout, IFrameView } from '#/layouts';
import { $t } from '#/locales';

const forbiddenComponent = () => import('#/views/_core/fallback/forbidden.vue');

async function generateAccess(options: GenerateMenuAndRoutesOptions) {
  const pageMap: ComponentRecordType = import.meta.glob('../views/**/*.vue');

  const layoutMap: ComponentRecordType = {
    BasicLayout,
    Layout: BasicLayout, // 后端返回的 Layout 映射到 BasicLayout
    IFrameView,
  };

  // 使用 mixed 模式，合并前端静态路由（包括 dashboard）和后端菜单路由
  // 这样确保 dashboard 菜单始终显示，不依赖后端菜单
  return await generateAccessible('mixed', {
    ...options,
    fetchMenuListAsync: async () => {
      message.loading({
        content: `${$t('common.loadingMenu')}...`,
        duration: 1.5,
      });
      try {
        return await getAllMenusApi();
      } catch (error: any) {
        // 菜单接口超时或异常时，不阻塞路由启动，返回空菜单并给出提示
        const errMsg =
          error?.response?.data?.message ||
          error?.message ||
          $t('common.requestError');
        message.error(errMsg);
        return [];
      }
    },
    // 可以指定没有权限跳转403页面
    forbiddenComponent,
    // 如果 route.meta.menuVisibleWithForbidden = true
    layoutMap,
    pageMap,
  });
}

export { generateAccess };

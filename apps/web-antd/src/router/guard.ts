import type { Router } from 'vue-router';

import { LOGIN_PATH } from '@vben/constants';
import { preferences } from '@vben/preferences';
import { useAccessStore, useUserStore } from '@vben/stores';
import { startProgress, stopProgress } from '@vben/utils';

import { accessRoutes, coreRouteNames } from '#/router/routes';
import { useAuthStore } from '#/store';

import { generateAccess } from './access';

/**
 * 通用守卫配置
 * @param router
 */
function setupCommonGuard(router: Router) {
  // 记录已经加载的页面
  const loadedPaths = new Set<string>();

  router.beforeEach((to) => {
    to.meta.loaded = loadedPaths.has(to.path);

    // 页面加载进度条
    if (!to.meta.loaded && preferences.transition.progress) {
      startProgress();
    }
    return true;
  });

  router.afterEach((to) => {
    // 记录页面是否加载,如果已经加载，后续的页面切换动画等效果不在重复执行

    loadedPaths.add(to.path);

    // 关闭页面加载进度条
    if (preferences.transition.progress) {
      stopProgress();
    }
  });
}

/**
 * 权限访问守卫配置
 * @param router
 */
function setupAccessGuard(router: Router) {
  router.beforeEach(async (to, from) => {
    const accessStore = useAccessStore();
    const userStore = useUserStore();
    const authStore = useAuthStore();

    // 基本路由，这些路由不需要进入权限拦截
    if (coreRouteNames.includes(to.name as string)) {
      if (to.path === LOGIN_PATH && accessStore.accessToken) {
        return decodeURIComponent(
          (to.query?.redirect as string) ||
            userStore.userInfo?.homePath ||
            preferences.app.defaultHomePath,
        );
      }
      return true;
    }

    // accessToken 检查
    if (!accessStore.accessToken) {
      // 明确声明忽略权限访问权限，则可以访问
      if (to.meta.ignoreAccess) {
        return true;
      }

      // 没有访问权限，跳转登录页面
      if (to.fullPath !== LOGIN_PATH) {
        return {
          path: LOGIN_PATH,
          // 如不需要，直接删除 query
          query:
            to.fullPath === preferences.app.defaultHomePath
              ? {}
              : { redirect: encodeURIComponent(to.fullPath) },
          // 携带当前跳转的页面，登录后重新跳转该页面
          replace: true,
        };
      }
      return to;
    }

    // 是否已经生成过动态路由
    if (accessStore.isAccessChecked) {
      return true;
    }

    // 如果是首次访问（从登录页跳转），先注册静态路由，然后异步加载菜单
    const isFirstVisit = from.path === LOGIN_PATH;
    
    // 检查目标路由是否在静态路由列表中（accessRoutes 中的路由）
    const isStaticRoute = accessRoutes.some((route) => {
      // 检查路由路径是否匹配
      if (route.path === to.path) return true;
      // 检查子路由
      if (route.children) {
        return route.children.some((child) => child.path === to.path);
      }
      return false;
    });

    if (isFirstVisit && isStaticRoute) {
      // 先同步注册静态路由，确保路由存在
      const userInfo = userStore.userInfo || (await authStore.fetchUserInfo());
      
      // 先使用 frontend 模式快速注册静态路由，不等待后端菜单
      // 使用 generateAccessible 确保路由注册逻辑完全一致
      const { generateAccessible } = await import('@vben/access');
      
      try {
        // 使用 frontend 模式注册静态路由
        await generateAccessible('frontend', {
          roles: (userInfo?.roles || []) as string[],
          router,
          routes: accessRoutes,
          forbiddenComponent: () => import('#/views/_core/fallback/forbidden.vue'),
        });
        
        // 等待路由注册完成，使用 nextTick 确保 Vue Router 已经更新路由表
        const { nextTick } = await import('vue');
        await nextTick();
        
        // 验证路由是否已经注册
        const root = router.getRoutes().find((item) => item.path === '/');
        const routeExists = root?.children?.some(
          (route) => route.name === 'Dashboard' || route.path === to.path || 
          route.children?.some((child) => child.path === to.path),
        );
        
        if (!routeExists) {
          // 如果路由还没注册，再等待一下
          await nextTick();
        }
      } catch (error) {
        console.error('Failed to register static routes:', error);
      }

      // 标记为已检查，避免重复注册
      accessStore.setIsAccessChecked(true);

      // 异步加载后端菜单，加载完成后更新路由和菜单
      // 使用 mixed 模式，会自动合并前端静态路由（包括 dashboard）和后端菜单路由
      generateAccess({
        roles: (userInfo?.roles || []) as string[],
        router,
        routes: accessRoutes,
      })
        .then(({ accessibleMenus, accessibleRoutes }) => {
          // 保存菜单信息和路由信息
          // mixed 模式会自动合并前端路由（包括 dashboard）和后端路由
          // dashboard 菜单会始终显示在菜单中
          accessStore.setAccessMenus(accessibleMenus);
          accessStore.setAccessRoutes(accessibleRoutes);
        })
        .catch((error) => {
          console.error('Failed to load menus:', error);
          // 即使菜单加载失败，静态路由仍然可用
        });

      // 路由注册完成后，重新解析目标路由，确保路由存在
      const resolved = router.resolve(to.path);
      if (resolved.name || resolved.matched.length > 0) {
        return resolved;
      }
      
      // 如果路由解析失败，返回 true 让 Vue Router 继续处理
      return true;
    }

    // 生成路由表
    // 当前登录用户拥有的角色标识列表
    const userInfo = userStore.userInfo || (await authStore.fetchUserInfo());
    const userRoles = (userInfo?.roles ?? []) as string[];

    // 生成菜单和路由
    const { accessibleMenus, accessibleRoutes } = await generateAccess({
      roles: userRoles,
      router,
      // 则会在菜单中显示，但是访问会被重定向到403
      routes: accessRoutes,
    });

    // 保存菜单信息和路由信息
    accessStore.setAccessMenus(accessibleMenus);
    accessStore.setAccessRoutes(accessibleRoutes);
    accessStore.setIsAccessChecked(true);
    const redirectPath = (from.query.redirect ??
      (to.path === preferences.app.defaultHomePath
        ? userInfo?.homePath || preferences.app.defaultHomePath
        : to.fullPath)) as string;

    return {
      ...router.resolve(decodeURIComponent(redirectPath)),
      replace: true,
    };
  });
}

/**
 * 项目守卫配置
 * @param router
 */
function createRouterGuard(router: Router) {
  /** 通用 */
  setupCommonGuard(router);
  /** 权限访问 */
  setupAccessGuard(router);
}

export { createRouterGuard };

import type { RouteRecordStringComponent } from '@vben/types';

import { requestClient } from '#/api/request';

/**
 * 后端菜单数据结构
 */
export interface BackendMenu {
  id: string;
  parentId: string;
  menuName: string;
  path: string | null;
  component: string | null;
  permission: string;
  menuType: 'M' | 'C' | 'F'; // M=目录, C=菜单, F=按钮
  icon: string | null;
  sort: number;
  status: number;
  isExternal: boolean;
  isCache: boolean;
  isVisible: boolean;
  remark: string | null;
  children?: BackendMenu[];
  // 转换后的字段（如果后端已经转换）
  key?: string;
  name?: string;
  hidden?: boolean;
  hideChildrenInMenu?: boolean;
  show?: boolean;
  target?: string;
  meta?: {
    title?: string;
    icon?: string | null;
    target?: string;
    permission?: string;
  };
}

/**
 * 菜单接口响应
 */
export interface MenuResponse {
  success: boolean;
  message: string;
  data: BackendMenu[];
  code?: number;
  timestamp?: string;
}

/**
 * 将组件名转换为组件路径
 * 根据后端返回的 component 和 path 字段，转换为前端需要的组件路径格式
 */
function normalizeComponentPath(
  component: string | null,
  path: string | null,
): string | undefined {
  if (!component) {
    return undefined;
  }

  // Layout 组件映射到 BasicLayout（在 layoutMap 中处理）
  if (component === 'Layout' || component === 'BasicLayout') {
    return 'BasicLayout';
  }

  // 如果 component 已经是路径格式（以 / 开头），直接返回
  if (component.startsWith('/')) {
    return component;
  }

  // 优先使用 path 作为组件路径（如果 path 存在且不是 Layout）
  // 例如：path: '/customer/profile' -> component: '/customer/profile'
  if (path && path !== '/Layout' && path.startsWith('/')) {
    return path;
  }

  // 如果 component 是驼峰命名（如 customerProfile），转换为路径格式
  // 例如：customerProfile -> /customer/profile
  // 将驼峰命名转换为 kebab-case，并添加斜杠分隔
  const kebabCase = component
    .replace(/([a-z0-9])([A-Z])/g, '$1/$2')
    .toLowerCase();
  return `/${kebabCase}`;
}

/**
 * 生成唯一的路由名称
 * 如果路径存在，使用路径生成唯一名称；否则使用菜单名称
 */
function generateUniqueRouteName(
  menuName: string,
  path: string,
  parentPath?: string,
): string {
  // 如果路径存在，使用路径生成唯一名称（移除开头的 /，替换 / 为 -）
  if (path && path !== '/Layout') {
    const normalizedPath = path.replace(/^\//, '').replace(/\//g, '-');
    return normalizedPath || menuName;
  }
  
  // 如果有父路径，组合生成唯一名称
  if (parentPath) {
    const parentName = parentPath.replace(/^\//, '').replace(/\//g, '-');
    return `${parentName}-${menuName}`;
  }
  
  return menuName;
}

/**
 * 将后端菜单数据转换为前端路由格式
 */
function transformMenuToRoute(
  menu: BackendMenu,
  parentPath?: string,
): RouteRecordStringComponent | null {
  // 只处理目录(M)和菜单(C)，按钮(F)不生成路由
  if (menu.menuType === 'F') {
    return null;
  }

  // 如果菜单不可见，跳过
  if (!menu.isVisible || menu.hidden) {
    return null;
  }

  // 使用转换后的字段（如果存在）或原始字段
  const menuName = menu.name || menu.menuName;
  const menuPath = menu.path || '';
  // 生成唯一的路由名称
  const uniqueRouteName = generateUniqueRouteName(menuName, menuPath, parentPath);
  // 转换组件路径
  const menuComponent = normalizeComponentPath(menu.component, menu.path);
  const menuIcon = menu.meta?.icon || menu.icon || undefined;
  const menuTitle = menu.meta?.title || menuName;

  // 构建父级路径数组
  const parents: string[] = parentPath ? [parentPath] : [];

  const route: RouteRecordStringComponent = {
    name: uniqueRouteName,
    path: menuPath,
    component: menuComponent,
    // 设置父级路径，用于菜单手风琴模式
    parent: parentPath,
    parents: parents,
    meta: {
      title: menuTitle,
      icon: menuIcon,
      order: menu.sort,
      hideInMenu: !menu.isVisible || menu.hidden || false,
      hideChildrenInMenu: menu.hideChildrenInMenu || false,
      permission: menu.meta?.permission || menu.permission,
      keepAlive: menu.isCache,
      // 如果是外链
      link: menu.isExternal && menuPath ? menuPath : undefined,
      openInNewWindow: menu.isExternal,
    },
    children: [],
  };

  // 递归处理子菜单，传递当前路径作为父路径
  if (menu.children && menu.children.length > 0) {
    route.children = menu.children
      .map((child) => {
        const childRoute = transformMenuToRoute(child, menuPath || parentPath);
        // 为子菜单设置正确的父级路径数组
        if (childRoute) {
          childRoute.parent = menuPath || parentPath;
          childRoute.parents = menuPath 
            ? [...parents, menuPath]
            : parents;
        }
        return childRoute;
      })
      .filter((child): child is RouteRecordStringComponent => child !== null);
  }

  return route;
}

/**
 * 获取用户所有菜单
 */
export async function getAllMenusApi() {
  // 调用后端菜单接口
  // requestClient 已经配置了响应拦截器，会根据 success 字段判断成功，并返回 data 字段
  const menuList = await requestClient.get<BackendMenu[]>('/api/Menu/userlist');
  
  // 确保 menuList 是数组
  const menus = Array.isArray(menuList) ? menuList : [];
  
  // 转换菜单数据为路由格式
  const routes = menus
    .map((menu: BackendMenu) => transformMenuToRoute(menu))
    .filter((route): route is RouteRecordStringComponent => route !== null);
  
  return routes;
}

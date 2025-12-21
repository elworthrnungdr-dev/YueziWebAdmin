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

// 说明：原先这里有一个 getAutoIconByName，根据名称自动匹配图标。
// 但现在图标完全由后端控制，不再在前端做自动匹配，因此该能力已移除。

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
  // 路径处理规则：
  // - 目录(M)：后端有时会给 path = '/Layout' 或 空，这种对所有父栏目是一样的，
  //   会导致所有父栏目 path 相同，从而共享展开状态；这里强制改成基于 id 的唯一路径
  // - 菜单(C)：优先使用后端真实 path；如果为空，再退回到基于 id 的唯一路径
  let menuPath = menu.path || '';
  if (menu.menuType === 'M') {
    if (!menuPath || menuPath === '/Layout') {
      menuPath = `/__menu-${menu.id}`;
    }
  } else {
    if (!menuPath) {
      menuPath = `/__menu-${menu.id}`;
    }
  }
  // 生成唯一的路由名称
  const uniqueRouteName = generateUniqueRouteName(menuName, menuPath, parentPath);
  // 转换组件路径
  const menuComponent = normalizeComponentPath(menu.component, menu.path);
  const menuTitle = menu.meta?.title || menuName;
  // 图标只使用后端提供的字段，不再根据名称自动匹配
  const menuIcon = menu.meta?.icon ?? menu.icon ?? undefined;

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

/**
 * 获取菜单列表（用于权限配置）
 * 接口：GET /api/Menu/list
 * 返回 menuType 为 M、C 和 F 的菜单，只包含 id 和 menuName
 * F 类型的菜单（按钮权限）会显示在对应的子菜单下面
 */
export interface MenuListItem {
  id: string;
  menuName: string;
  parentId?: string;
  menuType?: 'M' | 'C' | 'F';
  children?: MenuListItem[];
}

export async function getMenuListApi(): Promise<MenuListItem[]> {
  const menuList = await requestClient.get<BackendMenu[] | MenuListItem[]>('/api/Menu/list');
  const menus = Array.isArray(menuList) ? menuList : [];
  
  // 检查是否已经是树形结构（有 children 字段）
  const isTreeStructure = menus.some((menu: any) => Array.isArray(menu.children));
  
  if (isTreeStructure) {
    // 如果已经是树形结构，直接过滤并转换（包含 M、C、F 类型）
    const filterTree = (items: any[]): MenuListItem[] => {
      return items
        .filter((menu) => (menu.menuType === 'M' || menu.menuType === 'C' || menu.menuType === 'F'))
        .map((menu) => ({
          id: String(menu.id), // 确保ID是字符串类型
          menuName: menu.menuName,
          parentId: menu.parentId ? String(menu.parentId) : undefined,
          menuType: menu.menuType,
          children: menu.children && menu.children.length > 0 ? filterTree(menu.children) : undefined,
        }))
        .filter((menu) => menu.menuName); // 确保有 menuName
    };
    return filterTree(menus);
  }
  
  // 如果是扁平结构，需要构建树形结构
  // 先处理 M 和 C 类型，构建基础树结构
  const mcMenus = menus
    .filter((menu: any) => (menu.menuType === 'M' || menu.menuType === 'C') && menu.menuName && menu.id)
    .map((menu: any) => ({
      id: String(menu.id), // 确保ID是字符串类型
      menuName: menu.menuName,
      parentId: menu.parentId && menu.parentId.trim() !== '' ? String(menu.parentId) : null,
      menuType: menu.menuType,
    }));
  
  // 获取 F 类型的菜单（按钮权限）
  const fMenus = menus
    .filter((menu: any) => menu.menuType === 'F' && menu.menuName && menu.id)
    .map((menu: any) => ({
      id: String(menu.id), // 确保ID是字符串类型
      menuName: menu.menuName,
      parentId: menu.parentId && menu.parentId.trim() !== '' ? String(menu.parentId) : null,
      menuType: menu.menuType,
    }));
  
  // 构建树形结构（先构建 M 和 C 的基础树）
  const menuMap = new Map<string, MenuListItem>();
  const rootMenus: MenuListItem[] = [];
  
  // 第一遍：创建所有 M 和 C 节点
  mcMenus.forEach((menu) => {
    menuMap.set(menu.id, { ...menu, children: [] });
  });
  
  // 第二遍：构建 M 和 C 的父子关系
  mcMenus.forEach((menu) => {
    const node = menuMap.get(menu.id)!;
    // parentId 存在且不为空，且在 menuMap 中存在
    if (menu.parentId && menuMap.has(menu.parentId)) {
      const parent = menuMap.get(menu.parentId)!;
      if (!parent.children) {
        parent.children = [];
      }
      parent.children.push(node);
    } else {
      // 没有父节点或父节点不存在，作为根节点
      rootMenus.push(node);
    }
  });
  
  // 第三遍：将 F 类型的菜单添加到对应的父菜单下
  fMenus.forEach((fMenu) => {
    const fMenuItem: MenuListItem = { ...fMenu, children: [] };
    // 如果 F 菜单有 parentId，且 parentId 在 menuMap 中存在，则添加到父菜单下
    if (fMenu.parentId && menuMap.has(fMenu.parentId)) {
      const parent = menuMap.get(fMenu.parentId)!;
      if (!parent.children) {
        parent.children = [];
      }
      parent.children.push(fMenuItem);
    } else {
      // 如果 F 菜单没有父节点或父节点不在 M/C 树中，作为根节点（这种情况应该很少）
      rootMenus.push(fMenuItem);
    }
  });
  
  // 清理空的 children 数组
  const cleanEmptyChildren = (items: MenuListItem[]): MenuListItem[] => {
    return items.map((item) => {
      const cleaned: MenuListItem = { ...item };
      if (cleaned.children && cleaned.children.length > 0) {
        cleaned.children = cleanEmptyChildren(cleaned.children);
      } else {
        delete cleaned.children;
      }
      return cleaned;
    });
  };
  
  return cleanEmptyChildren(rootMenus);
}

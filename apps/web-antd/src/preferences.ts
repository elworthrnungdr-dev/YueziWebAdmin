import { defineOverridesPreferences } from '@vben/preferences';

/**
 * @description 项目配置文件
 * 只需要覆盖项目中的一部分配置，不需要的配置不用覆盖，会自动使用默认配置
 * !!! 更改配置后请清空缓存，否则可能不生效
 */
export const overridesPreferences = defineOverridesPreferences({
  // overrides
  app: {
    name: import.meta.env.VITE_APP_TITLE,
    // 设置为后端权限模式，从后端接口获取菜单
    accessMode: 'backend',
    // 启用刷新token功能
    enableRefreshToken: true,
    // 使用空字符串避免加载外部资源，消除浏览器跟踪防护警告
    defaultAvatar: '',
  },
  logo: {
    // 禁用 logo 或使用空字符串，避免加载外部资源
    enable: false,
    source: '',
  },
});

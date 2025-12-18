import { defineOverridesPreferences } from '@vben/preferences';

/**
 * @description 项目配置文件
 * 只需要覆盖项目中的一部分配置，不需要的配置不用覆盖，会自动使用默认配置
 * !!! 更改配置后请清空缓存，否则可能不生效
 */
export const overridesPreferences = defineOverridesPreferences({
  // overrides
  app: {
    // 固定品牌名（避免因本地偏好缓存/缺少 env 导致显示为 Vben Admin）
    name: '润康月子会所',
    // 设置为后端权限模式，从后端接口获取菜单
    accessMode: 'backend',
    // 启用刷新token功能
    enableRefreshToken: true,
    // 使用空字符串避免加载外部资源，消除浏览器跟踪防护警告
    defaultAvatar: '',
  },
  logo: {
    // 启用 logo，使用本地资源避免外部加载
    enable: true,
    source: '/favicon.ico',
  },
});

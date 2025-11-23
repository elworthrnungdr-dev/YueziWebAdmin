import type { UserInfo } from '@vben/types';

/**
 * TODO: 后端 /api/user/info 尚未实现，临时返回固定的用户信息，
 * 待接口准备好后，可恢复为真实接口请求。
 */
const mockUserInfo: UserInfo = {
  avatar:
    'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
  realName: '管理员',
  roles: ['admin'],
  userId: '1',
  username: 'admin',
  desc: 'Temporary mock user until /api/user/info is ready',
  //homePath: '/dashboard/analytics',
  token: '',
};

export async function getUserInfoApi(): Promise<UserInfo> {
  return Promise.resolve(mockUserInfo);
}

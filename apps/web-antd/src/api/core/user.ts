import type { UserInfo } from '@vben/types';

import { requestClient } from '#/api/request';

/**
 * 获取用户信息
 * @deprecated 已废弃，登录接口已返回用户信息，不再需要此接口
 */
// export async function getUserInfoApi() {
//   return requestClient.get<UserInfo>('/user/info');
// }

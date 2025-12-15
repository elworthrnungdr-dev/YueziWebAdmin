/**
 * 该文件可自行根据业务逻辑进行调整
 */
import type { RequestClientOptions } from '@vben/request';

import { preferences } from '@vben/preferences';
import {
  authenticateResponseInterceptor,
  defaultResponseInterceptor,
  errorMessageResponseInterceptor,
  RequestClient,
} from '@vben/request';
import { useAccessStore } from '@vben/stores';

import { message } from 'ant-design-vue';

import { useAuthStore } from '#/store';

// 固定使用真实接口地址，无论开发环境还是正式环境
const apiURL = 'http://23.141.172.216:5201';

function createRequestClient(baseURL: string, options?: RequestClientOptions) {
  const client = new RequestClient({
    ...options,
    baseURL,
  });

  /**
   * 重新认证逻辑
   */
  async function doReAuthenticate() {
    console.warn('Access token or refresh token is invalid or expired. ');
    const accessStore = useAccessStore();
    const authStore = useAuthStore();
    accessStore.setAccessToken(null);
    if (
      preferences.app.loginExpiredMode === 'modal' &&
      accessStore.isAccessChecked
    ) {
      accessStore.setLoginExpired(true);
    } else {
      await authStore.logout();
    }
  }

  /**
   * 刷新token逻辑（暂时停用，仅为满足类型要求，不会真正调用刷新接口）
   */
  async function doRefreshToken() {
    // 目前不启用刷新 Token，直接抛出错误，让认证逻辑走重新登录流程
    throw new Error('Refresh token is disabled');
  }

  function formatToken(token: null | string) {
    // 根据API要求，Authorization头直接使用token值，不使用Bearer前缀
    return token || null;
  }

  // 请求头处理
  client.addRequestInterceptor({
    fulfilled: async (config) => {
      const accessStore = useAccessStore();

      config.headers.Authorization = formatToken(accessStore.accessToken);
      config.headers['Accept-Language'] = preferences.app.locale;
      return config;
    },
  });

  // 处理返回的响应数据格式
  // 根据API返回格式，使用success字段判断是否成功
  client.addResponseInterceptor(
    defaultResponseInterceptor({
      codeField: 'success',
      dataField: 'data',
      successCode: (code: any) => code === true,
    }),
  );

  // token过期的处理
  client.addResponseInterceptor(
    authenticateResponseInterceptor({
      client,
      doReAuthenticate,
      doRefreshToken,
      enableRefreshToken: preferences.app.enableRefreshToken,
      formatToken,
    }),
  );

  // 通用的错误处理,如果没有进入上面的错误处理逻辑，就会进入这里
  client.addResponseInterceptor(
    errorMessageResponseInterceptor((msg: string, error) => {
      // 这里可以根据业务进行定制,你可以拿到 error 内的信息进行定制化处理，根据不同的 code 做不同的提示，而不是直接使用 message.error 提示 msg
      // 当前后端返回格式：{ success: false, message: string, code: number, ... }
      const responseData = error?.response?.data ?? {};
      const errorMessage = responseData?.error ?? responseData?.message ?? '';
      const businessCode = responseData?.code;

      // 如果后端用业务码 401 表示“未登录或登录已过期”，这里统一做登出并回到登录页
      if (businessCode === 401) {
        const accessStore = useAccessStore();
        const authStore = useAuthStore();

        accessStore.setAccessToken(null);
        accessStore.setRefreshToken(null);

        // 提示后跳转登录页
        message.error(errorMessage || '登录已过期，请重新登录');
        // 注意：这里不能直接 await，否则可能影响拦截器链路，调用后由路由守卫处理跳转
        authStore.logout().catch(() => {});
        return Promise.reject(error);
      }

      // 其它错误，保持原来的提示逻辑
      message.error(errorMessage || msg);
      return Promise.reject(error);
    }) as any,
  );

  return client;
}

export const requestClient = createRequestClient(apiURL, {
  responseReturn: 'data',
});

export const baseRequestClient = new RequestClient({ baseURL: apiURL });

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

import { refreshTokenApi } from './core';
import type { AuthApi } from './core/auth';

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
   * 刷新token逻辑
   */
  async function doRefreshToken() {
    const accessStore = useAccessStore();
    const refreshToken = accessStore.refreshToken;
    
    if (!refreshToken) {
      throw new Error('Refresh token is missing');
    }
    
    try {
      const resp = await refreshTokenApi(refreshToken);
      // baseRequestClient返回的是axios响应对象，需要访问response.data
      // 由于baseRequestClient没有响应拦截器，resp.data就是完整的响应对象
      const responseData = (resp.data as unknown) as AuthApi.RefreshTokenResponse;
      
      // 检查刷新是否成功
      if (!responseData.success) {
        throw new Error(responseData.message || '刷新token失败');
      }
      
      const { token: newToken, refreshToken: newRefreshToken } = responseData.data;
      
      // 保存新的token和refreshToken
      accessStore.setAccessToken(newToken);
      accessStore.setRefreshToken(newRefreshToken);
      
      return newToken;
    } catch (error) {
      // 刷新token失败，清除token并提示重新登录
      accessStore.setAccessToken(null);
      accessStore.setRefreshToken(null);
      message.error('登录已过期，请重新登录');
      throw error;
    }
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
      // 当前mock接口返回的错误字段是 error 或者 message
      const responseData = error?.response?.data ?? {};
      const errorMessage = responseData?.error ?? responseData?.message ?? '';
      // 如果没有错误信息，则会根据状态码进行提示
      message.error(errorMessage || msg);
    }),
  );

  return client;
}

export const requestClient = createRequestClient(apiURL, {
  responseReturn: 'data',
});

export const baseRequestClient = new RequestClient({ baseURL: apiURL });

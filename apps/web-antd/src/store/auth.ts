import type { Recordable, UserInfo } from '@vben/types';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { LOGIN_PATH } from '@vben/constants';
import { preferences } from '@vben/preferences';
import { resetAllStores, useAccessStore, useUserStore } from '@vben/stores';

import { notification } from 'ant-design-vue';
import { defineStore } from 'pinia';

// import { getUserInfoApi, loginApi, logoutApi } from '#/api';
import { loginApi, logoutApi } from '#/api';
import { $t } from '#/locales';

export const useAuthStore = defineStore('auth', () => {
  const accessStore = useAccessStore();
  const userStore = useUserStore();
  const router = useRouter();

  const loginLoading = ref(false);

  /**
   * 异步处理登录操作
   * Asynchronously handle the login process
   * @param params 登录表单数据
   */
  async function authLogin(
    params: Recordable<any>,
    onSuccess?: () => Promise<void> | void,
  ) {
    // 异步处理用户登录操作并获取 accessToken
    let userInfo: null | UserInfo = null;
    try {
      loginLoading.value = true;
      // 确保参数格式正确：branchId, userName, password
      const loginParams = {
        branchId: params.branchId,
        userName: params.username || params.userName, // 兼容username和userName
        password: params.password,
      };
      
      // 验证必填参数
      if (!loginParams.branchId) {
        notification.error({
          message: '登录失败',
          description: '请输入门店编号',
          duration: 3,
        });
        return {
          userInfo: null,
        };
      }
      
      if (!loginParams.userName) {
        notification.error({
          message: '登录失败',
          description: '请输入用户名',
          duration: 3,
        });
        return {
          userInfo: null,
        };
      }
      
      if (!loginParams.password) {
        notification.error({
          message: '登录失败',
          description: '请输入密码',
          duration: 3,
        });
        return {
          userInfo: null,
        };
      }
      
      const response = await loginApi(loginParams);

      // baseRequestClient返回的是axios响应对象，需要访问response.data
      // response.data的类型是LoginResponse
      const responseData = (response.data as unknown) as {
        success: boolean;
        message: string;
        data: {
          token: string;
          refreshToken: string;
          user: any;
        };
      };

      // 检查登录是否成功
      if (!responseData.success) {
        // 如果登录失败，显示错误信息
        if (responseData.message) {
          notification.error({
            message: '登录失败',
            description: responseData.message,
            duration: 3,
          });
        }
        return {
          userInfo: null,
        };
      }

      // 保存token和refreshToken
      const { token, refreshToken, user } = responseData.data;
      accessStore.setAccessToken(token);
      accessStore.setRefreshToken(refreshToken);

      // 将返回的用户信息转换为UserInfo格式
      const mappedUserInfo: UserInfo = {
        userId: user.id,
        username: user.employeeNumber,
        realName: user.employeesName,
        avatar: user.avatarUrl || '',
        desc: user.position || '',
        roles: user.roles || [],
        token: token,
        homePath: preferences.app.defaultHomePath, // 使用默认首页路径
      };

      userInfo = mappedUserInfo;
      userStore.setUserInfo(mappedUserInfo);

        if (accessStore.loginExpired) {
          accessStore.setLoginExpired(false);
      } else {
        if (onSuccess) {
          await onSuccess?.();
        } else {
          // 登录成功后，先跳转到默认首页（通常是 /dashboard/workspace）
          // 路由守卫会异步加载菜单，不阻塞页面显示
          const defaultPath = mappedUserInfo.homePath || preferences.app.defaultHomePath;
          await router.push(defaultPath);
        }
        }

      if (mappedUserInfo?.realName) {
          notification.success({
          description: `${$t('authentication.loginSuccessDesc')}:${mappedUserInfo?.realName}`,
            duration: 3,
            message: $t('authentication.loginSuccess'),
          });
        }
    } catch (error: any) {
      // 处理登录异常
      const errorMessage = error?.response?.data?.message || error?.message || '登录失败，请重试';
      notification.error({
        message: '登录失败',
        description: errorMessage,
        duration: 3,
      });
    } finally {
      loginLoading.value = false;
    }

    return {
      userInfo,
    };
  }

  async function logout(redirect: boolean = true) {
    try {
      await logoutApi();
    } catch {
      // 不做任何处理
    }
    resetAllStores();
    accessStore.setLoginExpired(false);

    // 回登录页带上当前路由地址
    await router.replace({
      path: LOGIN_PATH,
      query: redirect
        ? {
            redirect: encodeURIComponent(router.currentRoute.value.fullPath),
          }
        : {},
    });
  }

  async function fetchUserInfo() {
    // 登录接口已返回用户信息，直接使用 userStore 中的用户信息
    // 如果 userStore 中没有用户信息，返回 null
    let userInfo: null | UserInfo = null;
    // userInfo = await getUserInfoApi();
    userInfo = userStore.userInfo;
    // userStore.setUserInfo(userInfo);
    return userInfo;
  }

  function $reset() {
    loginLoading.value = false;
  }

  return {
    $reset,
    authLogin,
    fetchUserInfo,
    loginLoading,
    logout,
  };
});

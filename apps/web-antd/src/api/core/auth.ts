import { baseRequestClient } from '#/api/request';

export namespace AuthApi {
  /** 登录接口参数 */
  export interface LoginParams {
    branchId: string;
    userName: string;
    password: string;
  }

  /** 登录接口返回值 */
  export interface LoginResult {
    token: string;
    refreshToken: string;
    user: {
      id: string;
      employeesName: string;
      employeeNumber: string;
      tDepartmentId: string | null;
      branchId: string;
      branchName: string;
      gender: string | null;
      age: number | null;
      birthDate: string | null;
      nativePlace: string | null;
      address: string | null;
      phoneNumber: string;
      email: string | null;
      wechat: string | null;
      workStatus: string | null;
      position: string | null;
      hireDate: string | null;
      resignationDate: string | null;
      accountStatus: string | null;
      lastLoginTime: string;
      emergencyContact: string | null;
      emergencyContactPhone: string | null;
      emergencyContactRelation: string | null;
      avatarUrl: string | null;
      remark: string | null;
      isAdmin: boolean;
      roles: any[];
      createTime: string;
    };
  }

  /** 登录接口响应 */
  export interface LoginResponse {
    success: boolean;
    message: string;
    data: LoginResult;
    code: number;
    timestamp: string;
  }

  /** 刷新token接口返回值 */
  export interface RefreshTokenResult {
    token: string;
    refreshToken: string;
  }

  /** 刷新token接口响应 */
  export interface RefreshTokenResponse {
    success: boolean;
    message: string;
    data: RefreshTokenResult;
    code: number;
    timestamp: string;
  }

  /** 修改密码接口参数 */
  export interface ChangePasswordParams {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }

  /** 修改密码接口响应 */
  export interface ChangePasswordResponse {
    success: boolean;
    message: string;
    data?: any;
    code: number;
    timestamp: string;
  }
}

/**
 * 登录
 */
export async function loginApi(data: AuthApi.LoginParams) {
  // 登录接口需要特殊的Authorization头
  return baseRequestClient.post<AuthApi.LoginResponse>('/api/Account/login', data, {
    headers: {
      'Authorization': '_2y-2EWGFgtPwZE3IQAg7ZBdW26K1HcQ58-DY_WdbWU',
      'Content-Type': 'application/json',
    },
  });
}

/**
 * 退出登录
 */
export async function logoutApi() {
  return baseRequestClient.post('/api/Account/logout', {
    withCredentials: true,
  });
}

/**
 * 修改密码
 */
export async function changePasswordApi(data: AuthApi.ChangePasswordParams) {
  return baseRequestClient.post<AuthApi.ChangePasswordResponse>(
    '/api/Account/change-password',
    data,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
}


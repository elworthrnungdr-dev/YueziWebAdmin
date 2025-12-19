import { requestClient } from '#/api/request';

export interface RoleListParams {
  RoleName?: string;
  Status?: string; // 0全部 1正常 2锁定
  PageIndex?: number;
  PageSize?: number;
  OrderBy?: string;
  IsAsc?: boolean;
}

export interface BackendRoleItem {
  id: string;
  roleName: string;
  status: number;
  remark?: string;
  sort?: number;
  createTime?: string;
  [key: string]: any;
}

export interface BackendRolePage {
  pageNo: number;
  pageSize: number;
  totalCount: number;
  pages: number;
  data: BackendRoleItem[];
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export interface RoleItem {
  id: string;
  roleName: string;
  status: number;
  remark?: string;
  sort?: number;
  createTime?: string;
  raw: BackendRoleItem;
}

export interface CreateRoleParams {
  roleName: string;
  status: number;
  remark?: string;
  sort?: number;
}

export interface UpdateRoleParams {
  id: string;
  roleName: string;
  status: number;
  remark?: string;
  sort?: number;
}

/**
 * 获取角色列表
 * 接口：/api/Role/list
 * 说明：请求参数默认空值，这里统一通过 params 传递，可选填。
 */
export async function getRoleListApi(
  params: RoleListParams = {},
): Promise<{ items: RoleItem[]; total: number }> {
  const page = await requestClient.get<BackendRolePage>('/api/Role/list', {
    params,
  });
  const list: BackendRoleItem[] = page?.data ?? [];
  const items: RoleItem[] = Array.isArray(list)
    ? list.map((item) => ({
        id: item.id,
        roleName: item.roleName,
        status: item.status,
        remark: item.remark,
        sort: item.sort,
        createTime: item.createTime,
        raw: item,
      }))
    : [];

  return {
    items,
    total: page?.totalCount ?? items.length,
  };
}

/**
 * 获取角色详情
 * 接口：GET /api/Role/{id}
 */
export async function getRoleDetailApi(id: string): Promise<BackendRoleItem> {
  const res = await requestClient.get<BackendRoleItem>(`/api/Role/${id}`);
  return res;
}

/**
 * 创建角色
 * 接口：POST /api/Role
 */
export async function createRoleApi(
  params: CreateRoleParams,
): Promise<void> {
  await requestClient.post('/api/Role', params);
}

/**
 * 更新角色
 * 接口：PUT /api/Role
 */
export async function updateRoleApi(
  params: UpdateRoleParams,
): Promise<void> {
  await requestClient.put('/api/Role', params);
}

/**
 * 删除角色
 * 接口：DELETE /api/Role/{id}
 */
export async function deleteRoleApi(id: string): Promise<void> {
  await requestClient.delete(`/api/Role/${id}`);
}

/**
 * 获取角色权限
 * 接口：POST /api/Role/{roleId}
 * 参数：roleId 作为请求体参数
 */
export async function getRolePermissionsApi(roleId: string): Promise<any> {
  const res = await requestClient.post(`/api/Role/${roleId}`, {
    roleId,
  });
  return res;
}

/**
 * 保存角色权限
 * 接口：POST /api/Role/savePermissions
 */
export interface SaveRolePermissionsParams {
  roleId: string;
  menuIds: string[];
}

export async function saveRolePermissionsApi(
  params: SaveRolePermissionsParams,
): Promise<void> {
  await requestClient.post('/api/Role/savePermissions', params);
}

/**
 * 获取角色列表（简化版，用于下拉选择）
 * 接口：GET /api/Role/list
 * 只获取前20条，只返回 id 和 roleName
 */
export interface RoleOption {
  id: string;
  roleName: string;
}

export async function getRoleOptionsApi(): Promise<RoleOption[]> {
  const page = await requestClient.get<BackendRolePage>('/api/Role/list', {
    params: {
      PageIndex: 1,
      PageSize: 20,
    },
  });
  const list: BackendRoleItem[] = page?.data ?? [];
  return list.slice(0, 20).map((item) => ({
    id: item.id,
    roleName: item.roleName,
  }));
}

/**
 * 获取用户角色列表
 * 接口：GET /api/Role/user/{userId}
 */
export async function getUserRolesApi(userId: string): Promise<RoleOption[]> {
  const roles = await requestClient.get<BackendRoleItem[]>(`/api/Role/user/${userId}`);
  const list = Array.isArray(roles) ? roles : [];
  return list.map((item) => ({
    id: item.id,
    roleName: item.roleName,
  }));
}


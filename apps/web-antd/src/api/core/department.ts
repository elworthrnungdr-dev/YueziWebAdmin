import { requestClient } from '#/api/request';

// 后端分页列表返回的单条部门数据结构
export interface BackendDepartmentItem {
  id: string;
  deptCode: string;
  deptName: string;
  branchId?: string;
  branchName?: string;
  parentId?: string;
  leaderId?: string;
  [key: string]: any;
}

// 前端列表展示使用的字段
export interface DepartmentItem {
  id: string;
  deptCode: string;
  deptName: string;
  branchName?: string;
  parentId?: string;
  leaderId?: string;
}

export interface CreateDepartmentParams {
  deptCode: string;
  deptName: string;
  parentId: string;
  leaderId: string;
}

export interface UpdateDepartmentParams extends CreateDepartmentParams {
  id: string;
}

export interface BackendDepartmentPage {
  pageNo: number;
  pageSize: number;
  totalCount: number;
  pages: number;
  data: BackendDepartmentItem[];
}

/**
 * 获取部门列表
 * 接口：/api/Department/list
 * 说明：经过 defaultResponseInterceptor 和 responseReturn='data' 处理后，
 * 这里拿到的就是后端 data 字段的内容，即分页对象 BackendDepartmentPage。
 */
export async function getDepartmentListApi(): Promise<DepartmentItem[]> {
  const page = await requestClient.get<BackendDepartmentPage>('/api/Department/list');
  const list: BackendDepartmentItem[] = page?.data ?? [];
  if (!Array.isArray(list)) {
    return [];
  }
  return list.map((item) => ({
    id: item.id,
    deptCode: item.deptCode,
    deptName: item.deptName,
    branchName: item.branchName,
    parentId: item.parentId,
    leaderId: item.leaderId,
  }));
}

/**
 * 获取部门详情
 * 接口：/api/Department/{id}
 */
export async function getDepartmentDetailApi(id: string): Promise<BackendDepartmentItem> {
  return requestClient.get<BackendDepartmentItem>(`/api/Department/${id}`);
}

/**
 * 创建部门
 * 接口：/api/Department
 * 请求头：Authorization 由全局拦截器自动添加
 */
export async function createDepartmentApi(data: CreateDepartmentParams) {
  return requestClient.post('/api/Department', data, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/**
 * 更新部门
 * 接口：/api/Department
 * 说明：后端要求 id 与其它字段一起放在请求体
 */
export async function updateDepartmentApi(data: UpdateDepartmentParams) {
  return requestClient.put(`/api/Department`, data, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/**
 * 删除部门
 * 接口：/api/Department
 * 说明：后端要求 id 放在请求体
 */
export async function deleteDepartmentApi(id: string) {
  return requestClient.delete(`/api/Department`, {
    data: { id },
  });
}


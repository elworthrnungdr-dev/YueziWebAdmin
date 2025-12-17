import { requestClient } from '#/api/request';

export interface SafetyProjectListParams {
  ProjectCode?: string;
  ProjectName?: string;
  CreatedAtStart?: string;
  CreatedAtEnd?: string;
  PageIndex?: number;
  PageSize?: number;
  OrderBy?: string;
  IsAsc?: boolean;
}

export interface BackendSafetyProjectItem {
  id: string;
  branchId?: string;
  projectCode: string;
  projectName: string;
  projectType: number;
  projectTypeText?: string;
  brand?: string;
  model?: string;
  maintenanceCycle?: number;
  specifications?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendSafetyProjectPage {
  pageNo: number;
  pageSize: number;
  totalCount: number;
  pages: number;
  data: BackendSafetyProjectItem[];
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface SafetyProjectItem extends BackendSafetyProjectItem {}

export interface SafetyProjectListResult {
  items: SafetyProjectItem[];
  total: number;
}

export interface CreateSafetyProjectParams {
  projectCode: string;
  projectName: string;
  projectType: number;
  brand?: string;
  model?: string;
  maintenanceCycle?: number;
  specifications?: string;
  remark?: string;
}

export interface UpdateSafetyProjectParams extends CreateSafetyProjectParams {
  id: string;
}

/**
 * 获取设备登记项目列表
 * 接口：GET /api/SafetyProject/list
 */
export async function getSafetyProjectListApi(
  params: SafetyProjectListParams,
): Promise<SafetyProjectListResult> {
  const page = await requestClient.get<BackendSafetyProjectPage>(
    '/api/SafetyProject/list',
    { params },
  );
  const list: BackendSafetyProjectItem[] = page?.data ?? [];
  return {
    items: Array.isArray(list) ? list : [],
    total: page?.totalCount || 0,
  };
}

/**
 * 获取设备登记项目详情
 * 接口：GET /api/SafetyProject/{id}
 */
export async function getSafetyProjectDetailApi(
  id: string,
): Promise<SafetyProjectItem> {
  const response = await requestClient.get<BackendSafetyProjectItem>(
    `/api/SafetyProject/${id}`,
  );
  return response as unknown as SafetyProjectItem;
}

/**
 * 创建设备登记项目
 * 接口：POST /api/SafetyProject
 */
export async function createSafetyProjectApi(
  params: CreateSafetyProjectParams,
): Promise<void> {
  await requestClient.post('/api/SafetyProject', params);
}

/**
 * 更新设备登记项目
 * 接口：PUT /api/SafetyProject
 */
export async function updateSafetyProjectApi(
  params: UpdateSafetyProjectParams,
): Promise<void> {
  await requestClient.put('/api/SafetyProject', params);
}

/**
 * 删除设备登记项目
 * 接口：DELETE /api/SafetyProject/{id}
 */
export async function deleteSafetyProjectApi(id: string): Promise<void> {
  await requestClient.delete(`/api/SafetyProject/${id}`);
}






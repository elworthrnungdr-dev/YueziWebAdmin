import { requestClient } from '#/api/request';

export interface CareProjectListParams {
  ProductCode?: string;
  ProjectName?: string;
  Status?: number;
  PageIndex?: number;
  PageSize?: number;
  OrderBy?: string;
  IsAsc?: boolean;
}

export interface BackendCareProjectItem {
  id: string;
  productCode: string;
  projectName: string;
  standardPrice: number;
  standardHandFee?: number;
  duration?: number;
  validDays: number;
  description?: string;
  status: number;
  statusText?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendCareProjectPage {
  pageNo: number;
  pageSize: number;
  totalCount: number;
  pages: number;
  data: BackendCareProjectItem[];
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface CareProjectItem extends BackendCareProjectItem {}

export interface CareProjectListResult {
  items: CareProjectItem[];
  total: number;
  pageNo?: number;
  pageSize?: number;
  pages?: number;
}

export interface CreateCareProjectParams {
  productCode: string;
  projectName: string;
  standardPrice: number;
  standardHandFee?: number;
  duration?: number;
  validDays: number;
  description?: string;
  status: number;
}

export interface UpdateCareProjectParams extends CreateCareProjectParams {
  id: string;
}

/**
 * 获取产康项目列表
 * 接口：GET /api/CareProject/list
 */
export async function getCareProjectListApi(
  params: CareProjectListParams,
): Promise<CareProjectListResult> {
  const page = await requestClient.get<BackendCareProjectPage>(
    '/api/CareProject/list',
    { params },
  );
  const list: BackendCareProjectItem[] = page?.data ?? [];
  return {
    items: Array.isArray(list) ? list : [],
    total: page?.totalCount || 0,
    pageNo: page?.pageNo,
    pageSize: page?.pageSize,
    pages: page?.pages,
  };
}

/**
 * 获取产康项目详情
 * 接口：GET /api/CareProject/{id}
 */
export async function getCareProjectDetailApi(
  id: string,
): Promise<CareProjectItem> {
  const response = await requestClient.get<BackendCareProjectItem>(
    `/api/CareProject/${id}`,
  );
  return response as unknown as CareProjectItem;
}

/**
 * 创建产康项目
 * 接口：POST /api/CareProject
 */
export async function createCareProjectApi(
  params: CreateCareProjectParams,
): Promise<void> {
  await requestClient.post('/api/CareProject', params);
}

/**
 * 更新产康项目
 * 接口：PUT /api/CareProject
 */
export async function updateCareProjectApi(
  params: UpdateCareProjectParams,
): Promise<void> {
  await requestClient.put('/api/CareProject', params);
}

/**
 * 删除产康项目
 * 接口：DELETE /api/CareProject/{id}
 */
export async function deleteCareProjectApi(id: string): Promise<void> {
  await requestClient.delete(`/api/CareProject/${id}`);
}



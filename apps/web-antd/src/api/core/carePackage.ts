import { requestClient } from '#/api/request';

export interface CarePackageListParams {
  PackageName?: string;
  Status?: number;
  PageIndex?: number;
  PageSize?: number;
  OrderBy?: string;
  IsAsc?: boolean;
}

export interface CarePackageItemDetail {
  id: string;
  packageId: string;
  projectId: string;
  projectName: string;
  quantity: number;
}

export interface BackendCarePackageItem {
  id: string;
  packageName: string;
  status: number;
  statusText?: string;
  remark?: string;
  createdAt?: string;
  totalPrice: number;
  items: CarePackageItemDetail[];
}

export interface BackendCarePackagePage {
  pageNo: number;
  pageSize: number;
  totalCount: number;
  pages: number;
  data: BackendCarePackageItem[];
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface CarePackageItem extends BackendCarePackageItem {}

export interface CarePackageListResult {
  items: CarePackageItem[];
  total: number;
}

export interface CarePackageItemInput {
  projectId: string;
  quantity: number;
}

export interface CreateCarePackageParams {
  packageName: string;
  totalPrice: number;
  status: number;
  remark?: string;
  items: CarePackageItemInput[];
}

export interface UpdateCarePackageParams extends CreateCarePackageParams {
  id: string;
}

/**
 * 获取产康套餐项目列表
 * 接口：GET /api/CarePackage/list
 */
export async function getCarePackageListApi(
  params: CarePackageListParams,
): Promise<CarePackageListResult> {
  const page = await requestClient.get<BackendCarePackagePage>(
    '/api/CarePackage/list',
    { params },
  );
  const list: BackendCarePackageItem[] = page?.data ?? [];
  return {
    items: Array.isArray(list) ? list : [],
    total: page?.totalCount || 0,
  };
}

/**
 * 获取产康套餐项目详情
 * 接口：GET /api/CarePackage/{id}
 */
export async function getCarePackageDetailApi(
  id: string,
): Promise<CarePackageItem> {
  const response = await requestClient.get<BackendCarePackageItem>(
    `/api/CarePackage/${id}`,
  );
  return response as unknown as CarePackageItem;
}

/**
 * 创建产康套餐项目
 * 接口：POST /api/CarePackage
 */
export async function createCarePackageApi(
  params: CreateCarePackageParams,
): Promise<void> {
  await requestClient.post('/api/CarePackage', params);
}

/**
 * 更新产康套餐项目
 * 接口：PUT /api/CarePackage
 */
export async function updateCarePackageApi(
  params: UpdateCarePackageParams,
): Promise<void> {
  await requestClient.put('/api/CarePackage', params);
}

/**
 * 删除产康套餐项目
 * 接口：DELETE /api/CarePackage/{id}
 */
export async function deleteCarePackageApi(id: string): Promise<void> {
  await requestClient.delete(`/api/CarePackage/${id}`);
}





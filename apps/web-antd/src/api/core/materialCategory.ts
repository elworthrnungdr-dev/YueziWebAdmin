import { requestClient } from '#/api/request';

export interface MaterialCategoryListParams {
  CategoryCode?: string;
  CategoryName?: string;
  PageIndex?: number;
  PageSize?: number;
  OrderBy?: string;
  IsAsc?: boolean;
}

export interface MaterialCategoryItem {
  id: string;
  categoryCode: string;
  categoryName: string;
  parentId?: string;
  level?: number;
  sortOrder?: number;
  isEnabled?: number;
  description?: string;
}

export interface MaterialCategoryListResponse {
  pageNo: number;
  pageSize: number;
  totalCount: number;
  pages: number;
  data: MaterialCategoryItem[];
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface MaterialCategoryListResult {
  items: MaterialCategoryItem[];
  total: number;
}

export interface CreateMaterialCategoryParams {
  categoryCode: string;
  categoryName: string;
  parentId?: string;
  sortOrder?: number;
  description?: string;
}

export interface UpdateMaterialCategoryParams extends CreateMaterialCategoryParams {
  id: string;
}

// 获取物资类别列表
export async function getMaterialCategoryListApi(
  params: MaterialCategoryListParams,
): Promise<MaterialCategoryListResult> {
  const page = await requestClient.get<MaterialCategoryListResponse>(
    '/api/MaterialCategory/list',
    { params },
  );
  const list: MaterialCategoryItem[] = page?.data ?? [];
  return {
    items: Array.isArray(list) ? list : [],
    total: page?.totalCount || 0,
  };
}

// 获取物资类别详情
export async function getMaterialCategoryDetailApi(
  id: string,
): Promise<MaterialCategoryItem> {
  const response = await requestClient.get<MaterialCategoryItem>(
    `/api/MaterialCategory/${id}`,
  );
  return response as unknown as MaterialCategoryItem;
}

// 创建物资类别
export async function createMaterialCategoryApi(
  params: CreateMaterialCategoryParams,
): Promise<void> {
  await requestClient.post('/api/MaterialCategory', params);
}

// 更新物资类别
export async function updateMaterialCategoryApi(
  params: UpdateMaterialCategoryParams,
): Promise<void> {
  await requestClient.put('/api/MaterialCategory', params);
}

// 删除物资类别
export async function deleteMaterialCategoryApi(id: string): Promise<void> {
  await requestClient.delete(`/api/MaterialCategory/${id}`);
}



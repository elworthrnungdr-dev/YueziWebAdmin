import { requestClient } from '#/api/request';

export interface MaterialListParams {
  MaterialCode?: string;
  MaterialName?: string;
  PageIndex?: number;
  PageSize?: number;
  OrderBy?: string;
  IsAsc?: boolean;
}

export interface MaterialItem {
  id: string;
  materialCode: string;
  materialName: string;
  categoryId?: string;
  specification?: string;
  unit: string;
  minStock?: number;
  maxStock?: number;
  currentStock?: number;
  status?: number;
  purchasePrice?: number;
  salePrice?: number;
  costPrice?: number;
  isPerishable?: number;
  usageScenario?: string;
  remark?: string;
}

export interface MaterialListResponse {
  pageNo: number;
  pageSize: number;
  totalCount: number;
  pages: number;
  data: MaterialItem[];
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface MaterialListResult {
  items: MaterialItem[];
  total: number;
}

export interface CreateMaterialParams {
  materialCode: string;
  materialName: string;
  categoryId?: string;
  specification?: string;
  unit: string;
  minStock?: number;
  maxStock?: number;
  currentStock?: number;
  status?: number;
  purchasePrice?: number;
  salePrice?: number;
  costPrice?: number;
  isPerishable?: number;
  usageScenario?: string;
  remark?: string;
}

export interface UpdateMaterialParams extends CreateMaterialParams {
  id: string;
}

// 获取物资信息列表
export async function getMaterialListApi(
  params: MaterialListParams,
): Promise<MaterialListResult> {
  const page = await requestClient.get<MaterialListResponse>('/api/Material/list', {
    params,
  });
  const list: MaterialItem[] = page?.data ?? [];
  return {
    items: Array.isArray(list) ? list : [],
    total: page?.totalCount || 0,
  };
}

// 获取物资信息详情
export async function getMaterialDetailApi(id: string): Promise<MaterialItem> {
  const response = await requestClient.get<MaterialItem>(`/api/Material/${id}`);
  return response as unknown as MaterialItem;
}

// 创建物资信息
export async function createMaterialApi(
  params: CreateMaterialParams,
): Promise<void> {
  await requestClient.post('/api/Material', params);
}

// 更新物资信息
export async function updateMaterialApi(
  params: UpdateMaterialParams,
): Promise<void> {
  await requestClient.put('/api/Material', params);
}

// 删除物资信息
export async function deleteMaterialApi(id: string): Promise<void> {
  await requestClient.delete(`/api/Material/${id}`);
}



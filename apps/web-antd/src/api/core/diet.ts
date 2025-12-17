import { requestClient } from '#/api/request';

export interface DietListParams {
  ContractNo?: string;
  CustomerId?: string;
  CreateTimeStart?: string;
  CreateTimeEnd?: string;
  PageIndex?: number;
  PageSize?: number;
  OrderBy?: string;
  IsAsc?: boolean;
}

export interface BackendDietItem {
  id: string;
  tContractId: string;
  contractNo: string;
  customerId: string;
  tabooItem: string;
  stayTimes: number;
  description: string;
  createTime?: string;
  updateTime?: string;
}

export interface BackendDietPage {
  pageNo: number;
  pageSize: number;
  totalCount: number;
  pages: number;
  data: BackendDietItem[];
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface DietItem {
  id: string;
  tContractId: string;
  contractNo: string;
  customerId: string;
  tabooItem: string;
  stayTimes: number;
  description: string;
  createTime?: string;
  updateTime?: string;
}

export interface DietListResult {
  items: DietItem[];
  total: number;
}

export interface CreateDietParams {
  customerId: string;
  tabooItem: string;
  stayTimes: number;
  description: string;
}

export interface UpdateDietParams extends CreateDietParams {
  id: string;
}

/**
 * 获取饮食禁忌列表
 */
export async function getDietListApi(
  params: DietListParams,
): Promise<DietListResult> {
  const page = await requestClient.get<BackendDietPage>(
    '/api/CustomerFoodTaboo/list',
    {
      params,
    },
  );
  const list: BackendDietItem[] = page?.data ?? [];
  return {
    items: Array.isArray(list) ? list : [],
    total: page?.totalCount || 0,
  };
}

/**
 * 获取饮食禁忌详情
 * 接口：GET /api/CustomerFoodTaboo/{id}
 */
export async function getDietDetailApi(id: string): Promise<DietItem> {
  const response = await requestClient.get<BackendDietItem>(
    `/api/CustomerFoodTaboo/${id}`,
  );
  return response as unknown as DietItem;
}

/**
 * 创建饮食禁忌
 * 接口：POST /api/CustomerFoodTaboo
 */
export async function createDietApi(params: CreateDietParams): Promise<void> {
  await requestClient.post('/api/CustomerFoodTaboo', params);
}

/**
 * 更新饮食禁忌
 * 接口：PUT /api/CustomerFoodTaboo
 */
export async function updateDietApi(params: UpdateDietParams): Promise<void> {
  await requestClient.put('/api/CustomerFoodTaboo', params);
}

/**
 * 删除饮食禁忌
 * 接口：DELETE /api/CustomerFoodTaboo/{id}
 */
export async function deleteDietApi(id: string): Promise<void> {
  await requestClient.delete(`/api/CustomerFoodTaboo/${id}`);
}


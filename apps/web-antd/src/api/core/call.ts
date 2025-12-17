import { requestClient } from '#/api/request';

export interface CallListParams {
  ContractNo?: string;
  CustomerId?: string;
  CallTimeStart?: string;
  CallTimeEnd?: string;
  CreatedAtStart?: string;
  CreatedAtEnd?: string;
  PageIndex?: number;
  PageSize?: number;
  OrderBy?: string;
  IsAsc?: boolean;
}

export interface BackendCallItem {
  id: string;
  customerId: string;
  tContractId: string;
  contractNo: string;
  callTime?: string;
  reason: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendCallPage {
  pageNo: number;
  pageSize: number;
  totalCount: number;
  pages: number;
  data: BackendCallItem[];
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface CallItem extends BackendCallItem {}

export interface CallListResult {
  items: CallItem[];
  total: number;
}

export interface CreateCallParams {
  customerId: string;
  callTime?: string;
  reason: string;
  remark?: string;
}

export interface UpdateCallParams extends CreateCallParams {
  id: string;
}

/**
 * 获取呼叫记录列表
 */
export async function getCallListApi(
  params: CallListParams,
): Promise<CallListResult> {
  const page = await requestClient.get<BackendCallPage>(
    '/api/CustomerCall/list',
    { params },
  );
  const list: BackendCallItem[] = page?.data ?? [];
  return {
    items: Array.isArray(list) ? list : [],
    total: page?.totalCount || 0,
  };
}

/**
 * 获取呼叫记录详情
 * 接口：GET /api/CustomerCall/{id}
 */
export async function getCallDetailApi(id: string): Promise<CallItem> {
  const response = await requestClient.get<BackendCallItem>(
    `/api/CustomerCall/${id}`,
  );
  return response as unknown as CallItem;
}

/**
 * 创建呼叫记录
 * 接口：POST /api/CustomerCall
 */
export async function createCallApi(
  params: CreateCallParams,
): Promise<void> {
  await requestClient.post('/api/CustomerCall', params);
}

/**
 * 更新呼叫记录
 * 接口：PUT /api/CustomerCall
 */
export async function updateCallApi(
  params: UpdateCallParams,
): Promise<void> {
  await requestClient.put('/api/CustomerCall', params);
}

/**
 * 删除呼叫记录
 * 接口：DELETE /api/CustomerCall/{id}
 */
export async function deleteCallApi(id: string): Promise<void> {
  await requestClient.delete(`/api/CustomerCall/${id}`);
}



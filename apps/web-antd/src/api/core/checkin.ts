import { requestClient } from '#/api/request';

export interface CheckinListParams {
  ContractNo?: string;
  CustomerId?: string;
  CheckinDateStart?: string;
  CheckinDateEnd?: string;
  CheckoutDateStart?: string;
  CheckoutDateEnd?: string;
  PageIndex?: number;
  PageSize?: number;
  OrderBy?: string;
  IsAsc?: boolean;
}

export interface BackendCheckinItem {
  id: string;
  tContractId: string;
  contractNo: string;
  customerId: string;
  roomId: string;
  checkinDate?: string;
  checkoutDate?: string;
  status: number;
  statusText?: string;
  remark?: string;
  createTime?: string;
  updateTime?: string;
}

export interface BackendCheckinPage {
  pageNo: number;
  pageSize: number;
  totalCount: number;
  pages: number;
  data: BackendCheckinItem[];
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface CheckinItem {
  id: string;
  tContractId: string;
  contractNo: string;
  customerId: string;
  roomId: string;
  checkinDate?: string;
  checkoutDate?: string;
  status: number;
  statusText?: string;
  remark?: string;
  createTime?: string;
  updateTime?: string;
}

export interface CheckinListResult {
  items: CheckinItem[];
  total: number;
}

export interface CreateCheckinParams {
  createdByType: number;
  sourceReferenceId: string;
  roomId: string;
  checkinDate?: string;
  checkoutDate?: string;
  status: number;
  remark?: string;
}

export interface UpdateCheckinParams extends CreateCheckinParams {
  id: string;
}

/**
 * 获取入住信息列表
 */
export async function getCheckinListApi(
  params: CheckinListParams,
): Promise<CheckinListResult> {
  const page = await requestClient.get<BackendCheckinPage>(
    '/api/CustomerCheckin/list',
    { params },
  );
  const list: BackendCheckinItem[] = page?.data ?? [];
  return {
    items: Array.isArray(list) ? list : [],
    total: page?.totalCount || 0,
  };
}

/**
 * 获取入住信息详情
 * 接口：GET /api/CustomerCheckin/{id}
 */
export async function getCheckinDetailApi(id: string): Promise<CheckinItem> {
  const response = await requestClient.get<BackendCheckinItem>(
    `/api/CustomerCheckin/${id}`,
  );
  return response as unknown as CheckinItem;
}

/**
 * 创建入住信息
 * 接口：POST /api/CustomerCheckin
 */
export async function createCheckinApi(
  params: CreateCheckinParams,
): Promise<void> {
  await requestClient.post('/api/CustomerCheckin', params);
}

/**
 * 更新入住信息
 * 接口：PUT /api/CustomerCheckin
 */
export async function updateCheckinApi(
  params: UpdateCheckinParams,
): Promise<void> {
  await requestClient.put('/api/CustomerCheckin', params);
}

/**
 * 删除入住信息
 * 接口：DELETE /api/CustomerCheckin/{id}
 */
export async function deleteCheckinApi(id: string): Promise<void> {
  await requestClient.delete(`/api/CustomerCheckin/${id}`);
}


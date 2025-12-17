import { requestClient } from '#/api/request';

export interface ClauseListParams {
  ContractNo?: string;
  CustomerId?: string;
  SignDateStart?: string;
  SignDateEnd?: string;
  CreateTimeStart?: string;
  CreateTimeEnd?: string;
  PageIndex?: number;
  PageSize?: number;
  OrderBy?: string;
  IsAsc?: boolean;
}

export interface BackendClauseItem {
  id: string;
  tContractId: string;
  contractNo: string;
  customerId: string;
  title: string;
  content: string;
  signDate?: string;
  stayTimes: number;
  createTime?: string;
  updateTime?: string;
}

export interface BackendClausePage {
  pageNo: number;
  pageSize: number;
  totalCount: number;
  pages: number;
  data: BackendClauseItem[];
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface ClauseItem {
  id: string;
  tContractId: string;
  contractNo: string;
  customerId: string;
  title: string;
  content: string;
  signDate?: string;
  stayTimes: number;
  createTime?: string;
  updateTime?: string;
}

export interface ClauseListResult {
  items: ClauseItem[];
  total: number;
}

export interface CreateClauseParams {
  customerId: string;
  title: string;
  content: string;
  signDate?: string;
  stayTimes: number;
}

export interface UpdateClauseParams extends CreateClauseParams {
  id: string;
}

/**
 * 获取补充条款列表
 */
export async function getClauseListApi(
  params: ClauseListParams,
): Promise<ClauseListResult> {
  const page = await requestClient.get<BackendClausePage>(
    '/api/CustomerExtraTerms/list',
    {
      params,
    },
  );
  const list: BackendClauseItem[] = page?.data ?? [];
  return {
    items: Array.isArray(list) ? list : [],
    total: page?.totalCount || 0,
  };
}

/**
 * 获取补充条款详情
 * 接口：GET /api/CustomerExtraTerms/{id}
 */
export async function getClauseDetailApi(id: string): Promise<ClauseItem> {
  const response = await requestClient.get<BackendClauseItem>(
    `/api/CustomerExtraTerms/${id}`,
  );
  return response as unknown as ClauseItem;
}

/**
 * 创建补充条款
 * 接口：POST /api/CustomerExtraTerms
 */
export async function createClauseApi(
  params: CreateClauseParams,
): Promise<void> {
  await requestClient.post('/api/CustomerExtraTerms', params);
}

/**
 * 更新补充条款
 * 接口：PUT /api/CustomerExtraTerms
 */
export async function updateClauseApi(
  params: UpdateClauseParams,
): Promise<void> {
  await requestClient.put('/api/CustomerExtraTerms', params);
}

/**
 * 删除补充条款
 * 接口：DELETE /api/CustomerExtraTerms/{id}
 */
export async function deleteClauseApi(id: string): Promise<void> {
  await requestClient.delete(`/api/CustomerExtraTerms/${id}`);
}


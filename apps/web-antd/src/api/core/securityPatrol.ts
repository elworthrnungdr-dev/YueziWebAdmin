import { requestClient } from '#/api/request';

export interface SecurityPatrolListParams {
  SecurityName?: string;
  SecurityId?: string;
  PatrolDateStart?: string;
  PatrolDateEnd?: string;
  CreatedAtStart?: string;
  CreatedAtEnd?: string;
  PageIndex?: number;
  PageSize?: number;
  OrderBy?: string;
  IsAsc?: boolean;
}

export interface BackendSecurityPatrolItem {
  id: string;
  patrolDate: string;
  shift: number;
  shiftText?: string;
  securityId: string;
  securityName?: string;
  selectedRoutes: string;
  startTime?: string;
  endTime?: string;
  totalDuration?: number;
  patrolStatus?: number;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendSecurityPatrolPage {
  pageNo: number;
  pageSize: number;
  totalCount: number;
  pages: number;
  data: BackendSecurityPatrolItem[];
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface SecurityPatrolItem extends BackendSecurityPatrolItem {}

export interface SecurityPatrolListResult {
  items: SecurityPatrolItem[];
  total: number;
}

export interface CreateSecurityPatrolParams {
  patrolDate: string;
  shift: number;
  securityId: string;
  selectedRoutes: string;
  startTime?: string;
  endTime?: string;
  patrolStatus: number;
  remark?: string;
}

export interface UpdateSecurityPatrolParams
  extends CreateSecurityPatrolParams {
  id: string;
}

/**
 * 获取保安巡更列表
 * 接口：GET /api/SecurityPatrolRecord/list
 */
export async function getSecurityPatrolListApi(
  params: SecurityPatrolListParams,
): Promise<SecurityPatrolListResult> {
  const page = await requestClient.get<BackendSecurityPatrolPage>(
    '/api/SecurityPatrolRecord/list',
    { params },
  );
  const list: BackendSecurityPatrolItem[] = page?.data ?? [];
  return {
    items: Array.isArray(list) ? list : [],
    total: page?.totalCount || 0,
  };
}

/**
 * 获取保安巡更详情
 * 接口：GET /api/SecurityPatrolRecord/{id}
 */
export async function getSecurityPatrolDetailApi(
  id: string,
): Promise<SecurityPatrolItem> {
  const response = await requestClient.get<BackendSecurityPatrolItem>(
    `/api/SecurityPatrolRecord/${id}`,
  );
  return response as unknown as SecurityPatrolItem;
}

/**
 * 创建保安巡更
 * 接口：POST /api/SecurityPatrolRecord
 */
export async function createSecurityPatrolApi(
  params: CreateSecurityPatrolParams,
): Promise<void> {
  await requestClient.post('/api/SecurityPatrolRecord', params);
}

/**
 * 更新保安巡更
 * 接口：PUT /api/SecurityPatrolRecord
 */
export async function updateSecurityPatrolApi(
  params: UpdateSecurityPatrolParams,
): Promise<void> {
  await requestClient.put('/api/SecurityPatrolRecord', params);
}

/**
 * 删除保安巡更
 * 接口：DELETE /api/SecurityPatrolRecord/{id}
 */
export async function deleteSecurityPatrolApi(id: string): Promise<void> {
  await requestClient.delete(`/api/SecurityPatrolRecord/${id}`);
}





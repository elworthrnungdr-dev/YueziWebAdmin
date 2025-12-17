import { requestClient } from '#/api/request';

export interface LeaveListParams {
  CreatedAtStart?: string;
  CreatedAtEnd?: string;
  PageIndex?: number;
  PageSize?: number;
  OrderBy?: string;
  IsAsc?: boolean;
}

export interface BackendLeaveItem {
  id: string;
  customerId: string;
  tContractId: string;
  contractNo: string;
  leaveType: number;
  leaveTypeText?: string;
  applyTime?: string;
  plannedStart?: string;
  plannedEnd?: string;
  actualStart?: string;
  actualEnd?: string;
  leaveReason?: string;
  destination?: string;
  companion?: string;
  emergencyContact?: string;
  businessType?: string;
  workflowStatus?: string;
  documentStatus: number;
  isBabyAccompany: number;
  isBabyAccompanyText?: string;
  maternalCheckinTemp?: number;
  babyCheckinTemp?: string;
  maternalCheckoutTemp?: number;
  babyCheckoutTemp?: string;
  babyIds?: string;
  riskNotice?: string;
  customerSign?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendLeavePage {
  pageNo: number;
  pageSize: number;
  totalCount: number;
  pages: number;
  data: BackendLeaveItem[];
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface LeaveItem extends BackendLeaveItem {}

export interface LeaveListResult {
  items: LeaveItem[];
  total: number;
}

export interface CreateLeaveParams {
  customerId: string;
  leaveType: number;
  applyTime?: string;
  plannedStart?: string;
  plannedEnd?: string;
  actualStart?: string;
  actualEnd?: string;
  leaveReason: string;
  destination?: string;
  companion?: string;
  emergencyContact?: string;
  documentStatus: number;
  isBabyAccompany: number;
  maternalCheckinTemp?: number;
  babyCheckinTemp?: string;
  maternalCheckoutTemp?: number;
  babyCheckoutTemp?: string;
  riskNotice?: string;
  customerSign?: string;
  remark?: string;
}

export interface UpdateLeaveParams extends CreateLeaveParams {
  id: string;
}

/**
 * 获取请假记录列表
 */
export async function getLeaveListApi(
  params: LeaveListParams,
): Promise<LeaveListResult> {
  const page = await requestClient.get<BackendLeavePage>(
    '/api/CustomerLeave/list',
    { params },
  );
  const list: BackendLeaveItem[] = page?.data ?? [];
  return {
    items: Array.isArray(list) ? list : [],
    total: page?.totalCount || 0,
  };
}

/**
 * 获取请假记录详情
 * 接口：GET /api/CustomerLeave/{id}
 */
export async function getLeaveDetailApi(id: string): Promise<LeaveItem> {
  const response = await requestClient.get<BackendLeaveItem>(
    `/api/CustomerLeave/${id}`,
  );
  return response as unknown as LeaveItem;
}

/**
 * 创建请假记录
 * 接口：POST /api/CustomerLeave
 */
export async function createLeaveApi(
  params: CreateLeaveParams,
): Promise<void> {
  await requestClient.post('/api/CustomerLeave', params);
}

/**
 * 更新请假记录
 * 接口：PUT /api/CustomerLeave
 */
export async function updateLeaveApi(
  params: UpdateLeaveParams,
): Promise<void> {
  await requestClient.put('/api/CustomerLeave', params);
}

/**
 * 删除请假记录
 * 接口：DELETE /api/CustomerLeave/{id}
 */
export async function deleteLeaveApi(id: string): Promise<void> {
  await requestClient.delete(`/api/CustomerLeave/${id}`);
}

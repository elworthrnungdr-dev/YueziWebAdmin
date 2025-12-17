import { requestClient } from '#/api/request';

export interface VisitListParams {
  VisitorName?: string;
  CreatedAtStart?: string;
  CreatedAtEnd?: string;
  PageIndex?: number;
  PageSize?: number;
  OrderBy?: string;
  IsAsc?: boolean;
}

export interface BackendVisitItem {
  id: string;
  customerId: string;
  tContractId: string;
  contractNo: string;
  visitorName: string;
  visitorPhone: string;
  visitorCount: number;
  relation: number;
  relationText?: string;
  idType: number;
  idTypeText?: string;
  idNumber: string;
  visitPurpose: string;
  plannedStart?: string;
  plannedEnd?: string;
  actualStart?: string;
  actualEnd?: string;
  visitDuration: number;
  isApproved: number;
  isApprovedText?: string;
  approverId?: string;
  approveTime?: string;
  rejectReason?: string;
  visitLocation?: string;
  roomId?: string;
  carryItems?: string;
  healthStatus?: string;
  babyMeet: number;
  babyMeetText?: string;
  remark?: string;
  checkinEmployeeId?: string;
  checkoutEmployeeId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendVisitPage {
  pageNo: number;
  pageSize: number;
  totalCount: number;
  pages: number;
  data: BackendVisitItem[];
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface VisitItem {
  id: string;
  customerId: string;
  tContractId: string;
  contractNo: string;
  visitorName: string;
  visitorPhone: string;
  visitorCount: number;
  relation: number;
  relationText?: string;
  idType: number;
  idTypeText?: string;
  idNumber: string;
  visitPurpose: string;
  plannedStart?: string;
  plannedEnd?: string;
  actualStart?: string;
  actualEnd?: string;
  visitDuration: number;
  isApproved: number;
  isApprovedText?: string;
  approverId?: string;
  approveTime?: string;
  rejectReason?: string;
  visitLocation?: string;
  roomId?: string;
  carryItems?: string;
  healthStatus?: string;
  babyMeet: number;
  babyMeetText?: string;
  remark?: string;
  checkinEmployeeId?: string;
  checkoutEmployeeId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface VisitListResult {
  items: VisitItem[];
  total: number;
}

export interface CreateVisitParams {
  customerId: string;
  visitorName: string;
  visitorPhone: string;
  visitorCount: number;
  relation: number;
  idType: number;
  idNumber: string;
  visitPurpose: string;
  plannedStart?: string;
  plannedEnd?: string;
  actualStart?: string;
  actualEnd?: string;
  visitDuration: number;
  isApproved: number;
  approverId?: string;
  approveTime?: string;
  rejectReason?: string;
  visitLocation?: string;
  roomId?: string;
  carryItems?: string;
  healthStatus?: string;
  babyMeet: number;
  remark?: string;
}

export interface UpdateVisitParams extends CreateVisitParams {
  id: string;
}

/**
 * 获取来访登记列表
 */
export async function getVisitListApi(
  params: VisitListParams,
): Promise<VisitListResult> {
  const page = await requestClient.get<BackendVisitPage>(
    '/api/CustomerVisit/list',
    {
      params,
    },
  );
  const list: BackendVisitItem[] = page?.data ?? [];
  return {
    items: Array.isArray(list) ? list : [],
    total: page?.totalCount || 0,
  };
}

/**
 * 获取来访登记详情
 * 接口：GET /api/CustomerVisit/{id}
 */
export async function getVisitDetailApi(id: string): Promise<VisitItem> {
  const response = await requestClient.get<BackendVisitItem>(
    `/api/CustomerVisit/${id}`,
  );
  return response as unknown as VisitItem;
}

/**
 * 创建来访登记
 * 接口：POST /api/CustomerVisit
 */
export async function createVisitApi(
  params: CreateVisitParams,
): Promise<void> {
  await requestClient.post('/api/CustomerVisit', params);
}

/**
 * 更新来访登记
 * 接口：PUT /api/CustomerVisit
 */
export async function updateVisitApi(
  params: UpdateVisitParams,
): Promise<void> {
  await requestClient.put('/api/CustomerVisit', params);
}

/**
 * 删除来访登记
 * 接口：DELETE /api/CustomerVisit/{id}
 */
export async function deleteVisitApi(id: string): Promise<void> {
  await requestClient.delete(`/api/CustomerVisit/${id}`);
}


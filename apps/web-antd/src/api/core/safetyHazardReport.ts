import { requestClient } from '#/api/request';

export interface SafetyHazardReportListParams {
  DiscovererName?: string;
  ReportTimeStart?: string;
  ReportTimeEnd?: string;
  CreatedAtStart?: string;
  CreatedAtEnd?: string;
  PageIndex?: number;
  PageSize?: number;
  OrderBy?: string;
  IsAsc?: boolean;
}

export interface BackendSafetyHazardReportItem {
  id: string;
  reportNo?: string;
  projectId: string;
  businessType?: string;
  workflowStatus?: string;
  documentStatus: number;
  currentApprovalLevel?: number;
  hazardType: number;
  hazardTypeText?: string;
  hazardLevel: number;
  hazardLevelText?: string;
  location: string;
  branchId?: string;
  roomId?: string;
  discovererId: string;
  discovererName?: string;
  discoverTime: string;
  description: string;
  photos?: string;
  immediateMeasures?: string;
  isUrgent: number;
  isUrgentText?: string;
  reportStatus?: number;
  reportStatusText?: string;
  reporterId: string;
  reportTime: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendSafetyHazardReportPage {
  pageNo: number;
  pageSize: number;
  totalCount: number;
  pages: number;
  data: BackendSafetyHazardReportItem[];
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface SafetyHazardReportItem extends BackendSafetyHazardReportItem {}

export interface SafetyHazardReportListResult {
  items: SafetyHazardReportItem[];
  total: number;
}

export interface CreateSafetyHazardReportParams {
  projectId: string;
  documentStatus: number;
  hazardType: number;
  hazardLevel: number;
  location: string;
  roomId?: string;
  discovererId: string;
  discoverTime: string;
  description: string;
  photos?: string;
  immediateMeasures?: string;
  isUrgent: number;
  reporterId: string;
  reportTime: string;
  remark?: string;
}

export interface UpdateSafetyHazardReportParams
  extends CreateSafetyHazardReportParams {
  id: string;
}

/**
 * 获取隐患上报列表
 * 接口：GET /api/SafetyHazardReport/list
 */
export async function getSafetyHazardReportListApi(
  params: SafetyHazardReportListParams,
): Promise<SafetyHazardReportListResult> {
  const page = await requestClient.get<BackendSafetyHazardReportPage>(
    '/api/SafetyHazardReport/list',
    { params },
  );
  const list: BackendSafetyHazardReportItem[] = page?.data ?? [];
  return {
    items: Array.isArray(list) ? list : [],
    total: page?.totalCount || 0,
  };
}

/**
 * 获取隐患上报详情
 * 接口：GET /api/SafetyHazardReport/{id}
 */
export async function getSafetyHazardReportDetailApi(
  id: string,
): Promise<SafetyHazardReportItem> {
  const response = await requestClient.get<BackendSafetyHazardReportItem>(
    `/api/SafetyHazardReport/${id}`,
  );
  return response as unknown as SafetyHazardReportItem;
}

/**
 * 创建隐患上报
 * 接口：POST /api/SafetyHazardReport
 */
export async function createSafetyHazardReportApi(
  params: CreateSafetyHazardReportParams,
): Promise<void> {
  await requestClient.post('/api/SafetyHazardReport', params);
}

/**
 * 更新隐患上报
 * 接口：PUT /api/SafetyHazardReport
 */
export async function updateSafetyHazardReportApi(
  params: UpdateSafetyHazardReportParams,
): Promise<void> {
  await requestClient.put('/api/SafetyHazardReport', params);
}

/**
 * 删除隐患上报
 * 注意：根据你的描述，删除接口地址为 /api/SafetyProject/{id}
 * 如果后端后续调整为 /api/SafetyHazardReport/{id}，只需改这里的路径。
 */
export async function deleteSafetyHazardReportApi(id: string): Promise<void> {
  await requestClient.delete(`/api/SafetyProject/${id}`);
}






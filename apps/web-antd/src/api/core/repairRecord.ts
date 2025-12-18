import { requestClient } from '#/api/request';

export interface RepairRecordListParams {
  RepairStartDateStart?: string;
  RepairStartDateEnd?: string;
  RepairEndDateStart?: string;
  RepairEndDateEnd?: string;
  AcceptanceDateStart?: string;
  AcceptanceDateEnd?: string;
  CreatedAtStart?: string;
  CreatedAtEnd?: string;
  RepairType?: number;
  RepairStatus?: number;
  PaymentStatus?: number;
  PageIndex?: number;
  PageSize?: number;
  OrderBy?: string;
  IsAsc?: boolean;
}

export interface RepairRecordItem {
  id: string;
  repairNo: string;
  maintenanceId?: string;
  hazardReportId?: string;
  projectId: string;
  repairType: number;
  repairTypeText?: string;
  faultDescription?: string;
  repairContent?: string;
  repairCompany?: string;
  repairPerson?: string;
  repairPersonPhone?: string;
  estimatedCost?: number;
  actualCost?: number;
  warrantyPeriod?: number;
  repairStartDate?: string;
  repairEndDate?: string;
  repairStatus?: number;
  repairStatusText?: string;
  paymentStatus?: number;
  paymentStatusText?: string;
  invoiceNo?: string;
  beforePhotos?: string;
  afterPhotos?: string;
  acceptanceReport?: string;
  acceptanceEmployeeId?: string;
  acceptanceDate?: string;
  remark?: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
}

export interface RepairRecordListResponse {
  pageNo: number;
  pageSize: number;
  totalCount: number;
  pages: number;
  data: RepairRecordItem[];
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface RepairRecordListResult {
  items: RepairRecordItem[];
  total: number;
}

export interface CreateRepairRecordParams {
  projectId: string;
  repairType: number;
  faultDescription: string;
  estimatedCost?: number;
}

export interface UpdateRepairRecordParams extends CreateRepairRecordParams {
  id: string;
}

// 获取报修记录列表
export async function getRepairRecordListApi(
  params: RepairRecordListParams,
): Promise<RepairRecordListResult> {
  const page = await requestClient.get<RepairRecordListResponse>(
    '/api/RepairRecord/list',
    { params },
  );
  const list: RepairRecordItem[] = page?.data ?? [];
  return {
    items: Array.isArray(list) ? list : [],
    total: page?.totalCount || 0,
  };
}

// 获取报修记录详情
export async function getRepairRecordDetailApi(
  id: string,
): Promise<RepairRecordItem> {
  const response = await requestClient.get<RepairRecordItem>(
    `/api/RepairRecord/${id}`,
  );
  return response as unknown as RepairRecordItem;
}

// 创建报修记录
export async function createRepairRecordApi(
  params: CreateRepairRecordParams,
): Promise<void> {
  await requestClient.post('/api/RepairRecord', params);
}

// 更新报修记录
export async function updateRepairRecordApi(
  params: UpdateRepairRecordParams,
): Promise<void> {
  await requestClient.put('/api/RepairRecord', params);
}

// 删除报修记录
export async function deleteRepairRecordApi(id: string): Promise<void> {
  await requestClient.delete(`/api/RepairRecord/${id}`);
}



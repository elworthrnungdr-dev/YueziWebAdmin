import { requestClient } from '#/api/request';

export interface CustomerAssessmentListParams {
  CareDateStart?: string;
  CareDateEnd?: string;
  CreatedAtStart?: string;
  CreatedAtEnd?: string;
  CareType?: number;
  PageIndex?: number;
  PageSize?: number;
  OrderBy?: string;
  IsAsc?: boolean;
}

export interface BackendCustomerAssessmentItem {
  id: string;
  customerId?: string;
  tContractId?: string;
  contractNo?: string;
  careType: number;
  careTypeText?: string;
  babyId?: string;
  careDate?: string;
  careTime?: string;
  nurseId?: string;
  otherConditions?: string;
  nurseSignature?: string;
  careContent?: string;
  careData?: string;
  specialNotes?: string;
  nextCareTime?: string;
  attachments?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendCustomerAssessmentPage {
  pageNo: number;
  pageSize: number;
  totalCount: number;
  pages: number;
  data: BackendCustomerAssessmentItem[];
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface CustomerAssessmentItem extends BackendCustomerAssessmentItem {}

export interface CustomerAssessmentListResult {
  items: CustomerAssessmentItem[];
  total: number;
}

export interface CreateCustomerAssessmentParams {
  createdByType: number;
  sourceReferenceId: string;
  careType: number;
  babyId?: string;
  careDate: string;
  nurseId: string;
  otherConditions?: string;
  nurseSignature?: string;
  careContent: string;
  careData: string;
  specialNotes?: string;
  nextCareTime?: string;
  attachments?: string;
  remark?: string;
}

export interface UpdateCustomerAssessmentParams
  extends CreateCustomerAssessmentParams {
  id: string;
}

/**
 * 获取产妇护理记录列表
 * 接口：GET /api/CustomerAssessment/list
 */
export async function getCustomerAssessmentListApi(
  params: CustomerAssessmentListParams,
): Promise<CustomerAssessmentListResult> {
  const page = await requestClient.get<BackendCustomerAssessmentPage>(
    '/api/CustomerAssessment/list',
    { params },
  );
  const list: BackendCustomerAssessmentItem[] = page?.data ?? [];
  return {
    items: Array.isArray(list) ? list : [],
    total: page?.totalCount || 0,
  };
}

/**
 * 获取产妇护理记录详情
 * 接口：GET /api/CustomerAssessment/{id}
 */
export async function getCustomerAssessmentDetailApi(
  id: string,
): Promise<CustomerAssessmentItem> {
  const response = await requestClient.get<BackendCustomerAssessmentItem>(
    `/api/CustomerAssessment/${id}`,
  );
  return response as unknown as CustomerAssessmentItem;
}

/**
 * 创建产妇护理记录
 * 接口：POST /api/CustomerAssessment
 */
export async function createCustomerAssessmentApi(
  params: CreateCustomerAssessmentParams,
): Promise<void> {
  await requestClient.post('/api/CustomerAssessment', params);
}

/**
 * 更新产妇护理记录
 * 接口：PUT /api/CustomerAssessment
 */
export async function updateCustomerAssessmentApi(
  params: UpdateCustomerAssessmentParams,
): Promise<void> {
  await requestClient.put('/api/CustomerAssessment', params);
}

/**
 * 删除产妇护理记录
 * 接口：DELETE /api/CustomerAssessment/{id}
 */
export async function deleteCustomerAssessmentApi(id: string): Promise<void> {
  await requestClient.delete(`/api/CustomerAssessment/${id}`);
}


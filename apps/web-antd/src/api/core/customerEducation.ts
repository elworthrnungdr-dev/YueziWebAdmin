import { requestClient } from '#/api/request';

export interface CustomerEducationListParams {
  CustomerId?: string;
  TContractId?: string;
  BabyId?: string;
  ContractNo?: string;
  EducationDateStart?: string;
  EducationDateEnd?: string;
  CreatedAtStart?: string;
  CreatedAtEnd?: string;
  EducationType?: number;
  EducationMethod?: number;
  IsUnderstood?: number;
  PageIndex?: number;
  PageSize?: number;
  OrderBy?: string;
  IsAsc?: boolean;
}

export interface BackendCustomerEducationItem {
  id: string;
  customerId?: string;
  tContractId?: string;
  contractNo?: string;
  educationType: number;
  educationTypeText?: string;
  babyId?: string;
  educationDate?: string;
  educationTime?: string;
  educatorId?: string;
  educationContent?: string;
  educationMethod?: number;
  educationMethodText?: string;
  isUnderstood?: number;
  isUnderstoodText?: string;
  customerFeedback?: string;
  customerSign?: string;
  witnessEmployeeId?: string;
  attachments?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendCustomerEducationPage {
  pageNo: number;
  pageSize: number;
  totalCount: number;
  pages: number;
  data: BackendCustomerEducationItem[];
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface CustomerEducationItem extends BackendCustomerEducationItem {}

export interface CustomerEducationListResult {
  items: CustomerEducationItem[];
  total: number;
}

export interface CreateCustomerEducationParams {
  createdByType: number;
  sourceReferenceId: string;
  educationType: number;
  babyId?: string;
  educationDate: string;
  educatorId: string;
  educationContent: string;
  educationMethod?: number;
  isUnderstood?: number;
  customerFeedback?: string;
  customerSign?: string;
  witnessEmployeeId?: string;
  attachments?: string;
  remark?: string;
}

export interface UpdateCustomerEducationParams
  extends CreateCustomerEducationParams {
  id: string;
}

/**
 * 获取护理部入所宣教列表
 * 接口：GET /api/CustomerEducation/list
 */
export async function getCustomerEducationListApi(
  params: CustomerEducationListParams,
): Promise<CustomerEducationListResult> {
  const page = await requestClient.get<BackendCustomerEducationPage>(
    '/api/CustomerEducation/list',
    { params },
  );
  const list: BackendCustomerEducationItem[] = page?.data ?? [];
  return {
    items: Array.isArray(list) ? list : [],
    total: page?.totalCount || 0,
  };
}

/**
 * 获取护理部入所宣教详情
 * 接口：GET /api/CustomerEducation/{id}
 */
export async function getCustomerEducationDetailApi(
  id: string,
): Promise<CustomerEducationItem> {
  const response = await requestClient.get<BackendCustomerEducationItem>(
    `/api/CustomerEducation/${id}`,
  );
  return response as unknown as CustomerEducationItem;
}

/**
 * 创建护理部入所宣教
 * 接口：POST /api/CustomerEducation
 */
export async function createCustomerEducationApi(
  params: CreateCustomerEducationParams,
): Promise<void> {
  await requestClient.post('/api/CustomerEducation', params);
}

/**
 * 更新护理部入所宣教
 * 接口：PUT /api/CustomerEducation
 */
export async function updateCustomerEducationApi(
  params: UpdateCustomerEducationParams,
): Promise<void> {
  await requestClient.put('/api/CustomerEducation', params);
}

/**
 * 删除护理部入所宣教
 * 接口：DELETE /api/CustomerEducation/{id}
 */
export async function deleteCustomerEducationApi(id: string): Promise<void> {
  await requestClient.delete(`/api/CustomerEducation/${id}`);
}



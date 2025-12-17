import { requestClient } from '#/api/request';

export interface EmployeeHealthCertListParams {
  EmployeeName?: string;
  IssueDateEnd?: string;
  PhysicalExamDateStart?: string;
  PhysicalExamDateEnd?: string;
  CreatedAtStart?: string;
  CreatedAtEnd?: string;
  PageIndex?: number;
  PageSize?: number;
  OrderBy?: string;
  IsAsc?: boolean;
}

export interface BackendEmployeeHealthCertItem {
  id: string;
  employeeId: string;
  employeeName?: string;
  certNumber: string;
  certType: number;
  certTypeText?: string;
  issuingAuthority?: string;
  issueDate: string;
  expiryDate: string;
  certStatus: number;
  certStatusText?: string;
  certFrontImage?: string;
  certBackImage?: string;
  attachmentUrls?: string;
  physicalExamDate?: string;
  physicalExamHospital?: string;
  physicalExamResult: number;
  physicalExamResultText?: string;
  nextExamDate?: string;
  remark?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendEmployeeHealthCertPage {
  pageNo: number;
  pageSize: number;
  totalCount: number;
  pages: number;
  data: BackendEmployeeHealthCertItem[];
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface EmployeeHealthCertItem extends BackendEmployeeHealthCertItem {}

export interface EmployeeHealthCertListResult {
  items: EmployeeHealthCertItem[];
  total: number;
}

export interface CreateEmployeeHealthCertParams {
  employeeId: string;
  certNumber: string;
  certType?: number;
  issuingAuthority?: string;
  issueDate: string;
  expiryDate: string;
  certStatus?: number;
  certFrontImage?: string;
  certBackImage?: string;
  attachmentUrls?: string;
  physicalExamDate?: string;
  physicalExamHospital?: string;
  physicalExamResult?: number;
  nextExamDate?: string;
  remark?: string;
}

export interface UpdateEmployeeHealthCertParams
  extends CreateEmployeeHealthCertParams {
  id: string;
}

/**
 * 获取健康证列表
 * 接口：GET /api/EmployeeHealthCert/list
 */
export async function getEmployeeHealthCertListApi(
  params: EmployeeHealthCertListParams,
): Promise<EmployeeHealthCertListResult> {
  const page = await requestClient.get<BackendEmployeeHealthCertPage>(
    '/api/EmployeeHealthCert/list',
    { params },
  );
  const list: BackendEmployeeHealthCertItem[] = page?.data ?? [];
  return {
    items: Array.isArray(list) ? list : [],
    total: page?.totalCount || 0,
  };
}

/**
 * 获取健康证详情
 * 接口：GET /api/EmployeeHealthCert/{id}
 */
export async function getEmployeeHealthCertDetailApi(
  id: string,
): Promise<EmployeeHealthCertItem> {
  const response = await requestClient.get<BackendEmployeeHealthCertItem>(
    `/api/EmployeeHealthCert/${id}`,
  );
  return response as unknown as EmployeeHealthCertItem;
}

/**
 * 创建健康证
 * 接口：POST /api/EmployeeHealthCert
 */
export async function createEmployeeHealthCertApi(
  params: CreateEmployeeHealthCertParams,
): Promise<void> {
  await requestClient.post('/api/EmployeeHealthCert', params);
}

/**
 * 更新健康证
 * 接口：PUT /api/EmployeeHealthCert
 */
export async function updateEmployeeHealthCertApi(
  params: UpdateEmployeeHealthCertParams,
): Promise<void> {
  await requestClient.put('/api/EmployeeHealthCert', params);
}

/**
 * 删除健康证
 * 接口：DELETE /api/EmployeeHealthCert/{id}
 */
export async function deleteEmployeeHealthCertApi(id: string): Promise<void> {
  await requestClient.delete(`/api/EmployeeHealthCert/${id}`);
}





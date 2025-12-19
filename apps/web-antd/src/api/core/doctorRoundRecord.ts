import { requestClient } from '#/api/request';

export interface DoctorRoundRecordListParams {
  DoctorName?: string;
  BabyId?: string;
  RoundDateStart?: string;
  RoundDateEnd?: string;
  CreatedAtStart?: string;
  CreatedAtEnd?: string;
  RoundType?: number;
  IsUrgent?: number;
  PageIndex?: number;
  PageSize?: number;
  OrderBy?: string;
  IsAsc?: boolean;
}

export interface BackendDoctorRoundRecordItem {
  id: string;
  customerId?: string;
  tContractId?: string;
  contractNo?: string;
  roundType: number;
  roundTypeText?: string;
  babyId?: string;
  doctorId?: string;
  doctorName?: string;
  doctorDepartment?: string;
  roundDate?: string;
  roundTime?: string;
  symptoms?: string;
  diagnosis?: string;
  treatment?: string;
  prescription?: string;
  nextRoundDate?: string;
  isUrgent: number;
  isUrgentText?: string;
  attachments?: string;
  remark?: string;
  createdAt?: string;
}

export interface BackendDoctorRoundRecordPage {
  pageNo: number;
  pageSize: number;
  totalCount: number;
  pages: number;
  data: BackendDoctorRoundRecordItem[];
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface DoctorRoundRecordItem extends BackendDoctorRoundRecordItem {}

export interface DoctorRoundRecordListResult {
  items: DoctorRoundRecordItem[];
  total: number;
}

export interface CreateDoctorRoundRecordParams {
  createdByType: number;
  sourceReferenceId: string;
  roundType: number;
  babyId?: string;
  doctorId: string;
  roundDate: string;
  roundTime: string;
  symptoms?: string;
  diagnosis?: string;
  treatment?: string;
  prescription?: string;
  nextRoundDate?: string;
  isUrgent: number;
  attachments?: string;
  remark?: string;
}

export interface UpdateDoctorRoundRecordParams
  extends CreateDoctorRoundRecordParams {
  id: string;
}

/**
 * 获取新生儿科医生巡房列表
 * 接口：GET /api/DoctorRoundRecord/list
 */
export async function getDoctorRoundRecordListApi(
  params: DoctorRoundRecordListParams,
): Promise<DoctorRoundRecordListResult> {
  const page = await requestClient.get<BackendDoctorRoundRecordPage>(
    '/api/DoctorRoundRecord/list',
    { params },
  );
  const list: BackendDoctorRoundRecordItem[] = page?.data ?? [];
  return {
    items: Array.isArray(list) ? list : [],
    total: page?.totalCount || 0,
  };
}

/**
 * 获取新生儿科医生巡房详情
 * 接口：GET /api/DoctorRoundRecord/{id}
 */
export async function getDoctorRoundRecordDetailApi(
  id: string,
): Promise<DoctorRoundRecordItem> {
  const response = await requestClient.get<BackendDoctorRoundRecordItem>(
    `/api/DoctorRoundRecord/${id}`,
  );
  return response as unknown as DoctorRoundRecordItem;
}

/**
 * 创建新生儿科医生巡房
 * 接口：POST /api/DoctorRoundRecord
 */
export async function createDoctorRoundRecordApi(
  params: CreateDoctorRoundRecordParams,
): Promise<void> {
  await requestClient.post('/api/DoctorRoundRecord', params);
}

/**
 * 更新新生儿科医生巡房
 * 接口：PUT /api/DoctorRoundRecord
 */
export async function updateDoctorRoundRecordApi(
  params: UpdateDoctorRoundRecordParams,
): Promise<void> {
  await requestClient.put('/api/DoctorRoundRecord', params);
}

/**
 * 删除新生儿科医生巡房
 * 接口：DELETE /api/DoctorRoundRecord/{id}
 */
export async function deleteDoctorRoundRecordApi(id: string): Promise<void> {
  await requestClient.delete(`/api/DoctorRoundRecord/${id}`);
}



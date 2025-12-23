import { requestClient } from '#/api/request';

export interface MaintenanceRecordListParams {
  ExecutorName?: string;
  MaintenanceDateStart?: string;
  MaintenanceDateEnd?: string;
  PlanStartDateStart?: string;
  PlanStartDateEnd?: string;
  PlanEndDateStart?: string;
  PlanEndDateEnd?: string;
  ActualStartDateStart?: string;
  ActualStartDateEnd?: string;
  ActualEndDateStart?: string;
  ActualEndDateEnd?: string;
  CompletedTimeStart?: string;
  CompletedTimeEnd?: string;
  CreatedAtStart?: string;
  CreatedAtEnd?: string;
  UpdatedAtStart?: string;
  UpdatedAtEnd?: string;
  PageIndex?: number;
  PageSize?: number;
  OrderBy?: string;
  IsAsc?: boolean;
}

export interface BackendMaintenanceRecordItem {
  id: string;
  recordNo?: string;
  projectId?: string;
  maintenanceType?: number;
  maintenanceTypeText?: string;
  maintenanceDate?: string;
  maintenanceContent?: string;
  maintenanceStatus?: number;
  maintenanceStatusText?: string;
  planStartDate?: string;
  planEndDate?: string;
  actualStartDate?: string;
  actualEndDate?: string;
  isUrgent?: number;
  isUrgentText?: string;
  executorId?: string;
  executorName?: string;
  supervisorId?: string;
  completedTime?: string;
  verificationResult?: string;
  verificationEmployeeId?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendMaintenanceRecordPage {
  pageNo: number;
  pageSize: number;
  totalCount: number;
  pages: number;
  data: BackendMaintenanceRecordItem[];
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export interface MaintenanceRecordListResult {
  items: BackendMaintenanceRecordItem[];
  total: number;
}

export interface CreateMaintenanceRecordParams {
  projectId: string;
  maintenanceType: number;
  maintenanceDate: string;
  maintenanceContent: string;
  isUrgent: number;
  planStartDate?: string;
  planEndDate?: string;
  remark?: string;
}

export interface UpdateMaintenanceRecordParams extends CreateMaintenanceRecordParams {
  id: string;
}

export interface UpdateMaintenanceStatusParams {
  id: string;
  maintenanceStatus: number;
  actualStartDate?: string;
  actualEndDate?: string;
  executorId?: string;
  supervisorId?: string;
  completedTime?: string;
  verificationResult?: number;
  verificationEmployeeId?: string;
  remark?: string;
}

export async function getMaintenanceRecordListApi(
  params: MaintenanceRecordListParams,
): Promise<MaintenanceRecordListResult> {
  const page = await requestClient.get<BackendMaintenanceRecordPage>('/api/MaintenanceRecord/list', {
    params,
  });
  const list: BackendMaintenanceRecordItem[] = page?.data ?? [];
  return {
    items: Array.isArray(list) ? list : [],
    total: page?.totalCount || 0,
  };
}

export async function getMaintenanceRecordDetailApi(id: string): Promise<BackendMaintenanceRecordItem> {
  return requestClient.get<BackendMaintenanceRecordItem>(`/api/MaintenanceRecord/${id}`);
}

export async function createMaintenanceRecordApi(params: CreateMaintenanceRecordParams): Promise<void> {
  await requestClient.post('/api/MaintenanceRecord', params);
}

export async function updateMaintenanceRecordApi(params: UpdateMaintenanceRecordParams): Promise<void> {
  await requestClient.put('/api/MaintenanceRecord', params);
}

export async function deleteMaintenanceRecordApi(id: string): Promise<void> {
  await requestClient.delete(`/api/MaintenanceRecord/${id}`);
}

export async function updateMaintenanceRecordStatusApi(
  params: UpdateMaintenanceStatusParams,
): Promise<void> {
  await requestClient.put(`/api/MaintenanceRecord/${params.id}/status`, params);
}


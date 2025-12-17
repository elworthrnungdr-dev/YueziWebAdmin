import { requestClient } from '#/api/request';

export interface FrontdeskAppointmentListParams {
  ReferrerName?: string;
  VisitorName?: string;
  AppointmentNo?: string;
  ExpectedDeliveryDateStart?: string;
  ExpectedDeliveryDateEnd?: string;
  AppointmentDateStart?: string;
  AppointmentDateEnd?: string;
  ConvertTimeStart?: string;
  ConvertTimeEnd?: string;
  ArrivalTimeStart?: string;
  ArrivalTimeEnd?: string;
  DepartureTimeStart?: string;
  DepartureTimeEnd?: string;
  RemindTimeStart?: string;
  RemindTimeEnd?: string;
  CreatedAtStart?: string;
  CreatedAtEnd?: string;
  UpdatedAtStart?: string;
  UpdatedAtEnd?: string;
  AppointmentType?: number;
  AppointmentSource?: number;
  IsExistingCustomer?: number;
  ReferrerType?: number;
  AppointmentStatus?: number;
  IsConverted?: number;
  PageIndex?: number;
  PageSize?: number;
  OrderBy?: string;
  IsAsc?: boolean;
}

export interface BackendFrontdeskAppointmentItem {
  id: string;
  appointmentNo?: string;
  appointmentType: number;
  appointmentTypeText?: string;
  appointmentSource: number;
  appointmentSourceText?: string;
  isExistingCustomer: number;
  isExistingCustomerText?: string;
  customerId?: string;
  tContractId?: string;
  referrerType?: number;
  referrerTypeText?: string;
  referrerId?: string;
  referrerName?: string;
  referrerPhone?: string;
  visitorName?: string;
  visitorPhone?: string;
  visitorWechat?: string;
  expectedDeliveryDate?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  plannedDuration?: number;
  branchId?: string;
  appointmentPurpose?: string;
  receptionEmployeeId?: string;
  relatedEmployeeId?: string;
  roomId?: string;
  appointmentStatus: number;
  appointmentStatusText?: string;
  isConverted?: number;
  isConvertedText?: string;
  convertTime?: string;
  convertedBy?: string;
  convertedCustomerId?: string;
  convertedContractId?: string;
  convertedContractNo?: string;
  conversionNotes?: string;
  arrivalTime?: string;
  departureTime?: string;
  actualDuration?: number;
  isReminded?: number;
  remindTime?: string;
  cancelReason?: string;
  companionCount?: number;
  specialRequirements?: string;
  remark?: string;
  operatorId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendFrontdeskAppointmentPage {
  pageNo: number;
  pageSize: number;
  totalCount: number;
  pages: number;
  data: BackendFrontdeskAppointmentItem[];
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface FrontdeskAppointmentItem
  extends BackendFrontdeskAppointmentItem {}

export interface FrontdeskAppointmentListResult {
  items: FrontdeskAppointmentItem[];
  total: number;
}

export interface CreateFrontdeskAppointmentParams {
  appointmentType: number;
  appointmentSource: number;
  isExistingCustomer: number;
  customerId?: string;
  salesLeadId?: string;
  referrerType?: number;
  referrerId?: string;
  referrerName?: string;
  referrerPhone?: string;
  visitorName?: string;
  visitorPhone?: string;
  visitorWechat?: string;
  expectedDeliveryDate?: string;
  appointmentDate: string;
  appointmentTime: string;
  plannedDuration?: number;
  appointmentPurpose: string;
  receptionEmployeeId?: string;
  relatedEmployeeId?: string;
  roomId?: string;
  appointmentStatus: number;
  arrivalTime?: string;
  departureTime?: string;
  actualDuration?: number;
  companionCount?: number;
  specialRequirements?: string;
  remark?: string;
}

export interface UpdateFrontdeskAppointmentParams
  extends CreateFrontdeskAppointmentParams {
  id: string;
}

export interface UpdateAppointmentStatusParams {
  id: string;
  appointmentStatus: number;
  cancelReason?: string;
  receptionEmployeeId?: string;
  arrivalTime?: string;
  departureTime?: string;
  actualDuration?: number;
}

/**
 * 获取访客登记列表
 * 接口：GET /api/FrondeskAppointment/list
 */
export async function getFrontdeskAppointmentListApi(
  params: FrontdeskAppointmentListParams,
): Promise<FrontdeskAppointmentListResult> {
  const page = await requestClient.get<BackendFrontdeskAppointmentPage>(
    '/api/FrondeskAppointment/list',
    { params },
  );
  const list: BackendFrontdeskAppointmentItem[] = page?.data ?? [];
  return {
    items: Array.isArray(list) ? list : [],
    total: page?.totalCount || 0,
  };
}

/**
 * 获取访客登记详情
 * 接口：GET /api/FrondeskAppointment/{id}
 */
export async function getFrontdeskAppointmentDetailApi(
  id: string,
): Promise<FrontdeskAppointmentItem> {
  const response = await requestClient.get<BackendFrontdeskAppointmentItem>(
    `/api/FrondeskAppointment/${id}`,
  );
  return response as unknown as FrontdeskAppointmentItem;
}

/**
 * 创建访客登记
 * 接口：POST /api/FrondeskAppointment
 */
export async function createFrontdeskAppointmentApi(
  params: CreateFrontdeskAppointmentParams,
): Promise<void> {
  await requestClient.post('/api/FrondeskAppointment', params);
}

/**
 * 更新访客登记
 * 接口：PUT /api/FrondeskAppointment
 */
export async function updateFrontdeskAppointmentApi(
  params: UpdateFrontdeskAppointmentParams,
): Promise<void> {
  await requestClient.put('/api/FrondeskAppointment', params);
}

/**
 * 删除访客登记
 * 接口：DELETE /api/FrondeskAppointment/{id}
 */
export async function deleteFrontdeskAppointmentApi(id: string): Promise<void> {
  await requestClient.delete(`/api/FrondeskAppointment/${id}`);
}

/**
 * 更新预约状态
 * 接口：PUT /api/FrondeskAppointment/status
 */
export async function updateAppointmentStatusApi(
  params: UpdateAppointmentStatusParams,
): Promise<void> {
  await requestClient.put('/api/FrondeskAppointment/status', params);
}




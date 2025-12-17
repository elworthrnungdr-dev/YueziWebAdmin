import { requestClient } from '#/api/request';

export interface PaymentListParams {
  ContractNo?: string;
  PaymentTimeStart?: string;
  PaymentTimeEnd?: string;
  CreateTimeStart?: string;
  CreateTimeEnd?: string;
  PageIndex?: number;
  PageSize?: number;
  OrderBy?: string;
  IsAsc?: boolean;
}

export interface BackendPaymentItem {
  id: string;
  tContractId: string;
  contractNo: string;
  customerId: string;
  paymentType: number;
  paymentTypeText?: string;
  paymentCategory: number;
  paymentCategoryText?: string;
  relatedItemType?: string;
  relatedItemId?: string;
  amount: number;
  paymentMethod: number;
  paymentMethodText?: string;
  paymentStatus: number;
  paymentStatusText?: string;
  paymentTime?: string;
  transactionNo?: string;
  invoiceNo?: string;
  invoiceStatus: number;
  invoiceStatusText?: string;
  remark?: string;
  operatorId?: string;
  createTime?: string;
  updateTime?: string;
}

export interface BackendPaymentPage {
  pageNo: number;
  pageSize: number;
  totalCount: number;
  pages: number;
  data: BackendPaymentItem[];
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface BackendPaymentResponse {
  success: boolean;
  message: string;
  data: BackendPaymentPage;
  code: number;
  timestamp: string;
}

export interface PaymentItem {
  id: string;
  tContractId: string;
  contractNo: string;
  customerId: string;
  paymentType: number;
  paymentTypeText?: string;
  paymentCategory: number;
  paymentCategoryText?: string;
  relatedItemType?: string;
  relatedItemId?: string;
  amount: number;
  paymentMethod: number;
  paymentMethodText?: string;
  paymentStatus: number;
  paymentStatusText?: string;
  paymentTime?: string;
  transactionNo?: string;
  invoiceNo?: string;
  invoiceStatus: number;
  invoiceStatusText?: string;
  remark?: string;
  operatorId?: string;
  createTime?: string;
  updateTime?: string;
}

export interface PaymentListResult {
  items: PaymentItem[];
  total: number;
}

export interface CreatePaymentParams {
  tContractId: string;
  paymentType: number;
  paymentCategory: number;
  amount: number;
  paymentMethod: number;
  paymentStatus: number;
  paymentTime?: string;
  transactionNo?: string;
  invoiceNo?: string;
  invoiceStatus: number;
  remark?: string;
}

export interface UpdatePaymentParams extends CreatePaymentParams {
  id: string;
}

/**
 * 获取付款信息列表
 */
export async function getPaymentListApi(
  params: PaymentListParams,
): Promise<PaymentListResult> {
  const page = await requestClient.get<BackendPaymentPage>(
    '/api/Payment/list',
    { params },
  );
  const list: BackendPaymentItem[] = page?.data ?? [];
  return {
    items: Array.isArray(list) ? list : [],
    total: page?.totalCount || 0,
  };
}

/**
 * 获取付款信息详情
 * 接口：GET /api/Payment/{id}
 */
export async function getPaymentDetailApi(id: string): Promise<PaymentItem> {
  const response = await requestClient.get<BackendPaymentItem>(
    `/api/Payment/${id}`,
  );
  return response as unknown as PaymentItem;
}

/**
 * 创建付款信息
 * 接口：POST /api/Payment
 */
export async function createPaymentApi(
  params: CreatePaymentParams,
): Promise<void> {
  await requestClient.post('/api/Payment', params);
}

/**
 * 更新付款信息
 * 接口：PUT /api/Payment
 */
export async function updatePaymentApi(
  params: UpdatePaymentParams,
): Promise<void> {
  await requestClient.put('/api/Payment', params);
}

/**
 * 删除付款信息
 * 接口：DELETE /api/Payment/{id}
 */
export async function deletePaymentApi(id: string): Promise<void> {
  await requestClient.delete(`/api/Payment/${id}`);
}


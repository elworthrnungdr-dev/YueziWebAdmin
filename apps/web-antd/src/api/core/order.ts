import { requestClient } from '#/api/request';

export interface MealOrderListParams {
  ContractNo?: string;
  OrderDateStart?: string;
  OrderDateEnd?: string;
  CreatedAtStart?: string;
  CreatedAtEnd?: string;
  PageIndex?: number;
  PageSize?: number;
  OrderBy?: string;
  IsAsc?: boolean;
}

export interface BackendMealOrderItem {
  id: string;
  customerId: string;
  tContractId: string;
  contractNo: string;
  orderDate?: string;
  mealType: number;
  mealTypeText?: string;
  mealTime: string;
  menuName: string;
  mealContent: string;
  calories?: number;
  specialRequirements?: string;
  customerFeedback?: string;
  paymentType: number;
  paymentTypeText?: string;
  unitPrice: number;
  quantity: number;
  totalAmount: number;
  paymentStatus: number;
  paymentStatusText?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendMealOrderPage {
  pageNo: number;
  pageSize: number;
  totalCount: number;
  pages: number;
  data: BackendMealOrderItem[];
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface MealOrderItem extends BackendMealOrderItem {}

export interface MealOrderListResult {
  items: MealOrderItem[];
  total: number;
}

export interface CreateMealOrderParams {
  customerId: string;
  orderDate?: string;
  mealType: number;
  mealTime: string;
  menuName: string;
  mealContent: string;
  specialRequirements?: string;
  customerFeedback?: string;
  paymentType: number;
  unitPrice: number;
  quantity: number;
  totalAmount: number;
  paymentStatus: number;
  remark?: string;
}

export interface UpdateMealOrderParams extends CreateMealOrderParams {
  id: string;
}

/**
 * 获取订餐记录列表
 */
export async function getMealOrderListApi(
  params: MealOrderListParams,
): Promise<MealOrderListResult> {
  const page = await requestClient.get<BackendMealOrderPage>(
    '/api/CustomerMealOrder/list',
    { params },
  );
  const list: BackendMealOrderItem[] = page?.data ?? [];
  return {
    items: Array.isArray(list) ? list : [],
    total: page?.totalCount || 0,
  };
}

/**
 * 获取订餐记录详情
 * 接口：GET /api/CustomerMealOrder/{id}
 */
export async function getMealOrderDetailApi(
  id: string,
): Promise<MealOrderItem> {
  const response = await requestClient.get<BackendMealOrderItem>(
    `/api/CustomerMealOrder/${id}`,
  );
  return response as unknown as MealOrderItem;
}

/**
 * 创建订餐记录
 * 接口：POST /api/CustomerMealOrder
 */
export async function createMealOrderApi(
  params: CreateMealOrderParams,
): Promise<void> {
  await requestClient.post('/api/CustomerMealOrder', params);
}

/**
 * 更新订餐记录
 * 接口：PUT /api/CustomerMealOrder
 */
export async function updateMealOrderApi(
  params: UpdateMealOrderParams,
): Promise<void> {
  await requestClient.put('/api/CustomerMealOrder', params);
}

/**
 * 删除订餐记录
 * 接口：DELETE /api/CustomerMealOrder/{id}
 */
export async function deleteMealOrderApi(id: string): Promise<void> {
  await requestClient.delete(`/api/CustomerMealOrder/${id}`);
}



import { requestClient } from '#/api/request';

export interface CustomerFeedbackListParams {
  CustomerId?: string;
  FeedbackTimeStart?: string;
  FeedbackTimeEnd?: string;
  ResponseTimeStart?: string;
  ResponseTimeEnd?: string;
  CreatedAtStart?: string;
  CreatedAtEnd?: string;
  FeedbackType?: number;
  FeedbackCategory?: number;
  RatingScore?: number;
  FeedbackChannel?: number;
  ResponseStatus?: number;
  IsAnonymous?: number;
  ContactPermission?: number;
  CustomerSatisfaction?: number;
  IsResolved?: number;
  PageIndex?: number;
  PageSize?: number;
  OrderBy?: string;
  IsAsc?: boolean;
}

export interface BackendCustomerFeedbackItem {
  id: string;
  customerId?: string;
  tContractId?: string;
  contractNo?: string;
  feedbackType: number;
  feedbackTypeText?: string;
  feedbackCategory: number;
  feedbackCategoryText?: string;
  feedbackContent?: string;
  ratingScore?: number;
  ratingScoreText?: string;
  ratingDimensions?: string;
  feedbackChannel: number;
  feedbackChannelText?: string;
  feedbackTime?: string;
  respondentId?: string;
  responseStatus?: number;
  responseStatusText?: string;
  responseContent?: string;
  responderId?: string;
  responseTime?: string;
  isAnonymous: number;
  isAnonymousText?: string;
  contactPermission: number;
  contactPermissionText?: string;
  attachmentUrls?: string;
  followUpPlan?: string;
  customerSatisfaction?: number;
  customerSatisfactionText?: string;
  isResolved?: number;
  isResolvedText?: string;
  resolutionDate?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendCustomerFeedbackPage {
  pageNo: number;
  pageSize: number;
  totalCount: number;
  pages: number;
  data: BackendCustomerFeedbackItem[];
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface CustomerFeedbackItem extends BackendCustomerFeedbackItem {}

export interface CustomerFeedbackListResult {
  items: CustomerFeedbackItem[];
  total: number;
}

export interface CreateCustomerFeedbackParams {
  customerId: string;
  feedbackType: number;
  feedbackCategory: number;
  feedbackContent: string;
  ratingScore?: number;
  ratingDimensions?: string;
  feedbackChannel: number;
  feedbackTime: string;
  respondentId?: string;
  isAnonymous: number;
  contactPermission: number;
  attachmentUrls?: string;
  remark?: string;
}

export interface UpdateCustomerFeedbackParams
  extends CreateCustomerFeedbackParams {
  id: string;
}

export interface RespondCustomerFeedbackParams {
  id: string;
  responseStatus: number;
  responseContent?: string;
  responderId?: string;
  responseTime?: string;
  followUpPlan?: string;
  customerSatisfaction?: number;
  isResolved?: number;
  resolutionDate?: string;
}

/**
 * 获取客户反馈列表
 * 接口：GET /api/CustomerFeedback/list
 */
export async function getCustomerFeedbackListApi(
  params: CustomerFeedbackListParams,
): Promise<CustomerFeedbackListResult> {
  const page = await requestClient.get<BackendCustomerFeedbackPage>(
    '/api/CustomerFeedback/list',
    { params },
  );
  const list: BackendCustomerFeedbackItem[] = page?.data ?? [];
  return {
    items: Array.isArray(list) ? list : [],
    total: page?.totalCount || 0,
  };
}

/**
 * 获取客户反馈详情
 * 接口：GET /api/CustomerFeedback/{id}
 */
export async function getCustomerFeedbackDetailApi(
  id: string,
): Promise<CustomerFeedbackItem> {
  const response = await requestClient.get<BackendCustomerFeedbackItem>(
    `/api/CustomerFeedback/${id}`,
  );
  return response as unknown as CustomerFeedbackItem;
}

/**
 * 创建客户反馈
 * 接口：POST /api/CustomerFeedback
 */
export async function createCustomerFeedbackApi(
  params: CreateCustomerFeedbackParams,
): Promise<void> {
  await requestClient.post('/api/CustomerFeedback', params);
}

/**
 * 更新客户反馈
 * 接口：PUT /api/CustomerFeedback
 */
export async function updateCustomerFeedbackApi(
  params: UpdateCustomerFeedbackParams,
): Promise<void> {
  await requestClient.put('/api/CustomerFeedback', params);
}

/**
 * 删除客户反馈
 * 接口：DELETE /api/CustomerFeedback/{id}
 */
export async function deleteCustomerFeedbackApi(id: string): Promise<void> {
  await requestClient.delete(`/api/CustomerFeedback/${id}`);
}

/**
 * 处理/回复客户反馈
 * 接口：PUT /api/CustomerFeedback/response
 */
export async function respondCustomerFeedbackApi(
  params: RespondCustomerFeedbackParams,
): Promise<void> {
  await requestClient.put('/api/CustomerFeedback/response', params);
}


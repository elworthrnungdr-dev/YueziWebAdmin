import { requestClient } from '#/api/request';

export interface CustomerFeedbackListParams {
  CustomerId?: string;
  FeedbackTimeStart?: string;
  FeedbackTimeEnd?: string;
  ResponseTimeStart?: string;
  ResponseTimeEnd?: string;
  FeedbackType?: number;
  FeedbackCategory?: number;
  FeedbackChannel?: number;
  ResponseStatus?: number;
  IsResolved?: number;
  PageIndex?: number;
  PageSize?: number;
  OrderBy?: string;
  IsAsc?: boolean;
}

export interface BackendCustomerFeedbackItem {
  id: string;
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
  responseStatus?: number;
  responseContent?: string;
  responderId?: string;
  responseTime?: string;
  followUpPlan?: string;
  customerSatisfaction?: number;
  isResolved?: number;
  resolutionDate?: string;
  createdAt?: string;
  feedbackTypeText?: string;
  feedbackCategoryText?: string;
  feedbackChannelText?: string;
  responseStatusText?: string;
  isAnonymousText?: string;
  contactPermissionText?: string;
  isResolvedText?: string;
}

export interface BackendCustomerFeedbackPage {
  pageNo: number;
  pageSize: number;
  totalCount: number;
  pages: number;
  data: BackendCustomerFeedbackItem[];
  hasPrevious?: boolean;
  hasNext?: boolean;
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

export interface UpdateCustomerFeedbackParams extends CreateCustomerFeedbackParams {
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

// 获取客户反馈列表
export async function getCustomerFeedbackListApi(
  params: CustomerFeedbackListParams,
): Promise<CustomerFeedbackListResult> {
  const page = await requestClient.get<BackendCustomerFeedbackPage>('/api/CustomerFeedback/list', {
    params,
  });
  const list: BackendCustomerFeedbackItem[] = page?.data ?? [];
  const items: CustomerFeedbackItem[] = Array.isArray(list) ? list : [];
  return {
    items,
    total: page?.totalCount ?? items.length,
  };
}

// 获取客户反馈详情
export async function getCustomerFeedbackDetailApi(
  id: string,
): Promise<BackendCustomerFeedbackItem> {
  return requestClient.get<BackendCustomerFeedbackItem>(`/api/CustomerFeedback/${id}`);
}

// 创建客户反馈
export async function createCustomerFeedbackApi(
  data: CreateCustomerFeedbackParams,
): Promise<void> {
  await requestClient.post('/api/CustomerFeedback', data, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

// 更新客户反馈
export async function updateCustomerFeedbackApi(
  data: UpdateCustomerFeedbackParams,
): Promise<void> {
  await requestClient.put('/api/CustomerFeedback', data, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

// 删除客户反馈
export async function deleteCustomerFeedbackApi(id: string): Promise<void> {
  await requestClient.delete(`/api/CustomerFeedback/${id}`);
}

// 处理/回复客户反馈
export async function respondCustomerFeedbackApi(
  data: RespondCustomerFeedbackParams,
): Promise<void> {
  await requestClient.post('/api/CustomerFeedback/respond', data, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}


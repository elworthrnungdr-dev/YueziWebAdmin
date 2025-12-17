import { requestClient } from '#/api/request';

export interface DailyCheckListParams {
  VisitorName?: string;
  VisitDateStart?: string;
  VisitDateEnd?: string;
  CreatedAtStart?: string;
  CreatedAtEnd?: string;
  VisitType?: number;
  CustomerMood?: number;
  SleepQuality?: number;
  Appetite?: number;
  IsProblem?: number;
  FollowUpRequired?: number;
  PageIndex?: number;
  PageSize?: number;
  OrderBy?: string;
  IsAsc?: boolean;
}

export interface BackendDailyCheckItem {
  id: string;
  customerId: string;
  tContractId: string;
  contractNo: string;
  visitDate?: string;
  visitTime: string;
  visitorId: string;
  visitorName: string;
  visitType: number;
  visitTypeText?: string;
  visitContent: string;
  customerMood?: number;
  customerMoodText?: string;
  sleepQuality?: number;
  sleepQualityText?: string;
  appetite?: number;
  appetiteText?: string;
  breastfeeding?: string;
  lochiaSituation?: string;
  incisionCondition?: string;
  babyCondition?: string;
  specialConcerns?: string;
  nextFocus?: string;
  isProblem: number;
  isProblemText?: string;
  problemDescription?: string;
  solution?: string;
  followUpRequired: number;
  followUpRequiredText?: string;
  followUpPlan?: string;
  nextVisitDate?: string;
  customerFeedback?: string;
  attachments?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendDailyCheckPage {
  pageNo: number;
  pageSize: number;
  totalCount: number;
  pages: number;
  data: BackendDailyCheckItem[];
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface DailyCheckItem extends BackendDailyCheckItem {}

export interface DailyCheckListResult {
  items: DailyCheckItem[];
  total: number;
}

export interface CreateDailyCheckParams {
  customerId: string;
  visitDate?: string;
  visitTime: string;
  visitorId: string;
  visitorName: string;
  visitType: number;
  visitContent: string;
  customerMood?: number;
  sleepQuality?: number;
  appetite?: number;
  breastfeeding?: string;
  lochiaSituation?: string;
  incisionCondition?: string;
  babyCondition?: string;
  specialConcerns?: string;
  nextFocus?: string;
  isProblem: number;
  problemDescription?: string;
  solution?: string;
  followUpRequired: number;
  followUpPlan?: string;
  nextVisitDate?: string;
  customerFeedback?: string;
  attachments?: string;
  remark?: string;
}

export interface UpdateDailyCheckParams extends CreateDailyCheckParams {
  id: string;
}

/**
 * 获取每日查房列表
 */
export async function getDailyCheckListApi(
  params: DailyCheckListParams,
): Promise<DailyCheckListResult> {
  const page = await requestClient.get<BackendDailyCheckPage>(
    '/api/DailyVisirecord/list',
    { params },
  );
  const list: BackendDailyCheckItem[] = page?.data ?? [];
  return {
    items: Array.isArray(list) ? list : [],
    total: page?.totalCount || 0,
  };
}

/**
 * 获取每日查房详情
 * 接口：GET /api/DailyVisirecord/{id}
 */
export async function getDailyCheckDetailApi(
  id: string,
): Promise<DailyCheckItem> {
  const response = await requestClient.get<BackendDailyCheckItem>(
    `/api/DailyVisirecord/${id}`,
  );
  return response as unknown as DailyCheckItem;
}

/**
 * 创建每日查房
 * 接口：POST /api/DailyVisirecord
 */
export async function createDailyCheckApi(
  params: CreateDailyCheckParams,
): Promise<void> {
  await requestClient.post('/api/DailyVisirecord', params);
}

/**
 * 更新每日查房
 * 接口：PUT /api/DailyVisirecord
 */
export async function updateDailyCheckApi(
  params: UpdateDailyCheckParams,
): Promise<void> {
  await requestClient.put('/api/DailyVisirecord', params);
}

/**
 * 删除每日查房
 * 接口：DELETE /api/DailyVisirecord/{id}
 */
export async function deleteDailyCheckApi(id: string): Promise<void> {
  await requestClient.delete(`/api/DailyVisirecord/${id}`);
}


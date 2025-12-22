import { requestClient } from '#/api/request';

export interface WorkflowConditionTemplateListParams {
  ConditionCode?: string;
  ConditionName?: string;
  BusinessType?: string;
  PageIndex?: number;
  PageSize?: number;
  OrderBy?: string;
  IsAsc?: boolean;
}

export interface WorkflowConditionTemplateItem {
  id: string;
  businessType: string;
  conditionName: string;
  conditionCode: string;
  conditionTemplate: string;
  description: string;
  sortOrder: number;
  isActive: number;
}

export interface WorkflowConditionTemplateListResponse {
  pageNo: number;
  pageSize: number;
  totalCount: number;
  pages: number;
  data: WorkflowConditionTemplateItem[];
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface WorkflowConditionTemplateListResult {
  items: WorkflowConditionTemplateItem[];
  total: number;
}

export interface CreateWorkflowConditionTemplateParams {
  businessType: string;
  conditionName: string;
  conditionCode: string;
  conditionTemplate: string;
  description?: string;
  sortOrder?: number;
  isActive?: number;
}

export interface UpdateWorkflowConditionTemplateParams extends CreateWorkflowConditionTemplateParams {
  id: string;
}

// 获取条件模板列表
export async function getWorkflowConditionTemplateListApi(
  params: WorkflowConditionTemplateListParams,
): Promise<WorkflowConditionTemplateListResult> {
  const page = await requestClient.get<WorkflowConditionTemplateListResponse>(
    '/api/WorkflowConditionTemplate/list',
    { params },
  );
  const list: WorkflowConditionTemplateItem[] = page?.data ?? [];
  return {
    items: Array.isArray(list) ? list : [],
    total: page?.totalCount || 0,
  };
}

// 获取条件模板详情
export async function getWorkflowConditionTemplateDetailApi(
  id: string,
): Promise<WorkflowConditionTemplateItem> {
  const response = await requestClient.get<WorkflowConditionTemplateItem>(
    `/api/WorkflowConditionTemplate/${id}`,
  );
  return response as unknown as WorkflowConditionTemplateItem;
}

// 创建条件模板
export async function createWorkflowConditionTemplateApi(
  params: CreateWorkflowConditionTemplateParams,
): Promise<void> {
  await requestClient.post('/api/WorkflowConditionTemplate', params);
}

// 更新条件模板
export async function updateWorkflowConditionTemplateApi(
  params: UpdateWorkflowConditionTemplateParams,
): Promise<void> {
  await requestClient.put('/api/WorkflowConditionTemplate', params);
}

// 删除条件模板
export async function deleteWorkflowConditionTemplateApi(id: string): Promise<void> {
  await requestClient.delete(`/api/WorkflowConditionTemplate/${id}`);
}


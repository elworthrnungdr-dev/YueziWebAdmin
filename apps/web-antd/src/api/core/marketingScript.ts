import { requestClient } from '#/api/request';

export interface MarketingScriptListParams {
  ScriptCode?: string;
  ScriptName?: string;
  CreatedAtStart?: string;
  CreatedAtEnd?: string;
  ScriptType?: number;
  IsDefault?: number;
  ScriptStatus?: number;
  PageIndex?: number;
  PageSize?: number;
  OrderBy?: string;
  IsAsc?: boolean;
}

export interface MarketingScriptItem {
  id: string;
  scriptCode: string;
  scriptName: string;
  scriptType: number;
  scriptTypeText: string;
  useScenario: string;
  scriptContent: string;
  keyPoints: string;
  commonQuestions: string;
  isDefault: number;
  isDefaultText: string;
  scriptStatus: number;
  scriptStatusText: string;
  creatorId: string;
  remark: string;
  createdAt: string;
  updatedAt: string;
}

export interface MarketingScriptListResponse {
  pageNo: number;
  pageSize: number;
  totalCount: number;
  pages: number;
  data: MarketingScriptItem[];
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface MarketingScriptListResult {
  items: MarketingScriptItem[];
  total: number;
}

export interface CreateMarketingScriptParams {
  scriptName: string;
  scriptType: number;
  useScenario?: string;
  scriptContent: string;
  keyPoints?: string;
  commonQuestions?: string;
  isDefault: number;
  scriptStatus: number;
  remark?: string;
}

export interface UpdateMarketingScriptParams extends CreateMarketingScriptParams {
  id: string;
}

// 获取话术管理列表
export async function getMarketingScriptListApi(
  params: MarketingScriptListParams,
): Promise<MarketingScriptListResult> {
  const page = await requestClient.get<MarketingScriptListResponse>(
    '/api/MarketingScript/list',
    { params },
  );
  const list: MarketingScriptItem[] = page?.data ?? [];
  return {
    items: Array.isArray(list) ? list : [],
    total: page?.totalCount || 0,
  };
}

// 获取话术管理详情
export async function getMarketingScriptDetailApi(
  id: string,
): Promise<MarketingScriptItem> {
  const response = await requestClient.get<MarketingScriptItem>(
    `/api/MarketingScript/${id}`,
  );
  return response as unknown as MarketingScriptItem;
}

// 创建话术管理
export async function createMarketingScriptApi(
  params: CreateMarketingScriptParams,
): Promise<void> {
  await requestClient.post('/api/MarketingScript', params);
}

// 更新话术管理
export async function updateMarketingScriptApi(
  params: UpdateMarketingScriptParams,
): Promise<void> {
  await requestClient.put('/api/MarketingScript', params);
}

// 删除话术管理
export async function deleteMarketingScriptApi(id: string): Promise<void> {
  await requestClient.delete(`/api/MarketingScript/${id}`);
}


import { requestClient } from '#/api/request';

export interface SalesLeadListParams {
  CustomerName?: string;
  AssignedEmployeeId?: string;
  CreatedAtStart?: string;
  CreatedAtEnd?: string;
  LeadSource?: number;
  LeadStatus?: number;
  VisitedCompetitors?: number;
  VisitIntention?: number;
  AssignStatus?: number;
  IsConverted?: number;
  ConversionType?: number;
  PageIndex?: number;
  PageSize?: number;
  OrderBy?: string;
  IsAsc?: boolean;
}

export interface SalesLeadItem {
  id: string;
  leadNo: string;
  leadSource: number;
  leadSourceText: string;
  leadStatus: number;
  leadStatusText: string;
  customerName: string;
  customerPhone: string;
  customerWechat: string;
  expectedDeliveryDate: string;
  parity: number;
  gestationalWeeks: number;
  currentAddress: string;
  workAddress: string;
  distanceToBranch: number;
  preferredBranchId: string;
  budgetRange: string;
  visitedCompetitors: number;
  visitedCompetitorsText: string;
  competitorsInfo: string;
  visitIntention: number;
  visitIntentionText: string;
  visitDate: string;
  visitNotes: string;
  assignedEmployeeId: string;
  assignTime: string;
  assignStatus: number;
  assignStatusText: string;
  currentFollowerId: string;
  nextFollowTime: string;
  lastFollowTime: string;
  followCount: number;
  conversionProbability: number;
  conversionProbabilityText: string;
  lossReason: string;
  lossTime: string;
  isConverted: number;
  isConvertedText: string;
  convertTime: string;
  convertedBy: string;
  convertedCustomerId: string;
  convertedContractId: string;
  convertedContractNo: string;
  conversionType: number;
  conversionTypeText: string;
  conversionNotes: string;
  creatorId: string;
  dataSource: string;
  remark: string;
  createdAt: string;
  updatedAt: string;
}

export interface SalesLeadListResponse {
  pageNo: number;
  pageSize: number;
  totalCount: number;
  pages: number;
  data: SalesLeadItem[];
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface SalesLeadListResult {
  items: SalesLeadItem[];
  total: number;
}

export interface CreateSalesLeadParams {
  leadSource: number;
  customerName: string;
  customerPhone: string;
  customerWechat?: string;
  expectedDeliveryDate: string;
  parity?: number;
  gestationalWeeks?: number;
  currentAddress?: string;
  workAddress?: string;
  distanceToBranch?: number;
  preferredBranchId?: string;
  budgetRange?: string;
  visitedCompetitors?: number;
  competitorsInfo?: string;
  visitIntention?: number;
  visitDate?: string;
  visitNotes?: string;
  dataSource?: string;
  remark?: string;
}

export interface UpdateSalesLeadParams extends CreateSalesLeadParams {
  id: string;
}

// 获取我的商机列表
export async function getSalesLeadMyAssignedListApi(
  params: SalesLeadListParams,
): Promise<SalesLeadListResult> {
  const page = await requestClient.get<SalesLeadListResponse>(
    '/api/SalesLead/my-assigned-list',
    { params },
  );
  const list: SalesLeadItem[] = page?.data ?? [];
  return {
    items: Array.isArray(list) ? list : [],
    total: page?.totalCount || 0,
  };
}

// 获取客户线索列表
export async function getSalesLeadListApi(
  params: SalesLeadListParams,
): Promise<SalesLeadListResult> {
  const page = await requestClient.get<SalesLeadListResponse>(
    '/api/SalesLead/list',
    { params },
  );
  const list: SalesLeadItem[] = page?.data ?? [];
  return {
    items: Array.isArray(list) ? list : [],
    total: page?.totalCount || 0,
  };
}

// 获取商机详情
export async function getSalesLeadDetailApi(
  id: string,
): Promise<SalesLeadItem> {
  const response = await requestClient.get<SalesLeadItem>(
    `/api/SalesLead/${id}`,
  );
  return response as unknown as SalesLeadItem;
}

// 创建商机
export async function createSalesLeadApi(
  params: CreateSalesLeadParams,
): Promise<void> {
  await requestClient.post('/api/SalesLead', params);
}

// 更新商机
export async function updateSalesLeadApi(
  params: UpdateSalesLeadParams,
): Promise<void> {
  await requestClient.put('/api/SalesLead', params);
}

// 删除商机
export async function deleteSalesLeadApi(id: string): Promise<void> {
  await requestClient.delete(`/api/SalesLead/${id}`);
}

// 线索转客户参数
export interface ConvertLeadToCustomerParams {
  id: string;
  branchId?: string;
}

// 线索转客户
export async function convertLeadToCustomerApi(
  params: ConvertLeadToCustomerParams,
): Promise<void> {
  await requestClient.post('/api/SalesLead/convert', params);
}

// 指派销售参数
export interface AssignSalesLeadParams {
  id: string;
  assignedEmployeeId: string;
}

// 指派销售
export async function assignSalesLeadApi(
  params: AssignSalesLeadParams,
): Promise<void> {
  await requestClient.post('/api/SalesLead/assign', params);
}


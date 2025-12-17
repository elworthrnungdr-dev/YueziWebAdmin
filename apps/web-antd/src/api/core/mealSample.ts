import { requestClient } from '#/api/request';

export interface MealSampleListParams {
  MealName?: string;
  SamplerName?: string;
  WitnessName?: string;
  SampleDateStart?: string;
  SampleDateEnd?: string;
  InspectionTimeStart?: string;
  InspectionTimeEnd?: string;
  DisposalTimeStart?: string;
  DisposalTimeEnd?: string;
  CreatedAtStart?: string;
  CreatedAtEnd?: string;
  MealType?: number;
  SampleStatus?: number;
  IsComplaint?: number;
  PageIndex?: number;
  PageSize?: number;
  OrderBy?: string;
  IsAsc?: boolean;
}

export interface MealSampleItem {
  id: string;
  sampleNo: string;
  sampleDate: string;
  sampleTime: string;
  mealType: number;
  mealTypeText: string;
  mealName: string;
  sampleContent: string;
  sampleQuantity: string;
  sampleContainer: string;
  storageLocation: string;
  storageTemperature: string;
  retentionPeriod: number;
  sampleStatus: number;
  sampleStatusText: string;
  samplerId: string;
  samplerName: string;
  witnessId: string;
  witnessName: string;
  inspectionTime: string;
  inspectorId: string;
  inspectionResult: string;
  disposalTime: string;
  disposalMethod: string;
  disposalPersonId: string;
  disposalWitnessId: string;
  isComplaint: number;
  isComplaintText: string;
  complaintId: string;
  safetyNotes: string;
  attachments: string;
  remark: string;
  createdAt: string;
  updatedAt: string;
}

export interface MealSampleListResponse {
  pageNo: number;
  pageSize: number;
  totalCount: number;
  pages: number;
  data: MealSampleItem[];
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface MealSampleListResult {
  items: MealSampleItem[];
  total: number;
}

export interface CreateMealSampleParams {
  sampleNo: string;
  sampleDate: string;
  sampleTime: string;
  mealType: number;
  mealName: string;
  sampleContent: string;
  sampleQuantity: string;
  sampleContainer: string;
  storageLocation: string;
  storageTemperature: string;
  retentionPeriod: number;
  sampleStatus: number;
  samplerId: string;
  samplerName: string;
  witnessId?: string;
  witnessName?: string;
  inspectionTime?: string;
  inspectorId?: string;
  inspectionResult?: string;
  disposalTime?: string;
  disposalMethod?: string;
  disposalPersonId?: string;
  disposalWitnessId?: string;
  isComplaint: number;
  complaintId?: string;
  safetyNotes?: string;
  attachments?: string;
  remark?: string;
}

export interface UpdateMealSampleParams extends CreateMealSampleParams {
  id: string;
}

// 获取餐食留样列表
export async function getMealSampleListApi(
  params: MealSampleListParams,
): Promise<MealSampleListResult> {
  const page = await requestClient.get<MealSampleListResponse>(
    '/api/MealSampleRecord/list',
    { params },
  );
  const list: MealSampleItem[] = page?.data ?? [];
  return {
    items: Array.isArray(list) ? list : [],
    total: page?.totalCount || 0,
  };
}

// 获取餐食留样详情
export async function getMealSampleDetailApi(
  id: string,
): Promise<MealSampleItem> {
  const response = await requestClient.get<MealSampleItem>(
    `/api/MealSampleRecord/${id}`,
  );
  return response as unknown as MealSampleItem;
}

// 创建餐食留样
export async function createMealSampleApi(
  params: CreateMealSampleParams,
): Promise<void> {
  await requestClient.post('/api/MealSampleRecord', params);
}

// 更新餐食留样
export async function updateMealSampleApi(
  params: UpdateMealSampleParams,
): Promise<void> {
  await requestClient.put('/api/MealSampleRecord', params);
}

// 删除餐食留样
export async function deleteMealSampleApi(id: string): Promise<void> {
  await requestClient.delete(`/api/MealSampleRecord/${id}`);
}


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

export interface BackendMealSampleItem {
  id: string;
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
  witnessId: string;
  witnessName: string;
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
  createdAt?: string;
  mealTypeText?: string;
  sampleStatusText?: string;
  isComplaintText?: string;
}

export interface BackendMealSamplePage {
  pageNo: number;
  pageSize: number;
  totalCount: number;
  pages: number;
  data: BackendMealSampleItem[];
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export interface MealSampleItem extends BackendMealSampleItem {}

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
  witnessId: string;
  witnessName: string;
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
  const page = await requestClient.get<BackendMealSamplePage>('/api/MealSampleRecord/list', {
    params,
  });
  const list: BackendMealSampleItem[] = page?.data ?? [];
  const items: MealSampleItem[] = Array.isArray(list) ? list : [];
  return {
    items,
    total: page?.totalCount ?? items.length,
  };
}

// 获取餐食留样详情
export async function getMealSampleDetailApi(id: string): Promise<BackendMealSampleItem> {
  return requestClient.get<BackendMealSampleItem>(`/api/MealSampleRecord/${id}`);
}

// 创建餐食留样
export async function createMealSampleApi(data: CreateMealSampleParams): Promise<void> {
  await requestClient.post('/api/MealSampleRecord', data, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

// 更新餐食留样
export async function updateMealSampleApi(data: UpdateMealSampleParams): Promise<void> {
  await requestClient.put('/api/MealSampleRecord', data, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

// 删除餐食留样
export async function deleteMealSampleApi(id: string): Promise<void> {
  await requestClient.delete(`/api/MealSampleRecord/${id}`);
}



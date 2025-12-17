import { requestClient } from '#/api/request';

export interface BabyListParams {
  BabyName?: string;
  BirthdayStart?: string;
  BirthdayEnd?: string;
  CreatedAtStart?: string;
  CreatedAtEnd?: string;
  PageIndex?: number;
  PageSize?: number;
  OrderBy?: string;
  IsAsc?: boolean;
}

export interface BackendBabyItem {
  id: string;
  tCustomerId: string;
  tContractId: string;
  contractNo: string;
  babyName: string;
  babyGender: number;
  babyGenderText?: string;
  babyOrder: number;
  birthday?: string;
  birthHospital?: string;
  bloodType: number;
  bloodTypeText?: string;
  headCircumference: number;
  bodyLength: number;
  weight: number;
  chestCircumference: number;
  milkIntake?: string;
  relationshipWithBaby?: string;
  checkinTime?: string;
  checkoutTime?: string;
  stayTimes: number;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendBabyPage {
  pageNo: number;
  pageSize: number;
  totalCount: number;
  pages: number;
  data: BackendBabyItem[];
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface BabyItem {
  id: string;
  tCustomerId: string;
  tContractId: string;
  contractNo: string;
  babyName: string;
  babyGender: number;
  babyGenderText?: string;
  babyOrder: number;
  birthday?: string;
  birthHospital?: string;
  bloodType: number;
  bloodTypeText?: string;
  headCircumference: number;
  bodyLength: number;
  weight: number;
  chestCircumference: number;
  milkIntake?: string;
  relationshipWithBaby?: string;
  checkinTime?: string;
  checkoutTime?: string;
  stayTimes: number;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BabyListResult {
  items: BabyItem[];
  total: number;
}

export interface CreateBabyParams {
  createdByType: number;
  sourceReferenceId: string;
  babyName: string;
  babyGender: number;
  babyOrder: number;
  birthday?: string;
  birthHospital?: string;
  bloodType: number;
  headCircumference: number;
  bodyLength: number;
  weight: number;
  chestCircumference: number;
  milkIntake?: string;
  relationshipWithBaby?: string;
  checkinTime?: string;
  checkoutTime?: string;
  stayTimes: number;
  remark?: string;
}

export interface UpdateBabyParams extends CreateBabyParams {
  id: string;
}

/**
 * 获取宝宝信息列表
 */
export async function getBabyListApi(
  params: BabyListParams,
): Promise<BabyListResult> {
  const page = await requestClient.get<BackendBabyPage>('/api/Baby/list', {
    params,
  });
  const list: BackendBabyItem[] = page?.data ?? [];
  return {
    items: Array.isArray(list) ? list : [],
    total: page?.totalCount || 0,
  };
}

/**
 * 获取宝宝信息详情
 * 接口：GET /api/Baby/{id}
 */
export async function getBabyDetailApi(id: string): Promise<BabyItem> {
  const response = await requestClient.get<BackendBabyItem>(
    `/api/Baby/${id}`,
  );
  return response as unknown as BabyItem;
}

/**
 * 创建宝宝信息
 * 接口：POST /api/Baby
 */
export async function createBabyApi(
  params: CreateBabyParams,
): Promise<void> {
  await requestClient.post('/api/Baby', params);
}

/**
 * 更新宝宝信息
 * 接口：PUT /api/Baby
 */
export async function updateBabyApi(
  params: UpdateBabyParams,
): Promise<void> {
  await requestClient.put('/api/Baby', params);
}

/**
 * 删除宝宝信息
 * 接口：DELETE /api/Baby/{id}
 */
export async function deleteBabyApi(id: string): Promise<void> {
  await requestClient.delete(`/api/Baby/${id}`);
}


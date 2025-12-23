import { requestClient } from '#/api/request';

export interface CareProjectListParams {
  ProductCode?: string;
  ProjectName?: string;
  Status?: number;
  PageIndex?: number;
  PageSize?: number;
  OrderBy?: string;
  IsAsc?: boolean;
}

export interface BackendCareProjectItem {
  id: string;
  productCode: string;
  projectName: string;
  standardPrice: number;
  standardHandFee: number;
  duration: number;
  validDays: number;
  description?: string;
  status: number;
  statusText?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendCareProjectPage {
  pageNo: number;
  pageSize: number;
  totalCount: number;
  pages: number;
  data: BackendCareProjectItem[];
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export interface CareProjectListResult {
  items: BackendCareProjectItem[];
  total: number;
}

export interface CreateCareProjectParams {
  productCode: string;
  projectName: string;
  standardPrice: number;
  standardHandFee?: number;
  duration?: number;
  validDays: number;
  description?: string;
  status: number;
}

export interface UpdateCareProjectParams extends CreateCareProjectParams {
  id: string;
}

export async function getCareProjectListApi(
  params: CareProjectListParams,
): Promise<CareProjectListResult> {
  const page = await requestClient.get<BackendCareProjectPage>('/api/CareProject/list', {
    params,
  });
  const list: BackendCareProjectItem[] = page?.data ?? [];
  return {
    items: Array.isArray(list) ? list : [],
    total: page?.totalCount || 0,
  };
}

export async function getCareProjectDetailApi(id: string): Promise<BackendCareProjectItem> {
  return requestClient.get<BackendCareProjectItem>(`/api/CareProject/${id}`);
}

export async function createCareProjectApi(params: CreateCareProjectParams): Promise<void> {
  await requestClient.post('/api/CareProject', params);
}

export async function updateCareProjectApi(params: UpdateCareProjectParams): Promise<void> {
  await requestClient.put('/api/CareProject', params);
}

export async function deleteCareProjectApi(id: string): Promise<void> {
  await requestClient.delete(`/api/CareProject/${id}`);
}


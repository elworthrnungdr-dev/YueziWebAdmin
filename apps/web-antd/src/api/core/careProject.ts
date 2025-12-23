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

export interface CareProjectAllListParams {
  Status?: number;
  Type?: number;
  PageIndex?: number;
  PageSize?: number;
}

export interface CareProjectAllListItem {
  id: string;
  name: string;
  price?: number;
  status?: number;
  statusText?: string;
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

export async function getCareProjectAllListApi(
  params?: CareProjectAllListParams,
): Promise<CareProjectAllListItem[]> {
  const page = await requestClient.get<BackendCareProjectPage>('/api/CareProject/all/list', {
    params: {
      Status: 1,
      Type: 1,
      PageIndex: 1,
      PageSize: 100,
      ...params,
    },
  });
  const list: BackendCareProjectItem[] = page?.data ?? [];
  return Array.isArray(list)
    ? list.map((item) => ({
        id: item.id,
        name: (item as any).name || item.projectName || item.productCode || '',
        price: (item as any).price ?? item.standardPrice,
        status: item.status,
        statusText: item.statusText,
      }))
    : [];
}


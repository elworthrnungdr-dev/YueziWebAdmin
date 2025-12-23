import { requestClient } from '#/api/request';

export interface CarePackageListParams {
  PackageName?: string;
  Status?: number;
  PageIndex?: number;
  PageSize?: number;
  OrderBy?: string;
  IsAsc?: boolean;
}

export interface CarePackageItemDetail {
  id: string;
  packageId?: string;
  projectId: string;
  projectName?: string;
  quantity: number;
}

export interface BackendCarePackageItem {
  id: string;
  packageName: string;
  status: number;
  statusText?: string;
  remark?: string;
  createdAt?: string;
  totalPrice?: number;
  items?: CarePackageItemDetail[];
}

export interface BackendCarePackagePage {
  pageNo: number;
  pageSize: number;
  totalCount: number;
  pages: number;
  data: BackendCarePackageItem[];
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export interface CarePackageListResult {
  items: BackendCarePackageItem[];
  total: number;
}

export interface CarePackageItemInput {
  projectId: string;
  quantity: number;
}

export interface CreateCarePackageParams {
  packageName: string;
  totalPrice: number;
  status: number;
  remark?: string;
  items?: CarePackageItemInput[];
}

export interface UpdateCarePackageParams extends CreateCarePackageParams {
  id: string;
}

export async function getCarePackageListApi(
  params: CarePackageListParams,
): Promise<CarePackageListResult> {
  const page = await requestClient.get<BackendCarePackagePage>('/api/CarePackage/list', {
    params,
  });
  const list: BackendCarePackageItem[] = page?.data ?? [];
  return {
    items: Array.isArray(list) ? list : [],
    total: page?.totalCount || 0,
  };
}

export async function getCarePackageDetailApi(id: string): Promise<BackendCarePackageItem> {
  return requestClient.get<BackendCarePackageItem>(`/api/CarePackage/${id}`);
}

export async function createCarePackageApi(params: CreateCarePackageParams): Promise<void> {
  await requestClient.post('/api/CarePackage', params);
}

export async function updateCarePackageApi(params: UpdateCarePackageParams): Promise<void> {
  await requestClient.put('/api/CarePackage', params);
}

export async function deleteCarePackageApi(id: string): Promise<void> {
  await requestClient.delete(`/api/CarePackage/${id}`);
}






import { requestClient } from '#/api/request';

export interface SecurityRouteListParams {
  RouteCode?: string;
  RouteName?: string;
  EndPoint?: string;
  CreatedAtStart?: string;
  CreatedAtEnd?: string;
  UpdatedAtStart?: string;
  UpdatedAtEnd?: string;
  PageIndex?: number;
  PageSize?: number;
  OrderBy?: string;
  IsAsc?: boolean;
}

export interface SecurityRouteItem {
  id: string;
  routeCode: string;
  routeName: string;
  routeType: number;
  routeTypeText: string;
  startPoint: string;
  endPoint: string;
  routeDistance: number;
  estimatedDuration: number;
  remark: string;
  createdAt: string;
  updatedAt: string;
}

export interface SecurityRouteListResponse {
  pageNo: number;
  pageSize: number;
  totalCount: number;
  pages: number;
  data: SecurityRouteItem[];
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface SecurityRouteListResult {
  items: SecurityRouteItem[];
  total: number;
}

export interface CreateSecurityRouteParams {
  routeCode: string;
  routeName: string;
  routeType: number;
  startPoint: string;
  endPoint: string;
  routeDistance?: number;
  estimatedDuration: number;
  remark?: string;
}

export interface UpdateSecurityRouteParams extends CreateSecurityRouteParams {
  id: string;
}

// 获取巡逻线路列表
export async function getSecurityRouteListApi(
  params: SecurityRouteListParams,
): Promise<SecurityRouteListResult> {
  const page = await requestClient.get<SecurityRouteListResponse>(
    '/api/SecurityRoute/list',
    { params },
  );
  const list: SecurityRouteItem[] = page?.data ?? [];
  return {
    items: Array.isArray(list) ? list : [],
    total: page?.totalCount || 0,
  };
}

// 获取巡逻线路详情
export async function getSecurityRouteDetailApi(
  id: string,
): Promise<SecurityRouteItem> {
  const response = await requestClient.get<SecurityRouteItem>(
    `/api/SecurityRoute/${id}`,
  );
  return response as unknown as SecurityRouteItem;
}

// 创建巡逻线路
export async function createSecurityRouteApi(
  params: CreateSecurityRouteParams,
): Promise<void> {
  await requestClient.post('/api/SecurityRoute', params);
}

// 更新巡逻线路
export async function updateSecurityRouteApi(
  params: UpdateSecurityRouteParams,
): Promise<void> {
  await requestClient.put('/api/SecurityRoute', params);
}

// 删除巡逻线路
export async function deleteSecurityRouteApi(id: string): Promise<void> {
  await requestClient.delete(`/api/SecurityRoute/${id}`);
}


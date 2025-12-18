import { requestClient } from '#/api/request';

export interface RoomTypeListParams {
  TypeName?: string;
  PageIndex?: number;
  PageSize?: number;
  OrderBy?: string;
  IsAsc?: boolean;
}

export interface RoomTypeItem {
  id: string;
  typeName: string;
  style?: string;
  orientation?: string;
  area?: number;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RoomTypeListResponse {
  pageNo: number;
  pageSize: number;
  totalCount: number;
  pages: number;
  data: RoomTypeItem[];
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface RoomTypeListResult {
  items: RoomTypeItem[];
  total: number;
}

export interface CreateRoomTypeParams {
  typeName: string;
  style?: string;
  orientation?: string;
  area?: number;
  remark?: string;
}

export interface UpdateRoomTypeParams extends CreateRoomTypeParams {
  id: string;
}

// 获取房型列表
export async function getRoomTypeListApi(
  params: RoomTypeListParams,
): Promise<RoomTypeListResult> {
  const page = await requestClient.get<RoomTypeListResponse>('/api/RoomType/list', {
    params,
  });
  const list: RoomTypeItem[] = page?.data ?? [];
  return {
    items: Array.isArray(list) ? list : [],
    total: page?.totalCount || 0,
  };
}

// 获取房型详情
export async function getRoomTypeDetailApi(id: string): Promise<RoomTypeItem> {
  const response = await requestClient.get<RoomTypeItem>(`/api/RoomType/${id}`);
  return response as unknown as RoomTypeItem;
}

// 创建房型
export async function createRoomTypeApi(
  params: CreateRoomTypeParams,
): Promise<void> {
  await requestClient.post('/api/RoomType', params);
}

// 更新房型
export async function updateRoomTypeApi(
  params: UpdateRoomTypeParams,
): Promise<void> {
  await requestClient.put('/api/RoomType', params);
}

// 删除房型
export async function deleteRoomTypeApi(id: string): Promise<void> {
  await requestClient.delete(`/api/RoomType/${id}`);
}



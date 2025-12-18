import { requestClient } from '#/api/request';

export interface RoomListParams {
  RoomNo?: string;
  PageIndex?: number;
  PageSize?: number;
  OrderBy?: string;
  IsAsc?: boolean;
}

export interface RoomItem {
  id: string;
  roomNo: string;
  area?: number;
  orientation?: string;
  style?: string;
  branchId?: string;
  roomTypeId: string;
  status: number;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RoomListResponse {
  pageNo: number;
  pageSize: number;
  totalCount: number;
  pages: number;
  data: RoomItem[];
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface RoomListResult {
  items: RoomItem[];
  total: number;
}

export interface CreateRoomParams {
  roomNo: string;
  area?: number;
  orientation?: string;
  style?: string;
  roomTypeId: string;
  status: number;
  remark?: string;
}

export interface UpdateRoomParams extends CreateRoomParams {
  id: string;
}

// 获取房间列表
export async function getRoomListApi(
  params: RoomListParams,
): Promise<RoomListResult> {
  const page = await requestClient.get<RoomListResponse>('/api/Room/list', {
    params,
  });
  const list: RoomItem[] = page?.data ?? [];
  return {
    items: Array.isArray(list) ? list : [],
    total: page?.totalCount || 0,
  };
}

// 获取房间详情
export async function getRoomDetailApi(id: string): Promise<RoomItem> {
  const response = await requestClient.get<RoomItem>(`/api/Room/${id}`);
  return response as unknown as RoomItem;
}

// 创建房间
export async function createRoomApi(params: CreateRoomParams): Promise<void> {
  await requestClient.post('/api/Room', params);
}

// 更新房间
export async function updateRoomApi(params: UpdateRoomParams): Promise<void> {
  await requestClient.put('/api/Room', params);
}

// 删除房间
export async function deleteRoomApi(id: string): Promise<void> {
  await requestClient.delete(`/api/Room/${id}`);
}



import { requestClient } from '#/api/request';

export interface BranchItem {
  id: string;
  branchCode: string;
  branchName: string;
}

export interface BranchAllResponse {
  success: boolean;
  message: string;
  data: BranchItem[];
  code: number;
  timestamp: string;
}

// 获取全部门店列表
export async function getAllBranchApi(): Promise<BranchItem[]> {
  /**
   * 说明：
   * requestClient 经过 defaultResponseInterceptor + responseReturn='data' 处理后，
   * 这里拿到的是后端响应里的 data 字段内容，即 BranchItem[]
   */
  const list = await requestClient.get<BranchItem[]>('/api/Branch/all');
  return Array.isArray(list) ? list : [];
}



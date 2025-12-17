import { requestClient } from '#/api/request';

export interface EmployeeListParams {
  TEmployeesid?: string;
  EmployeesName?: string;
  EmployeeNumber?: string;
  PageIndex?: number;
  PageSize?: number;
  OrderBy?: string;
  IsAsc?: boolean;
}

export interface BackendEmployeeItem {
  tEmployeesid: string;
  employeesName: string;
  employeeNumber: string;
  tDepartmentId?: string;
  branchId?: string;
  branchName?: string;
  position?: string;
  phoneNumber?: string;
  email?: string;
  hireDate?: string;
  workStatus?: number;
  accountStatus?: number;
  gender?: number;
  age?: number;
  [key: string]: any;
}

export interface BackendEmployeePage {
  pageNo: number;
  pageSize: number;
  totalCount: number;
  pages: number;
  data: BackendEmployeeItem[];
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export interface EmployeeItem {
  id: string;
  name: string;
  number: string;
  departmentId?: string;
  branchName?: string;
  position?: string;
  phoneNumber?: string;
  email?: string;
  hireDate?: string;
  workStatus?: number;
  accountStatus?: number;
  raw: BackendEmployeeItem;
}

export interface CreateEmployeeParams {
  employeesName: string;
  employeeNumber: string;
  tDepartmentId: string;
  gender: number;
  age?: number | null;
  birthDate?: string | null;
  nativePlace?: string | null;
  address?: string | null;
  phoneNumber: string;
  email?: string | null;
  wechat?: string | null;
  workStatus?: number | null;
  position?: string | null;
  hireDate?: string | null;
  resignationDate?: string | null;
  bankCard?: string | null;
  bankName?: string | null;
  branchName?: string | null;
  idCardFront?: string | null;
  idCardBack?: string | null;
  password?: string | null;
  accountStatus: number;
  emergencyContact?: string | null;
  emergencyContactPhone?: string | null;
  emergencyContactRelation?: string | null;
  avatarUrl?: string | null;
  remark?: string | null;
}

export interface UpdateEmployeeParams extends CreateEmployeeParams {
  id: string;
}

/**
 * 获取职工列表
 * 接口：/api/Employees/list
 * 说明：请求参数默认空值，这里统一通过 params 传递，可选填。
 */
export async function getEmployeeListApi(
  params: EmployeeListParams = {},
): Promise<{ items: EmployeeItem[]; total: number }> {
  const page = await requestClient.get<BackendEmployeePage>('/api/Employees/list', {
    params,
  });
  const list: BackendEmployeeItem[] = page?.data ?? [];
  const items: EmployeeItem[] = Array.isArray(list)
    ? list.map((item) => ({
        id: item.tEmployeesid,
        name: item.employeesName,
        number: item.employeeNumber,
        departmentId: item.tDepartmentId,
        branchName: item.branchName,
        position: item.position,
        phoneNumber: item.phoneNumber,
        email: item.email,
        hireDate: item.hireDate,
        workStatus: item.workStatus,
        accountStatus: item.accountStatus,
        raw: item,
      }))
    : [];

  return {
    items,
    total: page?.totalCount ?? items.length,
  };
}

/**
 * 添加职工
 * 接口：/api/Employees
 */
export async function createEmployeeApi(data: CreateEmployeeParams) {
  return requestClient.post('/api/Employees', data, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/**
 * 获取职工详情
 * 接口：/api/Employees/{id}
 */
export async function getEmployeeDetailApi(id: string): Promise<BackendEmployeeItem> {
  return requestClient.get<BackendEmployeeItem>(`/api/Employees/${id}`);
}

/**
 * 更新职工
 * 接口：/api/Employees
 * 方法：PUT
 */
export async function updateEmployeeApi(data: UpdateEmployeeParams) {
  return requestClient.put('/api/Employees', data, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/**
 * 删除职工
 * 接口：/api/Employees/{id}
 * 说明：后端要求 id 作为路径参数
 */
export async function deleteEmployeeApi(id: string) {
  return requestClient.delete(`/api/Employees/${id}`);
}

/**
 * 设置职工新密码
 * 接口：/api/Employees/setPwd/{id}
 */
export async function setEmployeePasswordApi(id: string, newPassword: string) {
  return requestClient.post(
    `/api/Employees/setPwd/${id}`,
    { id, newPassword },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
}




const employeesSegment = '/employees';
const defaultEmployeesBase = '/api';

const configuredEmployeesBase =
  import.meta.env.VITE_EMPLOYEES_API_BASE ??
  import.meta.env.VITE_GLOB_API_URL_TEST ??
  defaultEmployeesBase;

const employeesApiBase = (() => {
  const trimmed = (configuredEmployeesBase || defaultEmployeesBase).replace(
    /\/+$/,
    '',
  );
  const lower = trimmed.toLowerCase();
  return lower.endsWith(employeesSegment.toLowerCase())
    ? trimmed
    : `${trimmed}${employeesSegment}`;
})();

const DEFAULT_TOKEN = 'f6PFTsqMrqcbRfOFWKEguscQvI0Z6i7JQ1s6I57CWvU=';

const employeesApiToken =
  import.meta.env.VITE_EMPLOYEES_API_TOKEN ?? DEFAULT_TOKEN;

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
type QueryValue = string | number | null | undefined;
type QueryParams = Record<string, QueryValue>;

export interface EmployeesApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  code: number;
  timestamp: string;
}

export interface ApiEmployee {
  tEmployeesId?: string;
  employeesName?: string;
  employeeNumber?: string;
  tDepartmentId?: string;
  gender?: string;
  age?: number;
  birthDate?: string;
  nativePlace?: string;
  address?: string;
  phoneNumber?: string;
  email?: string;
  wechat?: string;
  status?: string;
  hireDate?: string;
  resignationDate?: string;
  bankCard?: string;
  bankName?: string;
  branchName?: string;
  idCardFront?: string;
  idCardBack?: string;
  password?: string;
  roleId?: string;
  emergencyContact?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface EmployeePageParams extends QueryParams {
  pageIndex?: number;
  pageSize?: number;
  employeeNumber?: string;
  employeesName?: string;
  departmentId?: string;
  status?: string;
}

export interface EmployeePageResult {
  items: ApiEmployee[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
}

export type EmployeePayload = Partial<ApiEmployee> &
  Pick<
    ApiEmployee,
    'employeesName' | 'employeeNumber' | 'tDepartmentId' | 'phoneNumber'
  >;

interface EmployeeRequestOptions {
  method?: HttpMethod;
  params?: QueryParams;
  body?: Record<string, unknown>;
  headers?: Record<string, string>;
}

function buildQueryString(params?: QueryParams) {
  if (!params) return '';
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      !(typeof value === 'string' && value.trim() === '')
    ) {
      query.append(key, String(value));
    }
  });
  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
}

function resolveUrl(path: string, params?: QueryParams) {
  const normalizedBase = employeesApiBase.replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const query = buildQueryString(params);
  return `${normalizedBase}${normalizedPath}${query}`;
}

async function employeeRequest<T>(
  path: string,
  options: EmployeeRequestOptions = {},
) {
  const { method = 'GET', params, body, headers } = options;
  const url = resolveUrl(path, params);
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/plain, */*',
      Authorization: `Bearer ${employeesApiToken}`,
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(
      `接口请求失败(${response.status}): ${errorText || response.statusText}`,
    );
  }

  const rawText = await response.text();
  if (!rawText) {
    return null as T;
  }

  let payload: EmployeesApiResponse<T>;
  try {
    payload = JSON.parse(rawText) as EmployeesApiResponse<T>;
  } catch (error) {
    if (response.ok) {
      const trimmed = rawText.trim();
      if (trimmed) {
        return null as T;
      }
    }
    console.error('接口返回的原始内容：', rawText);
    throw new Error('接口响应格式异常，无法解析为 JSON');
  }

  if (payload.success) {
    return payload.data;
  }
  throw new Error(payload.message || '接口返回异常');
}

export function getEmployeesPage(params: EmployeePageParams) {
  return employeeRequest<EmployeePageResult>('/getPage', { params });
}

export function getEmployeesList(params?: Partial<EmployeePageParams>) {
  return employeeRequest<ApiEmployee[]>('/getList', { params });
}

export function getEmployeeDetail(id: string) {
  return employeeRequest<ApiEmployee>('/getOne', {
    params: { id },
  });
}

export function addEmployee(data: EmployeePayload) {
  return employeeRequest<ApiEmployee>('/add', {
    method: 'POST',
    body: data,
  });
}

export function updateEmployee(id: string, data: Partial<ApiEmployee>) {
  return employeeRequest<ApiEmployee>('/update', {
    method: 'POST',
    params: { id },
    body: data,
  });
}

export function deleteEmployee(id: string) {
  return employeeRequest<null>('/del', {
    method: 'POST',
    params: { id },
  });
}


const departmentsSegment = '/departments';
const defaultDepartmentsBase = '/api';

const configuredDepartmentsBase =
  import.meta.env.VITE_DEPARTMENTS_API_BASE ??
  import.meta.env.VITE_GLOB_API_URL_TEST ??
  defaultDepartmentsBase;

const departmentsApiBase = (() => {
  const trimmed = (configuredDepartmentsBase || defaultDepartmentsBase).replace(
    /\/+$/,
    '',
  );
  const lower = trimmed.toLowerCase();
  return lower.endsWith(departmentsSegment.toLowerCase())
    ? trimmed
    : `${trimmed}${departmentsSegment}`;
})();

const DEFAULT_TOKEN = 'f6PFTsqMrqcbRfOFWKEguscQvI0Z6i7JQ1s6I57CWvU=';

const departmentsApiToken =
  import.meta.env.VITE_DEPARTMENTS_API_TOKEN ?? DEFAULT_TOKEN;

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
type QueryValue = string | number | null | undefined;
type QueryParams = Record<string, QueryValue>;

export interface DepartmentsApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  code: number;
  timestamp: string;
}

export interface ApiDepartment {
  tDepartmentId?: string;
  deptCode?: string;
  deptName?: string;
  parentId?: string | null;
  leaderId?: string | null;
  sortno?: number | null;
  status?: number | null; // 0:禁用, 1:启用
  remark?: string | null;
  createTime?: string;
  updateTime?: string;
  [key: string]: unknown;
}

export interface DepartmentPageParams extends QueryParams {
  pageIndex?: number;
  pageSize?: number;
  deptCode?: string;
  deptName?: string;
  status?: number;
}

export interface DepartmentPageResult {
  items: ApiDepartment[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
}

export type DepartmentPayload = Partial<ApiDepartment> &
  Pick<ApiDepartment, 'deptCode' | 'deptName'>;

interface DepartmentRequestOptions {
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
      value !== '' &&
      !Number.isNaN(value)
    ) {
      query.append(key, String(value));
    }
  });
  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
}

function resolveUrl(path: string, params?: QueryParams) {
  const normalizedBase = departmentsApiBase.replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const query = buildQueryString(params);
  return `${normalizedBase}${normalizedPath}${query}`;
}

async function departmentRequest<T>(
  path: string,
  options: DepartmentRequestOptions = {},
) {
  const { method = 'GET', params, body, headers } = options;
  const url = resolveUrl(path, params);
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/plain, */*',
      Authorization: `Bearer ${departmentsApiToken}`,
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

  // 尝试解析 JSON
  let payload: DepartmentsApiResponse<T>;
  try {
    payload = JSON.parse(rawText) as DepartmentsApiResponse<T>;
  } catch (error) {
    // 如果解析失败，但响应状态码是成功的（2xx），可能是纯文本成功消息
    if (response.ok) {
      const trimmedText = rawText.trim();
      // 如果是成功响应且内容是文本消息（如"部门信息更新成功"），认为操作成功
      // 对于更新/删除/添加操作，返回 null 表示成功
      if (trimmedText) {
        return null as T;
      }
    }
    // 其他情况抛出错误
    console.error('接口返回的原始内容：', rawText);
    throw new Error('接口响应格式异常，无法解析为 JSON');
  }

  if (payload.success) {
    return payload.data;
  }
  throw new Error(payload.message || '接口返回异常');
}

export function getDepartmentsPage(params: DepartmentPageParams) {
  return departmentRequest<DepartmentPageResult>('/getPage', { params });
}

export function getDepartmentsList(params?: Partial<DepartmentPageParams>) {
  return departmentRequest<ApiDepartment[]>('/getList', { params });
}

export function getDepartmentDetail(id: string) {
  return departmentRequest<ApiDepartment>('/getOne', {
    params: { id },
  });
}

export function addDepartment(data: DepartmentPayload) {
  return departmentRequest<ApiDepartment>('/add', {
    method: 'POST',
    body: data,
  });
}

export function updateDepartment(id: string, data: Partial<ApiDepartment>) {
  return departmentRequest<ApiDepartment>('/update', {
    method: 'POST',
    params: { id },
    body: data,
  });
}

export function deleteDepartment(id: string) {
  return departmentRequest<null>('/del', {
    method: 'POST',
    params: { id },
  });
}


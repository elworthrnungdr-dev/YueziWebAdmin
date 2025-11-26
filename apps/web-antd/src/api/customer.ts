const customersSegment = '/Customers';
const defaultCustomersBase = '/api';

const configuredCustomersBase =
  import.meta.env.VITE_CUSTOMERS_API_BASE ??
  import.meta.env.VITE_GLOB_API_URL_TEST ??
  defaultCustomersBase;

const customersApiBase = (() => {
  const trimmed = (configuredCustomersBase || defaultCustomersBase).replace(
    /\/+$/,
    '',
  );
  const lower = trimmed.toLowerCase();
  return lower.endsWith(customersSegment.toLowerCase())
    ? trimmed
    : `${trimmed}${customersSegment}`;
})();

const DEFAULT_CUSTOMER_TOKEN = 'f6PFTsqMrqcbRfOFWKEguscQvI0Z6i7JQ1s6I57CWvU=';

const customersApiToken =
  import.meta.env.VITE_CUSTOMERS_API_TOKEN ?? DEFAULT_CUSTOMER_TOKEN;

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
type QueryValue = string | number | null | undefined;
type QueryParams = Record<string, QueryValue>;

export interface CustomersApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  code: number;
  timestamp: string;
}

export interface ApiCustomer {
  tCustomerId?: string;
  customerName?: string;
  employeeNumber?: string;
  birthDate?: string;
  age?: number;
  phoneArea?: string;
  phoneNumber?: string;
  wechat?: string;
  customerStatus?: string;
  paymentStatus?: string;
  expectedDeliveryDate?: string;
  deliveryDate?: string;
  deliveryMethod?: string;
  parity?: number;
  fetusType?: string;
  babyGender?: string;
  deliveryHospital?: string;
  stayTimes?: number;
  tRoomId?: string;
  registerTime?: string;
  contractSignTime?: string;
  checkinTime?: string;
  checkoutTime?: string;
  tBranchId?: string;
  salesEmployeesId?: string;
  registerEmployeesId?: string;
  emergencyName?: string;
  emergencyPhone?: string;
  emergencyRelation?: string;
  companionName?: string;
  companionPhone?: string;
  companionRelation?: string;
  nativePlace?: string;
  homeAddress?: string;
  idType?: string;
  idNumber?: string;
  nationality?: string;
  company?: string;
  occupation?: string;
  email?: string;
  customerSource?: string;
  referrerName?: string;
  referrerPhone?: string;
  idCardFront?: string;
  idCardBack?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface CustomerPageParams extends QueryParams {
  pageIndex?: number;
  pageSize?: number;
  customerName?: string;
  phoneNumber?: string;
  customerStatus?: string;
  paymentStatus?: string;
  tRoomId?: string;
  checkinTimeStart?: string;
  checkinTimeEnd?: string;
}

export interface CustomerPageResult {
  items: ApiCustomer[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
}

export type CustomerPayload = Partial<ApiCustomer> &
  Pick<ApiCustomer, 'customerName' | 'employeeNumber' | 'phoneNumber' | 'tBranchId'>;

interface CustomerRequestOptions {
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
  const normalizedBase = customersApiBase.replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const query = buildQueryString(params);
  return `${normalizedBase}${normalizedPath}${query}`;
}

async function customerRequest<T>(
  path: string,
  options: CustomerRequestOptions = {},
) {
  const { method = 'GET', params, body, headers } = options;
  const url = resolveUrl(path, params);
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/plain, */*',
      ...(customersApiToken ? { Authorization: `Bearer ${customersApiToken}` } : {}),
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
  let payload: CustomersApiResponse<T>;
  try {
    payload = JSON.parse(rawText) as CustomersApiResponse<T>;
  } catch (error) {
    // 如果解析失败，但响应状态码是成功的（2xx），可能是纯文本成功消息
    if (response.ok) {
      const trimmedText = rawText.trim();
      // 如果是成功响应且内容是文本消息（如"客户信息更新成功"），认为操作成功
      // 对于更新/删除/添加操作，返回 null 表示成功
      if (trimmedText) {
        return null as T;
      }
    }
    // 其他情况抛出错误
    console.error('接口返回的原始内容：', rawText);
    throw new Error('接口响应格式异常，无法解析为 JSON');
  }

  if (!payload.success || payload.code !== 200) {
    throw new Error(payload.message || '接口返回异常');
  }
  return payload.data;
}

export function getCustomersPage(params: CustomerPageParams) {
  return customerRequest<CustomerPageResult>('/getPage', { params });
}

export function getCustomersList(params?: Partial<CustomerPageParams>) {
  return customerRequest<ApiCustomer[]>('/getList', { params });
}

export function getCustomerDetail(id: string) {
  return customerRequest<ApiCustomer>('/getOne', {
    params: { id },
  });
}

export function addCustomer(data: CustomerPayload) {
  return customerRequest<ApiCustomer>('/add', {
    method: 'POST',
    body: data,
  });
}

export function updateCustomer(id: string, data: Partial<ApiCustomer>) {
  return customerRequest<ApiCustomer>('/update', {
    method: 'POST',
    params: { id },
    body: data,
  });
}

export function deleteCustomer(id: string) {
  return customerRequest<null>('/del', {
    method: 'POST',
    params: { id },
  });
}

// 图片上传和获取相关配置
const imageApiBase =
  import.meta.env.VITE_IMAGE_API_BASE || 'http://wshaiagent.natapp1.cc/api/Image';

// 图片API使用的token（直接使用客户API的token）
const imageApiToken = customersApiToken;

export interface ImageUploadResponse {
  success: boolean;
  message: string;
  data: string; // 图片ID
  code: number;
  timestamp: string;
}

export interface ImageGetResponse {
  success: boolean;
  message: string;
  data: string; // Base64编码的图片数据
  code: number;
  timestamp: string;
}

/**
 * 上传图片
 * @param file 图片文件
 * @returns 图片ID
 */
export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${imageApiBase}/upload`, {
    method: 'POST',
    headers: {
      accept: 'text/plain',
      Authorization: `Bearer ${imageApiToken}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(
      `图片上传失败(${response.status}): ${errorText || response.statusText}`,
    );
  }

  const rawText = await response.text();
  if (!rawText) {
    throw new Error('图片上传失败：服务器返回空响应');
  }

  let payload: ImageUploadResponse;
  try {
    payload = JSON.parse(rawText) as ImageUploadResponse;
  } catch (error) {
    console.error('图片上传接口返回的原始内容：', rawText);
    throw new Error('图片上传接口响应格式异常，无法解析为 JSON');
  }

  if (!payload.success || payload.code !== 200) {
    throw new Error(payload.message || '图片上传失败');
  }

  return payload.data;
}

/**
 * 通过ID获取图片（Base64编码）
 * @param id 图片ID
 * @returns Base64编码的图片数据
 */
export async function getImageById(id: string): Promise<string> {
  const response = await fetch(`${imageApiBase}/get/${id}`, {
    method: 'GET',
    headers: {
      accept: 'text/plain',
      Authorization: `Bearer ${imageApiToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(
      `获取图片失败(${response.status}): ${errorText || response.statusText}`,
    );
  }

  const rawText = await response.text();
  if (!rawText) {
    throw new Error('获取图片失败：服务器返回空响应');
  }

  let payload: ImageGetResponse;
  try {
    payload = JSON.parse(rawText) as ImageGetResponse;
  } catch (error) {
    // 如果解析失败，可能是直接返回Base64字符串
    if (response.ok && rawText.trim()) {
      return rawText.trim();
    }
    console.error('获取图片接口返回的原始内容：', rawText);
    throw new Error('获取图片接口响应格式异常，无法解析为 JSON');
  }

  if (!payload.success || payload.code !== 200) {
    throw new Error(payload.message || '获取图片失败');
  }

  return payload.data;
}

/**
 * 获取图片预览URL（带token，用于在新窗口打开）
 * @param id 图片ID
 * @returns 图片预览URL（blob URL）
 */
export async function getImagePreviewUrl(id: string): Promise<string> {
  try {
    const base64Data = await getImageById(id);
    // 将Base64转换为blob URL，这样可以在新窗口打开
    if (base64Data.startsWith('data:image')) {
      // 如果已经是data URL格式，直接转换为blob
      const response = await fetch(base64Data);
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    }
    // 如果是纯Base64字符串，转换为blob URL
    const base64String = `data:image/jpeg;base64,${base64Data}`;
    const response = await fetch(base64String);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('获取图片预览URL失败：', error);
    throw error;
  }
}


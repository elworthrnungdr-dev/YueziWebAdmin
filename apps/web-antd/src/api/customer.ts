const customersSegment = '/Customers';
const defaultCustomersBase = '/api';

const configuredCustomersBase =
  import.meta.env.VITE_CUSTOMERS_API_BASE ??
  import.meta.env.VITE_GLOB_API_URL ??
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
      `客户接口请求失败(${response.status}): ${errorText || response.statusText}`,
    );
  }

  const rawText = await response.text();
  if (!rawText) {
    return null as T;
  }

  let payload: CustomersApiResponse<T>;
  try {
    payload = JSON.parse(rawText) as CustomersApiResponse<T>;
  } catch (error) {
    console.error('客户接口返回的原始内容：', rawText);
    throw new Error('客户接口响应格式异常，无法解析为 JSON');
  }

  if (!payload.success || payload.code !== 200) {
    throw new Error(payload.message || '客户接口返回异常');
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


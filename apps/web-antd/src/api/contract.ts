const contractsSegment = '/contracts';
const defaultContractsBase = '/api';

const configuredContractsBase =
  import.meta.env.VITE_CONTRACTS_API_BASE ??
  import.meta.env.VITE_GLOB_API_URL_TEST ??
  defaultContractsBase;

const contractsApiBase = (() => {
  const trimmed = (configuredContractsBase || defaultContractsBase).replace(
    /\/+$/,
    '',
  );
  const lower = trimmed.toLowerCase();
  return lower.endsWith(contractsSegment.toLowerCase())
    ? trimmed
    : `${trimmed}${contractsSegment}`;
})();

const DEFAULT_TOKEN = 'f6PFTsqMrqcbRfOFWKEguscQvI0Z6i7JQ1s6I57CWvU=';

const contractsApiToken =
  import.meta.env.VITE_CONTRACTS_API_TOKEN ?? DEFAULT_TOKEN;

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
type QueryValue = string | number | null | undefined;
type QueryParams = Record<string, QueryValue>;

export interface ContractsApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  code: number;
  timestamp: string;
}

export interface ApiContract {
  tContractId?: string;
  contractNumber?: string;
  tCustomerId?: string;
  customerName?: string;
  idNumber?: string;
  phoneNumber?: string;
  inspectionHospital?: string;
  currentAddress?: string;
  emergencyName?: string;
  emergencyPhone?: string;
  emergencyRelation?: string;
  expectedCheckinTime?: string;
  packageDays?: number;
  roomType?: string;
  serviceMode?: string;
  maternalHistory?: string;
  maternalHistoryDesc?: string;
  babyHistory?: string;
  babyHistoryDesc?: string;
  fetusType?: string;
  originalPrice?: number;
  discountedPrice?: number;
  depositAmount?: number;
  unpaidAmount?: number;
  standardTerms?: string;
  additionalTerms?: string;
  stayTimes?: number;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface ContractPageParams extends QueryParams {
  pageIndex?: number;
  pageSize?: number;
  contractNumber?: string;
  customerName?: string;
  phoneNumber?: string;
}

export interface ContractPageResult {
  items: ApiContract[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
}

export type ContractPayload = Partial<ApiContract> &
  Pick<ApiContract, 'contractNumber' | 'tCustomerId' | 'customerName'>;

interface ContractRequestOptions {
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
  const normalizedBase = contractsApiBase.replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const query = buildQueryString(params);
  return `${normalizedBase}${normalizedPath}${query}`;
}

async function contractRequest<T>(
  path: string,
  options: ContractRequestOptions = {},
) {
  const { method = 'GET', params, body, headers } = options;
  const url = resolveUrl(path, params);
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/plain, */*',
      Authorization: `Bearer ${contractsApiToken}`,
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

  let payload: ContractsApiResponse<T>;
  try {
    payload = JSON.parse(rawText) as ContractsApiResponse<T>;
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

export function getContractsPage(params: ContractPageParams) {
  return contractRequest<ContractPageResult>('/getPage', { params });
}

export function getContractsList(params?: Partial<ContractPageParams>) {
  return contractRequest<ApiContract[]>('/getList', { params });
}

export function getContractDetail(id: string) {
  return contractRequest<ApiContract>('/getOne', {
    params: { id },
  });
}

export function addContract(data: ContractPayload) {
  return contractRequest<ApiContract>('/add', {
    method: 'POST',
    body: data,
  });
}

export function updateContract(id: string, data: Partial<ApiContract>) {
  return contractRequest<ApiContract>('/update', {
    method: 'POST',
    params: { id },
    body: data,
  });
}

export function deleteContract(id: string) {
  return contractRequest<null>('/del', {
    method: 'POST',
    params: { id },
  });
}


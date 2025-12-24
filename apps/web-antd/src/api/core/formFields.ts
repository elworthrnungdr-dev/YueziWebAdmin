import { requestClient } from '#/api/request';

export interface FormFieldsListParams {
  FormType?: number;
  FieldGroup?: string;
  CreatedTimeStart?: string;
  CreatedTimeEnd?: string;
  PageIndex?: number;
  PageSize?: number;
  OrderBy?: string;
  IsAsc?: boolean;
}

export interface FormFieldsItem {
  id: string;
  formType: number;
  formTypeText: string;
  fieldKey: string;
  fieldLabel: string;
  fieldType: number;
  fieldTypeText: string;
  unit: string;
  options: string;
  fieldGroup: string;
  groupOrder: number;
  sortOrder: number;
  createdTime: string;
}

export interface FormFieldsListResponse {
  pageNo: number;
  pageSize: number;
  totalCount: number;
  pages: number;
  data: FormFieldsItem[];
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface FormFieldsListResult {
  items: FormFieldsItem[];
  total: number;
}

export interface CreateFormFieldsParams {
  formType: number;
  fieldKey: string;
  fieldLabel: string;
  fieldType: number;
  unit?: string;
  options?: string;
  fieldGroup: string;
  groupOrder: number;
  sortOrder: number;
}

export interface UpdateFormFieldsParams extends CreateFormFieldsParams {
  id: string;
}

// 获取表单数据管理列表
export async function getFormFieldsListApi(
  params: FormFieldsListParams,
): Promise<FormFieldsListResult> {
  const page = await requestClient.get<FormFieldsListResponse>(
    '/api/FormFields/list',
    { params },
  );
  const list: FormFieldsItem[] = page?.data ?? [];
  return {
    items: Array.isArray(list) ? list : [],
    total: page?.totalCount || 0,
  };
}

// 获取表单数据管理详情
export async function getFormFieldsDetailApi(
  id: string,
): Promise<FormFieldsItem> {
  const response = await requestClient.get<FormFieldsItem>(
    `/api/FormFields/${id}`,
  );
  return response as unknown as FormFieldsItem;
}

// 创建表单数据管理
export async function createFormFieldsApi(
  params: CreateFormFieldsParams,
): Promise<void> {
  await requestClient.post('/api/FormFields', params);
}

// 更新表单数据管理
export async function updateFormFieldsApi(
  params: UpdateFormFieldsParams,
): Promise<void> {
  await requestClient.put('/api/FormFields', params);
}

// 删除表单数据管理
export async function deleteFormFieldsApi(id: string): Promise<void> {
  await requestClient.delete(`/api/FormFields/${id}`);
}


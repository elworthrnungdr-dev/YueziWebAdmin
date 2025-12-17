import { requestClient } from '#/api/request';

export interface CustomerListParams {
  CustomerName?: string;
  Gender?: number; // 1男/2女/3未知
  CustomerStatus?: number; // 1意向、2已入住、3已出所
  CreatedAtStart?: string;
  CreatedAtEnd?: string;
  PageIndex?: number;
  PageSize?: number;
  OrderBy?: string;
  IsAsc?: boolean;
}

export interface BackendCustomerItem {
  id: string;
  customerName: string;
  gender: string;
  birthDate?: string;
  age?: number;
  phoneArea?: string;
  phoneNumber?: string;
  wechat?: string;
  customerStatus: number;
  paymentStatus?: number;
  expectedDeliveryDate?: string;
  deliveryDate?: string;
  deliveryMethod?: number;
  parity?: number;
  fetusType?: number;
  babyGender?: number;
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
  idType?: number;
  idNumber?: string;
  nationality?: string;
  company?: string;
  occupation?: string;
  email?: string;
  customerSource?: number;
  referrerName?: string;
  referrerPhone?: string;
  idcardFront?: string;
  idcardBack?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface BackendCustomerPage {
  pageNo: number;
  pageSize: number;
  totalCount: number;
  pages: number;
  data: BackendCustomerItem[];
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export interface CustomerItem {
  id: string;
  customerName: string;
  gender: string;
  birthDate?: string;
  age?: number;
  phoneNumber?: string;
  wechat?: string;
  customerStatus: number;
  paymentStatus?: number;
  expectedDeliveryDate?: string;
  deliveryDate?: string;
  deliveryMethod?: number;
  parity?: number;
  fetusType?: number;
  babyGender?: number;
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
  idType?: number;
  idNumber?: string;
  nationality?: string;
  company?: string;
  occupation?: string;
  email?: string;
  customerSource?: number;
  referrerName?: string;
  referrerPhone?: string;
  idcardFront?: string;
  idcardBack?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
  raw: BackendCustomerItem;
}

/**
 * 获取客户列表
 * 接口：/api/Customer/list
 */
export async function getCustomerListApi(
  params: CustomerListParams = {},
): Promise<{ items: CustomerItem[]; total: number }> {
  const page = await requestClient.get<BackendCustomerPage>('/api/Customer/list', {
    params,
  });
  const list: BackendCustomerItem[] = page?.data ?? [];
  const items: CustomerItem[] = Array.isArray(list)
    ? list.map((item) => ({
        id: item.id,
        customerName: item.customerName,
        gender: item.gender,
        birthDate: item.birthDate,
        age: item.age,
        phoneNumber: item.phoneNumber,
        wechat: item.wechat,
        customerStatus: item.customerStatus,
        paymentStatus: item.paymentStatus,
        expectedDeliveryDate: item.expectedDeliveryDate,
        deliveryDate: item.deliveryDate,
        deliveryMethod: item.deliveryMethod,
        parity: item.parity,
        fetusType: item.fetusType,
        babyGender: item.babyGender,
        deliveryHospital: item.deliveryHospital,
        stayTimes: item.stayTimes,
        tRoomId: item.tRoomId,
        registerTime: item.registerTime,
        contractSignTime: item.contractSignTime,
        checkinTime: item.checkinTime,
        checkoutTime: item.checkoutTime,
        tBranchId: item.tBranchId,
        salesEmployeesId: item.salesEmployeesId,
        registerEmployeesId: item.registerEmployeesId,
        emergencyName: item.emergencyName,
        emergencyPhone: item.emergencyPhone,
        emergencyRelation: item.emergencyRelation,
        companionName: item.companionName,
        companionPhone: item.companionPhone,
        companionRelation: item.companionRelation,
        nativePlace: item.nativePlace,
        homeAddress: item.homeAddress,
        idType: item.idType,
        idNumber: item.idNumber,
        nationality: item.nationality,
        company: item.company,
        occupation: item.occupation,
        email: item.email,
        customerSource: item.customerSource,
        referrerName: item.referrerName,
        referrerPhone: item.referrerPhone,
        idcardFront: item.idcardFront,
        idcardBack: item.idcardBack,
        remark: item.remark,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        raw: item,
      }))
    : [];

  return {
    items,
    total: page?.totalCount ?? items.length,
  };
}

export interface CreateCustomerParams {
  customerName: string;
  gender: number;
  birthDate?: string;
  age?: number;
  phoneArea?: string;
  phoneNumber?: string;
  wechat?: string;
  customerStatus: number;
  paymentStatus?: number;
  expectedDeliveryDate?: string;
  deliveryDate?: string;
  deliveryMethod?: number;
  parity?: number;
  fetusType?: number;
  babyGender?: number;
  deliveryHospital?: string;
  stayTimes?: number;
  tRoomId?: string;
  registerTime?: string;
  contractSignTime?: string;
  checkinTime?: string;
  salesEmployeesId?: string;
  emergencyName?: string;
  emergencyPhone?: string;
  emergencyRelation?: string;
  companionName?: string;
  companionPhone?: string;
  companionRelation?: string;
  nativePlace?: string;
  homeAddress?: string;
  idType?: number;
  idNumber?: string;
  nationality?: string;
  company?: string;
  occupation?: string;
  email?: string;
  customerSource?: number;
  referrerName?: string;
  referrerPhone?: string;
  idcardFront?: string;
  idcardBack?: string;
  remark?: string;
}

export interface UpdateCustomerParams extends CreateCustomerParams {
  id: string;
}

/**
 * 获取客户详情
 * 接口：GET /api/Customer/{id}
 */
export async function getCustomerDetailApi(
  id: string,
): Promise<BackendCustomerItem> {
  const res = await requestClient.get<BackendCustomerItem>(`/api/Customer/${id}`);
  return res;
}

/**
 * 创建客户档案
 * 接口：POST /api/Customer
 */
export async function createCustomerApi(
  params: CreateCustomerParams,
): Promise<void> {
  await requestClient.post('/api/Customer', params);
}

/**
 * 更新客户档案
 * 接口：PUT /api/Customer
 */
export async function updateCustomerApi(
  params: UpdateCustomerParams,
): Promise<void> {
  await requestClient.put('/api/Customer', params);
}

/**
 * 删除客户档案
 * 接口：DELETE /api/Customer/{id}
 */
export async function deleteCustomerApi(id: string): Promise<void> {
  await requestClient.delete(`/api/Customer/${id}`);
}


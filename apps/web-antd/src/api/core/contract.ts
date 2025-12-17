import { requestClient } from '#/api/request';

export interface ContractListParams {
  Tcustomerid?: string;
  Customername?: string;
  ContractNumber?: string;
  Idnumber?: string;
  CreatedAtStart?: string;
  CreatedAtEnd?: string;
  PageIndex?: number;
  PageSize?: number;
  OrderBy?: string;
  IsAsc?: boolean;
}

export interface BackendContractItem {
  id: string;
  contractnumber: string;
  tcustomerid: string;
  customername: string;
  idnumber: string;
  phonenumber?: string;
  inspectionhospital?: string;
  currentaddress?: string;
  emergencyname?: string;
  emergencyphone?: string;
  emergencyrelation?: string;
  expectedcheckintime?: string;
  packagedays?: number;
  roomtype?: string;
  servicemode?: number;
  servicemodeText?: string;
  maternalhistory?: number;
  maternalhistoryText?: string;
  maternalhistorydesc?: string;
  babyhistory?: number;
  babyhistoryText?: string;
  babyhistorydesc?: string;
  fetustype?: number;
  fetustypeText?: string;
  deliverydate?: string;
  deliverymethod?: number;
  deliverymethodText?: string;
  pregnancycount?: number;
  paritycount?: number;
  weight?: number;
  originalprice?: number;
  discountedprice?: number;
  depositamount?: number;
  unpaidamount?: number;
  standardterms?: string;
  additionalterms?: string;
  staytimes?: number;
  remark?: string;
  createdat?: string;
  updatedat?: string;
  [key: string]: any;
}

export interface BackendContractPage {
  pageNo: number;
  pageSize: number;
  totalCount: number;
  pages: number;
  data: BackendContractItem[];
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export interface ContractItem {
  id: string;
  contractnumber: string;
  tcustomerid: string;
  customername: string;
  idnumber: string;
  phonenumber?: string;
  inspectionhospital?: string;
  currentaddress?: string;
  emergencyname?: string;
  emergencyphone?: string;
  emergencyrelation?: string;
  expectedcheckintime?: string;
  packagedays?: number;
  roomtype?: string;
  servicemode?: number;
  servicemodeText?: string;
  maternalhistory?: number;
  maternalhistoryText?: string;
  maternalhistorydesc?: string;
  babyhistory?: number;
  babyhistoryText?: string;
  babyhistorydesc?: string;
  fetustype?: number;
  fetustypeText?: string;
  deliverydate?: string;
  deliverymethod?: number;
  deliverymethodText?: string;
  pregnancycount?: number;
  paritycount?: number;
  weight?: number;
  originalprice?: number;
  discountedprice?: number;
  depositamount?: number;
  unpaidamount?: number;
  standardterms?: string;
  additionalterms?: string;
  staytimes?: number;
  remark?: string;
  createdat?: string;
  updatedat?: string;
  raw: BackendContractItem;
}

/**
 * 获取合同列表
 * 接口：/api/Contract/list
 */
export async function getContractListApi(
  params: ContractListParams = {},
): Promise<{ items: ContractItem[]; total: number }> {
  const page = await requestClient.get<BackendContractPage>('/api/Contract/list', {
    params,
  });
  const list: BackendContractItem[] = page?.data ?? [];
  const items: ContractItem[] = Array.isArray(list)
    ? list.map((item) => ({
        id: item.id,
        contractnumber: item.contractnumber,
        tcustomerid: item.tcustomerid,
        customername: item.customername,
        idnumber: item.idnumber,
        phonenumber: item.phonenumber,
        inspectionhospital: item.inspectionhospital,
        currentaddress: item.currentaddress,
        emergencyname: item.emergencyname,
        emergencyphone: item.emergencyphone,
        emergencyrelation: item.emergencyrelation,
        expectedcheckintime: item.expectedcheckintime,
        packagedays: item.packagedays,
        roomtype: item.roomtype,
        servicemode: item.servicemode,
        servicemodeText: item.servicemodeText,
        maternalhistory: item.maternalhistory,
        maternalhistoryText: item.maternalhistoryText,
        maternalhistorydesc: item.maternalhistorydesc,
        babyhistory: item.babyhistory,
        babyhistoryText: item.babyhistoryText,
        babyhistorydesc: item.babyhistorydesc,
        fetustype: item.fetustype,
        fetustypeText: item.fetustypeText,
        deliverydate: item.deliverydate,
        deliverymethod: item.deliverymethod,
        deliverymethodText: item.deliverymethodText,
        pregnancycount: item.pregnancycount,
        paritycount: item.paritycount,
        weight: item.weight,
        originalprice: item.originalprice,
        discountedprice: item.discountedprice,
        depositamount: item.depositamount,
        unpaidamount: item.unpaidamount,
        standardterms: item.standardterms,
        additionalterms: item.additionalterms,
        staytimes: item.staytimes,
        remark: item.remark,
        createdat: item.createdat,
        updatedat: item.updatedat,
        raw: item,
      }))
    : [];

  return {
    items,
    total: page?.totalCount ?? items.length,
  };
}

export interface CreateContractParams {
  tcustomerid: string;
  expectedcheckintime?: string;
  packagedays?: number;
  roomId?: string;
  servicemode?: number;
  maternalhistory?: number;
  maternalhistorydesc?: string;
  babyhistory?: number;
  babyhistorydesc?: string;
  fetustype?: number;
  deliverydate?: string;
  deliverymethod?: number;
  pregnancycount?: number;
  paritycount?: number;
  weight?: number;
  discountedprice?: number;
  depositamount?: number;
  unpaidamount?: number;
  standardterms?: string;
  additionalterms?: string;
  staytimes?: number;
  remark?: string;
}

export interface UpdateContractParams extends CreateContractParams {
  id: string;
}

/**
 * 创建合同
 * 接口：POST /api/Contract
 */
export async function createContractApi(
  params: CreateContractParams,
): Promise<void> {
  await requestClient.post('/api/Contract', params);
}

/**
 * 获取合同详情
 * 接口：GET /api/Contract/{id}
 */
export async function getContractDetailApi(
  id: string,
): Promise<BackendContractItem> {
  return requestClient.get<BackendContractItem>(`/api/Contract/${id}`);
}

/**
 * 更新合同
 * 接口：PUT /api/Contract
 */
export async function updateContractApi(
  params: UpdateContractParams,
): Promise<void> {
  await requestClient.put('/api/Contract', params);
}

/**
 * 删除合同
 * 接口：DELETE /api/Contract/{id}
 */
export async function deleteContractApi(id: string): Promise<void> {
  await requestClient.delete(`/api/Contract/${id}`);
}


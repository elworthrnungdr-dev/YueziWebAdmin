<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';

import {
  Button,
  DatePicker,
  Input,
  InputNumber,
  message,
  Modal,
  Pagination,
  Select,
  Table,
  TableColumn,
} from 'ant-design-vue';
import {
  addContract,
  deleteContract as deleteContractApi,
  getContractsPage,
  getContractDetail,
  updateContract as updateContractApi,
  type ApiContract,
  type ContractPayload,
} from '#/api/contract';
import { getCustomersList, type ApiCustomer } from '#/api/customer';

interface Contract {
  tContractId: string;
  contractNumber: string;
  tCustomerId: string;
  customerName: string;
  idNumber: string;
  phoneNumber: string;
  inspectionHospital: string;
  currentAddress: string;
  emergencyName: string;
  emergencyPhone: string;
  emergencyRelation: string;
  expectedCheckinTime: string;
  packageDays: number | null;
  roomType: string;
  serviceMode: string;
  maternalHistory: string;
  maternalHistoryDesc: string;
  babyHistory: string;
  babyHistoryDesc: string;
  fetusType: string;
  originalPrice: number | null;
  discountedPrice: number | null;
  depositAmount: number | null;
  unpaidAmount: number | null;
  standardTerms: string;
  additionalTerms: string;
  stayTimes: number | null;
  remark: string;
  createdAt: string;
  updatedAt: string;
}

const DATE_FORMAT = 'YYYY-MM-DD';

const createEmptyContract = (): Contract => ({
  tContractId: '',
  contractNumber: '',
  tCustomerId: '',
  customerName: '',
  idNumber: '',
  phoneNumber: '',
  inspectionHospital: '',
  currentAddress: '',
  emergencyName: '',
  emergencyPhone: '',
  emergencyRelation: '',
  expectedCheckinTime: '',
  packageDays: null,
  roomType: '',
  serviceMode: '',
  maternalHistory: '',
  maternalHistoryDesc: '',
  babyHistory: '',
  babyHistoryDesc: '',
  fetusType: '',
  originalPrice: null,
  discountedPrice: null,
  depositAmount: null,
  unpaidAmount: null,
  standardTerms: '',
  additionalTerms: '',
  stayTimes: null,
  remark: '',
  createdAt: '',
  updatedAt: '',
});

const toNullableNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const mapApiContractToLocal = (api: ApiContract): Contract => ({
  tContractId: api.tContractId ?? '',
  contractNumber: api.contractNumber ?? '',
  tCustomerId: api.tCustomerId ?? '',
  customerName: api.customerName ?? '',
  idNumber: api.idNumber ?? '',
  phoneNumber: api.phoneNumber ?? '',
  inspectionHospital: api.inspectionHospital ?? '',
  currentAddress: api.currentAddress ?? '',
  emergencyName: api.emergencyName ?? '',
  emergencyPhone: api.emergencyPhone ?? '',
  emergencyRelation: api.emergencyRelation ?? '',
  expectedCheckinTime: api.expectedCheckinTime ?? '',
  packageDays: toNullableNumber(api.packageDays),
  roomType: api.roomType ?? '',
  serviceMode: api.serviceMode ?? '',
  maternalHistory: api.maternalHistory ?? '',
  maternalHistoryDesc: api.maternalHistoryDesc ?? '',
  babyHistory: api.babyHistory ?? '',
  babyHistoryDesc: api.babyHistoryDesc ?? '',
  fetusType: api.fetusType ?? '',
  originalPrice: toNullableNumber(api.originalPrice),
  discountedPrice: toNullableNumber(api.discountedPrice),
  depositAmount: toNullableNumber(api.depositAmount),
  unpaidAmount: toNullableNumber(api.unpaidAmount),
  standardTerms: api.standardTerms ?? '',
  additionalTerms: api.additionalTerms ?? '',
  stayTimes: toNullableNumber(api.stayTimes),
  remark: api.remark ?? '',
  createdAt: api.createdAt ?? '',
  updatedAt: api.updatedAt ?? '',
});

const contractFieldKeys: (keyof Contract)[] = [
  'contractNumber',
  'tCustomerId',
  'customerName',
  'idNumber',
  'phoneNumber',
  'inspectionHospital',
  'currentAddress',
  'emergencyName',
  'emergencyPhone',
  'emergencyRelation',
  'expectedCheckinTime',
  'packageDays',
  'roomType',
  'serviceMode',
  'maternalHistory',
  'maternalHistoryDesc',
  'babyHistory',
  'babyHistoryDesc',
  'fetusType',
  'originalPrice',
  'discountedPrice',
  'depositAmount',
  'unpaidAmount',
  'standardTerms',
  'additionalTerms',
  'stayTimes',
  'remark',
];

const mapLocalContractToApiPayload = (
  contract: Contract,
): ContractPayload => {
  const payload: Record<string, unknown> = {};
  contractFieldKeys.forEach((key) => {
    const value = contract[key];
    if (
      value !== undefined &&
      value !== null &&
      !(typeof value === 'string' && value.trim() === '')
    ) {
      payload[key] = value;
    }
  });
  return payload as ContractPayload;
};

const requiredContractFields: (keyof Contract)[] = [
  'contractNumber',
  'tCustomerId',
  'customerName',
];

const requiredFieldLabels: Record<
  (typeof requiredContractFields)[number],
  string
> = {
  contractNumber: '合同编号',
  tCustomerId: '客户',
  customerName: '客户姓名',
};

const contracts = ref<Contract[]>([]);
const loading = ref(false);
const selectedRowKeys = ref<string[]>([]);

const searchForm = reactive({
  customerName: '',
  contractNumber: '',
  phoneNumber: '',
});

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
});

const modalVisible = ref(false);
const modalTitle = ref('新增合同');
const isEditing = ref(false);
const currentContractId = ref('');
const submitLoading = ref(false);

const contractForm = reactive<Contract>(createEmptyContract());

const allCustomers = ref<ApiCustomer[]>([]);

const loadCustomers = async () => {
  try {
    const res = await getCustomersList();
    allCustomers.value = res ?? [];
  } catch (error) {
    console.error('加载客户列表失败：', error);
  }
};

const customerOptions = computed(() =>
  allCustomers.value.map((customer) => ({
    label: customer.customerName ?? '-',
    value: customer.tCustomerId ?? '',
    phone: customer.phoneNumber ?? '',
  })),
);

const handleCustomerSelect = (customerId?: string) => {
  if (!customerId) {
    contractForm.tCustomerId = '';
    return;
  }
  const hit = customerOptions.value.find((item) => item.value === customerId);
  if (!hit) return;
  contractForm.tCustomerId = customerId;
  contractForm.customerName = hit.label;
  if (!isEditing.value) {
    contractForm.phoneNumber = hit.phone || '';
  }
};

const validateContractForm = () => {
  for (const field of requiredContractFields) {
    const value = contractForm[field];
    if (
      value === undefined ||
      value === null ||
      (typeof value === 'string' && value.trim() === '')
    ) {
      message.error(`${requiredFieldLabels[field]}为必填项`);
      return false;
    }
  }
  return true;
};

const buildPageParams = () => ({
  pageIndex: pagination.current,
  pageSize: pagination.pageSize,
  customerName: searchForm.customerName || undefined,
  contractNumber: searchForm.contractNumber || undefined,
  phoneNumber: searchForm.phoneNumber || undefined,
});

const loadContracts = async () => {
  loading.value = true;
  try {
    const response = await getContractsPage(buildPageParams());
    const items = response?.items ?? [];
    contracts.value = items.map((item) => mapApiContractToLocal(item));
    pagination.total = response?.totalCount ?? items.length;
    pagination.current = response?.pageIndex ?? pagination.current;
    pagination.pageSize = response?.pageSize ?? pagination.pageSize;
    selectedRowKeys.value = [];
  } catch (error) {
    console.error(error);
    message.error(error instanceof Error ? error.message : '获取合同列表失败');
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  pagination.current = 1;
  loadContracts();
};

const handleReset = () => {
  Object.assign(searchForm, {
    customerName: '',
    contractNumber: '',
    phoneNumber: '',
  });
  pagination.current = 1;
  pagination.pageSize = 10;
  loadContracts();
};

const handleAdd = () => {
  modalTitle.value = '新增合同';
  isEditing.value = false;
  currentContractId.value = '';
  Object.assign(contractForm, createEmptyContract());
  modalVisible.value = true;
};

const handleEdit = async (record: Contract) => {
  modalTitle.value = '编辑合同';
  isEditing.value = true;
  currentContractId.value = record.tContractId;
  try {
    const detail = await getContractDetail(record.tContractId);
    Object.assign(contractForm, createEmptyContract(), mapApiContractToLocal(detail));
  } catch (error) {
    console.error('获取合同详情失败：', error);
    Object.assign(contractForm, createEmptyContract(), record);
  }
  modalVisible.value = true;
};

const handleSave = async () => {
  if (!validateContractForm()) {
    return;
  }
  submitLoading.value = true;
  try {
    const payload = mapLocalContractToApiPayload(contractForm);
    if (isEditing.value) {
      await updateContractApi(currentContractId.value, payload);
      message.success('合同信息更新成功');
    } else {
      await addContract(payload);
      message.success('合同创建成功');
    }
    modalVisible.value = false;
    await loadContracts();
  } catch (error) {
    console.error(error);
    message.error(error instanceof Error ? error.message : '保存合同失败');
  } finally {
    submitLoading.value = false;
  }
};

const handleDelete = (id: string) => {
  Modal.confirm({
    title: '确认删除',
    content: '确定要删除该合同吗？',
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      try {
        await deleteContractApi(id);
        message.success('删除成功');
        await loadContracts();
      } catch (error) {
        message.error(error instanceof Error ? error.message : '删除失败');
        throw error;
      }
    },
  });
};

const handleBatchDelete = () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请选择要删除的合同');
    return;
  }
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除选中的 ${selectedRowKeys.value.length} 份合同吗？`,
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      try {
        await Promise.all(
          selectedRowKeys.value.map((id) => deleteContractApi(id)),
        );
        message.success('批量删除成功');
        await loadContracts();
      } catch (error) {
        message.error(error instanceof Error ? error.message : '批量删除失败');
        throw error;
      }
    },
  });
};

const handleCancel = () => {
  modalVisible.value = false;
};

const handlePageChange = (page: number, pageSize: number) => {
  pagination.current = page;
  pagination.pageSize = pageSize;
  loadContracts();
};

const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys: string[]) => {
    selectedRowKeys.value = keys;
  },
}));

const formatCurrency = (value: number | null) => {
  if (value === null || value === undefined) return '-';
  return `¥${Number(value).toLocaleString()}`;
};

onMounted(async () => {
  await loadCustomers();
  await loadContracts();
});
</script>

<template>
  <div class="p-4">
    <h1 class="mb-4 text-2xl font-bold">合同信息</h1>

    <div class="mb-4 rounded-lg bg-white p-6 shadow">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div>
          <label class="mb-2 block text-sm font-medium">客户姓名</label>
          <Input
            v-model:value="searchForm.customerName"
            placeholder="请输入客户姓名"
            allow-clear
            @press-enter="handleSearch"
          />
        </div>
        <div>
          <label class="mb-2 block text-sm font-medium">合同编号</label>
          <Input
            v-model:value="searchForm.contractNumber"
            placeholder="请输入合同编号"
            allow-clear
            @press-enter="handleSearch"
          />
        </div>
        <div>
          <label class="mb-2 block text-sm font-medium">联系电话</label>
          <Input
            v-model:value="searchForm.phoneNumber"
            placeholder="请输入联系电话"
            allow-clear
            @press-enter="handleSearch"
          />
        </div>
        <div class="flex items-end gap-2">
          <Button type="primary" @click="handleSearch">搜索</Button>
          <Button @click="handleReset">重置</Button>
        </div>
      </div>
    </div>

    <div class="mb-4 flex justify-between">
      <div class="flex gap-2">
        <Button type="primary" @click="handleAdd">新增合同</Button>
        <Button
          danger
          :disabled="selectedRowKeys.length === 0"
          @click="handleBatchDelete"
        >
          批量删除
        </Button>
      </div>
      <div>已选择 {{ selectedRowKeys.length }} 项</div>
    </div>

    <div class="rounded-lg bg-white p-6 shadow">
      <Table
        :data-source="contracts"
        :loading="loading"
        :row-key="(record) => record.tContractId"
        :pagination="false"
        :row-selection="rowSelection"
        :scroll="{ x: 'max-content' }"
      >
        <TableColumn
          title="合同编号"
          data-index="contractNumber"
          :width="160"
        />
        <TableColumn title="客户姓名" data-index="customerName" :width="140" />
        <TableColumn title="联系电话" data-index="phoneNumber" :width="140" />
        <TableColumn title="预计入住" data-index="expectedCheckinTime" :width="140" />
        <TableColumn title="套餐天数" data-index="packageDays" :width="120" />
        <TableColumn title="房型" data-index="roomType" :width="140" />
        <TableColumn title="服务模式" data-index="serviceMode" :width="140" />
        <TableColumn title="优惠价" key="discountedPrice" :width="140">
          <template #default="{ record }">
            {{ formatCurrency(record.discountedPrice) }}
          </template>
        </TableColumn>
        <TableColumn title="定金" key="depositAmount" :width="120">
          <template #default="{ record }">
            {{ formatCurrency(record.depositAmount) }}
          </template>
        </TableColumn>
        <TableColumn title="未付金额" key="unpaidAmount" :width="140">
          <template #default="{ record }">
            {{ formatCurrency(record.unpaidAmount) }}
          </template>
        </TableColumn>
        <TableColumn title="更新时间" data-index="updatedAt" :width="180" />
        <TableColumn title="操作" :width="150" fixed="right">
          <template #default="{ record }">
            <div class="flex gap-2">
              <Button type="link" size="small" @click="handleEdit(record)">
                编辑
              </Button>
              <Button
                type="link"
                size="small"
                danger
                @click="handleDelete(record.tContractId)"
              >
                删除
              </Button>
            </div>
          </template>
        </TableColumn>
      </Table>
      <div class="mt-4 flex justify-end">
        <Pagination
          v-model:current="pagination.current"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          show-size-changer
          @change="handlePageChange"
        />
      </div>
    </div>

    <Modal
      v-model:open="modalVisible"
      :title="modalTitle"
      :width="800"
      :confirm-loading="submitLoading"
      @ok="handleSave"
      @cancel="handleCancel"
    >
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label class="mb-1 block text-sm font-medium">
            合同编号 <span class="text-red-500">*</span>
          </label>
          <Input
            v-model:value="contractForm.contractNumber"
            placeholder="请输入合同编号"
            :maxlength="50"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium">
            关联客户 <span class="text-red-500">*</span>
          </label>
          <Select
            v-model:value="contractForm.tCustomerId"
            show-search
            allow-clear
            placeholder="请选择客户"
            class="w-full"
            option-filter-prop="label"
            @change="handleCustomerSelect"
          >
            <Select.Option
              v-for="customer in customerOptions"
              :key="customer.value"
              :value="customer.value"
              :label="customer.label"
            >
              {{ customer.label }}
            </Select.Option>
          </Select>
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium">
            客户姓名 <span class="text-red-500">*</span>
          </label>
          <Input
            v-model:value="contractForm.customerName"
            placeholder="请输入客户姓名"
            :maxlength="50"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium">证件号码</label>
          <Input
            v-model:value="contractForm.idNumber"
            placeholder="请输入证件号码"
            :maxlength="30"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium">联系电话</label>
          <Input
            v-model:value="contractForm.phoneNumber"
            placeholder="请输入联系电话"
            :maxlength="20"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium">产检医院</label>
          <Input
            v-model:value="contractForm.inspectionHospital"
            placeholder="请输入产检医院"
            :maxlength="100"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium">现住址</label>
          <Input
            v-model:value="contractForm.currentAddress"
            placeholder="请输入现住址"
            :maxlength="200"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium">紧急联系人</label>
          <Input
            v-model:value="contractForm.emergencyName"
            placeholder="请输入紧急联系人姓名"
            :maxlength="50"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium">紧急联系人电话</label>
          <Input
            v-model:value="contractForm.emergencyPhone"
            placeholder="请输入紧急联系人电话"
            :maxlength="20"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium">紧急联系人关系</label>
          <Input
            v-model:value="contractForm.emergencyRelation"
            placeholder="请输入关系"
            :maxlength="20"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium">预计入住时间</label>
          <DatePicker
            v-model:value="contractForm.expectedCheckinTime"
            :value-format="DATE_FORMAT"
            class="w-full"
            allow-clear
            placeholder="请选择预计入住时间"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium">套餐天数</label>
          <InputNumber
            v-model:value="contractForm.packageDays"
            :min="0"
            class="w-full"
            placeholder="请输入套餐天数"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium">房型</label>
          <Input
            v-model:value="contractForm.roomType"
            placeholder="请输入房型"
            :maxlength="50"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium">服务模式</label>
          <Input
            v-model:value="contractForm.serviceMode"
            placeholder="请输入服务模式"
            :maxlength="20"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium">孕产史</label>
          <Select
            v-model:value="contractForm.maternalHistory"
            allow-clear
            placeholder="请选择孕产史"
            class="w-full"
          >
            <Select.Option value="初产">初产</Select.Option>
            <Select.Option value="经产">经产</Select.Option>
          </Select>
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium">孕产史描述</label>
          <Input.TextArea
            v-model:value="contractForm.maternalHistoryDesc"
            :rows="2"
            :maxlength="500"
            placeholder="请输入孕产史描述"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium">婴儿史</label>
          <Select
            v-model:value="contractForm.babyHistory"
            allow-clear
            placeholder="请选择婴儿史"
            class="w-full"
          >
            <Select.Option value="健康">健康</Select.Option>
            <Select.Option value="特殊">特殊</Select.Option>
          </Select>
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium">婴儿史描述</label>
          <Input.TextArea
            v-model:value="contractForm.babyHistoryDesc"
            :rows="2"
            :maxlength="500"
            placeholder="请输入婴儿史描述"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium">胎儿类型</label>
          <Select
            v-model:value="contractForm.fetusType"
            allow-clear
            placeholder="请选择胎儿类型"
            class="w-full"
          >
            <Select.Option value="单胎">单胎</Select.Option>
            <Select.Option value="双胎">双胎</Select.Option>
            <Select.Option value="多胎">多胎</Select.Option>
          </Select>
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium">原价</label>
          <InputNumber
            v-model:value="contractForm.originalPrice"
            :min="0"
            :precision="2"
            class="w-full"
            placeholder="请输入原价"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium">优惠价</label>
          <InputNumber
            v-model:value="contractForm.discountedPrice"
            :min="0"
            :precision="2"
            class="w-full"
            placeholder="请输入优惠价"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium">定金金额</label>
          <InputNumber
            v-model:value="contractForm.depositAmount"
            :min="0"
            :precision="2"
            class="w-full"
            placeholder="请输入定金金额"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium">未付金额</label>
          <InputNumber
            v-model:value="contractForm.unpaidAmount"
            :min="0"
            :precision="2"
            class="w-full"
            placeholder="请输入未付金额"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium">入住次数</label>
          <InputNumber
            v-model:value="contractForm.stayTimes"
            :min="0"
            class="w-full"
            placeholder="请输入入住次数"
          />
        </div>
        <div class="md:col-span-2">
          <label class="mb-1 block text-sm font-medium">标准条款</label>
          <Input.TextArea
            v-model:value="contractForm.standardTerms"
            :rows="3"
            placeholder="请输入标准条款"
          />
        </div>
        <div class="md:col-span-2">
          <label class="mb-1 block text-sm font-medium">附加条款</label>
          <Input.TextArea
            v-model:value="contractForm.additionalTerms"
            :rows="3"
            placeholder="请输入附加条款"
          />
        </div>
        <div class="md:col-span-2">
          <label class="mb-1 block text-sm font-medium">备注</label>
          <Input.TextArea
            v-model:value="contractForm.remark"
            :rows="3"
            :maxlength="200"
            placeholder="请输入备注"
          />
        </div>
      </div>
    </Modal>
  </div>
</template>


<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import {
  getPaymentListApi,
  createPaymentApi,
  getPaymentDetailApi,
  updatePaymentApi,
  deletePaymentApi,
  type PaymentItem,
  type PaymentListParams,
  type CreatePaymentParams,
  type UpdatePaymentParams,
} from '#/api';

import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
} from 'ant-design-vue';
import type { FormInstance } from 'ant-design-vue';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

// 支付类型选项
const paymentTypeOptions = [
  { label: '合同定金', value: 1 },
  { label: '合同尾款', value: 2 },
  { label: '额外消费', value: 3 },
  { label: '其它', value: 99 },
];

// 支付分类选项
const paymentCategoryOptions = [
  { label: '收入', value: 1 },
  { label: '支出', value: 2 },
  { label: '退款', value: 3 },
];

// 支付方式选项
const paymentMethodOptions = [
  { label: '现金', value: 1 },
  { label: '银行卡', value: 2 },
  { label: '微信', value: 3 },
  { label: '支付宝', value: 4 },
];

// 支付状态选项
const paymentStatusOptions = [
  { label: '待支付', value: 1 },
  { label: '支付中', value: 2 },
  { label: '已支付', value: 3 },
];

// 发票状态选项
const invoiceStatusOptions = [
  { label: '未开票', value: 1 },
  { label: '已开票', value: 2 },
];

const loading = ref(false);
const dataSource = ref<PaymentItem[]>([]);
const total = ref(0);

const queryForm = ref<PaymentListParams>({
  ContractNo: undefined,
  PaymentTimeStart: undefined,
  PaymentTimeEnd: undefined,
  CreateTimeStart: undefined,
  CreateTimeEnd: undefined,
  PageIndex: 1,
  PageSize: 10,
  OrderBy: undefined,
  IsAsc: true,
});

const paymentDateRange = ref<[Dayjs | null, Dayjs | null]>([null, null]);
const createDateRange = ref<[Dayjs | null, Dayjs | null]>([null, null]);

const columns = [
  {
    title: '合同编号',
    dataIndex: 'tContractId',
    key: 'tContractId',
    width: 150,
  },
  {
    title: '支付类型',
    dataIndex: 'paymentTypeText',
    key: 'paymentTypeText',
    width: 120,
  },
  {
    title: '支付分类',
    dataIndex: 'paymentCategoryText',
    key: 'paymentCategoryText',
    width: 120,
  },
  {
    title: '支付方式',
    dataIndex: 'paymentMethodText',
    key: 'paymentMethodText',
    width: 120,
  },
  {
    title: '支付状态',
    dataIndex: 'paymentStatusText',
    key: 'paymentStatusText',
    width: 120,
  },
  {
    title: '支付金额',
    dataIndex: 'amount',
    key: 'amount',
    width: 120,
  },
  {
    title: '支付时间',
    dataIndex: 'paymentTime',
    key: 'paymentTime',
    width: 160,
  },
  {
    title: '交易单号',
    dataIndex: 'transactionNo',
    key: 'transactionNo',
    width: 180,
  },
  {
    title: '发票号',
    dataIndex: 'invoiceNo',
    key: 'invoiceNo',
    width: 150,
  },
  {
    title: '发票状态',
    dataIndex: 'invoiceStatusText',
    key: 'invoiceStatusText',
    width: 120,
  },
  {
    title: '备注',
    dataIndex: 'remark',
    key: 'remark',
    width: 200,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
    width: 160,
  },
  {
    title: '操作',
    key: 'actions',
    width: 140,
    fixed: 'right',
  },
];

async function fetchList() {
  loading.value = true;
  try {
    // 处理日期范围
    const params: PaymentListParams = {
      ...queryForm.value,
    };
    if (paymentDateRange.value[0]) {
      params.PaymentTimeStart = paymentDateRange.value[0].format('YYYY-MM-DD');
    }
    if (paymentDateRange.value[1]) {
      params.PaymentTimeEnd = paymentDateRange.value[1].format('YYYY-MM-DD');
    }
    if (createDateRange.value[0]) {
      params.CreateTimeStart = createDateRange.value[0].format('YYYY-MM-DD');
    }
    if (createDateRange.value[1]) {
      params.CreateTimeEnd = createDateRange.value[1].format('YYYY-MM-DD');
    }

    const { items, total: t } = await getPaymentListApi(params);
    dataSource.value = items;
    total.value = t;
  } catch (error: any) {
    const errMsg =
      error?.response?.data?.message || error?.message || '获取付款信息列表失败';
    message.error(errMsg);
  } finally {
    loading.value = false;
  }
}

function handleReset() {
  queryForm.value.ContractNo = undefined;
  queryForm.value.PaymentTimeStart = undefined;
  queryForm.value.PaymentTimeEnd = undefined;
  queryForm.value.CreateTimeStart = undefined;
  queryForm.value.CreateTimeEnd = undefined;
  queryForm.value.PageIndex = 1;
  queryForm.value.PageSize = 10;
  queryForm.value.OrderBy = undefined;
  queryForm.value.IsAsc = true;
  paymentDateRange.value = [null, null];
  createDateRange.value = [null, null];
  fetchList();
}

function handleTableChange(pagination: any) {
  queryForm.value.PageIndex = pagination.current;
  queryForm.value.PageSize = pagination.pageSize;
  fetchList();
}

// 创建/编辑付款信息弹窗相关
const createModalVisible = ref(false);
const submitting = ref(false);
const isEditMode = ref(false);
const editingPaymentId = ref<string>('');
const formRef = ref<FormInstance>();
const formModel = ref<CreatePaymentParams & { paymentTime?: Dayjs }>({
  tContractId: '',
  paymentType: 1,
  paymentCategory: 1,
  amount: 0,
  paymentMethod: 1,
  paymentStatus: 1,
  paymentTime: undefined,
  transactionNo: '',
  invoiceNo: '',
  invoiceStatus: 1,
  remark: '',
});

const formRules = {
  tContractId: [{ required: true, message: '请输入合同ID' }],
  paymentType: [{ required: true, message: '请选择支付类型' }],
  paymentCategory: [{ required: true, message: '请选择支付分类' }],
  amount: [{ required: true, message: '请输入支付金额' }],
  paymentMethod: [{ required: true, message: '请选择支付方式' }],
  paymentStatus: [{ required: true, message: '请选择支付状态' }],
};

function resetForm() {
  formModel.value = {
    tContractId: '',
    paymentType: 1,
    paymentCategory: 1,
    amount: 0,
    paymentMethod: 1,
    paymentStatus: 1,
    paymentTime: undefined as Dayjs | undefined,
    transactionNo: '',
    invoiceNo: '',
    invoiceStatus: 1,
    remark: '',
  };
  formRef.value?.resetFields();
}

function openCreateModal() {
  isEditMode.value = false;
  editingPaymentId.value = '';
  createModalVisible.value = true;
  resetForm();
}

async function openEditModal(record: PaymentItem) {
  isEditMode.value = true;
  editingPaymentId.value = record.id;
  createModalVisible.value = true;
  resetForm();

  try {
    const detail = await getPaymentDetailApi(record.id);
    // 填充表单数据
    formModel.value = {
      tContractId: detail.tContractId || '',
      paymentType: detail.paymentType,
      paymentCategory: detail.paymentCategory,
      amount: detail.amount,
      paymentMethod: detail.paymentMethod,
      paymentStatus: detail.paymentStatus,
      paymentTime: detail.paymentTime ? dayjs(detail.paymentTime) : undefined,
      transactionNo: detail.transactionNo || '',
      invoiceNo: detail.invoiceNo || '',
      invoiceStatus: detail.invoiceStatus,
      remark: detail.remark || '',
    };
  } catch (error: any) {
    const errMsg =
      error?.response?.data?.message ||
      error?.data?.message ||
      error?.message ||
      '获取付款信息详情失败';
    message.error(errMsg);
    createModalVisible.value = false;
  }
}

function closeCreateModal() {
  createModalVisible.value = false;
  isEditMode.value = false;
  editingPaymentId.value = '';
  resetForm();
}

async function handleSubmit() {
  try {
    const values = await formRef.value?.validate();
    if (!values) return;
    submitting.value = true;

    // 处理日期字段 - DatePicker 返回的是 dayjs 对象
    const baseData = {
      ...values,
      paymentTime: values.paymentTime
        ? (values.paymentTime as Dayjs).toISOString()
        : undefined,
    };

    if (isEditMode.value) {
      // 更新付款信息
      const updateData: UpdatePaymentParams = {
        ...baseData,
        id: editingPaymentId.value,
      };
      await updatePaymentApi(updateData);
      message.success('更新付款信息成功');
    } else {
      // 创建付款信息
      await createPaymentApi(baseData);
      message.success('创建付款信息成功');
    }
    closeCreateModal();
    fetchList();
  } catch (error: any) {
    // 表单验证错误，不处理
    if (error?.errorFields) {
      return;
    }
    // 提取错误消息，优先使用 response.data.message，然后是 data.message，最后是 error.message
    const errMsg =
      error?.response?.data?.message ||
      error?.data?.message ||
      error?.message ||
      (isEditMode.value ? '更新付款信息失败' : '创建付款信息失败');
    message.error(errMsg);
    // 阻止错误继续传播到控制台
    return;
  } finally {
    submitting.value = false;
  }
}

async function handleDelete(record: PaymentItem) {
  try {
    await deletePaymentApi(record.id);
    message.success('删除付款信息成功');
    fetchList();
  } catch (error: any) {
    const errMsg =
      error?.response?.data?.message ||
      error?.data?.message ||
      error?.message ||
      '删除付款信息失败';
    message.error(errMsg);
  }
}

onMounted(fetchList);
</script>

<template>
  <div class="p-4">
    <div class="mb-3 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <Button
          type="primary"
          class="cursor-pointer"
          @click="openCreateModal"
        >
          创建付款信息
        </Button>
      </div>
      <Space>
        <Input
          v-model:value="queryForm.ContractNo"
          allow-clear
          placeholder="合同编号"
          style="width: 150px"
        />
        <DatePicker.RangePicker
          v-model:value="paymentDateRange"
          format="YYYY-MM-DD"
          :placeholder="['支付开始时间', '支付结束时间']"
          style="width: 240px"
        />
        <DatePicker.RangePicker
          v-model:value="createDateRange"
          format="YYYY-MM-DD"
          :placeholder="['创建开始时间', '创建结束时间']"
          style="width: 240px"
        />
        <Button type="primary" class="cursor-pointer" @click="fetchList">
          查询
        </Button>
        <Button class="cursor-pointer" @click="handleReset">重置</Button>
      </Space>
    </div>

    <Table
      :columns="columns"
      :data-source="dataSource"
      :loading="loading"
      :pagination="{
        current: queryForm.PageIndex,
        pageSize: queryForm.PageSize,
        total,
        showSizeChanger: true,
      }"
      row-key="id"
      @change="handleTableChange"
      :scroll="{ x: 1600 }"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'amount'">
          <span v-if="record.amount !== null && record.amount !== undefined">
            ¥{{ record.amount.toLocaleString() }}
          </span>
          <span v-else>—</span>
        </template>
        <template v-else-if="column.key === 'paymentTime'">
          <span v-if="record.paymentTime">
            {{ new Date(record.paymentTime).toLocaleString('zh-CN') }}
          </span>
          <span v-else>—</span>
        </template>
        <template v-else-if="column.key === 'createTime'">
          <span v-if="record.createTime">
            {{ new Date(record.createTime).toLocaleString('zh-CN') }}
          </span>
          <span v-else>—</span>
        </template>
        <template v-else-if="column.key === 'paymentTypeText'">
          <span>{{ record.paymentTypeText || '—' }}</span>
        </template>
        <template v-else-if="column.key === 'paymentCategoryText'">
          <span>{{ record.paymentCategoryText || '—' }}</span>
        </template>
        <template v-else-if="column.key === 'paymentMethodText'">
          <span>{{ record.paymentMethodText || '—' }}</span>
        </template>
        <template v-else-if="column.key === 'paymentStatusText'">
          <span>{{ record.paymentStatusText || '—' }}</span>
        </template>
        <template v-else-if="column.key === 'invoiceStatusText'">
          <span>{{ record.invoiceStatusText || '—' }}</span>
        </template>
        <template v-else-if="column.key === 'remark'">
          <span>{{ record.remark || '—' }}</span>
        </template>
        <template v-else-if="column.key === 'transactionNo'">
          <span>{{ record.transactionNo || '—' }}</span>
        </template>
        <template v-else-if="column.key === 'invoiceNo'">
          <span>{{ record.invoiceNo || '—' }}</span>
        </template>
        <template v-else-if="column.key === 'actions'">
          <Space>
            <Button
              size="small"
              type="link"
              class="cursor-pointer"
              @click="openEditModal(record)"
            >
              更新
            </Button>
            <Popconfirm
              title="确定删除该付款信息吗？"
              ok-text="删除"
              cancel-text="取消"
              @confirm="handleDelete(record)"
            >
              <Button type="link" danger size="small" class="cursor-pointer">
                删除
              </Button>
            </Popconfirm>
          </Space>
        </template>
      </template>
    </Table>

    <!-- 创建/编辑付款信息弹窗 -->
    <Modal
      v-model:open="createModalVisible"
      :title="isEditMode ? '更新付款信息' : '创建付款信息'"
      width="800px"
      :confirm-loading="submitting"
      @ok="handleSubmit"
      @cancel="closeCreateModal"
      destroy-on-close
    >
      <Form
        ref="formRef"
        :model="formModel"
        :rules="formRules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 18 }"
      >
        <div class="grid grid-cols-2 gap-4">
          <!-- 第一列 -->
          <div>
            <Form.Item label="合同ID" name="tContractId">
              <Input
                v-model:value="formModel.tContractId"
                placeholder="请输入合同ID"
                allow-clear
              />
            </Form.Item>

            <Form.Item label="支付类型" name="paymentType">
              <Select
                v-model:value="formModel.paymentType"
                placeholder="请选择支付类型"
                :options="paymentTypeOptions"
                style="width: 100%"
              />
            </Form.Item>

            <Form.Item label="支付分类" name="paymentCategory">
              <Select
                v-model:value="formModel.paymentCategory"
                placeholder="请选择支付分类"
                :options="paymentCategoryOptions"
                style="width: 100%"
              />
            </Form.Item>

            <Form.Item label="支付金额" name="amount">
              <InputNumber
                v-model:value="formModel.amount"
                placeholder="请输入支付金额"
                :min="0"
                :precision="2"
                style="width: 100%"
              />
            </Form.Item>

            <Form.Item label="支付方式" name="paymentMethod">
              <Select
                v-model:value="formModel.paymentMethod"
                placeholder="请选择支付方式"
                :options="paymentMethodOptions"
                style="width: 100%"
              />
            </Form.Item>

            <Form.Item label="支付状态" name="paymentStatus">
              <Select
                v-model:value="formModel.paymentStatus"
                placeholder="请选择支付状态"
                :options="paymentStatusOptions"
                style="width: 100%"
              />
            </Form.Item>
          </div>

          <!-- 第二列 -->
          <div>
            <Form.Item label="支付时间" name="paymentTime">
              <DatePicker
                v-model:value="formModel.paymentTime"
                show-time
                format="YYYY-MM-DD HH:mm:ss"
                placeholder="请选择支付时间"
                style="width: 100%"
              />
            </Form.Item>

            <Form.Item label="交易单号" name="transactionNo">
              <Input
                v-model:value="formModel.transactionNo"
                placeholder="请输入交易单号"
                allow-clear
              />
            </Form.Item>

            <Form.Item label="发票号" name="invoiceNo">
              <Input
                v-model:value="formModel.invoiceNo"
                placeholder="请输入发票号"
                allow-clear
              />
            </Form.Item>

            <Form.Item label="发票状态" name="invoiceStatus">
              <Select
                v-model:value="formModel.invoiceStatus"
                placeholder="请选择发票状态"
                :options="invoiceStatusOptions"
                style="width: 100%"
              />
            </Form.Item>

            <Form.Item label="备注" name="remark">
              <Input.TextArea
                v-model:value="formModel.remark"
                :rows="4"
                placeholder="请输入备注"
                allow-clear
              />
            </Form.Item>
          </div>
        </div>
      </Form>
    </Modal>
  </div>
</template>


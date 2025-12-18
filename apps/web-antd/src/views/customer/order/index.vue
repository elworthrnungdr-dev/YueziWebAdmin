<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import {
  getMealOrderListApi,
  createMealOrderApi,
  getMealOrderDetailApi,
  updateMealOrderApi,
  deleteMealOrderApi,
  type MealOrderItem,
  type MealOrderListParams,
  type CreateMealOrderParams,
  type UpdateMealOrderParams,
} from '#/api';

import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Select,
  Space,
  Table,
} from 'ant-design-vue';
import type { FormInstance } from 'ant-design-vue';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { h } from 'vue';

const loading = ref(false);
const dataSource = ref<MealOrderItem[]>([]);
const total = ref(0);

const queryForm = ref<MealOrderListParams>({
  ContractNo: undefined,
  OrderDateStart: undefined,
  OrderDateEnd: undefined,
  CreatedAtStart: undefined,
  CreatedAtEnd: undefined,
  PageIndex: 1,
  PageSize: 10,
  OrderBy: undefined,
  IsAsc: true,
});

const orderDateRange = ref<[Dayjs | null, Dayjs | null]>([null, null]);
const createdDateRange = ref<[Dayjs | null, Dayjs | null]>([null, null]);

const mealTypeOptions = [
  { label: '早餐', value: 1 },
  { label: '午餐', value: 2 },
  { label: '晚餐', value: 3 },
  { label: '加餐', value: 4 },
  { label: '宵夜', value: 5 },
];

const paymentTypeOptions = [
  { label: '套餐内', value: 1 },
  { label: '额外付费', value: 2 },
  { label: '赠送', value: 3 },
];

const paymentStatusOptions = [
  { label: '未支付', value: 1 },
  { label: '已支付', value: 2 },
  { label: '挂账', value: 3 },
];

const columns = [
  {
    title: '订餐日期',
    dataIndex: 'orderDate',
    key: 'orderDate',
    width: 170,
  },
  {
    title: '餐别',
    dataIndex: 'mealTypeText',
    key: 'mealTypeText',
    width: 100,
  },
  {
    title: '用餐时间',
    dataIndex: 'mealTime',
    key: 'mealTime',
    width: 120,
  },
  {
    title: '菜单名称',
    dataIndex: 'menuName',
    key: 'menuName',
    width: 160,
  },
  {
    title: '菜品内容',
    dataIndex: 'mealContent',
    key: 'mealContent',
    width: 220,
    ellipsis: true,
  },
  {
    title: '特殊要求',
    dataIndex: 'specialRequirements',
    key: 'specialRequirements',
    width: 200,
    ellipsis: true,
  },
  {
    title: '客户反馈',
    dataIndex: 'customerFeedback',
    key: 'customerFeedback',
    width: 200,
    ellipsis: true,
  },
  {
    title: '支付类型',
    dataIndex: 'paymentTypeText',
    key: 'paymentTypeText',
    width: 120,
  },
  {
    title: '单价',
    dataIndex: 'unitPrice',
    key: 'unitPrice',
    width: 100,
  },
  {
    title: '数量',
    dataIndex: 'quantity',
    key: 'quantity',
    width: 80,
  },
  {
    title: '总金额',
    dataIndex: 'totalAmount',
    key: 'totalAmount',
    width: 120,
  },
  {
    title: '支付状态',
    dataIndex: 'paymentStatusText',
    key: 'paymentStatusText',
    width: 120,
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 170,
  },
  {
    title: '更新时间',
    dataIndex: 'updatedAt',
    key: 'updatedAt',
    width: 170,
  },
  {
    title: '操作',
    key: 'actions',
    width: 140,
    fixed: 'right',
    align: 'center',
  },
];

async function fetchList() {
  try {
    loading.value = true;

    if (orderDateRange.value[0] && orderDateRange.value[1]) {
      queryForm.value.OrderDateStart = orderDateRange.value[0].format(
        'YYYY-MM-DD',
      );
      queryForm.value.OrderDateEnd = orderDateRange.value[1].format(
        'YYYY-MM-DD',
      );
    } else {
      queryForm.value.OrderDateStart = undefined;
      queryForm.value.OrderDateEnd = undefined;
    }

    if (createdDateRange.value[0] && createdDateRange.value[1]) {
      queryForm.value.CreatedAtStart = createdDateRange.value[0].format(
        'YYYY-MM-DD',
      );
      queryForm.value.CreatedAtEnd = createdDateRange.value[1].format(
        'YYYY-MM-DD',
      );
    } else {
      queryForm.value.CreatedAtStart = undefined;
      queryForm.value.CreatedAtEnd = undefined;
    }

    const result = await getMealOrderListApi(queryForm.value);
    dataSource.value = result.items || [];
    total.value = result.total || 0;
  } catch (error: any) {
    const errMsg =
      error?.response?.data?.message ||
      error?.data?.message ||
      error?.message ||
      '获取订餐记录列表失败';
    message.error(errMsg);
  } finally {
    loading.value = false;
  }
}

function handleReset() {
  queryForm.value = {
    ContractNo: undefined,
    OrderDateStart: undefined,
    OrderDateEnd: undefined,
    CreatedAtStart: undefined,
    CreatedAtEnd: undefined,
    PageIndex: 1,
    PageSize: 10,
    OrderBy: undefined,
    IsAsc: true,
  };
  orderDateRange.value = [null, null];
  createdDateRange.value = [null, null];
  fetchList();
}

function handleTableChange(pagination: any) {
  queryForm.value.PageIndex = pagination.current;
  queryForm.value.PageSize = pagination.pageSize;
  fetchList();
}

// 创建/编辑订餐记录弹窗相关
const createModalVisible = ref(false);
const submitting = ref(false);
const isEditMode = ref(false);
const editingOrderId = ref<string>('');
const formRef = ref<FormInstance>();
const formModel = ref<
  CreateMealOrderParams & {
    orderDate?: Dayjs;
    mealTime?: Dayjs;
  }
>({
  customerId: '',
  orderDate: undefined,
  mealType: 1,
  mealTime: undefined,
  menuName: '',
  mealContent: '',
  specialRequirements: '',
  customerFeedback: '',
  paymentType: 1,
  unitPrice: 0,
  quantity: 1,
  totalAmount: 0,
  paymentStatus: 1,
  remark: '',
});

const formRules = {
  customerId: [{ required: true, message: '请输入客户ID' }],
  orderDate: [{ required: true, message: '请选择订餐日期' }],
  mealType: [{ required: true, message: '请选择餐别' }],
  mealTime: [{ required: true, message: '请选择用餐时间' }],
  menuName: [{ required: true, message: '请输入菜单名称' }],
  mealContent: [{ required: true, message: '请输入菜品内容' }],
  paymentType: [{ required: true, message: '请选择支付类型' }],
  unitPrice: [{ required: true, message: '请输入单价' }],
  quantity: [{ required: true, message: '请输入数量' }],
  totalAmount: [{ required: true, message: '请输入总金额' }],
  paymentStatus: [{ required: true, message: '请选择支付状态' }],
};

function resetForm() {
  formModel.value = {
    customerId: '',
    orderDate: undefined,
    mealType: 1,
    mealTime: undefined,
    menuName: '',
    mealContent: '',
    specialRequirements: '',
    customerFeedback: '',
    paymentType: 1,
    unitPrice: 0,
    quantity: 1,
    totalAmount: 0,
    paymentStatus: 1,
    remark: '',
  };
  formRef.value?.resetFields();
}

function openCreateModal() {
  isEditMode.value = false;
  editingOrderId.value = '';
  createModalVisible.value = true;
  resetForm();
}

async function openEditModal(record: MealOrderItem) {
  isEditMode.value = true;
  editingOrderId.value = record.id;
  createModalVisible.value = true;
  resetForm();

  try {
    const detail = await getMealOrderDetailApi(record.id);
    formModel.value = {
      customerId: detail.customerId || '',
      orderDate: detail.orderDate ? dayjs(detail.orderDate) : undefined,
      mealType: detail.mealType ?? 1,
      mealTime: detail.mealTime ? dayjs(detail.mealTime) : undefined,
      menuName: detail.menuName || '',
      mealContent: detail.mealContent || '',
      specialRequirements: detail.specialRequirements || '',
      customerFeedback: detail.customerFeedback || '',
      paymentType: detail.paymentType ?? 1,
      unitPrice: detail.unitPrice ?? 0,
      quantity: detail.quantity ?? 1,
      totalAmount: detail.totalAmount ?? 0,
      paymentStatus: detail.paymentStatus ?? 1,
      remark: detail.remark || '',
    };
  } catch (error: any) {
    const errMsg =
      error?.response?.data?.message ||
      error?.data?.message ||
      error?.message ||
      '获取订餐记录详情失败';
    message.error(errMsg);
    createModalVisible.value = false;
  }
}

function closeCreateModal() {
  createModalVisible.value = false;
  isEditMode.value = false;
  editingOrderId.value = '';
  resetForm();
}

function toIso(val?: Dayjs) {
  return val ? val.toISOString() : undefined;
}

async function handleSubmit() {
  try {
    const values = await formRef.value?.validate();
    if (!values) return;
    submitting.value = true;

    const baseData = {
      ...values,
      orderDate: toIso(values.orderDate as Dayjs | undefined),
      mealTime: toIso(values.mealTime as Dayjs | undefined),
    };

    if (isEditMode.value) {
      const updateData: UpdateMealOrderParams = {
        ...(baseData as CreateMealOrderParams),
        id: editingOrderId.value,
      };
      await updateMealOrderApi(updateData);
      message.success('更新订餐记录成功');
    } else {
      await createMealOrderApi(baseData as CreateMealOrderParams);
      message.success('创建订餐记录成功');
    }
    closeCreateModal();
    fetchList();
  } catch (error: any) {
    if (error?.errorFields) {
      return;
    }
    const errMsg =
      error?.response?.data?.message ||
      error?.data?.message ||
      error?.message ||
      (isEditMode.value ? '更新订餐记录失败' : '创建订餐记录失败');
    message.error(errMsg);
    return;
  } finally {
    submitting.value = false;
  }
}

function handleDelete(record: MealOrderItem) {
  Modal.confirm({
    title: '确认删除',
    content: h('div', { style: { fontSize: '14px', lineHeight: '1.6' } }, [
      h('p', {
        style: { marginBottom: '8px', color: '#ff4d4f', fontWeight: 500 },
      }, '⚠️ 警告'),
      h('p', { style: { margin: 0 } }, '确定要删除该订餐记录吗？'),
      h(
        'p',
        { style: { margin: '4px 0 0', color: '#8c8c8c', fontSize: '12px' } },
        '此操作不可恢复，请谨慎操作。',
      ),
    ]),
    okText: '确定删除',
    cancelText: '取消',
    okType: 'danger',
    centered: true,
    width: 420,
    onOk: async () => {
      try {
        loading.value = true;
        await deleteMealOrderApi(record.id);
        message.success('删除订餐记录成功');
        fetchList();
      } catch (error: any) {
        const errMsg =
          error?.response?.data?.message ||
          error?.data?.message ||
          error?.message ||
          '删除订餐记录失败';
        message.error(errMsg);
        throw error;
      } finally {
        loading.value = false;
      }
    },
  });
}

onMounted(() => {
  fetchList();
});
</script>

<template>
  <div class="p-4">
    <!-- 创建按钮和查询条件 -->
    <div
      class="mb-4"
      style="display: flex; justify-content: space-between; align-items: center"
    >
      <Button type="primary" class="cursor-pointer" @click="openCreateModal">
        创建订餐记录
      </Button>
      <Space wrap>
        <Input
          v-model:value="queryForm.ContractNo"
          placeholder="合同编号"
          style="width: 200px"
          allow-clear
        />
        <DatePicker.RangePicker
          v-model:value="orderDateRange"
          :placeholder="['订餐开始日期', '订餐结束日期']"
          style="width: 260px"
        />
        <DatePicker.RangePicker
          v-model:value="createdDateRange"
          :placeholder="['创建开始时间', '创建结束时间']"
          style="width: 260px"
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
        total: total,
        showSizeChanger: true,
        showTotal: (total) => `共 ${total} 条`,
      }"
      :scroll="{ x: 2000 }"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'orderDate'">
          <span v-if="record.orderDate">
            {{ dayjs(record.orderDate).format('YYYY-MM-DD HH:mm:ss') }}
          </span>
          <span v-else>—</span>
        </template>
        <template v-else-if="column.key === 'createdAt'">
          <span v-if="record.createdAt">
            {{ dayjs(record.createdAt).format('YYYY-MM-DD HH:mm:ss') }}
          </span>
          <span v-else>—</span>
        </template>
        <template v-else-if="column.key === 'updatedAt'">
          <span v-if="record.updatedAt">
            {{ dayjs(record.updatedAt).format('YYYY-MM-DD HH:mm:ss') }}
          </span>
          <span v-else>—</span>
        </template>
        <template v-else-if="column.key === 'unitPrice'">
          <span v-if="record.unitPrice !== null && record.unitPrice !== undefined">
            {{ record.unitPrice }}
          </span>
          <span v-else>—</span>
        </template>
        <template v-else-if="column.key === 'quantity'">
          <span v-if="record.quantity !== null && record.quantity !== undefined">
            {{ record.quantity }}
          </span>
          <span v-else>—</span>
        </template>
        <template v-else-if="column.key === 'totalAmount'">
          <span
            v-if="record.totalAmount !== null && record.totalAmount !== undefined"
          >
            {{ record.totalAmount }}
          </span>
          <span v-else>—</span>
        </template>
        <template v-else-if="column.key === 'actions'">
          <div style="text-align: center">
            <Space>
              <Button
                size="small"
                type="link"
                class="cursor-pointer"
                @click="openEditModal(record)"
              >
                更新
              </Button>
              <Button
                type="link"
                danger
                size="small"
                class="cursor-pointer"
                @click="handleDelete(record)"
              >
                删除
              </Button>
            </Space>
          </div>
        </template>
      </template>
    </Table>

    <!-- 创建/编辑订餐记录弹窗 -->
    <Modal
      v-model:open="createModalVisible"
      :title="isEditMode ? '更新订餐记录' : '创建订餐记录'"
      width="800px"
      :confirm-loading="submitting"
      :body-style="{ maxHeight: '600px', overflowY: 'auto' }"
      @ok="handleSubmit"
      @cancel="closeCreateModal"
      destroy-on-close
    >
      <Form
        ref="formRef"
        :model="formModel"
        :rules="formRules"
        :label-col="{ span: 7 }"
        :wrapper-col="{ span: 14 }"
      >
        <div class="grid grid-cols-2 gap-x-6">
          <Form.Item label="客户ID" name="customerId">
            <Input
              v-model:value="formModel.customerId"
              placeholder="请输入客户ID"
            />
          </Form.Item>
          <Form.Item label="订餐日期" name="orderDate">
            <DatePicker
              v-model:value="formModel.orderDate"
              show-time
              format="YYYY-MM-DD HH:mm:ss"
              style="width: 100%"
              placeholder="请选择订餐日期"
            />
          </Form.Item>

          <Form.Item label="餐别" name="mealType">
            <Select
              v-model:value="formModel.mealType"
              :options="mealTypeOptions"
              placeholder="请选择餐别"
            />
          </Form.Item>
          <Form.Item label="用餐时间" name="mealTime">
            <DatePicker
              v-model:value="formModel.mealTime"
              show-time
              format="YYYY-MM-DD HH:mm:ss"
              placeholder="请选择用餐时间"
              style="width: 100%"
            />
          </Form.Item>

          <Form.Item label="菜单名称" name="menuName">
            <Input
              v-model:value="formModel.menuName"
              placeholder="请输入菜单名称"
            />
          </Form.Item>
          <Form.Item label="菜品内容" name="mealContent">
            <Input
              v-model:value="formModel.mealContent"
              placeholder="请输入菜品内容"
            />
          </Form.Item>

          <Form.Item label="支付类型" name="paymentType">
            <Select
              v-model:value="formModel.paymentType"
              :options="paymentTypeOptions"
              placeholder="请选择支付类型"
            />
          </Form.Item>
          <Form.Item label="单价" name="unitPrice">
            <InputNumber
              v-model:value="formModel.unitPrice"
              :min="0"
              style="width: 100%"
              placeholder="请输入单价"
            />
          </Form.Item>

          <Form.Item label="数量" name="quantity">
            <InputNumber
              v-model:value="formModel.quantity"
              :min="1"
              style="width: 100%"
              placeholder="请输入数量"
            />
          </Form.Item>
          <Form.Item label="总金额" name="totalAmount">
            <InputNumber
              v-model:value="formModel.totalAmount"
              :min="0"
              style="width: 100%"
              placeholder="请输入总金额"
            />
          </Form.Item>

          <Form.Item label="支付状态" name="paymentStatus">
            <Select
              v-model:value="formModel.paymentStatus"
              :options="paymentStatusOptions"
              placeholder="请选择支付状态"
            />
          </Form.Item>
          <Form.Item label="特殊要求" name="specialRequirements">
            <Input
              v-model:value="formModel.specialRequirements"
              placeholder="请输入特殊要求"
            />
          </Form.Item>

          <Form.Item label="客户反馈" name="customerFeedback">
            <Input
              v-model:value="formModel.customerFeedback"
              placeholder="请输入客户反馈"
            />
          </Form.Item>
        </div>
        <Form.Item label="备注" name="remark">
          <Input.TextArea
            v-model:value="formModel.remark"
            :rows="4"
            placeholder="请输入备注"
          />
        </Form.Item>
      </Form>
    </Modal>
  </div>
</template>

<style scoped>
/* 增加表单标签和输入框之间的间距 */
:deep(.ant-form-item-label) {
  padding-right: 16px !important;
}
</style>



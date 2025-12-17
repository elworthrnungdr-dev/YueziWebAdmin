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
  Select,
  Space,
  Table,
  Modal,
  Popconfirm,
  TimePicker,
  message,
} from 'ant-design-vue';
import type { FormInstance } from 'ant-design-vue';
import dayjs from 'dayjs';

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
    title: '客户ID',
    dataIndex: 'customerId',
    key: 'customerId',
    width: 140,
  },
  {
    title: '合同编号',
    dataIndex: 'contractNo',
    key: 'contractNo',
    width: 150,
  },
  {
    title: '订餐日期',
    dataIndex: 'orderDate',
    key: 'orderDate',
    width: 120,
  },
  {
    title: '餐次类型',
    dataIndex: 'mealTypeText',
    key: 'mealTypeText',
    width: 100,
  },
  {
    title: '送餐时间',
    dataIndex: 'mealTime',
    key: 'mealTime',
    width: 100,
  },
  {
    title: '菜单名称',
    dataIndex: 'menuName',
    key: 'menuName',
    width: 140,
  },
  {
    title: '餐食内容',
    dataIndex: 'mealContent',
    key: 'mealContent',
    width: 180,
    ellipsis: true,
  },
  {
    title: '付费类型',
    dataIndex: 'paymentTypeText',
    key: 'paymentTypeText',
    width: 100,
  },
  {
    title: '单价',
    dataIndex: 'unitPrice',
    key: 'unitPrice',
    width: 80,
  },
  {
    title: '数量',
    dataIndex: 'quantity',
    key: 'quantity',
    width: 70,
  },
  {
    title: '总金额',
    dataIndex: 'totalAmount',
    key: 'totalAmount',
    width: 100,
  },
  {
    title: '支付状态',
    dataIndex: 'paymentStatusText',
    key: 'paymentStatusText',
    width: 100,
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 170,
  },
  {
    title: '操作',
    key: 'actions',
    width: 150,
    fixed: 'right',
    align: 'center',
  },
];

async function fetchList() {
  try {
    loading.value = true;
    const params: MealOrderListParams = {
      ...queryForm.value,
      OrderDateStart: queryForm.value.OrderDateStart
        ? dayjs(queryForm.value.OrderDateStart).toISOString()
        : undefined,
      OrderDateEnd: queryForm.value.OrderDateEnd
        ? dayjs(queryForm.value.OrderDateEnd).toISOString()
        : undefined,
      CreatedAtStart: queryForm.value.CreatedAtStart
        ? dayjs(queryForm.value.CreatedAtStart).toISOString()
        : undefined,
      CreatedAtEnd: queryForm.value.CreatedAtEnd
        ? dayjs(queryForm.value.CreatedAtEnd).toISOString()
        : undefined,
    };
    const res = await getMealOrderListApi(params);
    dataSource.value = res.items;
    total.value = res.total;
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
  fetchList();
}

function handleTableChange(pagination: any) {
  queryForm.value.PageIndex = pagination.current;
  queryForm.value.PageSize = pagination.pageSize;
  fetchList();
}

onMounted(() => {
  fetchList();
});

// 创建 / 编辑弹窗
const createModalVisible = ref(false);
const isEditMode = ref(false);
const submitting = ref(false);
const formRef = ref<FormInstance | null>(null);
const editingId = ref('');

const formModel = ref<CreateMealOrderParams>({
  customerId: '',
  orderDate: '',
  mealType: 1,
  mealTime: '',
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
  mealType: [{ required: true, message: '请选择餐次类型' }],
  mealTime: [{ required: true, message: '请选择送餐时间' }],
  menuName: [{ required: true, message: '请输入菜单名称' }],
  mealContent: [{ required: true, message: '请输入餐食内容' }],
  paymentType: [{ required: true, message: '请选择付费类型' }],
  unitPrice: [{ required: true, message: '请输入单价' }],
  quantity: [{ required: true, message: '请输入数量' }],
  totalAmount: [{ required: true, message: '请输入总金额' }],
  paymentStatus: [{ required: true, message: '请选择支付状态' }],
};

function openCreateModal() {
  isEditMode.value = false;
  editingId.value = '';
  formModel.value = {
    customerId: '',
    orderDate: '',
    mealType: 1,
    mealTime: '',
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
  createModalVisible.value = true;
}

async function openEditModal(record: MealOrderItem) {
  isEditMode.value = true;
  editingId.value = record.id;
  try {
    const detail = await getMealOrderDetailApi(record.id);
    formModel.value = {
      customerId: detail.customerId || '',
      orderDate: detail.orderDate ? (dayjs(detail.orderDate) as any) : '',
      mealType: detail.mealType,
      mealTime: detail.mealTime || '',
      menuName: detail.menuName || '',
      mealContent: detail.mealContent || '',
      specialRequirements: detail.specialRequirements || '',
      customerFeedback: detail.customerFeedback || '',
      paymentType: detail.paymentType,
      unitPrice: detail.unitPrice,
      quantity: detail.quantity,
      totalAmount: detail.totalAmount,
      paymentStatus: detail.paymentStatus,
      remark: detail.remark || '',
    };
    createModalVisible.value = true;
  } catch {
    // 由全局拦截器处理错误
  }
}

function closeCreateModal() {
  createModalVisible.value = false;
  formRef.value?.resetFields();
}

async function handleSubmit() {
  try {
    await formRef.value?.validate();
    submitting.value = true;
    const params: CreateMealOrderParams = {
      ...formModel.value,
      orderDate: formModel.value.orderDate
        ? dayjs(formModel.value.orderDate as any).toISOString()
        : '',
    };

    if (isEditMode.value) {
      await updateMealOrderApi({
        ...params,
        id: editingId.value,
      } as UpdateMealOrderParams);
      message.success('更新订餐管理成功');
    } else {
      await createMealOrderApi(params);
      message.success('创建订餐管理成功');
    }
    closeCreateModal();
    fetchList();
  } catch {
    // 由全局拦截器处理错误
  } finally {
    submitting.value = false;
  }
}

async function handleDelete(record: MealOrderItem) {
  try {
    await deleteMealOrderApi(record.id);
    message.success('删除订餐管理成功');
    fetchList();
  } catch {
    // 由全局拦截器处理错误
  }
}
</script>

<template>
  <div class="p-4">
    <!-- 创建按钮和搜索表单 -->
    <div class="mb-4" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px">
      <Button type="primary" class="cursor-pointer" @click="openCreateModal">
        创建订餐管理
      </Button>
      <Space wrap>
        <Input
          v-model:value="queryForm.ContractNo"
          placeholder="合同编号"
          style="width: 150px"
          allow-clear
        />
        <DatePicker
          v-model:value="queryForm.OrderDateStart"
          placeholder="订餐日期开始"
          style="width: 150px"
        />
        <DatePicker
          v-model:value="queryForm.OrderDateEnd"
          placeholder="订餐日期结束"
          style="width: 150px"
        />
        <DatePicker
          v-model:value="queryForm.CreatedAtStart"
          placeholder="创建时间开始"
          style="width: 150px"
        />
        <DatePicker
          v-model:value="queryForm.CreatedAtEnd"
          placeholder="创建时间结束"
          style="width: 150px"
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
      :scroll="{ x: 1800 }"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'orderDate'">
          <span v-if="record.orderDate">
            {{ dayjs(record.orderDate).format('YYYY-MM-DD') }}
          </span>
          <span v-else>—</span>
        </template>
        <template v-else-if="column.key === 'createdAt'">
          <span v-if="record.createdAt">
            {{ dayjs(record.createdAt).format('YYYY-MM-DD HH:mm:ss') }}
          </span>
          <span v-else>—</span>
        </template>
        <template v-else-if="column.key === 'actions'">
          <div style="text-align: center">
            <Space>
              <Button
                type="link"
                size="small"
                class="cursor-pointer"
                @click="openEditModal(record)"
              >
                更新
              </Button>
              <Popconfirm
                title="确定删除该订餐记录吗？"
                ok-text="删除"
                cancel-text="取消"
                @confirm="handleDelete(record)"
              >
                <Button type="link" danger size="small" class="cursor-pointer">
                  删除
                </Button>
              </Popconfirm>
            </Space>
          </div>
        </template>
      </template>
    </Table>

    <!-- 创建 / 编辑订餐管理弹窗 -->
    <Modal
      v-model:open="createModalVisible"
      :title="isEditMode ? '更新订餐管理' : '创建订餐管理'"
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
        layout="vertical"
      >
        <div class="grid grid-cols-2 gap-4">
          <Form.Item label="客户ID" name="customerId">
            <Input
              v-model:value="formModel.customerId"
              placeholder="请输入客户ID"
            />
          </Form.Item>
          <Form.Item label="订餐日期" name="orderDate">
            <DatePicker
              v-model:value="formModel.orderDate"
              style="width: 100%"
              placeholder="请选择订餐日期"
            />
          </Form.Item>
          <Form.Item label="餐次类型" name="mealType">
            <Select
              v-model:value="formModel.mealType"
              :options="mealTypeOptions"
              placeholder="请选择餐次类型"
            />
          </Form.Item>
          <Form.Item label="送餐时间" name="mealTime">
            <TimePicker
              v-model:value="formModel.mealTime"
              format="HH:mm:ss"
              value-format="HH:mm:ss"
              style="width: 100%"
              placeholder="请选择送餐时间"
            />
          </Form.Item>
          <Form.Item label="菜单名称" name="menuName">
            <Input
              v-model:value="formModel.menuName"
              placeholder="请输入菜单名称"
            />
          </Form.Item>
          <Form.Item label="付费类型" name="paymentType">
            <Select
              v-model:value="formModel.paymentType"
              :options="paymentTypeOptions"
              placeholder="请选择付费类型"
            />
          </Form.Item>
          <Form.Item label="单价" name="unitPrice">
            <InputNumber
              v-model:value="formModel.unitPrice"
              :min="0"
              :precision="2"
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
              :precision="2"
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
        </div>
        <Form.Item label="餐食内容（详细菜品）" name="mealContent">
          <Input.TextArea
            v-model:value="formModel.mealContent"
            :rows="2"
            placeholder="请输入餐食内容"
          />
        </Form.Item>
        <Form.Item label="特殊要求（少盐、无糖等）" name="specialRequirements">
          <Input.TextArea
            v-model:value="formModel.specialRequirements"
            :rows="2"
            placeholder="请输入特殊要求"
          />
        </Form.Item>
        <Form.Item label="客户反馈" name="customerFeedback">
          <Input.TextArea
            v-model:value="formModel.customerFeedback"
            :rows="2"
            placeholder="请输入客户反馈"
          />
        </Form.Item>
        <Form.Item label="备注" name="remark">
          <Input.TextArea
            v-model:value="formModel.remark"
            :rows="2"
            placeholder="请输入备注"
          />
        </Form.Item>
      </Form>
    </Modal>
  </div>
</template>


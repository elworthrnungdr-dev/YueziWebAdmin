<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import {
  getRepairRecordListApi,
  createRepairRecordApi,
  getRepairRecordDetailApi,
  updateRepairRecordApi,
  deleteRepairRecordApi,
  type RepairRecordItem,
  type RepairRecordListParams,
  type CreateRepairRecordParams,
  type UpdateRepairRecordParams,
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
  message,
} from 'ant-design-vue';
import type { FormInstance } from 'ant-design-vue';
import dayjs from 'dayjs';
import { h } from 'vue';

const loading = ref(false);
const dataSource = ref<RepairRecordItem[]>([]);
const total = ref(0);

const queryForm = ref<RepairRecordListParams>({
  RepairStartDateStart: undefined,
  RepairStartDateEnd: undefined,
  RepairEndDateStart: undefined,
  RepairEndDateEnd: undefined,
  AcceptanceDateStart: undefined,
  AcceptanceDateEnd: undefined,
  CreatedAtStart: undefined,
  CreatedAtEnd: undefined,
  RepairType: undefined,
  RepairStatus: undefined,
  PaymentStatus: undefined,
  PageIndex: 1,
  PageSize: 10,
  OrderBy: undefined,
  IsAsc: true,
});

const repairTypeOptions = [
  { label: '委内维修', value: 1 },
  { label: '委外维修', value: 2 },
  { label: '保修', value: 3 },
];

const repairStatusOptions = [
  { label: '待处理', value: 1 },
  { label: '报价中', value: 2 },
  { label: '维修中', value: 3 },
  { label: '已完成', value: 4 },
  { label: '已取消', value: 5 },
];

const paymentStatusOptions = [
  { label: '未支付', value: 1 },
  { label: '部分支付', value: 2 },
  { label: '已支付', value: 3 },
];

const columns = [
  {
    title: '报修单号',
    dataIndex: 'repairNo',
    key: 'repairNo',
    width: 160,
  },
  {
    title: '项目ID',
    dataIndex: 'projectId',
    key: 'projectId',
    width: 180,
  },
  {
    title: '维修类型',
    dataIndex: 'repairType',
    key: 'repairType',
    width: 120,
  },
  {
    title: '故障描述',
    dataIndex: 'faultDescription',
    key: 'faultDescription',
    width: 220,
    ellipsis: true,
  },
  {
    title: '预估费用',
    dataIndex: 'estimatedCost',
    key: 'estimatedCost',
    width: 120,
  },
  {
    title: '实际费用',
    dataIndex: 'actualCost',
    key: 'actualCost',
    width: 120,
  },
  {
    title: '维修开始日期',
    dataIndex: 'repairStartDate',
    key: 'repairStartDate',
    width: 170,
  },
  {
    title: '维修结束日期',
    dataIndex: 'repairEndDate',
    key: 'repairEndDate',
    width: 170,
  },
  {
    title: '维修状态',
    dataIndex: 'repairStatus',
    key: 'repairStatus',
    width: 120,
  },
  {
    title: '支付状态',
    dataIndex: 'paymentStatus',
    key: 'paymentStatus',
    width: 120,
  },
  {
    title: '验收日期',
    dataIndex: 'acceptanceDate',
    key: 'acceptanceDate',
    width: 170,
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
    width: 200,
    fixed: 'right',
    align: 'center',
  },
];

async function fetchList() {
  try {
    loading.value = true;
    const params: RepairRecordListParams = {
      ...queryForm.value,
      RepairStartDateStart: queryForm.value.RepairStartDateStart
        ? dayjs(queryForm.value.RepairStartDateStart).toISOString()
        : undefined,
      RepairStartDateEnd: queryForm.value.RepairStartDateEnd
        ? dayjs(queryForm.value.RepairStartDateEnd).toISOString()
        : undefined,
      RepairEndDateStart: queryForm.value.RepairEndDateStart
        ? dayjs(queryForm.value.RepairEndDateStart).toISOString()
        : undefined,
      RepairEndDateEnd: queryForm.value.RepairEndDateEnd
        ? dayjs(queryForm.value.RepairEndDateEnd).toISOString()
        : undefined,
      AcceptanceDateStart: queryForm.value.AcceptanceDateStart
        ? dayjs(queryForm.value.AcceptanceDateStart).toISOString()
        : undefined,
      AcceptanceDateEnd: queryForm.value.AcceptanceDateEnd
        ? dayjs(queryForm.value.AcceptanceDateEnd).toISOString()
        : undefined,
      CreatedAtStart: queryForm.value.CreatedAtStart
        ? dayjs(queryForm.value.CreatedAtStart).toISOString()
        : undefined,
      CreatedAtEnd: queryForm.value.CreatedAtEnd
        ? dayjs(queryForm.value.CreatedAtEnd).toISOString()
        : undefined,
    };
    const res = await getRepairRecordListApi(params);
    dataSource.value = res.items;
    total.value = res.total;
  } finally {
    loading.value = false;
  }
}

function handleReset() {
  queryForm.value = {
    RepairStartDateStart: undefined,
    RepairStartDateEnd: undefined,
    RepairEndDateStart: undefined,
    RepairEndDateEnd: undefined,
    AcceptanceDateStart: undefined,
    AcceptanceDateEnd: undefined,
    CreatedAtStart: undefined,
    CreatedAtEnd: undefined,
    RepairType: undefined,
    RepairStatus: undefined,
    PaymentStatus: undefined,
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

const formModel = ref<CreateRepairRecordParams>({
  projectId: '',
  repairType: 1,
  faultDescription: '',
  estimatedCost: undefined,
});

const formRules = {
  projectId: [{ required: true, message: '请输入项目ID' }],
  repairType: [{ required: true, message: '请选择维修类型' }],
  faultDescription: [{ required: true, message: '请输入故障描述' }],
};

function openCreateModal() {
  isEditMode.value = false;
  editingId.value = '';
  formModel.value = {
    projectId: '',
    repairType: 1,
    faultDescription: '',
    estimatedCost: undefined,
  };
  createModalVisible.value = true;
}

async function openEditModal(record: RepairRecordItem) {
  isEditMode.value = true;
  editingId.value = record.id;
  try {
    const detail = await getRepairRecordDetailApi(record.id);
    formModel.value = {
      projectId: detail.projectId || '',
      repairType: detail.repairType ?? 1,
      faultDescription: detail.faultDescription || '',
      estimatedCost: detail.estimatedCost,
    };
    createModalVisible.value = true;
  } catch {
    // 错误由全局拦截器处理
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
    const params: CreateRepairRecordParams = {
      ...formModel.value,
    };

    if (isEditMode.value) {
      await updateRepairRecordApi({
        ...(params as CreateRepairRecordParams),
        id: editingId.value,
      } as UpdateRepairRecordParams);
      message.success('更新报修管理成功');
    } else {
      await createRepairRecordApi(params);
      message.success('创建报修管理成功');
    }
    closeCreateModal();
    fetchList();
  } finally {
    submitting.value = false;
  }
}

function formatRepairType(value?: number) {
  if (value === 1) return '委内维修';
  if (value === 2) return '委外维修';
  if (value === 3) return '保修';
  return '—';
}

function formatRepairStatus(value?: number) {
  if (value === 1) return '待处理';
  if (value === 2) return '报价中';
  if (value === 3) return '维修中';
  if (value === 4) return '已完成';
  if (value === 5) return '已取消';
  return '—';
}

function formatPaymentStatus(value?: number) {
  if (value === 1) return '未支付';
  if (value === 2) return '部分支付';
  if (value === 3) return '已支付';
  return '—';
}

function handleDelete(record: RepairRecordItem) {
  Modal.confirm({
    title: '确认删除',
    content: h('div', { style: { fontSize: '14px', lineHeight: '1.6' } }, [
      h(
        'p',
        {
          style: { marginBottom: '8px', color: '#ff4d4f', fontWeight: 500 },
        },
        '⚠️ 警告',
      ),
      h('p', { style: { margin: 0 } }, '确定要删除该报修记录吗？'),
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
        await deleteRepairRecordApi(record.id);
        message.success('删除报修记录成功');
        fetchList();
      } finally {
        loading.value = false;
      }
    },
  });
}
</script>

<template>
  <div class="p-4">
    <!-- 创建按钮和搜索表单 -->
    <div
      class="mb-4"
      style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px;
      "
    >
      <Button type="primary" class="cursor-pointer" @click="openCreateModal">
        创建报修管理
      </Button>
      <Space wrap>
        <DatePicker
          v-model:value="queryForm.RepairStartDateStart"
          placeholder="维修开始日期开始"
          style="width: 180px"
        />
        <DatePicker
          v-model:value="queryForm.RepairStartDateEnd"
          placeholder="维修开始日期结束"
          style="width: 180px"
        />
        <DatePicker
          v-model:value="queryForm.RepairEndDateStart"
          placeholder="维修结束日期开始"
          style="width: 180px"
        />
        <DatePicker
          v-model:value="queryForm.RepairEndDateEnd"
          placeholder="维修结束日期结束"
          style="width: 180px"
        />
        <DatePicker
          v-model:value="queryForm.AcceptanceDateStart"
          placeholder="验收日期开始"
          style="width: 180px"
        />
        <DatePicker
          v-model:value="queryForm.AcceptanceDateEnd"
          placeholder="验收日期结束"
          style="width: 180px"
        />
        <DatePicker
          v-model:value="queryForm.CreatedAtStart"
          placeholder="创建时间开始"
          style="width: 180px"
        />
        <DatePicker
          v-model:value="queryForm.CreatedAtEnd"
          placeholder="创建时间结束"
          style="width: 180px"
        />
        <Select
          v-model:value="queryForm.RepairType"
          :options="repairTypeOptions"
          placeholder="维修类型"
          allow-clear
          style="width: 150px"
        />
        <Select
          v-model:value="queryForm.RepairStatus"
          :options="repairStatusOptions"
          placeholder="维修状态"
          allow-clear
          style="width: 150px"
        />
        <Select
          v-model:value="queryForm.PaymentStatus"
          :options="paymentStatusOptions"
          placeholder="支付状态"
          allow-clear
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
      :scroll="{ x: 2000 }"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'repairType'">
          <span>{{ record.repairTypeText || formatRepairType(record.repairType) }}</span>
        </template>
        <template v-else-if="column.key === 'repairStatus'">
          <span>
            {{ record.repairStatusText || formatRepairStatus(record.repairStatus) }}
          </span>
        </template>
        <template v-else-if="column.key === 'paymentStatus'">
          <span>
            {{ record.paymentStatusText || formatPaymentStatus(record.paymentStatus) }}
          </span>
        </template>
        <template v-else-if="column.key === 'estimatedCost'">
          <span
            v-if="
              record.estimatedCost !== null && record.estimatedCost !== undefined
            "
          >
            {{ record.estimatedCost }}
          </span>
          <span v-else>—</span>
        </template>
        <template v-else-if="column.key === 'actualCost'">
          <span
            v-if="record.actualCost !== null && record.actualCost !== undefined"
          >
            {{ record.actualCost }}
          </span>
          <span v-else>—</span>
        </template>
        <template v-else-if="column.key === 'repairStartDate'">
          <span v-if="record.repairStartDate">
            {{ dayjs(record.repairStartDate).format('YYYY-MM-DD HH:mm:ss') }}
          </span>
          <span v-else>—</span>
        </template>
        <template v-else-if="column.key === 'repairEndDate'">
          <span v-if="record.repairEndDate">
            {{ dayjs(record.repairEndDate).format('YYYY-MM-DD HH:mm:ss') }}
          </span>
          <span v-else>—</span>
        </template>
        <template v-else-if="column.key === 'acceptanceDate'">
          <span v-if="record.acceptanceDate">
            {{ dayjs(record.acceptanceDate).format('YYYY-MM-DD HH:mm:ss') }}
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

    <!-- 创建 / 编辑报修管理弹窗 -->
    <Modal
      v-model:open="createModalVisible"
      :title="isEditMode ? '更新报修管理' : '创建报修管理'"
      width="700px"
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
          <Form.Item label="项目ID" name="projectId">
            <Input
              v-model:value="formModel.projectId"
              placeholder="请输入项目ID"
            />
          </Form.Item>
          <Form.Item label="维修类型" name="repairType">
            <Select
              v-model:value="formModel.repairType"
              :options="repairTypeOptions"
              placeholder="请选择维修类型"
            />
          </Form.Item>
        </div>
        <Form.Item label="故障描述" name="faultDescription">
          <Input.TextArea
            v-model:value="formModel.faultDescription"
            :rows="3"
            placeholder="请输入故障描述"
          />
        </Form.Item>
        <Form.Item label="预估费用" name="estimatedCost">
          <InputNumber
            v-model:value="formModel.estimatedCost"
            :min="0"
            :step="0.01"
            style="width: 100%"
            placeholder="请输入预估费用"
          />
        </Form.Item>
      </Form>
    </Modal>
  </div>
</template>



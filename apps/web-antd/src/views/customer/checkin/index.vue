<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import {
  getCheckinListApi,
  createCheckinApi,
  getCheckinDetailApi,
  updateCheckinApi,
  deleteCheckinApi,
  type CheckinItem,
  type CheckinListParams,
  type CreateCheckinParams,
  type UpdateCheckinParams,
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
import { h } from 'vue';
import dayjs from 'dayjs';

// 状态选项
const statusOptions = [
  { label: '入住中', value: 1 },
  { label: '已离店', value: 2 },
];

// 创建类型选项：1 客户ID 2 合同ID
const createdByTypeOptions = [
  { label: '客户ID', value: 1 },
  { label: '合同ID', value: 2 },
];

const loading = ref(false);
const dataSource = ref<CheckinItem[]>([]);
const total = ref(0);

const queryForm = ref<CheckinListParams>({
  ContractNo: undefined,
  CustomerId: undefined,
  CheckinDateStart: undefined,
  CheckinDateEnd: undefined,
  CheckoutDateStart: undefined,
  CheckoutDateEnd: undefined,
  PageIndex: 1,
  PageSize: 10,
  OrderBy: undefined,
  IsAsc: true,
});

const checkinDateRange = ref<[Dayjs | null, Dayjs | null]>([null, null]);
const checkoutDateRange = ref<[Dayjs | null, Dayjs | null]>([null, null]);

const columns = [
  {
    title: '合同编号',
    dataIndex: 'tContractId',
    key: 'tContractId',
    width: 150,
  },
  {
    title: '客户ID',
    dataIndex: 'customerId',
    key: 'customerId',
    width: 150,
  },
  {
    title: '房间ID',
    dataIndex: 'roomId',
    key: 'roomId',
    width: 150,
  },
  {
    title: '入住日期',
    dataIndex: 'checkinDate',
    key: 'checkinDate',
    width: 160,
  },
  {
    title: '离店日期',
    dataIndex: 'checkoutDate',
    key: 'checkoutDate',
    width: 160,
  },
  {
    title: '状态',
    dataIndex: 'statusText',
    key: 'statusText',
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
    align: 'center',
  },
];

async function fetchList() {
  loading.value = true;
  try {
    // 处理日期范围
    const params: CheckinListParams = {
      ...queryForm.value,
    };
    if (checkinDateRange.value[0]) {
      params.CheckinDateStart = checkinDateRange.value[0].format('YYYY-MM-DD');
    }
    if (checkinDateRange.value[1]) {
      params.CheckinDateEnd = checkinDateRange.value[1].format('YYYY-MM-DD');
    }
    if (checkoutDateRange.value[0]) {
      params.CheckoutDateStart = checkoutDateRange.value[0].format('YYYY-MM-DD');
    }
    if (checkoutDateRange.value[1]) {
      params.CheckoutDateEnd = checkoutDateRange.value[1].format('YYYY-MM-DD');
    }

    const { items, total: t } = await getCheckinListApi(params);
    dataSource.value = items;
    total.value = t;
  } catch (error: any) {
    const errMsg =
      error?.response?.data?.message || error?.message || '获取入住信息列表失败';
    message.error(errMsg);
  } finally {
    loading.value = false;
  }
}

function handleReset() {
  queryForm.value.ContractNo = undefined;
  queryForm.value.CustomerId = undefined;
  queryForm.value.CheckinDateStart = undefined;
  queryForm.value.CheckinDateEnd = undefined;
  queryForm.value.CheckoutDateStart = undefined;
  queryForm.value.CheckoutDateEnd = undefined;
  queryForm.value.PageIndex = 1;
  queryForm.value.PageSize = 10;
  queryForm.value.OrderBy = undefined;
  queryForm.value.IsAsc = true;
  checkinDateRange.value = [null, null];
  checkoutDateRange.value = [null, null];
  fetchList();
}

function handleTableChange(pagination: any) {
  queryForm.value.PageIndex = pagination.current;
  queryForm.value.PageSize = pagination.pageSize;
  fetchList();
}

// 创建/编辑入住信息弹窗相关
const createModalVisible = ref(false);
const submitting = ref(false);
const isEditMode = ref(false);
const editingCheckinId = ref<string>('');
const formRef = ref<FormInstance>();
const formModel = ref<
  CreateCheckinParams & { checkinDate?: Dayjs; checkoutDate?: Dayjs }
>({
  createdByType: 1,
  sourceReferenceId: '',
  roomId: '',
  checkinDate: undefined,
  checkoutDate: undefined,
  status: 1,
  remark: '',
});

const formRules = {
  createdByType: [{ required: true, message: '请选择创建类型' }],
  sourceReferenceId: [{ required: true, message: '请输入来源ID' }],
  roomId: [{ required: true, message: '请输入房间ID' }],
  checkinDate: [{ required: true, message: '请选择入住日期' }],
  status: [{ required: true, message: '请选择状态' }],
};

function resetForm() {
  formModel.value = {
    createdByType: 1,
    sourceReferenceId: '',
    roomId: '',
    checkinDate: undefined as Dayjs | undefined,
    checkoutDate: undefined as Dayjs | undefined,
    status: 1,
    remark: '',
  };
  formRef.value?.resetFields();
}

function openCreateModal() {
  isEditMode.value = false;
  editingCheckinId.value = '';
  createModalVisible.value = true;
  resetForm();
}

async function openEditModal(record: CheckinItem) {
  isEditMode.value = true;
  editingCheckinId.value = record.id;
  createModalVisible.value = true;
  resetForm();

  try {
    const detail = await getCheckinDetailApi(record.id);
    // 计算来源ID：1=客户ID -> customerId；2=合同ID -> tContractId；其他为空
    const createdByType = (detail as any).createdByType || 0;
    let sourceReferenceId = '';
    if (createdByType === 1) {
      sourceReferenceId = (detail as any).tCustomerId || detail.customerId || '';
    } else if (createdByType === 2) {
      sourceReferenceId = detail.tContractId || '';
    }

    // 填充表单数据
    formModel.value = {
      createdByType,
      sourceReferenceId,
      roomId: detail.roomId || '',
      checkinDate: detail.checkinDate ? dayjs(detail.checkinDate) : undefined,
      checkoutDate: detail.checkoutDate ? dayjs(detail.checkoutDate) : undefined,
      status: detail.status,
      remark: detail.remark || '',
    };
  } catch (error: any) {
    const errMsg =
      error?.response?.data?.message ||
      error?.data?.message ||
      error?.message ||
      '获取入住信息详情失败';
    message.error(errMsg);
    createModalVisible.value = false;
  }
}

function closeCreateModal() {
  createModalVisible.value = false;
  isEditMode.value = false;
  editingCheckinId.value = '';
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
      checkinDate: values.checkinDate
        ? (values.checkinDate as Dayjs).toISOString()
        : undefined,
      checkoutDate: values.checkoutDate
        ? (values.checkoutDate as Dayjs).toISOString()
        : undefined,
    };

    if (isEditMode.value) {
      // 更新入住信息
      const updateData: UpdateCheckinParams = {
        ...baseData,
        id: editingCheckinId.value,
      };
      await updateCheckinApi(updateData);
      message.success('更新入住信息成功');
    } else {
      // 创建入住信息
      await createCheckinApi(baseData);
      message.success('创建入住信息成功');
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
      (isEditMode.value ? '更新入住信息失败' : '创建入住信息失败');
    message.error(errMsg);
    // 阻止错误继续传播到控制台
    return;
  } finally {
    submitting.value = false;
  }
}

function handleDelete(record: CheckinItem) {
  Modal.confirm({
    title: '确认删除',
    content: h('div', { style: { fontSize: '14px', lineHeight: '1.6' } }, [
      h('p', {
        style: { marginBottom: '8px', color: '#ff4d4f', fontWeight: 500 },
      }, '⚠️ 警告'),
      h('p', { style: { margin: 0 } }, '确定要删除该入住信息吗？'),
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
        await deleteCheckinApi(record.id);
        message.success('删除入住信息成功');
        fetchList();
      } catch (error: any) {
        const errMsg =
          error?.response?.data?.message ||
          error?.data?.message ||
          error?.message ||
          '删除入住信息失败';
        message.error(errMsg);
        throw error;
      } finally {
        loading.value = false;
      }
    },
  });
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
          创建入住信息
        </Button>
      </div>
      <Space>
        <Input
          v-model:value="queryForm.ContractNo"
          allow-clear
          placeholder="合同编号"
          style="width: 150px"
        />
        <Input
          v-model:value="queryForm.CustomerId"
          allow-clear
          placeholder="客户ID"
          style="width: 150px"
        />
        <DatePicker.RangePicker
          v-model:value="checkinDateRange"
          format="YYYY-MM-DD"
          :placeholder="['入住开始日期', '入住结束日期']"
          style="width: 240px"
        />
        <DatePicker.RangePicker
          v-model:value="checkoutDateRange"
          format="YYYY-MM-DD"
          :placeholder="['离店开始日期', '离店结束日期']"
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
      :scroll="{ x: 1200 }"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'checkinDate'">
          <span v-if="record.checkinDate">
            {{ new Date(record.checkinDate).toLocaleString('zh-CN') }}
          </span>
          <span v-else>—</span>
        </template>
        <template v-else-if="column.key === 'checkoutDate'">
          <span v-if="record.checkoutDate">
            {{ new Date(record.checkoutDate).toLocaleString('zh-CN') }}
          </span>
          <span v-else>—</span>
        </template>
        <template v-else-if="column.key === 'createTime'">
          <span v-if="record.createTime">
            {{ new Date(record.createTime).toLocaleString('zh-CN') }}
          </span>
          <span v-else>—</span>
        </template>
        <template v-else-if="column.key === 'statusText'">
          <span>{{ record.statusText || '—' }}</span>
        </template>
        <template v-else-if="column.key === 'remark'">
          <span>{{ record.remark || '—' }}</span>
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

    <!-- 创建/编辑入住信息弹窗 -->
    <Modal
      v-model:open="createModalVisible"
      :title="isEditMode ? '更新入住信息' : '创建入住信息'"
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
            <Form.Item label="创建类型" name="createdByType">
              <Select
                v-model:value="formModel.createdByType"
                :options="createdByTypeOptions"
                placeholder="请选择创建类型"
                style="width: 100%"
              />
            </Form.Item>

            <Form.Item label="来源ID" name="sourceReferenceId">
              <Input
                v-model:value="formModel.sourceReferenceId"
                placeholder="请输入来源ID"
                allow-clear
              />
            </Form.Item>

            <Form.Item label="房间ID" name="roomId">
              <Input
                v-model:value="formModel.roomId"
                placeholder="请输入房间ID"
                allow-clear
              />
            </Form.Item>

            <Form.Item label="入住日期" name="checkinDate">
              <DatePicker
                v-model:value="formModel.checkinDate"
                show-time
                format="YYYY-MM-DD HH:mm:ss"
                placeholder="请选择入住日期"
                style="width: 100%"
              />
            </Form.Item>
          </div>

          <!-- 第二列 -->
          <div>
            <Form.Item label="离店日期" name="checkoutDate">
              <DatePicker
                v-model:value="formModel.checkoutDate"
                show-time
                format="YYYY-MM-DD HH:mm:ss"
                placeholder="请选择离店日期"
                style="width: 100%"
              />
            </Form.Item>

            <Form.Item label="状态" name="status">
              <Select
                v-model:value="formModel.status"
                placeholder="请选择状态"
                :options="statusOptions"
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


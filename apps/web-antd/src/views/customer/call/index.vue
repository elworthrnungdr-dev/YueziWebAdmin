<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import {
  getCallListApi,
  createCallApi,
  getCallDetailApi,
  updateCallApi,
  deleteCallApi,
  type CallItem,
  type CallListParams,
  type CreateCallParams,
  type UpdateCallParams,
} from '#/api';

import {
  Button,
  DatePicker,
  Form,
  Input,
  message,
  Modal,
  Space,
  Table,
} from 'ant-design-vue';
import type { FormInstance } from 'ant-design-vue';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { h } from 'vue';

const loading = ref(false);
const dataSource = ref<CallItem[]>([]);
const total = ref(0);

const queryForm = ref<CallListParams>({
  ContractNo: undefined,
  CustomerId: undefined,
  CallTimeStart: undefined,
  CallTimeEnd: undefined,
  CreatedAtStart: undefined,
  CreatedAtEnd: undefined,
  PageIndex: 1,
  PageSize: 10,
  OrderBy: undefined,
  IsAsc: true,
});

const callTimeRange = ref<[Dayjs | null, Dayjs | null]>([null, null]);
const createdDateRange = ref<[Dayjs | null, Dayjs | null]>([null, null]);

const columns = [
  {
    title: '客户ID',
    dataIndex: 'customerId',
    key: 'customerId',
    width: 150,
  },
  {
    title: '合同编号',
    dataIndex: 'contractNo',
    key: 'contractNo',
    width: 150,
  },
  {
    title: '呼叫时间',
    dataIndex: 'callTime',
    key: 'callTime',
    width: 180,
  },
  {
    title: '呼叫原因',
    dataIndex: 'reason',
    key: 'reason',
    width: 220,
    ellipsis: true,
  },
  {
    title: '备注',
    dataIndex: 'remark',
    key: 'remark',
    width: 220,
    ellipsis: true,
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 180,
  },
  {
    title: '更新时间',
    dataIndex: 'updatedAt',
    key: 'updatedAt',
    width: 180,
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

    if (callTimeRange.value[0] && callTimeRange.value[1]) {
      queryForm.value.CallTimeStart = callTimeRange.value[0].format(
        'YYYY-MM-DD',
      );
      queryForm.value.CallTimeEnd = callTimeRange.value[1].format('YYYY-MM-DD');
    } else {
      queryForm.value.CallTimeStart = undefined;
      queryForm.value.CallTimeEnd = undefined;
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

    const result = await getCallListApi(queryForm.value);
    dataSource.value = result.items || [];
    total.value = result.total || 0;
  } catch (error: any) {
    const errMsg =
      error?.response?.data?.message ||
      error?.data?.message ||
      error?.message ||
      '获取呼叫记录列表失败';
    message.error(errMsg);
  } finally {
    loading.value = false;
  }
}

function handleReset() {
  queryForm.value = {
    ContractNo: undefined,
    CustomerId: undefined,
    CallTimeStart: undefined,
    CallTimeEnd: undefined,
    CreatedAtStart: undefined,
    CreatedAtEnd: undefined,
    PageIndex: 1,
    PageSize: 10,
    OrderBy: undefined,
    IsAsc: true,
  };
  callTimeRange.value = [null, null];
  createdDateRange.value = [null, null];
  fetchList();
}

function handleTableChange(pagination: any) {
  queryForm.value.PageIndex = pagination.current;
  queryForm.value.PageSize = pagination.pageSize;
  fetchList();
}

// 创建/编辑呼叫记录弹窗相关
const createModalVisible = ref(false);
const submitting = ref(false);
const isEditMode = ref(false);
const editingCallId = ref<string>('');
const formRef = ref<FormInstance>();
const formModel = ref<
  CreateCallParams & {
    callTime?: Dayjs;
  }
>({
  customerId: '',
  callTime: undefined,
  reason: '',
  remark: '',
});

const formRules = {
  customerId: [{ required: true, message: '请输入客户ID' }],
  callTime: [{ required: true, message: '请选择呼叫时间' }],
  reason: [{ required: true, message: '请输入呼叫原因' }],
};

function resetForm() {
  formModel.value = {
    customerId: '',
    callTime: undefined,
    reason: '',
    remark: '',
  };
  formRef.value?.resetFields();
}

function openCreateModal() {
  isEditMode.value = false;
  editingCallId.value = '';
  createModalVisible.value = true;
  resetForm();
}

async function openEditModal(record: CallItem) {
  isEditMode.value = true;
  editingCallId.value = record.id;
  createModalVisible.value = true;
  resetForm();

  try {
    const detail = await getCallDetailApi(record.id);
    formModel.value = {
      customerId: detail.customerId || '',
      callTime: detail.callTime ? dayjs(detail.callTime) : undefined,
      reason: detail.reason || '',
      remark: detail.remark || '',
    };
  } catch (error: any) {
    const errMsg =
      error?.response?.data?.message ||
      error?.data?.message ||
      error?.message ||
      '获取呼叫记录详情失败';
    message.error(errMsg);
    createModalVisible.value = false;
  }
}

function closeCreateModal() {
  createModalVisible.value = false;
  isEditMode.value = false;
  editingCallId.value = '';
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
      callTime: toIso(values.callTime as Dayjs | undefined),
    };

    if (isEditMode.value) {
      const updateData: UpdateCallParams = {
        ...(baseData as CreateCallParams),
        id: editingCallId.value,
      };
      await updateCallApi(updateData);
      message.success('更新呼叫记录成功');
    } else {
      await createCallApi(baseData as CreateCallParams);
      message.success('创建呼叫记录成功');
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
      (isEditMode.value ? '更新呼叫记录失败' : '创建呼叫记录失败');
    message.error(errMsg);
    return;
  } finally {
    submitting.value = false;
  }
}

function handleDelete(record: CallItem) {
  Modal.confirm({
    title: '确认删除',
    content: h('div', { style: { fontSize: '14px', lineHeight: '1.6' } }, [
      h('p', {
        style: { marginBottom: '8px', color: '#ff4d4f', fontWeight: 500 },
      }, '⚠️ 警告'),
      h('p', { style: { margin: 0 } }, '确定要删除该呼叫记录吗？'),
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
        await deleteCallApi(record.id);
        message.success('删除呼叫记录成功');
        fetchList();
      } catch (error: any) {
        const errMsg =
          error?.response?.data?.message ||
          error?.data?.message ||
          error?.message ||
          '删除呼叫记录失败';
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
    <!-- 第一行：创建按钮 -->
    <div class="mb-2">
      <Button type="primary" class="cursor-pointer" @click="openCreateModal">
        创建呼叫记录
      </Button>
    </div>

    <!-- 第二行：搜索条件 -->
    <div class="mb-4">
      <Space wrap>
        <Input
          v-model:value="queryForm.ContractNo"
          placeholder="合同编号"
          style="width: 200px"
          allow-clear
        />
        <Input
          v-model:value="queryForm.CustomerId"
          placeholder="客户ID"
          style="width: 200px"
          allow-clear
        />
        <DatePicker.RangePicker
          v-model:value="callTimeRange"
          :placeholder="['呼叫开始时间', '呼叫结束时间']"
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
      :scroll="{ x: 1400 }"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'callTime'">
          <span v-if="record.callTime">
            {{ dayjs(record.callTime).format('YYYY-MM-DD HH:mm:ss') }}
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

    <!-- 创建/编辑呼叫记录弹窗 -->
    <Modal
      v-model:open="createModalVisible"
      :title="isEditMode ? '更新呼叫记录' : '创建呼叫记录'"
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
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 18 }"
      >
        <Form.Item label="客户ID" name="customerId">
          <Input
            v-model:value="formModel.customerId"
            placeholder="请输入客户ID"
          />
        </Form.Item>
        <Form.Item label="呼叫时间" name="callTime">
          <DatePicker
            v-model:value="formModel.callTime"
            show-time
            format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
            placeholder="请选择呼叫时间"
          />
        </Form.Item>
        <Form.Item label="呼叫原因" name="reason">
          <Input
            v-model:value="formModel.reason"
            placeholder="请输入呼叫原因"
          />
        </Form.Item>
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



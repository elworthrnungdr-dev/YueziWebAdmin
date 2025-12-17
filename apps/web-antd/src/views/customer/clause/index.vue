<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import {
  getClauseListApi,
  createClauseApi,
  getClauseDetailApi,
  updateClauseApi,
  deleteClauseApi,
  type ClauseItem,
  type ClauseListParams,
  type CreateClauseParams,
  type UpdateClauseParams,
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
  Space,
  Table,
} from 'ant-design-vue';
import type { FormInstance } from 'ant-design-vue';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

const loading = ref(false);
const dataSource = ref<ClauseItem[]>([]);
const total = ref(0);

const queryForm = ref<ClauseListParams>({
  ContractNo: undefined,
  CustomerId: undefined,
  SignDateStart: undefined,
  SignDateEnd: undefined,
  CreateTimeStart: undefined,
  CreateTimeEnd: undefined,
  PageIndex: 1,
  PageSize: 10,
  OrderBy: undefined,
  IsAsc: true,
});

const signDateRange = ref<[Dayjs | null, Dayjs | null]>([null, null]);
const createDateRange = ref<[Dayjs | null, Dayjs | null]>([null, null]);

const columns = [
  {
    title: '合同编号',
    dataIndex: 'contractNo',
    key: 'contractNo',
    width: 150,
  },
  {
    title: '客户ID',
    dataIndex: 'customerId',
    key: 'customerId',
    width: 150,
  },
  {
    title: '标题',
    dataIndex: 'title',
    key: 'title',
    width: 200,
  },
  {
    title: '内容',
    dataIndex: 'content',
    key: 'content',
    width: 300,
    ellipsis: true,
  },
  {
    title: '签署日期',
    dataIndex: 'signDate',
    key: 'signDate',
    width: 160,
  },
  {
    title: '入住次数',
    dataIndex: 'stayTimes',
    key: 'stayTimes',
    width: 100,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
    width: 160,
  },
  {
    title: '更新时间',
    dataIndex: 'updateTime',
    key: 'updateTime',
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
  try {
    loading.value = true;
    // 处理日期范围
    if (signDateRange.value[0] && signDateRange.value[1]) {
      queryForm.value.SignDateStart = signDateRange.value[0].format(
        'YYYY-MM-DD',
      );
      queryForm.value.SignDateEnd = signDateRange.value[1].format('YYYY-MM-DD');
    } else {
      queryForm.value.SignDateStart = undefined;
      queryForm.value.SignDateEnd = undefined;
    }

    if (createDateRange.value[0] && createDateRange.value[1]) {
      queryForm.value.CreateTimeStart = createDateRange.value[0].format(
        'YYYY-MM-DD',
      );
      queryForm.value.CreateTimeEnd = createDateRange.value[1].format(
        'YYYY-MM-DD',
      );
    } else {
      queryForm.value.CreateTimeStart = undefined;
      queryForm.value.CreateTimeEnd = undefined;
    }

    const result = await getClauseListApi(queryForm.value);
    dataSource.value = result.items || [];
    total.value = result.total || 0;
  } catch (error: any) {
    const errMsg =
      error?.response?.data?.message ||
      error?.data?.message ||
      error?.message ||
      '获取补充条款列表失败';
    message.error(errMsg);
  } finally {
    loading.value = false;
  }
}

function handleReset() {
  queryForm.value = {
    ContractNo: undefined,
    CustomerId: undefined,
    SignDateStart: undefined,
    SignDateEnd: undefined,
    CreateTimeStart: undefined,
    CreateTimeEnd: undefined,
    PageIndex: 1,
    PageSize: 10,
    OrderBy: undefined,
    IsAsc: true,
  };
  signDateRange.value = [null, null];
  createDateRange.value = [null, null];
  fetchList();
}

function handleTableChange(pagination: any) {
  queryForm.value.PageIndex = pagination.current;
  queryForm.value.PageSize = pagination.pageSize;
  fetchList();
}

// 创建/编辑补充条款弹窗相关
const createModalVisible = ref(false);
const submitting = ref(false);
const isEditMode = ref(false);
const editingClauseId = ref<string>('');
const formRef = ref<FormInstance>();
const formModel = ref<CreateClauseParams & { signDate?: Dayjs }>({
  customerId: '',
  title: '',
  content: '',
  signDate: undefined,
  stayTimes: 0,
});

const formRules = {
  customerId: [{ required: true, message: '请输入客户ID' }],
  title: [{ required: true, message: '请输入标题' }],
  content: [{ required: true, message: '请输入内容' }],
  stayTimes: [{ required: true, message: '请输入入住次数' }],
};

function resetForm() {
  formModel.value = {
    customerId: '',
    title: '',
    content: '',
    signDate: undefined as Dayjs | undefined,
    stayTimes: 0,
  };
  formRef.value?.resetFields();
}

function openCreateModal() {
  isEditMode.value = false;
  editingClauseId.value = '';
  createModalVisible.value = true;
  resetForm();
}

async function openEditModal(record: ClauseItem) {
  isEditMode.value = true;
  editingClauseId.value = record.id;
  createModalVisible.value = true;
  resetForm();

  try {
    const detail = await getClauseDetailApi(record.id);
    // 填充表单数据
    formModel.value = {
      customerId: detail.customerId || '',
      title: detail.title || '',
      content: detail.content || '',
      signDate: detail.signDate ? dayjs(detail.signDate) : undefined,
      stayTimes: detail.stayTimes || 0,
    };
  } catch (error: any) {
    const errMsg =
      error?.response?.data?.message ||
      error?.data?.message ||
      error?.message ||
      '获取补充条款详情失败';
    message.error(errMsg);
    createModalVisible.value = false;
  }
}

function closeCreateModal() {
  createModalVisible.value = false;
  isEditMode.value = false;
  editingClauseId.value = '';
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
      signDate: values.signDate
        ? (values.signDate as Dayjs).toISOString()
        : undefined,
    };

    if (isEditMode.value) {
      // 更新补充条款
      const updateData: UpdateClauseParams = {
        ...baseData,
        id: editingClauseId.value,
      };
      await updateClauseApi(updateData);
      message.success('更新补充条款成功');
    } else {
      // 创建补充条款
      await createClauseApi(baseData);
      message.success('创建补充条款成功');
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
      (isEditMode.value ? '更新补充条款失败' : '创建补充条款失败');
    message.error(errMsg);
    // 阻止错误继续传播到控制台
    return;
  } finally {
    submitting.value = false;
  }
}

async function handleDelete(record: ClauseItem) {
  try {
    await deleteClauseApi(record.id);
    message.success('删除补充条款成功');
    fetchList();
  } catch (error: any) {
    const errMsg =
      error?.response?.data?.message ||
      error?.data?.message ||
      error?.message ||
      '删除补充条款失败';
    message.error(errMsg);
  }
}

onMounted(() => {
  fetchList();
});
</script>

<template>
  <div class="p-4">
    <!-- 创建按钮 -->
    <div class="mb-4">
      <Button type="primary" class="cursor-pointer" @click="openCreateModal">
        创建补充条款
      </Button>
    </div>

    <!-- 查询条件 -->
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
          v-model:value="signDateRange"
          :placeholder="['签署开始日期', '签署结束日期']"
          style="width: 240px"
        />
        <DatePicker.RangePicker
          v-model:value="createDateRange"
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
        total: total,
        showSizeChanger: true,
        showTotal: (total) => `共 ${total} 条`,
      }"
      :scroll="{ x: 1500 }"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'signDate'">
          <span v-if="record.signDate">
            {{ dayjs(record.signDate).format('YYYY-MM-DD HH:mm:ss') }}
          </span>
          <span v-else>—</span>
        </template>
        <template v-else-if="column.key === 'createTime'">
          <span v-if="record.createTime">
            {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
          </span>
          <span v-else>—</span>
        </template>
        <template v-else-if="column.key === 'updateTime'">
          <span v-if="record.updateTime">
            {{ dayjs(record.updateTime).format('YYYY-MM-DD HH:mm:ss') }}
          </span>
          <span v-else>—</span>
        </template>
        <template v-else-if="column.key === 'stayTimes'">
          <span v-if="record.stayTimes !== null && record.stayTimes !== undefined">
            {{ record.stayTimes }}
          </span>
          <span v-else>—</span>
        </template>
        <template v-else-if="column.key === 'content'">
          <span :title="record.content">{{ record.content || '—' }}</span>
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
              title="确定删除该补充条款吗？"
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

    <!-- 创建/编辑补充条款弹窗 -->
    <Modal
      v-model:open="createModalVisible"
      :title="isEditMode ? '更新补充条款' : '创建补充条款'"
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
        <Form.Item label="客户ID" name="customerId">
          <Input
            v-model:value="formModel.customerId"
            placeholder="请输入客户ID"
          />
        </Form.Item>
        <Form.Item label="标题" name="title">
          <Input
            v-model:value="formModel.title"
            placeholder="请输入标题"
          />
        </Form.Item>
        <Form.Item label="内容" name="content">
          <Input.TextArea
            v-model:value="formModel.content"
            placeholder="请输入内容"
            :rows="6"
          />
        </Form.Item>
        <Form.Item label="签署日期" name="signDate">
          <DatePicker
            v-model:value="formModel.signDate"
            placeholder="请选择签署日期"
            style="width: 100%"
            show-time
            format="YYYY-MM-DD HH:mm:ss"
          />
        </Form.Item>
        <Form.Item label="入住次数" name="stayTimes">
          <InputNumber
            v-model:value="formModel.stayTimes"
            placeholder="请输入入住次数"
            :min="0"
            style="width: 100%"
          />
        </Form.Item>
      </Form>
    </Modal>
  </div>
</template>


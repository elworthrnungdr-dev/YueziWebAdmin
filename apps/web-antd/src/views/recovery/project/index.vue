<script lang="ts" setup>
import { h, onMounted, ref } from 'vue';
import dayjs from 'dayjs';
import {
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Table,
  message,
} from 'ant-design-vue';
import type { FormInstance } from 'ant-design-vue';

import {
  getCareProjectListApi,
  getCareProjectDetailApi,
  createCareProjectApi,
  updateCareProjectApi,
  deleteCareProjectApi,
  type CareProjectListParams,
  type BackendCareProjectItem,
  type CreateCareProjectParams,
  type UpdateCareProjectParams,
} from '#/api';

const loading = ref(false);
const dataSource = ref<BackendCareProjectItem[]>([]);
const total = ref(0);

const queryForm = ref<CareProjectListParams>({
  ProductCode: undefined,
  ProjectName: undefined,
  Status: undefined,
  PageIndex: 1,
  PageSize: 10,
  OrderBy: undefined,
  IsAsc: true,
});

const statusOptions = [
  { label: '启用', value: 1 },
  { label: '禁用', value: 2 },
];

const columns = [
  { title: '产品编码', dataIndex: 'productCode', key: 'productCode', width: 140 },
  { title: '项目名称', dataIndex: 'projectName', key: 'projectName', width: 160 },
  { title: '标准价', dataIndex: 'standardPrice', key: 'standardPrice', width: 100 },
  { title: '标准手工费', dataIndex: 'standardHandFee', key: 'standardHandFee', width: 120 },
  { title: '项目时长(分钟)', dataIndex: 'duration', key: 'duration', width: 130 },
  { title: '有效期(天)', dataIndex: 'validDays', key: 'validDays', width: 110 },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 90,
    customRender: ({ record }: any) => (record.status === 1 ? '启用' : '禁用'),
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 170,
    customRender: ({ record }: any) =>
      record.createdAt ? dayjs(record.createdAt).format('YYYY-MM-DD HH:mm:ss') : '—',
  },
  { title: '操作', key: 'actions', width: 160, fixed: 'right' },
];

async function fetchList() {
  try {
    loading.value = true;
    const params = { ...queryForm.value };
    const res = await getCareProjectListApi(params);
    dataSource.value = res.items;
    total.value = res.total;
  } catch (error: any) {
    const errMsg = error?.response?.data?.message || error?.message || '获取产康项目列表失败';
    message.error(errMsg);
  } finally {
    loading.value = false;
  }
}

function handleReset() {
  queryForm.value = {
    ProductCode: undefined,
    ProjectName: undefined,
    Status: undefined,
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

// 弹窗相关
const createModalVisible = ref(false);
const isEditMode = ref(false);
const submitting = ref(false);
const formRef = ref<FormInstance>();
const editingId = ref('');

const formModel = ref<CreateCareProjectParams>({
  productCode: '',
  projectName: '',
  standardPrice: 0,
  standardHandFee: undefined,
  duration: undefined,
  validDays: 0,
  description: '',
  status: 1,
});

const formRules = {
  productCode: [{ required: true, message: '请输入产品编码' }],
  projectName: [{ required: true, message: '请输入项目名称' }],
  standardPrice: [{ required: true, message: '请输入标准价' }],
  validDays: [{ required: true, message: '请输入项目有效期（天）' }],
  status: [{ required: true, message: '请选择状态' }],
};

function openCreateModal() {
  isEditMode.value = false;
  editingId.value = '';
  formModel.value = {
    productCode: '',
    projectName: '',
    standardPrice: 0,
    standardHandFee: undefined,
    duration: undefined,
    validDays: 0,
    description: '',
    status: 1,
  };
  createModalVisible.value = true;
}

async function openEditModal(record: BackendCareProjectItem) {
  try {
    loading.value = true;
    const detail = await getCareProjectDetailApi(record.id);
    isEditMode.value = true;
    editingId.value = detail.id;
    formModel.value = {
      productCode: detail.productCode || '',
      projectName: detail.projectName || '',
      standardPrice: detail.standardPrice ?? 0,
      standardHandFee: detail.standardHandFee ?? undefined,
      duration: detail.duration ?? undefined,
      validDays: detail.validDays ?? 0,
      description: detail.description || '',
      status: detail.status ?? 1,
    };
    createModalVisible.value = true;
  } catch (error: any) {
    const errMsg = error?.response?.data?.message || error?.message || '获取项目详情失败';
    message.error(errMsg);
  } finally {
    loading.value = false;
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
    const payload: CreateCareProjectParams = { ...formModel.value };

    if (isEditMode.value) {
      await updateCareProjectApi({ ...(payload as any), id: editingId.value } as UpdateCareProjectParams);
      message.success('更新产康项目成功');
    } else {
      await createCareProjectApi(payload);
      message.success('创建产康项目成功');
    }
    closeCreateModal();
    fetchList();
  } catch (error: any) {
    if (error?.errorFields) return;
    const errMsg = error?.response?.data?.message || error?.message || '操作失败';
    message.error(errMsg);
  } finally {
    submitting.value = false;
  }
}

function handleDelete(record: BackendCareProjectItem) {
  Modal.confirm({
    title: '确认删除',
    content: h('div', { style: { fontSize: '14px' } }, `确定删除项目【${record.projectName || ''}】吗？`),
    okText: '删除',
    cancelText: '取消',
    okType: 'danger',
    centered: true,
    onOk: async () => {
      try {
        loading.value = true;
        await deleteCareProjectApi(record.id);
        message.success('删除成功');
        fetchList();
      } catch (error: any) {
        const errMsg = error?.response?.data?.message || error?.message || '删除失败';
        message.error(errMsg);
        throw error;
      } finally {
        loading.value = false;
      }
    },
  });
}
</script>

<template>
  <div class="p-4">
    <!-- 顶部操作和搜索 -->
    <div
      class="mb-4 flex items-center justify-between gap-3 flex-wrap"
    >
      <Button type="primary" class="cursor-pointer" @click="openCreateModal">
        创建产康项目
      </Button>
      <Space wrap>
        <Input
          v-model:value="queryForm.ProductCode"
          placeholder="产品编码"
          style="width: 160px"
          allow-clear
        />
        <Input
          v-model:value="queryForm.ProjectName"
          placeholder="项目名称"
          style="width: 160px"
          allow-clear
        />
        <Select
          v-model:value="queryForm.Status"
          :options="statusOptions"
          placeholder="项目状态"
          style="width: 140px"
          allow-clear
        />
        <Button type="primary" class="cursor-pointer" @click="fetchList">
          查询
        </Button>
        <Button class="cursor-pointer" @click="handleReset">重置</Button>
      </Space>
    </div>

    <!-- 表格 -->
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
      :scroll="{ x: 'max-content' }"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'actions'">
          <Space>
            <Button type="link" size="small" @click="openEditModal(record)">更新</Button>
            <Button type="link" size="small" danger @click="handleDelete(record)">删除</Button>
          </Space>
        </template>
      </template>
    </Table>

    <!-- 创建 / 编辑弹窗 -->
    <Modal
      v-model:open="createModalVisible"
      :title="isEditMode ? '更新产康项目' : '创建产康项目'"
      width="700px"
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
        layout="vertical"
      >
        <div class="grid grid-cols-3 gap-4">
          <Form.Item label="产品编码" name="productCode">
            <Input v-model:value="formModel.productCode" placeholder="请输入产品编码" />
          </Form.Item>
          <Form.Item label="项目名称" name="projectName">
            <Input v-model:value="formModel.projectName" placeholder="请输入项目名称" />
          </Form.Item>
          <Form.Item label="标准价" name="standardPrice">
            <InputNumber
              v-model:value="formModel.standardPrice"
              :min="0"
              style="width: 100%"
              placeholder="请输入标准价"
            />
          </Form.Item>
          <Form.Item label="标准手工费" name="standardHandFee">
            <InputNumber
              v-model:value="formModel.standardHandFee"
              :min="0"
              style="width: 100%"
              placeholder="请输入标准手工费"
            />
          </Form.Item>
          <Form.Item label="项目时长（分钟）" name="duration">
            <InputNumber
              v-model:value="formModel.duration"
              :min="0"
              style="width: 100%"
              placeholder="请输入项目时长（分钟）"
            />
          </Form.Item>
          <Form.Item label="项目有效期（天）" name="validDays">
            <InputNumber
              v-model:value="formModel.validDays"
              :min="0"
              style="width: 100%"
              placeholder="请输入项目有效期（天）"
            />
          </Form.Item>
          <Form.Item label="状态" name="status">
            <Select
              v-model:value="formModel.status"
              :options="statusOptions"
              placeholder="请选择状态"
            />
          </Form.Item>
        </div>
        <Form.Item label="项目介绍" name="description">
          <Input.TextArea
            v-model:value="formModel.description"
            :rows="3"
            placeholder="请输入项目介绍"
          />
        </Form.Item>
      </Form>
    </Modal>
  </div>
</template>


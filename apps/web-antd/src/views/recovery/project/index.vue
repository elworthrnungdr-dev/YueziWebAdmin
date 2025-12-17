<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import {
  getCareProjectListApi,
  createCareProjectApi,
  getCareProjectDetailApi,
  updateCareProjectApi,
  deleteCareProjectApi,
  type CareProjectItem,
  type CareProjectListParams,
  type CreateCareProjectParams,
  type UpdateCareProjectParams,
} from '#/api';

import {
  Button,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Table,
  Modal,
  Popconfirm,
  message,
} from 'ant-design-vue';
import type { FormInstance } from 'ant-design-vue';
import dayjs from 'dayjs';

const loading = ref(false);
const dataSource = ref<CareProjectItem[]>([]);
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
  {
    title: '产品编码',
    dataIndex: 'productCode',
    key: 'productCode',
    width: 140,
  },
  {
    title: '项目名称',
    dataIndex: 'projectName',
    key: 'projectName',
    width: 160,
  },
  {
    title: '标准价',
    dataIndex: 'standardPrice',
    key: 'standardPrice',
    width: 120,
  },
  {
    title: '标准手工费',
    dataIndex: 'standardHandFee',
    key: 'standardHandFee',
    width: 120,
  },
  {
    title: '时长(分钟)',
    dataIndex: 'duration',
    key: 'duration',
    width: 120,
  },
  {
    title: '有效天数',
    dataIndex: 'validDays',
    key: 'validDays',
    width: 120,
  },
  {
    title: '项目说明',
    dataIndex: 'description',
    key: 'description',
    width: 220,
    ellipsis: true,
  },
  {
    title: '状态',
    dataIndex: 'statusText',
    key: 'statusText',
    width: 100,
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
    const result = await getCareProjectListApi(queryForm.value);
    dataSource.value = result.items || [];
    total.value = result.total || 0;
  } catch (error: any) {
    const errMsg =
      error?.response?.data?.message ||
      error?.data?.message ||
      error?.message ||
      '获取产康项目列表失败';
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

// 创建/编辑产康项目弹窗相关
const createModalVisible = ref(false);
const submitting = ref(false);
const isEditMode = ref(false);
const editingId = ref<string>('');
const formRef = ref<FormInstance>();
const formModel = ref<CreateCareProjectParams>({
  productCode: '',
  projectName: '',
  standardPrice: 0,
  standardHandFee: 0,
  duration: 0,
  validDays: 0,
  description: '',
  status: 1,
});

const formRules = {
  productCode: [{ required: true, message: '请输入产品编码' }],
  projectName: [{ required: true, message: '请输入项目名称' }],
  standardPrice: [{ required: true, message: '请输入标准价' }],
  validDays: [{ required: true, message: '请输入有效天数' }],
  status: [{ required: true, message: '请选择状态' }],
};

function resetForm() {
  formModel.value = {
    productCode: '',
    projectName: '',
    standardPrice: 0,
    standardHandFee: 0,
    duration: 0,
    validDays: 0,
    description: '',
    status: 1,
  };
  formRef.value?.resetFields();
}

function openCreateModal() {
  isEditMode.value = false;
  editingId.value = '';
  createModalVisible.value = true;
  resetForm();
}

async function openEditModal(record: CareProjectItem) {
  isEditMode.value = true;
  editingId.value = record.id;
  createModalVisible.value = true;
  resetForm();

  try {
    const detail = await getCareProjectDetailApi(record.id);
    formModel.value = {
      productCode: detail.productCode || '',
      projectName: detail.projectName || '',
      standardPrice: detail.standardPrice ?? 0,
      standardHandFee: detail.standardHandFee ?? 0,
      duration: detail.duration ?? 0,
      validDays: detail.validDays ?? 0,
      description: detail.description || '',
      status: detail.status ?? 1,
    };
  } catch (error: any) {
    const errMsg =
      error?.response?.data?.message ||
      error?.data?.message ||
      error?.message ||
      '获取产康项目详情失败';
    message.error(errMsg);
    createModalVisible.value = false;
  }
}

function closeCreateModal() {
  createModalVisible.value = false;
  isEditMode.value = false;
  editingId.value = '';
  resetForm();
}

async function handleSubmit() {
  try {
    const values = await formRef.value?.validate();
    if (!values) return;
    submitting.value = true;

    const baseData = {
      ...values,
    } as CreateCareProjectParams;

    if (isEditMode.value) {
      const updateData: UpdateCareProjectParams = {
        ...baseData,
        id: editingId.value,
      };
      await updateCareProjectApi(updateData);
      message.success('更新产康项目成功');
    } else {
      await createCareProjectApi(baseData);
      message.success('创建产康项目成功');
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
      (isEditMode.value ? '更新产康项目失败' : '创建产康项目失败');
    message.error(errMsg);
    return;
  } finally {
    submitting.value = false;
  }
}

async function handleDelete(record: CareProjectItem) {
  try {
    await deleteCareProjectApi(record.id);
    message.success('删除产康项目成功');
    fetchList();
  } catch (error: any) {
    const errMsg =
      error?.response?.data?.message ||
      error?.data?.message ||
      error?.message ||
      '删除产康项目失败';
    message.error(errMsg);
  }
}

onMounted(() => {
  fetchList();
});
</script>

<template>
  <div class="p-4">
    <!-- 顶部：创建按钮 + 查询条件 -->
    <div class="mb-3 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <Button type="primary" class="cursor-pointer" @click="openCreateModal">
          创建产康项目
        </Button>
      </div>
      <Space>
        <Input
          v-model:value="queryForm.ProductCode"
          placeholder="产品编码"
          allow-clear
          style="width: 160px"
        />
        <Input
          v-model:value="queryForm.ProjectName"
          placeholder="项目名称"
          allow-clear
          style="width: 160px"
        />
        <Select
          v-model:value="queryForm.Status"
          :options="statusOptions"
          placeholder="项目状态"
          allow-clear
          style="width: 140px"
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
      :scroll="{ x: 1600 }"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'standardPrice'">
          <span v-if="record.standardPrice !== null && record.standardPrice !== undefined">
            ¥{{ record.standardPrice.toLocaleString() }}
          </span>
          <span v-else>—</span>
        </template>
        <template v-else-if="column.key === 'standardHandFee'">
          <span
            v-if="record.standardHandFee !== null && record.standardHandFee !== undefined"
          >
            ¥{{ record.standardHandFee.toLocaleString() }}
          </span>
          <span v-else>—</span>
        </template>
        <template v-else-if="column.key === 'duration'">
          <span v-if="record.duration !== null && record.duration !== undefined">
            {{ record.duration }}
          </span>
          <span v-else>—</span>
        </template>
        <template v-else-if="column.key === 'validDays'">
          <span v-if="record.validDays !== null && record.validDays !== undefined">
            {{ record.validDays }}
          </span>
          <span v-else>—</span>
        </template>
        <template v-else-if="column.key === 'statusText'">
          <span>
            {{
              record.statusText ||
              (record.status === 1 ? '启用' : record.status === 2 ? '禁用' : '未知')
            }}
          </span>
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
        <template v-else-if="column.key === 'description'">
          <span>{{ record.description || '—' }}</span>
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
                title="确定删除该产康项目吗？"
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

    <!-- 创建/编辑产康项目弹窗 -->
    <Modal
      v-model:open="createModalVisible"
      :title="isEditMode ? '更新产康项目' : '创建产康项目'"
      width="720px"
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
          <Form.Item label="产品编码" name="productCode">
            <Input
              v-model:value="formModel.productCode"
              placeholder="请输入产品编码"
            />
          </Form.Item>
          <Form.Item label="项目名称" name="projectName">
            <Input
              v-model:value="formModel.projectName"
              placeholder="请输入项目名称"
            />
          </Form.Item>
          <Form.Item label="标准价" name="standardPrice">
            <InputNumber
              v-model:value="formModel.standardPrice"
              :min="0"
              :precision="2"
              style="width: 100%"
              placeholder="请输入标准价"
            />
          </Form.Item>
          <Form.Item label="标准手工费" name="standardHandFee">
            <InputNumber
              v-model:value="formModel.standardHandFee"
              :min="0"
              :precision="2"
              style="width: 100%"
              placeholder="请输入标准手工费"
            />
          </Form.Item>
          <Form.Item label="时长(分钟)" name="duration">
            <InputNumber
              v-model:value="formModel.duration"
              :min="0"
              style="width: 100%"
              placeholder="请输入时长"
            />
          </Form.Item>
          <Form.Item label="有效天数" name="validDays">
            <InputNumber
              v-model:value="formModel.validDays"
              :min="0"
              style="width: 100%"
              placeholder="请输入有效天数"
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
        <Form.Item label="项目说明" name="description">
          <Input.TextArea
            v-model:value="formModel.description"
            :rows="4"
            placeholder="请输入项目说明"
          />
        </Form.Item>
      </Form>
    </Modal>
  </div>
</template>





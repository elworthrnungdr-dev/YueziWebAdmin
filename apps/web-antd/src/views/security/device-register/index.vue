<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import {
  getSafetyProjectListApi,
  createSafetyProjectApi,
  getSafetyProjectDetailApi,
  updateSafetyProjectApi,
  deleteSafetyProjectApi,
  type SafetyProjectItem,
  type SafetyProjectListParams,
  type CreateSafetyProjectParams,
  type UpdateSafetyProjectParams,
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
const dataSource = ref<SafetyProjectItem[]>([]);
const total = ref(0);

const queryForm = ref<SafetyProjectListParams>({
  ProjectCode: undefined,
  ProjectName: undefined,
  CreatedAtStart: undefined,
  CreatedAtEnd: undefined,
  PageIndex: 1,
  PageSize: 10,
  OrderBy: undefined,
  IsAsc: true,
});

const projectTypeOptions = [
  { label: '家具', value: 1 },
  { label: '电器', value: 2 },
  { label: '管道', value: 3 },
  { label: '消防', value: 4 },
  { label: '结构', value: 5 },
  { label: '其他', value: 6 },
];

const columns = [
  {
    title: '项目编码',
    dataIndex: 'projectCode',
    key: 'projectCode',
    width: 140,
  },
  {
    title: '项目名称',
    dataIndex: 'projectName',
    key: 'projectName',
    width: 180,
  },
  {
    title: '项目类型',
    dataIndex: 'projectTypeText',
    key: 'projectTypeText',
    width: 120,
  },
  {
    title: '品牌',
    dataIndex: 'brand',
    key: 'brand',
    width: 140,
  },
  {
    title: '型号',
    dataIndex: 'model',
    key: 'model',
    width: 140,
  },
  {
    title: '维护周期(天)',
    dataIndex: 'maintenanceCycle',
    key: 'maintenanceCycle',
    width: 140,
  },
  {
    title: '规格',
    dataIndex: 'specifications',
    key: 'specifications',
    width: 200,
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
    width: 170,
  },
  {
    title: '操作',
    key: 'actions',
    width: 160,
    fixed: 'right',
    align: 'center',
  },
];

async function fetchList() {
  try {
    loading.value = true;
    const params: SafetyProjectListParams = {
      ...queryForm.value,
      CreatedAtStart: queryForm.value.CreatedAtStart
        ? dayjs(queryForm.value.CreatedAtStart).toISOString()
        : undefined,
      CreatedAtEnd: queryForm.value.CreatedAtEnd
        ? dayjs(queryForm.value.CreatedAtEnd).toISOString()
        : undefined,
    };
    const result = await getSafetyProjectListApi(params);
    dataSource.value = result.items || [];
    total.value = result.total || 0;
  } catch (error: any) {
    const errMsg =
      error?.response?.data?.message ||
      error?.data?.message ||
      error?.message ||
      '获取设备登记项目列表失败';
    message.error(errMsg);
  } finally {
    loading.value = false;
  }
}

function handleReset() {
  queryForm.value = {
    ProjectCode: undefined,
    ProjectName: undefined,
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

// 创建 / 编辑弹窗
const createModalVisible = ref(false);
const submitting = ref(false);
const isEditMode = ref(false);
const editingId = ref<string>('');
const formRef = ref<FormInstance>();

const formModel = ref<CreateSafetyProjectParams>({
  projectCode: '',
  projectName: '',
  projectType: 1,
  brand: '',
  model: '',
  maintenanceCycle: undefined,
  specifications: '',
  remark: '',
});

const formRules = {
  projectCode: [{ required: true, message: '请输入项目编码' }],
  projectName: [{ required: true, message: '请输入项目名称' }],
  projectType: [{ required: true, message: '请选择项目类型' }],
};

function resetForm() {
  formModel.value = {
    projectCode: '',
    projectName: '',
    projectType: 1,
    brand: '',
    model: '',
    maintenanceCycle: undefined,
    specifications: '',
    remark: '',
  };
  formRef.value?.resetFields();
}

function openCreateModal() {
  isEditMode.value = false;
  editingId.value = '';
  createModalVisible.value = true;
  resetForm();
}

async function openEditModal(record: SafetyProjectItem) {
  isEditMode.value = true;
  editingId.value = record.id;
  createModalVisible.value = true;
  resetForm();

  try {
    const detail = await getSafetyProjectDetailApi(record.id);
    formModel.value = {
      projectCode: detail.projectCode || '',
      projectName: detail.projectName || '',
      projectType: detail.projectType ?? 1,
      brand: detail.brand || '',
      model: detail.model || '',
      maintenanceCycle: detail.maintenanceCycle,
      specifications: detail.specifications || '',
      remark: detail.remark || '',
    };
  } catch (error: any) {
    const errMsg =
      error?.response?.data?.message ||
      error?.data?.message ||
      error?.message ||
      '获取设备登记项目详情失败';
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

    const baseData: CreateSafetyProjectParams = {
      projectCode: formModel.value.projectCode,
      projectName: formModel.value.projectName,
      projectType: formModel.value.projectType,
      brand: formModel.value.brand,
      model: formModel.value.model,
      maintenanceCycle: formModel.value.maintenanceCycle,
      specifications: formModel.value.specifications,
      remark: formModel.value.remark,
    };

    if (isEditMode.value) {
      const updateData: UpdateSafetyProjectParams = {
        ...baseData,
        id: editingId.value,
      };
      await updateSafetyProjectApi(updateData);
      message.success('更新设备登记项目成功');
    } else {
      await createSafetyProjectApi(baseData);
      message.success('创建设备登记项目成功');
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
      (isEditMode.value ? '更新设备登记项目失败' : '创建设备登记项目失败');
    message.error(errMsg);
    return;
  } finally {
    submitting.value = false;
  }
}

function handleDelete(record: SafetyProjectItem) {
  Modal.confirm({
    title: '确认删除',
    content: h('div', { style: { fontSize: '14px', lineHeight: '1.6' } }, [
      h('p', {
        style: { marginBottom: '8px', color: '#ff4d4f', fontWeight: 500 },
      }, '⚠️ 警告'),
      h('p', { style: { margin: 0 } }, '确定要删除该设备登记项目吗？'),
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
        await deleteSafetyProjectApi(record.id);
        message.success('删除设备登记项目成功');
        fetchList();
      } catch (error: any) {
        const errMsg =
          error?.response?.data?.message ||
          error?.data?.message ||
          error?.message ||
          '删除设备登记项目失败';
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
    <!-- 顶部：创建设备登记项目 + 查询条件 -->
    <div class="mb-3 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <Button type="primary" class="cursor-pointer" @click="openCreateModal">
          创建设备的登记项目
        </Button>
      </div>
      <Space>
        <Input
          v-model:value="queryForm.ProjectCode"
          placeholder="项目编码"
          allow-clear
          style="width: 160px"
        />
        <Input
          v-model:value="queryForm.ProjectName"
          placeholder="项目名称"
          allow-clear
          style="width: 160px"
        />
        <DatePicker
          v-model:value="queryForm.CreatedAtStart"
          placeholder="创建时间开始"
          style="width: 170px"
        />
        <DatePicker
          v-model:value="queryForm.CreatedAtEnd"
          placeholder="创建时间结束"
          style="width: 170px"
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
      :scroll="{ x: 1200 }"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'maintenanceCycle'">
          <span v-if="record.maintenanceCycle !== null && record.maintenanceCycle !== undefined">
            {{ record.maintenanceCycle }}
          </span>
          <span v-else>—</span>
        </template>
        <template v-else-if="column.key === 'projectTypeText'">
          <span>
            {{
              record.projectTypeText ||
              (record.projectType === 1
                ? '家具'
                : record.projectType === 2
                ? '电器'
                : record.projectType === 3
                ? '管道'
                : record.projectType === 4
                ? '消防'
                : record.projectType === 5
                ? '结构'
                : record.projectType === 6
                ? '其他'
                : '未知')
            }}
          </span>
        </template>
        <template v-else-if="column.key === 'remark'">
          <span>{{ record.remark || '—' }}</span>
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

    <!-- 创建 / 编辑设备登记项目弹窗 -->
    <Modal
      v-model:open="createModalVisible"
      :title="isEditMode ? '更新设备的登记项目' : '创建设备的登记项目'"
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
          <Form.Item label="项目编码" name="projectCode">
            <Input
              v-model:value="formModel.projectCode"
              placeholder="请输入项目编码"
            />
          </Form.Item>
          <Form.Item label="项目名称" name="projectName">
            <Input
              v-model:value="formModel.projectName"
              placeholder="请输入项目名称"
            />
          </Form.Item>
          <Form.Item label="项目类型" name="projectType">
            <Select
              v-model:value="formModel.projectType"
              :options="projectTypeOptions"
              placeholder="请选择项目类型"
            />
          </Form.Item>
          <Form.Item label="品牌" name="brand">
            <Input
              v-model:value="formModel.brand"
              placeholder="请输入品牌"
            />
          </Form.Item>
          <Form.Item label="型号" name="model">
            <Input
              v-model:value="formModel.model"
              placeholder="请输入型号"
            />
          </Form.Item>
          <Form.Item label="维护周期(天)" name="maintenanceCycle">
            <InputNumber
              v-model:value="formModel.maintenanceCycle"
              :min="0"
              style="width: 100%"
              placeholder="请输入维护周期"
            />
          </Form.Item>
        </div>
        <Form.Item label="规格" name="specifications">
          <Input.TextArea
            v-model:value="formModel.specifications"
            :rows="3"
            placeholder="请输入规格"
          />
        </Form.Item>
        <Form.Item label="备注" name="remark">
          <Input.TextArea
            v-model:value="formModel.remark"
            :rows="3"
            placeholder="请输入备注"
          />
        </Form.Item>
      </Form>
    </Modal>
  </div>
</template>



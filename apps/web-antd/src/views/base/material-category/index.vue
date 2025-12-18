<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import {
  getMaterialCategoryListApi,
  createMaterialCategoryApi,
  getMaterialCategoryDetailApi,
  updateMaterialCategoryApi,
  deleteMaterialCategoryApi,
  type MaterialCategoryItem,
  type MaterialCategoryListParams,
  type CreateMaterialCategoryParams,
  type UpdateMaterialCategoryParams,
} from '#/api';

import {
  Button,
  Form,
  Input,
  InputNumber,
  Space,
  Table,
  Modal,
  message,
} from 'ant-design-vue';
import type { FormInstance } from 'ant-design-vue';
import { h } from 'vue';

const loading = ref(false);
const dataSource = ref<MaterialCategoryItem[]>([]);
const total = ref(0);

const queryForm = ref<MaterialCategoryListParams>({
  CategoryCode: undefined,
  CategoryName: undefined,
  PageIndex: 1,
  PageSize: 10,
  OrderBy: undefined,
  IsAsc: true,
});

const columns = [
  {
    title: '类别编码',
    dataIndex: 'categoryCode',
    key: 'categoryCode',
    width: 160,
  },
  {
    title: '类别名称',
    dataIndex: 'categoryName',
    key: 'categoryName',
    width: 160,
  },
  {
    title: '父级类别ID',
    dataIndex: 'parentId',
    key: 'parentId',
    width: 180,
  },
  {
    title: '排序序号',
    dataIndex: 'sortOrder',
    key: 'sortOrder',
    width: 120,
  },
  {
    title: '是否启用',
    dataIndex: 'isEnabled',
    key: 'isEnabled',
    width: 120,
  },
  {
    title: '类别描述',
    dataIndex: 'description',
    key: 'description',
    width: 240,
    ellipsis: true,
  },
  {
    title: '操作',
    key: 'actions',
    width: 180,
    fixed: 'right',
    align: 'center',
  },
];

async function fetchList() {
  try {
    loading.value = true;
    const params: MaterialCategoryListParams = {
      ...queryForm.value,
    };
    const res = await getMaterialCategoryListApi(params);
    dataSource.value = res.items;
    total.value = res.total;
  } finally {
    loading.value = false;
  }
}

function handleReset() {
  queryForm.value = {
    CategoryCode: undefined,
    CategoryName: undefined,
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

const formModel = ref<CreateMaterialCategoryParams>({
  categoryCode: '',
  categoryName: '',
  parentId: '',
  sortOrder: undefined,
  description: '',
});

const formRules = {
  categoryCode: [{ required: true, message: '请输入类别编码' }],
  categoryName: [{ required: true, message: '请输入类别名称' }],
};

function openCreateModal() {
  isEditMode.value = false;
  editingId.value = '';
  formModel.value = {
    categoryCode: '',
    categoryName: '',
    parentId: '',
    sortOrder: undefined,
    description: '',
  };
  createModalVisible.value = true;
}

async function openEditModal(record: MaterialCategoryItem) {
  isEditMode.value = true;
  editingId.value = record.id;
  try {
    const detail = await getMaterialCategoryDetailApi(record.id);
    formModel.value = {
      categoryCode: detail.categoryCode || '',
      categoryName: detail.categoryName || '',
      parentId: detail.parentId || '',
      sortOrder: detail.sortOrder,
      description: detail.description || '',
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
    const params: CreateMaterialCategoryParams = {
      ...formModel.value,
    };

    if (isEditMode.value) {
      await updateMaterialCategoryApi({
        ...(params as CreateMaterialCategoryParams),
        id: editingId.value,
      } as UpdateMaterialCategoryParams);
      message.success('更新物资类别成功');
    } else {
      await createMaterialCategoryApi(params);
      message.success('创建物资类别成功');
    }
    closeCreateModal();
    fetchList();
  } finally {
    submitting.value = false;
  }
}

function formatIsEnabled(value?: number) {
  if (value === 1) return '启用';
  if (value === 0) return '禁用';
  return '—';
}

function handleDelete(record: MaterialCategoryItem) {
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
      h('p', { style: { margin: 0 } }, '确定要删除该物资类别吗？'),
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
        await deleteMaterialCategoryApi(record.id);
        message.success('删除物资类别成功');
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
        创建物资类别
      </Button>
      <Space wrap>
        <Input
          v-model:value="queryForm.CategoryCode"
          placeholder="类别编码"
          style="width: 180px"
          allow-clear
        />
        <Input
          v-model:value="queryForm.CategoryName"
          placeholder="类别名称"
          style="width: 180px"
          allow-clear
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
        <template v-if="column.key === 'parentId'">
          <span>{{ record.parentId || '—' }}</span>
        </template>
        <template v-else-if="column.key === 'sortOrder'">
          <span v-if="record.sortOrder !== null && record.sortOrder !== undefined">
            {{ record.sortOrder }}
          </span>
          <span v-else>—</span>
        </template>
        <template v-else-if="column.key === 'isEnabled'">
          <span>{{ formatIsEnabled(record.isEnabled) }}</span>
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

    <!-- 创建 / 编辑物资类别弹窗 -->
    <Modal
      v-model:open="createModalVisible"
      :title="isEditMode ? '更新物资类别' : '创建物资类别'"
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
          <Form.Item label="类别编码" name="categoryCode">
            <Input
              v-model:value="formModel.categoryCode"
              placeholder="请输入类别编码"
            />
          </Form.Item>
          <Form.Item label="类别名称" name="categoryName">
            <Input
              v-model:value="formModel.categoryName"
              placeholder="请输入类别名称"
            />
          </Form.Item>
          <Form.Item label="父级类别ID" name="parentId">
            <Input
              v-model:value="formModel.parentId"
              placeholder="请输入父级类别ID"
            />
          </Form.Item>
          <Form.Item label="排序序号" name="sortOrder">
            <InputNumber
              v-model:value="formModel.sortOrder"
              :min="0"
              style="width: 100%"
              placeholder="请输入排序序号"
            />
          </Form.Item>
        </div>
        <Form.Item label="类别描述" name="description">
          <Input.TextArea
            v-model:value="formModel.description"
            :rows="3"
            placeholder="请输入类别描述"
          />
        </Form.Item>
      </Form>
    </Modal>
  </div>
</template>

<style scoped>
</style>



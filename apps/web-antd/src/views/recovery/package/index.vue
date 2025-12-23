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
  getCarePackageListApi,
  getCarePackageDetailApi,
  createCarePackageApi,
  updateCarePackageApi,
  deleteCarePackageApi,
  type CarePackageListParams,
  type BackendCarePackageItem,
  type CreateCarePackageParams,
  type UpdateCarePackageParams,
  type CarePackageItemInput,
  getCareProjectAllListApi,
  type CareProjectAllListItem,
} from '#/api';

const loading = ref(false);
const dataSource = ref<BackendCarePackageItem[]>([]);
const total = ref(0);

const queryForm = ref<CarePackageListParams>({
  PackageName: undefined,
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
  { title: '套餐名称', dataIndex: 'packageName', key: 'packageName', width: 180 },
  { title: '套餐总价', dataIndex: 'totalPrice', key: 'totalPrice', width: 120 },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 90,
    customRender: ({ record }: any) => (record.status === 1 ? '启用' : '禁用'),
  },
  { title: '备注', dataIndex: 'remark', key: 'remark', width: 220, ellipsis: true },
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
    const res = await getCarePackageListApi(params);
    dataSource.value = res.items;
    total.value = res.total;
  } catch (error: any) {
    const errMsg = error?.response?.data?.message || error?.message || '获取产康套餐项目列表失败';
    message.error(errMsg);
  } finally {
    loading.value = false;
  }
}

function handleReset() {
  queryForm.value = {
    PackageName: undefined,
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
  loadProjectOptions();
});

// 弹窗相关
const createModalVisible = ref(false);
const isEditMode = ref(false);
const submitting = ref(false);
const formRef = ref<FormInstance>();
const editingId = ref('');

const formModel = ref<CreateCarePackageParams>({
  packageName: '',
  totalPrice: 0,
  status: 1,
  remark: '',
  items: [{ projectId: '', quantity: 1 }],
});

const formRules = {
  packageName: [{ required: true, message: '请输入套餐名称' }],
  totalPrice: [{ required: true, message: '请输入套餐总价' }],
  status: [{ required: true, message: '请选择状态' }],
};

const projectOptions = ref<CareProjectAllListItem[]>([]);

async function loadProjectOptions() {
  try {
    const list = await getCareProjectAllListApi();
    projectOptions.value = list;
  } catch (error: any) {
    const errMsg = error?.response?.data?.message || error?.message || '获取产康项目失败';
    message.error(errMsg);
  }
}

function openCreateModal() {
  isEditMode.value = false;
  editingId.value = '';
  formModel.value = {
    packageName: '',
    totalPrice: 0,
    status: 1,
    remark: '',
    items: [{ projectId: '', quantity: 1 }],
  };
  createModalVisible.value = true;
}

async function openEditModal(record: BackendCarePackageItem) {
  try {
    loading.value = true;
    const detail = await getCarePackageDetailApi(record.id);
    isEditMode.value = true;
    editingId.value = detail.id;
    formModel.value = {
      packageName: detail.packageName || '',
      totalPrice: detail.totalPrice ?? 0,
      status: detail.status ?? 1,
      remark: detail.remark || '',
      items: Array.isArray(detail.items) && detail.items.length
        ? detail.items.map((it) => ({
            projectId: it.projectId,
            quantity: it.quantity ?? 1,
          }))
        : [{ projectId: '', quantity: 1 }],
    };
    createModalVisible.value = true;
  } catch (error: any) {
    const errMsg = error?.response?.data?.message || error?.message || '获取套餐详情失败';
    message.error(errMsg);
  } finally {
    loading.value = false;
  }
}

function closeCreateModal() {
  createModalVisible.value = false;
  formRef.value?.resetFields();
}

function addItem() {
  formModel.value.items = [...(formModel.value.items || []), { projectId: '', quantity: 1 }];
}

function removeItem(index: number) {
  const list = [...(formModel.value.items || [])];
  if (list.length <= 1) {
    message.warning('至少保留一条子项');
    return;
  }
  list.splice(index, 1);
  formModel.value.items = list;
}

function validateItems(items?: CarePackageItemInput[]) {
  if (!items || !items.length) return true;
  for (const [idx, it] of items.entries()) {
    if (!it.projectId) {
      message.error(`第 ${idx + 1} 条子项请选择产康项目`);
      return false;
    }
    if (!it.quantity || it.quantity <= 0) {
      message.error(`第 ${idx + 1} 条子项请输入数量`);
      return false;
    }
  }
  return true;
}

async function handleSubmit() {
  try {
    await formRef.value?.validate();
    const validItems = validateItems(formModel.value.items);
    if (!validItems) return;
    submitting.value = true;
    const payload: CreateCarePackageParams = {
      packageName: formModel.value.packageName,
      totalPrice: formModel.value.totalPrice,
      status: formModel.value.status,
      remark: formModel.value.remark,
      items: formModel.value.items?.map((it) => ({
        projectId: it.projectId,
        quantity: it.quantity,
      })),
    };

    if (isEditMode.value) {
      await updateCarePackageApi({ ...(payload as any), id: editingId.value } as UpdateCarePackageParams);
      message.success('更新产康套餐项目成功');
    } else {
      await createCarePackageApi(payload);
      message.success('创建产康套餐项目成功');
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

function handleDelete(record: BackendCarePackageItem) {
  Modal.confirm({
    title: '确认删除',
    content: h('div', { style: { fontSize: '14px' } }, `确定删除套餐【${record.packageName || ''}】吗？`),
    okText: '删除',
    cancelText: '取消',
    okType: 'danger',
    centered: true,
    onOk: async () => {
      try {
        loading.value = true;
        await deleteCarePackageApi(record.id);
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
    <div class="mb-4 flex items-center justify-between gap-3 flex-wrap">
      <Button type="primary" class="cursor-pointer" @click="openCreateModal">
        创建产康套餐项目
      </Button>
      <Space wrap>
        <Input
          v-model:value="queryForm.PackageName"
          placeholder="套餐名称"
          style="width: 180px"
          allow-clear
        />
        <Select
          v-model:value="queryForm.Status"
          :options="statusOptions"
          placeholder="状态"
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
      :title="isEditMode ? '更新产康套餐项目' : '创建产康套餐项目'"
      width="820px"
      :confirm-loading="submitting"
      :body-style="{ maxHeight: '640px', overflowY: 'auto' }"
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
          <Form.Item label="套餐名称" name="packageName">
            <Input v-model:value="formModel.packageName" placeholder="请输入套餐名称" />
          </Form.Item>
          <Form.Item label="套餐总价" name="totalPrice">
            <InputNumber
              v-model:value="formModel.totalPrice"
              :min="0"
              style="width: 100%"
              placeholder="请输入套餐总价"
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
        <Form.Item label="备注" name="remark">
          <Input.TextArea v-model:value="formModel.remark" :rows="3" placeholder="请输入备注" />
        </Form.Item>
        <Form.Item label="套餐子项">
          <Space direction="vertical" style="width: 100%">
            <div
              v-for="(item, index) in formModel.items"
              :key="index"
              class="flex gap-3 items-center flex-wrap"
            >
              <Select
                v-model:value="item.projectId"
                :options="projectOptions.map((p) => ({ label: p.name, value: p.id }))"
                placeholder="请选择产康项目"
                style="width: 260px"
                show-search
                option-filter-prop="label"
              />
              <InputNumber
                v-model:value="item.quantity"
                :min="1"
                style="width: 140px"
                placeholder="数量"
              />
              <Button danger type="link" @click="removeItem(index)">移除</Button>
            </div>
            <Button type="dashed" block @click="addItem">+ 添加子项</Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  </div>
</template>


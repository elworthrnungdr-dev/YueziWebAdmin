<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue';

import {
  createDepartmentApi,
  deleteDepartmentApi,
  getDepartmentListApi,
  getDepartmentDetailApi,
  updateDepartmentApi,
  type CreateDepartmentParams,
  type DepartmentItem,
  type UpdateDepartmentParams,
} from '#/api';

import { Button, Form, Input, message, Modal, Popconfirm, Table } from 'ant-design-vue';
import type { FormInstance, Rule } from 'ant-design-vue/es/form';

const loading = ref(false);
const dataSource = ref<DepartmentItem[]>([]);

const createModalVisible = ref(false);
const submitting = ref(false);
const isEditMode = ref(false);
const editingId = ref<string>('');
const formRef = ref<FormInstance>();
const formModel = reactive<CreateDepartmentParams>({
  deptCode: '',
  deptName: '',
  parentId: '',
  leaderId: '',
});

const formRules: Record<string, Rule[]> = {
  deptCode: [{ required: true, message: '请输入部门编码' }],
  deptName: [{ required: true, message: '请输入部门名称' }],
  // parentId、leaderId 为非必填
  parentId: [],
  leaderId: [],
};

async function fetchList() {
  loading.value = true;
  try {
    const list = await getDepartmentListApi();
    dataSource.value = list;
  } catch (error: any) {
    const errMsg =
      error?.response?.data?.message || error?.message || '获取部门列表失败';
    message.error(errMsg);
  } finally {
    loading.value = false;
  }
}

function resetFormModel() {
  formModel.deptCode = '';
  formModel.deptName = '';
  formModel.parentId = '';
  formModel.leaderId = '';
}

function openCreateModal() {
  isEditMode.value = false;
  editingId.value = '';
  resetFormModel();
  createModalVisible.value = true;
  formRef.value?.clearValidate?.();
}

async function openEditModal(record: DepartmentItem) {
  isEditMode.value = true;
  editingId.value = record.id;

  try {
    const detail = await getDepartmentDetailApi(record.id);
    formModel.deptCode = detail.deptCode || '';
    formModel.deptName = detail.deptName || '';
    formModel.parentId = detail.parentId || '';
    formModel.leaderId = detail.leaderId || '';
    createModalVisible.value = true;
    formRef.value?.clearValidate?.();
  } catch (error: any) {
    const errMsg =
      error?.response?.data?.message || error?.message || '获取部门详情失败';
    message.error(errMsg);
  }
}

async function handleSubmit() {
  try {
    const values = await formRef.value?.validate();
    if (!values) return;
    submitting.value = true;

    if (isEditMode.value && editingId.value) {
      const payload: UpdateDepartmentParams = {
        ...(values as CreateDepartmentParams),
        id: editingId.value,
      };
      await updateDepartmentApi(payload);
      message.success('更新成功');
    } else {
      await createDepartmentApi(values as CreateDepartmentParams);
      message.success('创建成功');
    }

    createModalVisible.value = false;
    fetchList();
  } catch (error: any) {
    if (error?.errorFields) {
      // 表单校验错误
      return;
    }
    const errMsg =
      error?.response?.data?.message ||
      error?.message ||
      (isEditMode.value ? '更新失败' : '创建失败');
    message.error(errMsg);
  } finally {
    submitting.value = false;
  }
}

async function handleDelete(record: DepartmentItem) {
  try {
    await deleteDepartmentApi(record.id);
    message.success('删除成功');
    fetchList();
  } catch (error: any) {
    const errMsg =
      error?.response?.data?.message || error?.message || '删除失败';
    message.error(errMsg);
  }
}

onMounted(fetchList);

const columns = [
  {
    title: '部门编码',
    dataIndex: 'deptCode',
    key: 'deptCode',
    width: 120,
  },
  {
    title: '部门名称',
    dataIndex: 'deptName',
    key: 'deptName',
    width: 160,
  },
  {
    title: '所属门店',
    dataIndex: 'branchName',
    key: 'branchName',
  },
  {
    title: '操作',
    key: 'action',
    width: 180,
  },
];
</script>

<template>
  <div class="p-4">
    <div class="mb-3 flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <h2 class="text-lg font-semibold">部门管理</h2>
        <Button
          type="primary"
          size="small"
          class="cursor-pointer"
          @click="openCreateModal"
        >
          创建部门
        </Button>
      </div>
      <Button class="cursor-pointer" ghost @click="fetchList">刷新</Button>
    </div>
    <Table
      :columns="columns"
      :data-source="dataSource"
      :loading="loading"
      :pagination="{ pageSize: 10 }"
      row-key="id"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'action'">
          <div class="space-x-2">
            <Button type="link" size="small" @click="openEditModal(record)">编辑</Button>
            <Popconfirm
              title="确定删除该部门吗？"
              ok-text="删除"
              cancel-text="取消"
              @confirm="handleDelete(record)"
            >
              <Button type="link" danger size="small">删除</Button>
            </Popconfirm>
          </div>
        </template>
      </template>
    </Table>

    <Modal
      v-model:open="createModalVisible"
      :title="isEditMode ? '编辑部门' : '创建部门'"
      :width="520"
      :confirm-loading="submitting"
      @ok="handleSubmit"
      @cancel="createModalVisible = false"
      destroy-on-close
    >
      <div class="rounded-md border border-gray-200 bg-gray-50 px-4 py-3">
        <Form
          ref="formRef"
          :model="formModel"
          :rules="formRules"
          layout="vertical"
        >
          <Form.Item label="部门编码" name="deptCode">
            <Input
              v-model:value="formModel.deptCode"
              allow-clear
              placeholder="请输入部门编码"
            />
          </Form.Item>
          <Form.Item label="部门名称" name="deptName">
            <Input
              v-model:value="formModel.deptName"
              allow-clear
              placeholder="请输入部门名称"
            />
          </Form.Item>
          <Form.Item label="上级部门ID" name="parentId">
            <Input
              v-model:value="formModel.parentId"
              allow-clear
              placeholder="请输入上级部门ID"
            />
          </Form.Item>
          <Form.Item label="负责人ID" name="leaderId">
            <Input
              v-model:value="formModel.leaderId"
              allow-clear
              placeholder="请输入负责人ID"
            />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  </div>
</template>


<script lang="ts" setup>
import { h, onMounted, ref } from 'vue';

import {
  getRoleListApi,
  createRoleApi,
  getRoleDetailApi,
  updateRoleApi,
  deleteRoleApi,
  type RoleItem,
  type RoleListParams,
  type CreateRoleParams,
  type UpdateRoleParams,
} from '#/api';

import {
  Button,
  Form,
  Input,
  message,
  Modal,
  Radio,
  Select,
  Space,
  Table,
} from 'ant-design-vue';
import type { FormInstance } from 'ant-design-vue';

const loading = ref(false);
const dataSource = ref<RoleItem[]>([]);
const total = ref(0);

const queryForm = ref<RoleListParams>({
  RoleName: undefined,
  Status: undefined,
  PageIndex: 1,
  PageSize: 10,
  OrderBy: undefined,
  IsAsc: true,
});

const columns = [
  {
    title: '角色名称',
    dataIndex: 'roleName',
    key: 'roleName',
    width: 150,
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
  },
  {
    title: '排序',
    dataIndex: 'sort',
    key: 'sort',
    width: 100,
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
    width: 180,
  },
  {
    title: '操作',
    key: 'actions',
    width: 140,
    fixed: 'right',
  },
];

async function fetchList() {
  loading.value = true;
  try {
    const { items, total: t } = await getRoleListApi(queryForm.value);
    dataSource.value = items;
    total.value = t;
  } catch (error: any) {
    const errMsg =
      error?.response?.data?.message || error?.message || '获取角色列表失败';
    message.error(errMsg);
  } finally {
    loading.value = false;
  }
}

function handleReset() {
  queryForm.value.RoleName = undefined;
  queryForm.value.Status = undefined;
  queryForm.value.PageIndex = 1;
  queryForm.value.PageSize = 10;
  queryForm.value.OrderBy = undefined;
  queryForm.value.IsAsc = true;
  fetchList();
}

function handleTableChange(pagination: any) {
  queryForm.value.PageIndex = pagination.current;
  queryForm.value.PageSize = pagination.pageSize;
  fetchList();
}

// 添加/编辑角色弹窗相关
const createModalVisible = ref(false);
const isEditMode = ref(false);
const editingRoleId = ref<string>('');
const submitting = ref(false);
const formRef = ref<FormInstance>();
const formModel = ref<CreateRoleParams>({
  roleName: '',
  status: 1,
  remark: '',
  sort: 0,
});

const formRules = {
  roleName: [{ required: true, message: '请输入角色名称' }],
  status: [{ required: true, message: '请选择状态' }],
};

function resetForm() {
  formModel.value = {
    roleName: '',
    status: 1,
    remark: '',
    sort: 0,
  };
  formRef.value?.resetFields();
}

function openCreateModal() {
  isEditMode.value = false;
  editingRoleId.value = '';
  createModalVisible.value = true;
  resetForm();
}

function closeCreateModal() {
  createModalVisible.value = false;
  resetForm();
}

async function openEditModal(record: RoleItem) {
  isEditMode.value = true;
  editingRoleId.value = record.id;
  createModalVisible.value = true;
  
  try {
    loading.value = true;
    const detail = await getRoleDetailApi(record.id);
    
    // 填充表单数据
    formModel.value = {
      roleName: detail.roleName || '',
      status: detail.status ?? 1,
      remark: detail.remark || '',
      sort: detail.sort ?? 0,
    };
  } catch (error: any) {
    const errMsg =
      error?.response?.data?.message || error?.message || '获取角色详情失败';
    message.error(errMsg);
    createModalVisible.value = false;
  } finally {
    loading.value = false;
  }
}

async function handleSubmit() {
  try {
    const values = await formRef.value?.validate();
    if (!values) return;
    submitting.value = true;

    if (isEditMode.value) {
      // 编辑模式：PUT 请求
      const updateData: UpdateRoleParams = {
        ...values,
        id: editingRoleId.value,
      };
      await updateRoleApi(updateData);
      message.success('更新角色成功');
    } else {
      // 新增模式：POST 请求
      await createRoleApi(values as CreateRoleParams);
      message.success('添加角色成功');
    }
    
    closeCreateModal();
    fetchList();
  } catch (error: any) {
    if (error?.errorFields) {
      return;
    }
    const errMsg =
      error?.response?.data?.message ||
      error?.message ||
      (isEditMode.value ? '更新角色失败' : '添加角色失败');
    message.error(errMsg);
  } finally {
    submitting.value = false;
  }
}

function handleDelete(record: RoleItem) {
  Modal.confirm({
    title: '确认删除',
    content: h('div', { style: { fontSize: '14px', lineHeight: '1.6' } }, [
      h('p', { style: { marginBottom: '8px', color: '#ff4d4f', fontWeight: 500 } }, '⚠️ 警告'),
      h('p', { style: { margin: 0 } }, `确定要删除角色"${record.roleName}"吗？`),
      h('p', { style: { margin: '4px 0 0', color: '#8c8c8c', fontSize: '12px' } }, '此操作不可恢复，请谨慎操作。'),
    ]),
    okText: '确定删除',
    cancelText: '取消',
    okType: 'danger',
    centered: true,
    width: 420,
    onOk: async () => {
      try {
        loading.value = true;
        await deleteRoleApi(record.id);
        message.success('删除成功');
        fetchList();
      } catch (error: any) {
        const errMsg =
          error?.response?.data?.message || error?.message || '删除失败';
        message.error(errMsg);
        throw error; // 阻止 Modal 自动关闭
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
          添加指定角色
        </Button>
      </div>
      <Space>
        <Input
          v-model:value="queryForm.RoleName"
          allow-clear
          placeholder="按角色名称搜索"
          style="width: 180px"
        />
        <Select
          v-model:value="queryForm.Status"
          placeholder="请选择状态"
          allow-clear
          style="width: 120px"
        >
          <Select.Option value="0">全部</Select.Option>
          <Select.Option value="1">正常</Select.Option>
          <Select.Option value="2">锁定</Select.Option>
        </Select>
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
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'status'">
          {{
            {
              1: '正常',
              2: '锁定',
            }[record.status ?? 1] ?? '未知'
          }}
        </template>
        <template v-else-if="column.key === 'createTime'">
          <span v-if="record.createTime">
            {{ new Date(record.createTime).toLocaleString('zh-CN') }}
          </span>
          <span v-else>—</span>
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
            <Button
              size="small"
              type="link"
              danger
              class="cursor-pointer"
              @click="handleDelete(record)"
            >
              删除
            </Button>
          </Space>
        </template>
      </template>
    </Table>

    <!-- 添加/编辑角色弹窗 -->
    <Modal
      v-model:open="createModalVisible"
      :title="isEditMode ? '更新角色' : '添加指定角色'"
      width="600px"
      :confirm-loading="submitting"
      @ok="handleSubmit"
      @cancel="closeCreateModal"
    >
      <Form
        ref="formRef"
        :model="formModel"
        :rules="formRules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 18 }"
      >
        <Form.Item label="角色名称" name="roleName">
          <Input
            v-model:value="formModel.roleName"
            placeholder="请输入角色名称"
            allow-clear
          />
        </Form.Item>

        <Form.Item label="状态" name="status">
          <Radio.Group v-model:value="formModel.status">
            <Radio :value="1">正常</Radio>
            <Radio :value="2">锁定</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item label="排序" name="sort">
          <Input
            v-model:value="formModel.sort"
            type="number"
            placeholder="请输入排序值"
            :min="0"
          />
        </Form.Item>

        <Form.Item label="备注" name="remark">
          <Input.TextArea
            v-model:value="formModel.remark"
            :rows="3"
            placeholder="请输入备注"
            allow-clear
          />
        </Form.Item>
      </Form>
    </Modal>
  </div>
</template>


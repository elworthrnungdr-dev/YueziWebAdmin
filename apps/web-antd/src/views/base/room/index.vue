<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import {
  getRoomListApi,
  createRoomApi,
  getRoomDetailApi,
  updateRoomApi,
  deleteRoomApi,
  type RoomItem,
  type RoomListParams,
  type CreateRoomParams,
  type UpdateRoomParams,
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
  message,
} from 'ant-design-vue';
import type { FormInstance } from 'ant-design-vue';
import dayjs from 'dayjs';
import { h } from 'vue';

const loading = ref(false);
const dataSource = ref<RoomItem[]>([]);
const total = ref(0);

const queryForm = ref<RoomListParams>({
  RoomNo: undefined,
  PageIndex: 1,
  PageSize: 10,
  OrderBy: undefined,
  IsAsc: true,
});

const statusOptions = [
  { label: '正常', value: 1 },
  { label: '锁定', value: 2 },
];

const columns = [
  {
    title: '房号',
    dataIndex: 'roomNo',
    key: 'roomNo',
    width: 140,
  },
  {
    title: '面积(㎡)',
    dataIndex: 'area',
    key: 'area',
    width: 120,
  },
  {
    title: '朝向',
    dataIndex: 'orientation',
    key: 'orientation',
    width: 140,
  },
  {
    title: '风格',
    dataIndex: 'style',
    key: 'style',
    width: 140,
  },
  {
    title: '房型ID',
    dataIndex: 'roomTypeId',
    key: 'roomTypeId',
    width: 160,
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 120,
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
    title: '操作',
    key: 'actions',
    width: 200,
    fixed: 'right',
    align: 'center',
  },
];

async function fetchList() {
  try {
    loading.value = true;
    const params: RoomListParams = {
      ...queryForm.value,
    };
    const res = await getRoomListApi(params);
    dataSource.value = res.items;
    total.value = res.total;
  } finally {
    loading.value = false;
  }
}

function handleReset() {
  queryForm.value = {
    RoomNo: undefined,
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

const formModel = ref<CreateRoomParams>({
  roomNo: '',
  area: undefined,
  orientation: '',
  style: '',
  roomTypeId: '',
  status: 1,
  remark: '',
});

const formRules = {
  roomNo: [{ required: true, message: '请输入房号' }],
  roomTypeId: [{ required: true, message: '请输入房型ID' }],
  status: [{ required: true, message: '请选择状态' }],
};

function openCreateModal() {
  isEditMode.value = false;
  editingId.value = '';
  formModel.value = {
    roomNo: '',
    area: undefined,
    orientation: '',
    style: '',
    roomTypeId: '',
    status: 1,
    remark: '',
  };
  createModalVisible.value = true;
}

async function openEditModal(record: RoomItem) {
  isEditMode.value = true;
  editingId.value = record.id;
  try {
    const detail = await getRoomDetailApi(record.id);
    formModel.value = {
      roomNo: detail.roomNo || '',
      area: detail.area,
      orientation: detail.orientation || '',
      style: detail.style || '',
      roomTypeId: detail.roomTypeId || '',
      status: detail.status ?? 1,
      remark: detail.remark || '',
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
    const params: CreateRoomParams = {
      ...formModel.value,
    };

    if (isEditMode.value) {
      await updateRoomApi({
        ...(params as CreateRoomParams),
        id: editingId.value,
      } as UpdateRoomParams);
      message.success('更新房间成功');
    } else {
      await createRoomApi(params);
      message.success('创建房间成功');
    }
    closeCreateModal();
    fetchList();
  } finally {
    submitting.value = false;
  }
}

function formatStatus(status: number) {
  if (status === 1) return '正常';
  if (status === 2) return '锁定';
  return '未知';
}

function handleDelete(record: RoomItem) {
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
      h('p', { style: { margin: 0 } }, '确定要删除该房间吗？'),
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
        await deleteRoomApi(record.id);
        message.success('删除房间成功');
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
        创建房间管理
      </Button>
      <Space wrap>
        <Input
          v-model:value="queryForm.RoomNo"
          placeholder="房号"
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
        <template v-if="column.key === 'area'">
          <span v-if="record.area !== null && record.area !== undefined">
            {{ record.area }}
          </span>
          <span v-else>—</span>
        </template>
        <template v-else-if="column.key === 'remark'">
          <span>{{ record.remark || '—' }}</span>
        </template>
        <template v-else-if="column.key === 'status'">
          <span>{{ formatStatus(record.status) }}</span>
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

    <!-- 创建 / 编辑房间弹窗 -->
    <Modal
      v-model:open="createModalVisible"
      :title="isEditMode ? '更新房间管理' : '创建房间管理'"
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
        layout="vertical"
      >
        <div class="grid grid-cols-2 gap-4">
          <Form.Item label="房号" name="roomNo">
            <Input
              v-model:value="formModel.roomNo"
              placeholder="请输入房号"
            />
          </Form.Item>
          <Form.Item label="面积(㎡)" name="area">
            <InputNumber
              v-model:value="formModel.area"
              :min="0"
              style="width: 100%"
              placeholder="请输入面积"
            />
          </Form.Item>
          <Form.Item label="朝向" name="orientation">
            <Input
              v-model:value="formModel.orientation"
              placeholder="请输入朝向"
            />
          </Form.Item>
          <Form.Item label="风格" name="style">
            <Input
              v-model:value="formModel.style"
              placeholder="请输入风格"
            />
          </Form.Item>
          <Form.Item label="房型ID" name="roomTypeId">
            <Input
              v-model:value="formModel.roomTypeId"
              placeholder="请输入房型ID"
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



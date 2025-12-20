<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import {
  getSecurityRouteListApi,
  createSecurityRouteApi,
  getSecurityRouteDetailApi,
  updateSecurityRouteApi,
  deleteSecurityRouteApi,
  type SecurityRouteItem,
  type SecurityRouteListParams,
  type CreateSecurityRouteParams,
  type UpdateSecurityRouteParams,
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
const dataSource = ref<SecurityRouteItem[]>([]);
const total = ref(0);

const queryForm = ref<SecurityRouteListParams>({
  RouteCode: undefined,
  RouteName: undefined,
  EndPoint: undefined,
  CreatedAtStart: undefined,
  CreatedAtEnd: undefined,
  UpdatedAtStart: undefined,
  UpdatedAtEnd: undefined,
  PageIndex: 1,
  PageSize: 10,
  OrderBy: undefined,
  IsAsc: true,
});

const routeTypeOptions = [
  { label: '常规', value: 1 },
  { label: '重点', value: 2 },
  { label: '外围', value: 3 },
  { label: '楼层', value: 4 },
];

const columns = [
  {
    title: '线路编码',
    dataIndex: 'routeCode',
    key: 'routeCode',
    width: 140,
  },
  {
    title: '线路名称',
    dataIndex: 'routeName',
    key: 'routeName',
    width: 150,
  },
  {
    title: '线路类型',
    dataIndex: 'routeTypeText',
    key: 'routeTypeText',
    width: 100,
  },
  {
    title: '起点',
    dataIndex: 'startPoint',
    key: 'startPoint',
    width: 150,
  },
  {
    title: '终点',
    dataIndex: 'endPoint',
    key: 'endPoint',
    width: 150,
  },
  {
    title: '线路距离',
    dataIndex: 'routeDistance',
    key: 'routeDistance',
    width: 120,
  },
  {
    title: '预计耗时（分钟）',
    dataIndex: 'estimatedDuration',
    key: 'estimatedDuration',
    width: 140,
  },
  {
    title: '备注',
    dataIndex: 'remark',
    key: 'remark',
    width: 200,
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
    width: 150,
    fixed: 'right',
    align: 'center',
  },
];

async function fetchList() {
  try {
    loading.value = true;
    const params: SecurityRouteListParams = {
      ...queryForm.value,
      CreatedAtStart: queryForm.value.CreatedAtStart
        ? dayjs(queryForm.value.CreatedAtStart).toISOString()
        : undefined,
      CreatedAtEnd: queryForm.value.CreatedAtEnd
        ? dayjs(queryForm.value.CreatedAtEnd).toISOString()
        : undefined,
      UpdatedAtStart: queryForm.value.UpdatedAtStart
        ? dayjs(queryForm.value.UpdatedAtStart).toISOString()
        : undefined,
      UpdatedAtEnd: queryForm.value.UpdatedAtEnd
        ? dayjs(queryForm.value.UpdatedAtEnd).toISOString()
        : undefined,
    };
    const res = await getSecurityRouteListApi(params);
    dataSource.value = res.items;
    total.value = res.total;
  } finally {
    loading.value = false;
  }
}

function handleReset() {
  queryForm.value = {
    RouteCode: undefined,
    RouteName: undefined,
    EndPoint: undefined,
    CreatedAtStart: undefined,
    CreatedAtEnd: undefined,
    UpdatedAtStart: undefined,
    UpdatedAtEnd: undefined,
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

const formModel = ref<CreateSecurityRouteParams>({
  routeCode: '',
  routeName: '',
  routeType: 1,
  startPoint: '',
  endPoint: '',
  routeDistance: undefined,
  estimatedDuration: 0,
  remark: '',
});

const formRules = {
  routeCode: [{ required: true, message: '请输入线路编码' }],
  routeName: [{ required: true, message: '请输入线路名称' }],
  routeType: [{ required: true, message: '请选择线路类型' }],
  startPoint: [{ required: true, message: '请输入起点' }],
  endPoint: [{ required: true, message: '请输入终点' }],
  estimatedDuration: [{ required: true, message: '请输入预计耗时' }],
};

function openCreateModal() {
  isEditMode.value = false;
  editingId.value = '';
  formModel.value = {
    routeCode: '',
    routeName: '',
    routeType: 1,
    startPoint: '',
    endPoint: '',
    routeDistance: undefined,
    estimatedDuration: 0,
    remark: '',
  };
  createModalVisible.value = true;
}

async function openEditModal(record: SecurityRouteItem) {
  isEditMode.value = true;
  editingId.value = record.id;
  try {
    const detail = await getSecurityRouteDetailApi(record.id);
    formModel.value = {
      routeCode: detail.routeCode || '',
      routeName: detail.routeName || '',
      routeType: detail.routeType,
      startPoint: detail.startPoint || '',
      endPoint: detail.endPoint || '',
      routeDistance: detail.routeDistance,
      estimatedDuration: detail.estimatedDuration || 0,
      remark: detail.remark || '',
    };
    createModalVisible.value = true;
  } catch {
    // 由全局拦截器处理错误
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
    const params: CreateSecurityRouteParams = {
      ...formModel.value,
    };

    if (isEditMode.value) {
      await updateSecurityRouteApi({
        ...params,
        id: editingId.value,
      } as UpdateSecurityRouteParams);
      message.success('更新巡逻线路成功');
    } else {
      await createSecurityRouteApi(params);
      message.success('创建巡逻线路成功');
    }
    closeCreateModal();
    fetchList();
  } catch {
    // 由全局拦截器处理错误
  } finally {
    submitting.value = false;
  }
}

function handleDelete(record: SecurityRouteItem) {
  Modal.confirm({
    title: '确认删除',
    content: h('div', { style: { fontSize: '14px', lineHeight: '1.6' } }, [
      h('p', {
        style: { marginBottom: '8px', color: '#ff4d4f', fontWeight: 500 },
      }, '⚠️ 警告'),
      h('p', { style: { margin: 0 } }, '确定要删除该巡逻线路吗？'),
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
        await deleteSecurityRouteApi(record.id);
        message.success('删除巡逻线路成功');
        fetchList();
      } catch {
        throw new Error();
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
        创建巡逻线路
      </Button>
      <Space wrap>
        <Input
          v-model:value="queryForm.RouteCode"
          placeholder="线路编码"
          style="width: 150px"
          allow-clear
        />
        <Input
          v-model:value="queryForm.RouteName"
          placeholder="线路名称"
          style="width: 150px"
          allow-clear
        />
        <Input
          v-model:value="queryForm.EndPoint"
          placeholder="终点"
          style="width: 150px"
          allow-clear
        />
        <DatePicker
          v-model:value="queryForm.CreatedAtStart"
          placeholder="创建时间开始"
          style="width: 150px"
        />
        <DatePicker
          v-model:value="queryForm.CreatedAtEnd"
          placeholder="创建时间结束"
          style="width: 150px"
        />
        <DatePicker
          v-model:value="queryForm.UpdatedAtStart"
          placeholder="更新时间开始"
          style="width: 150px"
        />
        <DatePicker
          v-model:value="queryForm.UpdatedAtEnd"
          placeholder="更新时间结束"
          style="width: 150px"
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
      :scroll="{ x: 1500 }"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'routeDistance'">
          <span
            v-if="record.routeDistance !== null && record.routeDistance !== undefined"
          >
            {{ record.routeDistance }}
          </span>
          <span v-else>—</span>
        </template>
        <template v-else-if="column.key === 'routeTypeText'">
          <span>
            {{
              record.routeTypeText ||
              (record.routeType === 1
                ? '常规'
                : record.routeType === 2
                ? '重点'
                : record.routeType === 3
                ? '外围'
                : record.routeType === 4
                ? '楼层'
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

    <!-- 创建 / 编辑巡逻线路弹窗 -->
    <Modal
      v-model:open="createModalVisible"
      :title="isEditMode ? '更新巡逻线路' : '创建巡逻线路'"
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
        <div class="grid grid-cols-3 gap-4">
          <Form.Item label="线路编码" name="routeCode">
            <Input
              v-model:value="formModel.routeCode"
              placeholder="请输入线路编码"
            />
          </Form.Item>
          <Form.Item label="线路名称" name="routeName">
            <Input
              v-model:value="formModel.routeName"
              placeholder="请输入线路名称"
            />
          </Form.Item>
          <Form.Item label="线路类型" name="routeType">
            <Select
              v-model:value="formModel.routeType"
              :options="routeTypeOptions"
              placeholder="请选择线路类型"
            />
          </Form.Item>
          <Form.Item label="起点" name="startPoint">
            <Input
              v-model:value="formModel.startPoint"
              placeholder="请输入起点"
            />
          </Form.Item>
          <Form.Item label="终点" name="endPoint">
            <Input
              v-model:value="formModel.endPoint"
              placeholder="请输入终点"
            />
          </Form.Item>
          <Form.Item label="线路距离" name="routeDistance">
            <InputNumber
              v-model:value="formModel.routeDistance"
              :min="0"
              style="width: 100%"
              placeholder="请输入线路距离"
            />
          </Form.Item>
          <Form.Item label="预计耗时（分钟）" name="estimatedDuration">
            <InputNumber
              v-model:value="formModel.estimatedDuration"
              :min="0"
              style="width: 100%"
              placeholder="请输入预计耗时"
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


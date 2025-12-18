<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import {
  getDietListApi,
  createDietApi,
  getDietDetailApi,
  updateDietApi,
  deleteDietApi,
  type DietItem,
  type DietListParams,
  type CreateDietParams,
  type UpdateDietParams,
} from '#/api';

import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Space,
  Table,
} from 'ant-design-vue';
import type { FormInstance } from 'ant-design-vue';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { h } from 'vue';

const loading = ref(false);
const dataSource = ref<DietItem[]>([]);
const total = ref(0);

const queryForm = ref<DietListParams>({
  ContractNo: undefined,
  CustomerId: undefined,
  CreateTimeStart: undefined,
  CreateTimeEnd: undefined,
  PageIndex: 1,
  PageSize: 10,
  OrderBy: undefined,
  IsAsc: true,
});

const createDateRange = ref<[Dayjs | null, Dayjs | null]>([null, null]);

const columns = [
  {
    title: '禁忌项目',
    dataIndex: 'tabooItem',
    key: 'tabooItem',
    width: 200,
  },
  {
    title: '入住次数',
    dataIndex: 'stayTimes',
    key: 'stayTimes',
    width: 100,
  },
  {
    title: '描述',
    dataIndex: 'description',
    key: 'description',
    width: 300,
    ellipsis: true,
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
    align: 'center',
  },
];

async function fetchList() {
  try {
    loading.value = true;
    // 处理日期范围
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

    const result = await getDietListApi(queryForm.value);
    dataSource.value = result.items || [];
    total.value = result.total || 0;
  } catch (error: any) {
    const errMsg =
      error?.response?.data?.message ||
      error?.data?.message ||
      error?.message ||
      '获取饮食禁忌列表失败';
    message.error(errMsg);
  } finally {
    loading.value = false;
  }
}

function handleReset() {
  queryForm.value = {
    ContractNo: undefined,
    CustomerId: undefined,
    CreateTimeStart: undefined,
    CreateTimeEnd: undefined,
    PageIndex: 1,
    PageSize: 10,
    OrderBy: undefined,
    IsAsc: true,
  };
  createDateRange.value = [null, null];
  fetchList();
}

function handleTableChange(pagination: any) {
  queryForm.value.PageIndex = pagination.current;
  queryForm.value.PageSize = pagination.pageSize;
  fetchList();
}

// 创建/编辑饮食禁忌弹窗相关
const createModalVisible = ref(false);
const submitting = ref(false);
const isEditMode = ref(false);
const editingDietId = ref<string>('');
const formRef = ref<FormInstance>();
const formModel = ref<CreateDietParams>({
  customerId: '',
  tabooItem: '',
  stayTimes: 0,
  description: '',
});

const formRules = {
  customerId: [{ required: true, message: '请输入客户ID' }],
  tabooItem: [{ required: true, message: '请输入禁忌项目' }],
  stayTimes: [{ required: true, message: '请输入入住次数' }],
  description: [{ required: true, message: '请输入描述' }],
};

function resetForm() {
  formModel.value = {
    customerId: '',
    tabooItem: '',
    stayTimes: 0,
    description: '',
  };
  formRef.value?.resetFields();
}

function openCreateModal() {
  isEditMode.value = false;
  editingDietId.value = '';
  createModalVisible.value = true;
  resetForm();
}

async function openEditModal(record: DietItem) {
  isEditMode.value = true;
  editingDietId.value = record.id;
  createModalVisible.value = true;
  resetForm();

  try {
    const detail = await getDietDetailApi(record.id);
    // 填充表单数据
    formModel.value = {
      customerId: detail.customerId || '',
      tabooItem: detail.tabooItem || '',
      stayTimes: detail.stayTimes || 0,
      description: detail.description || '',
    };
  } catch (error: any) {
    const errMsg =
      error?.response?.data?.message ||
      error?.data?.message ||
      error?.message ||
      '获取饮食禁忌详情失败';
    message.error(errMsg);
    createModalVisible.value = false;
  }
}

function closeCreateModal() {
  createModalVisible.value = false;
  isEditMode.value = false;
  editingDietId.value = '';
  resetForm();
}

async function handleSubmit() {
  try {
    const values = await formRef.value?.validate();
    if (!values) return;
    submitting.value = true;

    if (isEditMode.value) {
      // 更新饮食禁忌
      const updateData: UpdateDietParams = {
        ...values,
        id: editingDietId.value,
      };
      await updateDietApi(updateData);
      message.success('更新饮食禁忌成功');
    } else {
      // 创建饮食禁忌
      await createDietApi(values);
      message.success('创建饮食禁忌成功');
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
      (isEditMode.value ? '更新饮食禁忌失败' : '创建饮食禁忌失败');
    message.error(errMsg);
    // 阻止错误继续传播到控制台
    return;
  } finally {
    submitting.value = false;
  }
}

function handleDelete(record: DietItem) {
  Modal.confirm({
    title: '确认删除',
    content: h('div', { style: { fontSize: '14px', lineHeight: '1.6' } }, [
      h('p', {
        style: { marginBottom: '8px', color: '#ff4d4f', fontWeight: 500 },
      }, '⚠️ 警告'),
      h('p', { style: { margin: 0 } }, '确定要删除该饮食禁忌吗？'),
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
        await deleteDietApi(record.id);
        message.success('删除饮食禁忌成功');
        fetchList();
      } catch (error: any) {
        const errMsg =
          error?.response?.data?.message ||
          error?.data?.message ||
          error?.message ||
          '删除饮食禁忌失败';
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
    <!-- 创建按钮和查询条件 -->
    <div class="mb-4" style="display: flex; justify-content: space-between; align-items: center">
      <Button type="primary" class="cursor-pointer" @click="openCreateModal">
        创建饮食禁忌
      </Button>
      <Space wrap>
        <Input
          v-model:value="queryForm.CustomerId"
          placeholder="客户ID"
          style="width: 200px"
          allow-clear
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
        <template v-if="column.key === 'createTime'">
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
          <span
            v-if="record.stayTimes !== null && record.stayTimes !== undefined"
          >
            {{ record.stayTimes }}
          </span>
          <span v-else>—</span>
        </template>
        <template v-else-if="column.key === 'description'">
          <span :title="record.description">{{ record.description || '—' }}</span>
        </template>
        <template v-else-if="column.key === 'actions'">
          <div style="text-align: center">
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

    <!-- 创建/编辑饮食禁忌弹窗 -->
    <Modal
      v-model:open="createModalVisible"
      :title="isEditMode ? '更新饮食禁忌' : '创建饮食禁忌'"
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
          <Input v-model:value="formModel.customerId" placeholder="请输入客户ID" />
        </Form.Item>
        <Form.Item label="禁忌项目" name="tabooItem">
          <Input
            v-model:value="formModel.tabooItem"
            placeholder="请输入禁忌项目"
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
        <Form.Item label="描述" name="description">
          <Input.TextArea
            v-model:value="formModel.description"
            placeholder="请输入描述"
            :rows="6"
          />
        </Form.Item>
      </Form>
    </Modal>
  </div>
</template>


<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import dayjs from 'dayjs';
import {
  Button,
  DatePicker,
  Form,
  Input,
  Select,
  Space,
  Table,
  Modal,
  message,
} from 'ant-design-vue';
import type { FormInstance } from 'ant-design-vue';
import {
  getCustomerListApi,
  createCustomerApi,
  updateCustomerApi,
  deleteCustomerApi,
  type CustomerListParams,
  type CustomerItem,
  type CreateCustomerParams,
  type UpdateCustomerParams,
} from '#/api';

const hideContent = true; // 暂时隐藏接口数据和功能

const loading = ref(false);
const dataSource = ref<CustomerItem[]>([]);
const total = ref(0);

const queryForm = ref<CustomerListParams>({
  CustomerName: undefined,
  Gender: undefined,
  CustomerStatus: undefined,
  CreatedAtStart: undefined,
  CreatedAtEnd: undefined,
  PageIndex: 1,
  PageSize: 10,
  OrderBy: undefined,
  IsAsc: true,
});

const genderOptions = [
  { label: '男', value: 1 },
  { label: '女', value: 2 },
  { label: '未知', value: 3 },
];

const statusOptions = [
  { label: '意向', value: 1 },
  { label: '已入住', value: 2 },
  { label: '已出所', value: 3 },
];

const columns = [
  { title: '客户姓名', dataIndex: 'customerName', key: 'customerName', width: 140 },
  { title: '性别', dataIndex: 'genderText', key: 'genderText', width: 80 },
  { title: '手机号', dataIndex: 'phoneNumber', key: 'phoneNumber', width: 140 },
  { title: '客户状态', dataIndex: 'customerStatusText', key: 'customerStatusText', width: 120 },
  { title: '预计生产日期', dataIndex: 'expectedDeliveryDateText', key: 'expectedDeliveryDateText', width: 150 },
  { title: '创建时间', dataIndex: 'createdAtText', key: 'createdAtText', width: 170 },
  { title: '操作', dataIndex: 'actions', key: 'actions', width: 180, fixed: 'right', align: 'center' },
];

async function fetchList() {
  try {
    loading.value = true;
    const params: CustomerListParams = {
      ...queryForm.value,
      CreatedAtStart: queryForm.value.CreatedAtStart
        ? dayjs(queryForm.value.CreatedAtStart).toISOString()
        : undefined,
      CreatedAtEnd: queryForm.value.CreatedAtEnd
        ? dayjs(queryForm.value.CreatedAtEnd).toISOString()
        : undefined,
    };
    const res = await getCustomerListApi(params);
    dataSource.value = res.items.map((item) => ({
      ...item,
      genderText: formatGender(item.gender),
      customerStatusText: formatStatus(item.customerStatus),
      expectedDeliveryDateText: item.expectedDeliveryDate
        ? dayjs(item.expectedDeliveryDate).format('YYYY-MM-DD')
        : '',
      createdAtText: item.createdAt ? dayjs(item.createdAt).format('YYYY-MM-DD HH:mm:ss') : '',
    })) as any;
    total.value = res.total;
  } finally {
    loading.value = false;
  }
}

function handleReset() {
  queryForm.value = {
    CustomerName: undefined,
    Gender: undefined,
    CustomerStatus: undefined,
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

function formatGender(gender: any) {
  if (gender === 1 || gender === '1') return '男';
  if (gender === 2 || gender === '2') return '女';
  return '未知';
}

function formatStatus(status: any) {
  if (status === 1 || status === '1') return '意向';
  if (status === 2 || status === '2') return '已入住';
  if (status === 3 || status === '3') return '已出所';
  return '—';
}

onMounted(() => {
  if (!hideContent) {
    fetchList();
  }
});

// 创建/编辑弹窗
const createModalVisible = ref(false);
const isEditMode = ref(false);
const submitting = ref(false);
const formRef = ref<FormInstance | null>(null);
const editingId = ref('');

const formModel = ref<CreateCustomerParams>({
  customerName: '',
  gender: 1,
  phoneNumber: '',
  wechat: '',
  customerStatus: 1,
  expectedDeliveryDate: '',
  remark: '',
});

const formRules = {
  customerName: [{ required: true, message: '请输入客户姓名' }],
  gender: [{ required: true, message: '请选择性别' }],
  customerStatus: [{ required: true, message: '请选择客户状态' }],
  phoneNumber: [{ required: true, message: '请输入手机号' }],
};

function openCreateModal() {
  isEditMode.value = false;
  editingId.value = '';
  formModel.value = {
    customerName: '',
    gender: 1,
    phoneNumber: '',
    wechat: '',
    customerStatus: 1,
    expectedDeliveryDate: '',
    remark: '',
  };
  createModalVisible.value = true;
}

function openEditModal(record: CustomerItem) {
  isEditMode.value = true;
  editingId.value = record.id;
  formModel.value = {
    customerName: record.customerName || '',
    gender: Number(record.gender) || 1,
    phoneNumber: record.phoneNumber || '',
    wechat: (record as any).wechat || '',
    customerStatus: Number(record.customerStatus) || 1,
    expectedDeliveryDate: record.expectedDeliveryDate
      ? (dayjs(record.expectedDeliveryDate) as any)
      : '',
    remark: (record as any).remark || '',
  };
  createModalVisible.value = true;
}

function closeCreateModal() {
  createModalVisible.value = false;
  formRef.value?.resetFields();
}

async function handleSubmit() {
  try {
    await formRef.value?.validate();
    submitting.value = true;

    const params: CreateCustomerParams = {
      ...formModel.value,
      expectedDeliveryDate: formModel.value.expectedDeliveryDate
        ? dayjs(formModel.value.expectedDeliveryDate as any).toISOString()
        : undefined,
    };

    if (isEditMode.value) {
      await updateCustomerApi({
        ...(params as any),
        id: editingId.value,
      } as UpdateCustomerParams);
      message.success('更新客户信息成功');
    } else {
      await createCustomerApi(params);
      message.success('创建客户信息成功');
    }
    closeCreateModal();
    fetchList();
  } catch {
    // 表单或请求错误交由全局处理
  } finally {
    submitting.value = false;
  }
}

function handleDelete(record: CustomerItem) {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除客户【${record.customerName || ''}】吗？`,
    okText: '删除',
    cancelText: '取消',
    okType: 'danger',
    centered: true,
    onOk: async () => {
      try {
        loading.value = true;
        await deleteCustomerApi(record.id);
        message.success('删除成功');
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
    <div
      style="
        background: #f5f5f5;
        border: 1px dashed #d9d9d9;
        border-radius: 6px;
        padding: 24px;
        text-align: center;
        color: #8c8c8c;
      "
    >
      客户信息功能暂未启用，接口数据已临时隐藏。
    </div>
  </div>
</template>


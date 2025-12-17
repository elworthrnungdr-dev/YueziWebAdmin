<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import {
  getFrontdeskAppointmentListApi,
  createFrontdeskAppointmentApi,
  getFrontdeskAppointmentDetailApi,
  updateFrontdeskAppointmentApi,
  deleteFrontdeskAppointmentApi,
  updateAppointmentStatusApi,
  type FrontdeskAppointmentItem,
  type FrontdeskAppointmentListParams,
  type CreateFrontdeskAppointmentParams,
  type UpdateFrontdeskAppointmentParams,
  type UpdateAppointmentStatusParams,
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
  Popconfirm,
  TimePicker,
  message,
} from 'ant-design-vue';
import type { FormInstance } from 'ant-design-vue';
import dayjs from 'dayjs';

const loading = ref(false);
const dataSource = ref<FrontdeskAppointmentItem[]>([]);
const total = ref(0);

const queryForm = ref<FrontdeskAppointmentListParams>({
  ReferrerName: undefined,
  VisitorName: undefined,
  AppointmentNo: undefined,
  ExpectedDeliveryDateStart: undefined,
  ExpectedDeliveryDateEnd: undefined,
  AppointmentDateStart: undefined,
  AppointmentDateEnd: undefined,
  ConvertTimeStart: undefined,
  ConvertTimeEnd: undefined,
  ArrivalTimeStart: undefined,
  ArrivalTimeEnd: undefined,
  DepartureTimeStart: undefined,
  DepartureTimeEnd: undefined,
  RemindTimeStart: undefined,
  RemindTimeEnd: undefined,
  CreatedAtStart: undefined,
  CreatedAtEnd: undefined,
  UpdatedAtStart: undefined,
  UpdatedAtEnd: undefined,
  AppointmentType: undefined,
  AppointmentSource: undefined,
  IsExistingCustomer: undefined,
  ReferrerType: undefined,
  AppointmentStatus: undefined,
  IsConverted: undefined,
  PageIndex: 1,
  PageSize: 10,
  OrderBy: undefined,
  IsAsc: true,
});

const appointmentTypeOptions = [
  { label: '参观预约', value: 1 },
  { label: '产康体验', value: 2 },
  { label: '医生咨询', value: 3 },
  { label: '护理服务', value: 4 },
  { label: '其他', value: 99 },
];

const appointmentSourceOptions = [
  { label: '电话预约', value: 1 },
  { label: '销售推荐', value: 2 },
  { label: '微信预约', value: 3 },
  { label: '官网预约', value: 4 },
  { label: 'APP预约', value: 5 },
  { label: '到店预约', value: 6 },
  { label: '其他', value: 99 },
];

const isExistingCustomerOptions = [
  { label: '新客户', value: 1 },
  { label: '老客户', value: 2 },
  { label: '线索', value: 3 },
];

const referrerTypeOptions = [
  { label: '销售', value: 1 },
  { label: '老客户', value: 2 },
  { label: '合作伙伴', value: 3 },
  { label: '其他', value: 99 },
];

const appointmentStatusOptions = [
  { label: '待确认', value: 1 },
  { label: '已确认', value: 2 },
  { label: '已到访', value: 3 },
  { label: '已取消', value: 4 },
  { label: '已过期', value: 5 },
  { label: '已完成', value: 6 },
];

const isConvertedOptions = [
  { label: '是', value: 1 },
  { label: '否', value: 2 },
];

const columns = [
  {
    title: '预约编号',
    dataIndex: 'appointmentNo',
    key: 'appointmentNo',
    width: 150,
  },
  {
    title: '预约类型',
    dataIndex: 'appointmentTypeText',
    key: 'appointmentTypeText',
    width: 120,
  },
  {
    title: '预约来源',
    dataIndex: 'appointmentSourceText',
    key: 'appointmentSourceText',
    width: 120,
  },
  {
    title: '是否已有客户',
    dataIndex: 'isExistingCustomerText',
    key: 'isExistingCustomerText',
    width: 130,
  },
  {
    title: '推荐人类型',
    dataIndex: 'referrerTypeText',
    key: 'referrerTypeText',
    width: 120,
  },
  {
    title: '推荐人姓名',
    dataIndex: 'referrerName',
    key: 'referrerName',
    width: 120,
  },
  {
    title: '访客姓名',
    dataIndex: 'visitorName',
    key: 'visitorName',
    width: 120,
  },
  {
    title: '访客电话',
    dataIndex: 'visitorPhone',
    key: 'visitorPhone',
    width: 140,
  },
  {
    title: '预产期',
    dataIndex: 'expectedDeliveryDate',
    key: 'expectedDeliveryDate',
    width: 150,
  },
  {
    title: '预约日期',
    dataIndex: 'appointmentDate',
    key: 'appointmentDate',
    width: 150,
  },
  {
    title: '预约时间',
    dataIndex: 'appointmentTime',
    key: 'appointmentTime',
    width: 120,
  },
  {
    title: '预约事由',
    dataIndex: 'appointmentPurpose',
    key: 'appointmentPurpose',
    width: 160,
    ellipsis: true,
  },
  {
    title: '预约状态',
    dataIndex: 'appointmentStatusText',
    key: 'appointmentStatusText',
    width: 120,
  },
  {
    title: '是否已转化',
    dataIndex: 'isConvertedText',
    key: 'isConvertedText',
    width: 110,
  },
  {
    title: '实际到访时间',
    dataIndex: 'arrivalTime',
    key: 'arrivalTime',
    width: 170,
  },
  {
    title: '实际离开时间',
    dataIndex: 'departureTime',
    key: 'departureTime',
    width: 170,
  },
  {
    title: '陪同人数',
    dataIndex: 'companionCount',
    key: 'companionCount',
    width: 100,
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
    width: 180,
    fixed: 'right',
    align: 'center',
  },
];

async function fetchList() {
  try {
    loading.value = true;
    const params: FrontdeskAppointmentListParams = {
      ...queryForm.value,
      ExpectedDeliveryDateStart: queryForm.value.ExpectedDeliveryDateStart
        ? dayjs(queryForm.value.ExpectedDeliveryDateStart).toISOString()
        : undefined,
      ExpectedDeliveryDateEnd: queryForm.value.ExpectedDeliveryDateEnd
        ? dayjs(queryForm.value.ExpectedDeliveryDateEnd).toISOString()
        : undefined,
      AppointmentDateStart: queryForm.value.AppointmentDateStart
        ? dayjs(queryForm.value.AppointmentDateStart).toISOString()
        : undefined,
      AppointmentDateEnd: queryForm.value.AppointmentDateEnd
        ? dayjs(queryForm.value.AppointmentDateEnd).toISOString()
        : undefined,
      ConvertTimeStart: queryForm.value.ConvertTimeStart
        ? dayjs(queryForm.value.ConvertTimeStart).toISOString()
        : undefined,
      ConvertTimeEnd: queryForm.value.ConvertTimeEnd
        ? dayjs(queryForm.value.ConvertTimeEnd).toISOString()
        : undefined,
      ArrivalTimeStart: queryForm.value.ArrivalTimeStart
        ? dayjs(queryForm.value.ArrivalTimeStart).toISOString()
        : undefined,
      ArrivalTimeEnd: queryForm.value.ArrivalTimeEnd
        ? dayjs(queryForm.value.ArrivalTimeEnd).toISOString()
        : undefined,
      DepartureTimeStart: queryForm.value.DepartureTimeStart
        ? dayjs(queryForm.value.DepartureTimeStart).toISOString()
        : undefined,
      DepartureTimeEnd: queryForm.value.DepartureTimeEnd
        ? dayjs(queryForm.value.DepartureTimeEnd).toISOString()
        : undefined,
      RemindTimeStart: queryForm.value.RemindTimeStart
        ? dayjs(queryForm.value.RemindTimeStart).toISOString()
        : undefined,
      RemindTimeEnd: queryForm.value.RemindTimeEnd
        ? dayjs(queryForm.value.RemindTimeEnd).toISOString()
        : undefined,
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
    const res = await getFrontdeskAppointmentListApi(params);
    dataSource.value = res.items;
    total.value = res.total;
  } finally {
    loading.value = false;
  }
}

function handleReset() {
  queryForm.value = {
    ReferrerName: undefined,
    VisitorName: undefined,
    AppointmentNo: undefined,
    ExpectedDeliveryDateStart: undefined,
    ExpectedDeliveryDateEnd: undefined,
    AppointmentDateStart: undefined,
    AppointmentDateEnd: undefined,
    ConvertTimeStart: undefined,
    ConvertTimeEnd: undefined,
    ArrivalTimeStart: undefined,
    ArrivalTimeEnd: undefined,
    DepartureTimeStart: undefined,
    DepartureTimeEnd: undefined,
    RemindTimeStart: undefined,
    RemindTimeEnd: undefined,
    CreatedAtStart: undefined,
    CreatedAtEnd: undefined,
    UpdatedAtStart: undefined,
    UpdatedAtEnd: undefined,
    AppointmentType: undefined,
    AppointmentSource: undefined,
    IsExistingCustomer: undefined,
    ReferrerType: undefined,
    AppointmentStatus: undefined,
    IsConverted: undefined,
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

const formModel = ref<CreateFrontdeskAppointmentParams>({
  appointmentType: 1,
  appointmentSource: 1,
  isExistingCustomer: 1,
  customerId: '',
  salesLeadId: '',
  referrerType: undefined,
  referrerId: '',
  referrerName: '',
  referrerPhone: '',
  visitorName: '',
  visitorPhone: '',
  visitorWechat: '',
  expectedDeliveryDate: undefined,
  appointmentDate: '',
  appointmentTime: '',
  plannedDuration: undefined,
  appointmentPurpose: '',
  receptionEmployeeId: '',
  relatedEmployeeId: '',
  roomId: '',
  appointmentStatus: 1,
  arrivalTime: undefined,
  departureTime: undefined,
  actualDuration: undefined,
  companionCount: undefined,
  specialRequirements: '',
  remark: '',
});

const formRules = {
  appointmentType: [{ required: true, message: '请选择预约类型' }],
  appointmentSource: [{ required: true, message: '请选择预约来源' }],
  isExistingCustomer: [{ required: true, message: '请选择是否已有客户' }],
  appointmentDate: [{ required: true, message: '请选择预约日期' }],
  appointmentTime: [{ required: true, message: '请输入预约时间' }],
  appointmentPurpose: [{ required: true, message: '请输入预约事由' }],
  appointmentStatus: [{ required: true, message: '请选择预约状态' }],
};

function openCreateModal() {
  isEditMode.value = false;
  editingId.value = '';
  formModel.value = {
    appointmentType: 1,
    appointmentSource: 1,
    isExistingCustomer: 1,
    customerId: '',
    salesLeadId: '',
    referrerType: undefined,
    referrerId: '',
    referrerName: '',
    referrerPhone: '',
    visitorName: '',
    visitorPhone: '',
    visitorWechat: '',
    expectedDeliveryDate: undefined,
    appointmentDate: '',
    appointmentTime: '',
    plannedDuration: undefined,
    appointmentPurpose: '',
    receptionEmployeeId: '',
    relatedEmployeeId: '',
    roomId: '',
    appointmentStatus: 1,
    arrivalTime: undefined,
    departureTime: undefined,
    actualDuration: undefined,
    companionCount: undefined,
    specialRequirements: '',
    remark: '',
  };
  createModalVisible.value = true;
}

async function openEditModal(record: FrontdeskAppointmentItem) {
  isEditMode.value = true;
  editingId.value = record.id;
  try {
    const detail = await getFrontdeskAppointmentDetailApi(record.id);
    formModel.value = {
      appointmentType: detail.appointmentType,
      appointmentSource: detail.appointmentSource,
      isExistingCustomer: detail.isExistingCustomer,
      customerId: detail.customerId || '',
      salesLeadId: '',
      referrerType: detail.referrerType,
      referrerId: detail.referrerId || '',
      referrerName: detail.referrerName || '',
      referrerPhone: detail.referrerPhone || '',
      visitorName: detail.visitorName || '',
      visitorPhone: detail.visitorPhone || '',
      visitorWechat: detail.visitorWechat || '',
      expectedDeliveryDate: detail.expectedDeliveryDate
        ? (dayjs(detail.expectedDeliveryDate) as any)
        : undefined,
      appointmentDate: detail.appointmentDate
        ? (dayjs(detail.appointmentDate) as any)
        : '',
      appointmentTime: detail.appointmentTime || '',
      plannedDuration: detail.plannedDuration,
      appointmentPurpose: detail.appointmentPurpose || '',
      receptionEmployeeId: detail.receptionEmployeeId || '',
      relatedEmployeeId: detail.relatedEmployeeId || '',
      roomId: detail.roomId || '',
      appointmentStatus: detail.appointmentStatus,
      arrivalTime: detail.arrivalTime
        ? (dayjs(detail.arrivalTime) as any)
        : undefined,
      departureTime: detail.departureTime
        ? (dayjs(detail.departureTime) as any)
        : undefined,
      actualDuration: detail.actualDuration,
      companionCount: detail.companionCount,
      specialRequirements: detail.specialRequirements || '',
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
    const params: CreateFrontdeskAppointmentParams = {
      ...formModel.value,
      expectedDeliveryDate: formModel.value.expectedDeliveryDate
        ? dayjs(formModel.value.expectedDeliveryDate as any).toISOString()
        : undefined,
      appointmentDate: formModel.value.appointmentDate
        ? dayjs(formModel.value.appointmentDate as any).toISOString()
        : '',
      arrivalTime: formModel.value.arrivalTime
        ? dayjs(formModel.value.arrivalTime as any).toISOString()
        : undefined,
      departureTime: formModel.value.departureTime
        ? dayjs(formModel.value.departureTime as any).toISOString()
        : undefined,
    };

    if (isEditMode.value) {
      await updateFrontdeskAppointmentApi({
        ...params,
        id: editingId.value,
      } as UpdateFrontdeskAppointmentParams);
      message.success('更新访客登记成功');
    } else {
      await createFrontdeskAppointmentApi(params);
      message.success('创建访客登记成功');
    }
    closeCreateModal();
    fetchList();
  } catch {
    // 由全局拦截器处理错误
  } finally {
    submitting.value = false;
  }
}

async function handleDelete(record: FrontdeskAppointmentItem) {
  try {
    await deleteFrontdeskAppointmentApi(record.id);
    message.success('删除访客登记成功');
    fetchList();
  } catch {
    // 由全局拦截器处理错误
  }
}

// 预约状态编辑弹窗
const statusModalVisible = ref(false);
const statusSubmitting = ref(false);
const statusFormRef = ref<FormInstance | null>(null);

const statusFormModel = ref<UpdateAppointmentStatusParams>({
  id: '',
  appointmentStatus: 1,
  cancelReason: '',
  receptionEmployeeId: '',
  arrivalTime: undefined,
  departureTime: undefined,
  actualDuration: undefined,
});

const statusFormRules = {
  appointmentStatus: [{ required: true, message: '请选择预约状态' }],
};

const allAppointmentStatusOptions = [
  { label: '待确认', value: 1 },
  { label: '已确认', value: 2 },
  { label: '已到访', value: 3 },
  { label: '已取消', value: 4 },
  { label: '已过期', value: 5 },
  { label: '已完成', value: 6 },
];

function openStatusModal(record: FrontdeskAppointmentItem) {
  statusFormModel.value = {
    id: record.id,
    appointmentStatus: record.appointmentStatus,
    cancelReason: record.cancelReason || '',
    receptionEmployeeId: record.receptionEmployeeId || '',
    arrivalTime: record.arrivalTime ? (dayjs(record.arrivalTime) as any) : undefined,
    departureTime: record.departureTime ? (dayjs(record.departureTime) as any) : undefined,
    actualDuration: record.actualDuration,
  };
  statusModalVisible.value = true;
}

function closeStatusModal() {
  statusModalVisible.value = false;
  statusFormRef.value?.resetFields();
}

async function handleStatusSubmit() {
  try {
    await statusFormRef.value?.validate();
    statusSubmitting.value = true;
    const params: UpdateAppointmentStatusParams = {
      id: statusFormModel.value.id,
      appointmentStatus: statusFormModel.value.appointmentStatus,
      cancelReason: statusFormModel.value.cancelReason || undefined,
      receptionEmployeeId: statusFormModel.value.receptionEmployeeId || undefined,
      arrivalTime: statusFormModel.value.arrivalTime
        ? dayjs(statusFormModel.value.arrivalTime as any).toISOString()
        : undefined,
      departureTime: statusFormModel.value.departureTime
        ? dayjs(statusFormModel.value.departureTime as any).toISOString()
        : undefined,
      actualDuration: statusFormModel.value.actualDuration,
    };
    await updateAppointmentStatusApi(params);
    message.success('更新预约状态成功');
    closeStatusModal();
    fetchList();
  } catch {
    // 由全局拦截器处理错误
  } finally {
    statusSubmitting.value = false;
  }
}
</script>

<template>
  <div class="p-4">
    <!-- 创建按钮 -->
    <div class="mb-4">
      <Button type="primary" class="cursor-pointer" @click="openCreateModal">
        创建访客登记
      </Button>
    </div>

    <!-- 搜索表单 -->
    <div class="mb-4">
      <Space wrap>
        <Input
          v-model:value="queryForm.VisitorName"
          placeholder="访客姓名"
          style="width: 140px"
          allow-clear
        />
        <Input
          v-model:value="queryForm.ReferrerName"
          placeholder="推荐人姓名"
          style="width: 140px"
          allow-clear
        />
        <Select
          v-model:value="queryForm.AppointmentType"
          :options="appointmentTypeOptions"
          placeholder="预约类型"
          style="width: 130px"
          allow-clear
        />
        <Select
          v-model:value="queryForm.AppointmentSource"
          :options="appointmentSourceOptions"
          placeholder="预约来源"
          style="width: 130px"
          allow-clear
        />
        <Select
          v-model:value="queryForm.AppointmentStatus"
          :options="appointmentStatusOptions"
          placeholder="预约状态"
          style="width: 130px"
          allow-clear
        />
        <Select
          v-model:value="queryForm.IsConverted"
          :options="isConvertedOptions"
          placeholder="是否已转化"
          style="width: 130px"
          allow-clear
        />
        <DatePicker
          v-model:value="queryForm.AppointmentDateStart"
          placeholder="预约日期开始"
          style="width: 150px"
        />
        <DatePicker
          v-model:value="queryForm.AppointmentDateEnd"
          placeholder="预约日期结束"
          style="width: 150px"
        />
        <DatePicker
          v-model:value="queryForm.ArrivalTimeStart"
          placeholder="到访时间开始"
          style="width: 150px"
        />
        <DatePicker
          v-model:value="queryForm.ArrivalTimeEnd"
          placeholder="到访时间结束"
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
      :scroll="{ x: 2400 }"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'expectedDeliveryDate'">
          <span v-if="record.expectedDeliveryDate">
            {{ dayjs(record.expectedDeliveryDate).format('YYYY-MM-DD') }}
          </span>
          <span v-else>—</span>
        </template>
        <template v-else-if="column.key === 'appointmentDate'">
          <span v-if="record.appointmentDate">
            {{ dayjs(record.appointmentDate).format('YYYY-MM-DD') }}
          </span>
          <span v-else>—</span>
        </template>
        <template v-else-if="column.key === 'arrivalTime'">
          <span v-if="record.arrivalTime">
            {{ dayjs(record.arrivalTime).format('YYYY-MM-DD HH:mm:ss') }}
          </span>
          <span v-else>—</span>
        </template>
        <template v-else-if="column.key === 'departureTime'">
          <span v-if="record.departureTime">
            {{ dayjs(record.departureTime).format('YYYY-MM-DD HH:mm:ss') }}
          </span>
          <span v-else>—</span>
        </template>
        <template v-else-if="column.key === 'createdAt'">
          <span v-if="record.createdAt">
            {{ dayjs(record.createdAt).format('YYYY-MM-DD HH:mm:ss') }}
          </span>
          <span v-else>—</span>
        </template>
        <template v-else-if="column.key === 'companionCount'">
          <span v-if="record.companionCount !== null && record.companionCount !== undefined">
            {{ record.companionCount }}
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
                @click="openStatusModal(record)"
              >
                预约状态
              </Button>
              <Button
                type="link"
                size="small"
                class="cursor-pointer"
                @click="openEditModal(record)"
              >
                更新
              </Button>
              <Popconfirm
                title="确定删除该访客登记吗？"
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

    <!-- 创建 / 编辑访客登记弹窗 -->
    <Modal
      v-model:open="createModalVisible"
      :title="isEditMode ? '更新访客登记' : '创建访客登记'"
      width="1000px"
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
          <Form.Item label="预约类型" name="appointmentType">
            <Select
              v-model:value="formModel.appointmentType"
              :options="appointmentTypeOptions"
              placeholder="请选择预约类型"
            />
          </Form.Item>
          <Form.Item label="预约来源" name="appointmentSource">
            <Select
              v-model:value="formModel.appointmentSource"
              :options="appointmentSourceOptions"
              placeholder="请选择预约来源"
            />
          </Form.Item>
          <Form.Item label="是否已有客户" name="isExistingCustomer">
            <Select
              v-model:value="formModel.isExistingCustomer"
              :options="isExistingCustomerOptions"
              placeholder="请选择是否已有客户"
            />
          </Form.Item>
          <Form.Item label="客户ID" name="customerId">
            <Input
              v-model:value="formModel.customerId"
              placeholder="请输入客户ID"
            />
          </Form.Item>
          <Form.Item label="销售线索ID" name="salesLeadId">
            <Input
              v-model:value="formModel.salesLeadId"
              placeholder="请输入销售线索ID"
            />
          </Form.Item>
          <Form.Item label="推荐人类型" name="referrerType">
            <Select
              v-model:value="formModel.referrerType"
              :options="referrerTypeOptions"
              placeholder="请选择推荐人类型"
              allow-clear
            />
          </Form.Item>
          <Form.Item label="推荐人ID" name="referrerId">
            <Input
              v-model:value="formModel.referrerId"
              placeholder="请输入推荐人ID"
            />
          </Form.Item>
          <Form.Item label="推荐人姓名" name="referrerName">
            <Input
              v-model:value="formModel.referrerName"
              placeholder="请输入推荐人姓名"
            />
          </Form.Item>
          <Form.Item label="推荐人电话" name="referrerPhone">
            <Input
              v-model:value="formModel.referrerPhone"
              placeholder="请输入推荐人电话"
            />
          </Form.Item>
          <Form.Item label="访客姓名" name="visitorName">
            <Input
              v-model:value="formModel.visitorName"
              placeholder="请输入访客姓名"
            />
          </Form.Item>
          <Form.Item label="访客电话" name="visitorPhone">
            <Input
              v-model:value="formModel.visitorPhone"
              placeholder="请输入访客电话"
            />
          </Form.Item>
          <Form.Item label="访客微信" name="visitorWechat">
            <Input
              v-model:value="formModel.visitorWechat"
              placeholder="请输入访客微信"
            />
          </Form.Item>
          <Form.Item label="预产期" name="expectedDeliveryDate">
            <DatePicker
              v-model:value="formModel.expectedDeliveryDate"
              style="width: 100%"
              placeholder="请选择预产期"
            />
          </Form.Item>
          <Form.Item label="预约日期" name="appointmentDate">
            <DatePicker
              v-model:value="formModel.appointmentDate"
              style="width: 100%"
              placeholder="请选择预约日期"
            />
          </Form.Item>
          <Form.Item label="预约时间" name="appointmentTime">
            <TimePicker
              v-model:value="formModel.appointmentTime"
              format="HH:mm:ss"
              value-format="HH:mm:ss"
              style="width: 100%"
              placeholder="请选择预约时间"
            />
          </Form.Item>
          <Form.Item label="计划时长(分钟)" name="plannedDuration">
            <InputNumber
              v-model:value="formModel.plannedDuration"
              :min="0"
              style="width: 100%"
              placeholder="请输入计划时长"
            />
          </Form.Item>
          <Form.Item label="预约事由" name="appointmentPurpose">
            <Input
              v-model:value="formModel.appointmentPurpose"
              placeholder="请输入预约事由"
            />
          </Form.Item>
          <Form.Item label="接待员工ID" name="receptionEmployeeId">
            <Input
              v-model:value="formModel.receptionEmployeeId"
              placeholder="请输入接待员工ID"
            />
          </Form.Item>
          <Form.Item label="关联员工ID" name="relatedEmployeeId">
            <Input
              v-model:value="formModel.relatedEmployeeId"
              placeholder="请输入关联员工ID"
            />
          </Form.Item>
          <Form.Item label="房间ID" name="roomId">
            <Input
              v-model:value="formModel.roomId"
              placeholder="请输入房间ID"
            />
          </Form.Item>
          <Form.Item label="预约状态" name="appointmentStatus">
            <Select
              v-model:value="formModel.appointmentStatus"
              :options="appointmentStatusOptions"
              placeholder="请选择预约状态"
            />
          </Form.Item>
          <Form.Item label="实际到访时间" name="arrivalTime">
            <DatePicker
              v-model:value="formModel.arrivalTime"
              show-time
              style="width: 100%"
              placeholder="请选择实际到访时间"
            />
          </Form.Item>
          <Form.Item label="实际离开时间" name="departureTime">
            <DatePicker
              v-model:value="formModel.departureTime"
              show-time
              style="width: 100%"
              placeholder="请选择实际离开时间"
            />
          </Form.Item>
          <Form.Item label="实际时长(分钟)" name="actualDuration">
            <InputNumber
              v-model:value="formModel.actualDuration"
              :min="0"
              style="width: 100%"
              placeholder="请输入实际时长"
            />
          </Form.Item>
          <Form.Item label="陪同人数" name="companionCount">
            <InputNumber
              v-model:value="formModel.companionCount"
              :min="0"
              style="width: 100%"
              placeholder="请输入陪同人数"
            />
          </Form.Item>
        </div>
        <Form.Item label="特殊要求" name="specialRequirements">
          <Input.TextArea
            v-model:value="formModel.specialRequirements"
            :rows="2"
            placeholder="请输入特殊要求"
          />
        </Form.Item>
        <Form.Item label="备注" name="remark">
          <Input.TextArea
            v-model:value="formModel.remark"
            :rows="2"
            placeholder="请输入备注"
          />
        </Form.Item>
      </Form>
    </Modal>

    <!-- 预约状态编辑弹窗 -->
    <Modal
      v-model:open="statusModalVisible"
      title="编辑预约状态"
      width="600px"
      :confirm-loading="statusSubmitting"
      @ok="handleStatusSubmit"
      @cancel="closeStatusModal"
      destroy-on-close
    >
      <Form
        ref="statusFormRef"
        :model="statusFormModel"
        :rules="statusFormRules"
        layout="vertical"
      >
        <Form.Item label="预约状态" name="appointmentStatus">
          <Select
            v-model:value="statusFormModel.appointmentStatus"
            :options="allAppointmentStatusOptions"
            placeholder="请选择预约状态"
          />
        </Form.Item>
        <Form.Item label="取消原因（当状态为已取消时可填写）" name="cancelReason">
          <Input.TextArea
            v-model:value="statusFormModel.cancelReason"
            :rows="2"
            placeholder="请输入取消原因"
            :disabled="statusFormModel.appointmentStatus !== 4"
          />
        </Form.Item>
        <Form.Item label="接待员工ID（到访/完成时可选）" name="receptionEmployeeId">
          <Input
            v-model:value="statusFormModel.receptionEmployeeId"
            placeholder="请输入接待员工ID"
            :disabled="statusFormModel.appointmentStatus !== 3 && statusFormModel.appointmentStatus !== 6"
          />
        </Form.Item>
        <Form.Item label="实际到访时间（到访/完成时可选）" name="arrivalTime">
          <DatePicker
            v-model:value="statusFormModel.arrivalTime"
            show-time
            style="width: 100%"
            placeholder="请选择实际到访时间"
            :disabled="statusFormModel.appointmentStatus !== 3 && statusFormModel.appointmentStatus !== 6"
          />
        </Form.Item>
        <Form.Item label="实际离开时间（完成时可选）" name="departureTime">
          <DatePicker
            v-model:value="statusFormModel.departureTime"
            show-time
            style="width: 100%"
            placeholder="请选择实际离开时间"
            :disabled="statusFormModel.appointmentStatus !== 6"
          />
        </Form.Item>
        <Form.Item label="实际时长(分钟，完成时可选)" name="actualDuration">
          <InputNumber
            v-model:value="statusFormModel.actualDuration"
            :min="0"
            style="width: 100%"
            placeholder="请输入实际时长"
            :disabled="statusFormModel.appointmentStatus !== 6"
          />
        </Form.Item>
      </Form>
    </Modal>
  </div>
</template>


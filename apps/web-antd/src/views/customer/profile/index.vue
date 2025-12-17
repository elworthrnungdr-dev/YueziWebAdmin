<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import {
  getCustomerListApi,
  createCustomerApi,
  getCustomerDetailApi,
  updateCustomerApi,
  deleteCustomerApi,
  type CustomerItem,
  type CustomerListParams,
  type CreateCustomerParams,
  type UpdateCustomerParams,
} from '#/api';

import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Radio,
  Select,
  Space,
  Table,
} from 'ant-design-vue';
import type { FormInstance } from 'ant-design-vue';
import { h } from 'vue';
import dayjs, { type Dayjs } from 'dayjs';

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

const dateRange = ref<[Dayjs | null, Dayjs | null]>([null, null]);

const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 40,
  },
  {
    title: '客户姓名',
    dataIndex: 'customerName',
    key: 'customerName',
    width: 120,
  },
  {
    title: '性别',
    dataIndex: 'gender',
    key: 'gender',
    width: 80,
  },
  {
    title: '年龄',
    dataIndex: 'age',
    key: 'age',
    width: 80,
  },
  {
    title: '联系电话',
    dataIndex: 'phoneNumber',
    key: 'phoneNumber',
    width: 130,
  },
  {
    title: '微信号',
    dataIndex: 'wechat',
    key: 'wechat',
    width: 120,
  },
  {
    title: '客户状态',
    dataIndex: 'customerStatus',
    key: 'customerStatus',
    width: 100,
  },
  {
    title: '预产期',
    dataIndex: 'expectedDeliveryDate',
    key: 'expectedDeliveryDate',
    width: 120,
  },
  {
    title: '生产日期',
    dataIndex: 'deliveryDate',
    key: 'deliveryDate',
    width: 120,
  },
  {
    title: '入住时间',
    dataIndex: 'checkinTime',
    key: 'checkinTime',
    width: 160,
  },
  {
    title: '出所时间',
    dataIndex: 'checkoutTime',
    key: 'checkoutTime',
    width: 160,
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    key: 'createdAt',
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
  loading.value = true;
  try {
    // 处理日期范围
    const params: CustomerListParams = {
      ...queryForm.value,
    };
    if (dateRange.value[0]) {
      params.CreatedAtStart = dateRange.value[0].format('YYYY-MM-DD');
    }
    if (dateRange.value[1]) {
      params.CreatedAtEnd = dateRange.value[1].format('YYYY-MM-DD');
    }

    const { items, total: t } = await getCustomerListApi(params);
    dataSource.value = items;
    total.value = t;
  } catch (error: any) {
    const errMsg =
      error?.response?.data?.message || error?.message || '获取客户列表失败';
    message.error(errMsg);
  } finally {
    loading.value = false;
  }
}

function handleReset() {
  queryForm.value.CustomerName = undefined;
  queryForm.value.Gender = undefined;
  queryForm.value.CustomerStatus = undefined;
  queryForm.value.CreatedAtStart = undefined;
  queryForm.value.CreatedAtEnd = undefined;
  queryForm.value.PageIndex = 1;
  queryForm.value.PageSize = 10;
  queryForm.value.OrderBy = undefined;
  queryForm.value.IsAsc = true;
  dateRange.value = [null, null];
  fetchList();
}

async function copyCustomerId(id: string) {
  try {
    await navigator.clipboard.writeText(id);
    message.success('ID已复制到剪贴板');
  } catch (error) {
    // 降级方案：使用传统方法
    const textArea = document.createElement('textarea');
    textArea.value = id;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      message.success('ID已复制到剪贴板');
    } catch (err) {
      message.error('复制失败，请手动复制');
    }
    document.body.removeChild(textArea);
  }
}

function handleTableChange(pagination: any) {
  queryForm.value.PageIndex = pagination.current;
  queryForm.value.PageSize = pagination.pageSize;
  fetchList();
}

// 添加/编辑客户档案弹窗相关
const createModalVisible = ref(false);
const isEditMode = ref(false);
const editingCustomerId = ref<string>('');
const submitting = ref(false);
const formRef = ref<FormInstance>();
const formModel = ref<CreateCustomerParams>({
  customerName: '',
  gender: 1,
  birthDate: undefined,
  age: undefined,
  phoneArea: '',
  phoneNumber: '',
  wechat: '',
  customerStatus: 1,
  paymentStatus: undefined,
  expectedDeliveryDate: undefined,
  deliveryDate: undefined,
  deliveryMethod: undefined,
  parity: undefined,
  fetusType: undefined,
  babyGender: undefined,
  deliveryHospital: '',
  stayTimes: undefined,
  tRoomId: '',
  registerTime: undefined,
  contractSignTime: undefined,
  checkinTime: undefined,
  salesEmployeesId: '',
  emergencyName: '',
  emergencyPhone: '',
  emergencyRelation: '',
  companionName: '',
  companionPhone: '',
  companionRelation: '',
  nativePlace: '',
  homeAddress: '',
  idType: undefined,
  idNumber: '',
  nationality: '',
  company: '',
  occupation: '',
  email: '',
  customerSource: undefined,
  referrerName: '',
  referrerPhone: '',
  idcardFront: '',
  idcardBack: '',
  remark: '',
});

const formRules = {
  customerName: [{ required: true, message: '请输入客户姓名' }],
  gender: [{ required: true, message: '请选择性别' }],
  customerStatus: [{ required: true, message: '请选择客户状态' }],
};

function resetForm() {
  formModel.value = {
    customerName: '',
    gender: 1,
    birthDate: undefined,
    age: undefined,
    phoneArea: '',
    phoneNumber: '',
    wechat: '',
    customerStatus: 1,
    paymentStatus: undefined,
    expectedDeliveryDate: undefined,
    deliveryDate: undefined,
    deliveryMethod: undefined,
    parity: undefined,
    fetusType: undefined,
    babyGender: undefined,
    deliveryHospital: '',
    stayTimes: undefined,
    tRoomId: '',
    registerTime: undefined,
    contractSignTime: undefined,
    checkinTime: undefined,
    salesEmployeesId: '',
    emergencyName: '',
    emergencyPhone: '',
    emergencyRelation: '',
    companionName: '',
    companionPhone: '',
    companionRelation: '',
    nativePlace: '',
    homeAddress: '',
    idType: undefined,
    idNumber: '',
    nationality: '',
    company: '',
    occupation: '',
    email: '',
    customerSource: undefined,
    referrerName: '',
    referrerPhone: '',
    idcardFront: '',
    idcardBack: '',
    remark: '',
  };
  formRef.value?.resetFields();
}

function openCreateModal() {
  isEditMode.value = false;
  editingCustomerId.value = '';
  createModalVisible.value = true;
  resetForm();
}

function closeCreateModal() {
  createModalVisible.value = false;
  resetForm();
}

// 安全的日期转换函数
function safeDayjs(dateValue: string | null | undefined): Dayjs | undefined {
  if (!dateValue) return undefined;
  try {
    const d = dayjs(dateValue);
    return d.isValid() ? d : undefined;
  } catch {
    return undefined;
  }
}

// 安全的性别转换函数
function safeGender(gender: string | number | null | undefined): number {
  if (gender === null || gender === undefined) return 3;
  if (typeof gender === 'number') {
    return gender >= 1 && gender <= 3 ? gender : 3;
  }
  if (typeof gender === 'string') {
    if (gender === '1' || gender === '男') return 1;
    if (gender === '2' || gender === '女') return 2;
    return 3;
  }
  return 3;
}

async function openEditModal(record: CustomerItem) {
  isEditMode.value = true;
  editingCustomerId.value = record.id;
  createModalVisible.value = true;

  try {
    loading.value = true;
    const detail = await getCustomerDetailApi(record.id);

    // 填充表单数据
    formModel.value = {
      customerName: detail.customerName || '',
      gender: safeGender(detail.gender),
      birthDate: safeDayjs(detail.birthDate),
      age: detail.age ?? undefined,
      phoneArea: detail.phoneArea || '',
      phoneNumber: detail.phoneNumber || '',
      wechat: detail.wechat || '',
      customerStatus: detail.customerStatus ?? 1,
      paymentStatus: detail.paymentStatus ?? undefined,
      expectedDeliveryDate: safeDayjs(detail.expectedDeliveryDate),
      deliveryDate: safeDayjs(detail.deliveryDate),
      deliveryMethod: detail.deliveryMethod ?? undefined,
      parity: detail.parity ?? undefined,
      fetusType: detail.fetusType ?? undefined,
      babyGender: detail.babyGender ?? undefined,
      deliveryHospital: detail.deliveryHospital || '',
      stayTimes: detail.stayTimes ?? undefined,
      tRoomId: detail.tRoomId || '',
      registerTime: safeDayjs(detail.registerTime),
      contractSignTime: safeDayjs(detail.contractSignTime),
      checkinTime: safeDayjs(detail.checkinTime),
      salesEmployeesId: detail.salesEmployeesId || '',
      emergencyName: detail.emergencyName || '',
      emergencyPhone: detail.emergencyPhone || '',
      emergencyRelation: detail.emergencyRelation || '',
      companionName: detail.companionName || '',
      companionPhone: detail.companionPhone || '',
      companionRelation: detail.companionRelation || '',
      nativePlace: detail.nativePlace || '',
      homeAddress: detail.homeAddress || '',
      idType: detail.idType ?? undefined,
      idNumber: detail.idNumber || '',
      nationality: detail.nationality || '',
      company: detail.company || '',
      occupation: detail.occupation || '',
      email: detail.email || '',
      customerSource: detail.customerSource ?? undefined,
      referrerName: detail.referrerName || '',
      referrerPhone: detail.referrerPhone || '',
      idcardFront: detail.idcardFront || '',
      idcardBack: detail.idcardBack || '',
      remark: detail.remark || '',
    };
  } catch (error: any) {
    const errMsg =
      error?.response?.data?.message || error?.message || '获取客户详情失败';
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

    // 处理日期字段 - DatePicker 返回的是 dayjs 对象
    const baseData: CreateCustomerParams = {
      ...values,
      birthDate: values.birthDate
        ? (values.birthDate as Dayjs).toISOString()
        : undefined,
      expectedDeliveryDate: values.expectedDeliveryDate
        ? (values.expectedDeliveryDate as Dayjs).toISOString()
        : undefined,
      deliveryDate: values.deliveryDate
        ? (values.deliveryDate as Dayjs).toISOString()
        : undefined,
      registerTime: values.registerTime
        ? (values.registerTime as Dayjs).toISOString()
        : undefined,
      contractSignTime: values.contractSignTime
        ? (values.contractSignTime as Dayjs).toISOString()
        : undefined,
      checkinTime: values.checkinTime
        ? (values.checkinTime as Dayjs).toISOString()
        : undefined,
    };

    if (isEditMode.value) {
      // 编辑模式：PUT 请求
      const updateData: UpdateCustomerParams = {
        ...baseData,
        id: editingCustomerId.value,
      };
      await updateCustomerApi(updateData);
      message.success('更新客户档案成功');
    } else {
      // 新增模式：POST 请求
      await createCustomerApi(baseData);
      message.success('创建客户档案成功');
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
      (isEditMode.value ? '更新客户档案失败' : '创建客户档案失败');
    message.error(errMsg);
  } finally {
    submitting.value = false;
  }
}

function handleDelete(record: CustomerItem) {
  Modal.confirm({
    title: '确认删除',
    content: h('div', { style: { fontSize: '14px', lineHeight: '1.6' } }, [
      h('p', {
        style: { marginBottom: '8px', color: '#ff4d4f', fontWeight: 500 },
      }, '⚠️ 警告'),
      h('p', { style: { margin: 0 } }, `确定要删除客户"${record.customerName}"吗？`),
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
        await deleteCustomerApi(record.id);
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
          创建客户档案
        </Button>
      </div>
      <Space>
        <Input
          v-model:value="queryForm.CustomerName"
          allow-clear
          placeholder="客户姓名"
          style="width: 150px"
        />
        <Select
          v-model:value="queryForm.Gender"
          placeholder="性别"
          allow-clear
          style="width: 100px"
        >
          <Select.Option :value="1">男</Select.Option>
          <Select.Option :value="2">女</Select.Option>
          <Select.Option :value="3">未知</Select.Option>
        </Select>
        <Select
          v-model:value="queryForm.CustomerStatus"
          placeholder="客户状态"
          allow-clear
          style="width: 120px"
        >
          <Select.Option :value="1">意向</Select.Option>
          <Select.Option :value="2">已入住</Select.Option>
          <Select.Option :value="3">已出所</Select.Option>
        </Select>
        <DatePicker.RangePicker
          v-model:value="dateRange"
          format="YYYY-MM-DD"
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
        total,
        showSizeChanger: true,
      }"
      row-key="id"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'id'">
          <Button
            type="link"
            size="small"
            class="cursor-pointer p-0"
            @click="copyCustomerId(record.id)"
            title="复制ID"
          >
            📋
          </Button>
        </template>
        <template v-else-if="column.key === 'gender'">
          {{
            {
              '1': '男',
              '2': '女',
              '3': '未知',
            }[record.gender ?? '3'] ?? '未知'
          }}
        </template>
        <template v-else-if="column.key === 'customerStatus'">
          {{
            {
              1: '意向',
              2: '已入住',
              3: '已出所',
            }[record.customerStatus ?? 1] ?? '未知'
          }}
        </template>
        <template v-else-if="column.key === 'expectedDeliveryDate'">
          <span v-if="record.expectedDeliveryDate">
            {{ new Date(record.expectedDeliveryDate).toLocaleDateString('zh-CN') }}
          </span>
          <span v-else>—</span>
        </template>
        <template v-else-if="column.key === 'deliveryDate'">
          <span v-if="record.deliveryDate">
            {{ new Date(record.deliveryDate).toLocaleDateString('zh-CN') }}
          </span>
          <span v-else>—</span>
        </template>
        <template v-else-if="column.key === 'checkinTime'">
          <span v-if="record.checkinTime">
            {{ new Date(record.checkinTime).toLocaleString('zh-CN') }}
          </span>
          <span v-else>—</span>
        </template>
        <template v-else-if="column.key === 'checkoutTime'">
          <span v-if="record.checkoutTime">
            {{ new Date(record.checkoutTime).toLocaleString('zh-CN') }}
          </span>
          <span v-else>—</span>
        </template>
        <template v-else-if="column.key === 'createdAt'">
          <span v-if="record.createdAt">
            {{ new Date(record.createdAt).toLocaleString('zh-CN') }}
          </span>
          <span v-else>—</span>
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
                size="small"
                type="link"
                danger
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

    <!-- 创建/编辑客户档案弹窗 -->
    <Modal
      v-model:open="createModalVisible"
      :title="isEditMode ? '更新客户档案' : '创建客户档案'"
      width="1200px"
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
        <div class="grid grid-cols-2 gap-4">
          <!-- 第一列 -->
          <div>
            <Form.Item label="客户姓名" name="customerName">
              <Input
                v-model:value="formModel.customerName"
                placeholder="请输入客户姓名"
                allow-clear
              />
            </Form.Item>

            <Form.Item label="性别" name="gender">
              <Radio.Group v-model:value="formModel.gender">
                <Radio :value="1">男</Radio>
                <Radio :value="2">女</Radio>
                <Radio :value="3">未知</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item label="出生日期" name="birthDate">
              <DatePicker
                v-model:value="formModel.birthDate"
                format="YYYY-MM-DD"
                placeholder="请选择出生日期"
                style="width: 100%"
              />
            </Form.Item>

            <Form.Item label="年龄" name="age">
              <InputNumber
                v-model:value="formModel.age"
                placeholder="请输入年龄"
                :min="0"
                style="width: 100%"
              />
            </Form.Item>

            <Form.Item label="电话区号" name="phoneArea">
              <Input
                v-model:value="formModel.phoneArea"
                placeholder="请输入电话区号"
                allow-clear
              />
            </Form.Item>

            <Form.Item label="联系电话" name="phoneNumber">
              <Input
                v-model:value="formModel.phoneNumber"
                placeholder="请输入联系电话"
                allow-clear
              />
            </Form.Item>

            <Form.Item label="微信号" name="wechat">
              <Input
                v-model:value="formModel.wechat"
                placeholder="请输入微信号"
                allow-clear
              />
            </Form.Item>

            <Form.Item label="客户状态" name="customerStatus">
              <Select
                v-model:value="formModel.customerStatus"
                placeholder="请选择客户状态"
              >
                <Select.Option :value="1">意向</Select.Option>
                <Select.Option :value="2">已入住</Select.Option>
                <Select.Option :value="3">已出所</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item label="付款状态" name="paymentStatus">
              <InputNumber
                v-model:value="formModel.paymentStatus"
                placeholder="请输入付款状态"
                style="width: 100%"
              />
            </Form.Item>

            <Form.Item label="预产期" name="expectedDeliveryDate">
              <DatePicker
                v-model:value="formModel.expectedDeliveryDate"
                format="YYYY-MM-DD"
                placeholder="请选择预产期"
                style="width: 100%"
              />
            </Form.Item>

            <Form.Item label="生产日期" name="deliveryDate">
              <DatePicker
                v-model:value="formModel.deliveryDate"
                format="YYYY-MM-DD"
                placeholder="请选择生产日期"
                style="width: 100%"
              />
            </Form.Item>

            <Form.Item label="分娩方式" name="deliveryMethod">
              <InputNumber
                v-model:value="formModel.deliveryMethod"
                placeholder="请输入分娩方式"
                style="width: 100%"
              />
            </Form.Item>

            <Form.Item label="胎次" name="parity">
              <InputNumber
                v-model:value="formModel.parity"
                placeholder="请输入胎次"
                :min="0"
                style="width: 100%"
              />
            </Form.Item>

            <Form.Item label="胎儿类型" name="fetusType">
              <InputNumber
                v-model:value="formModel.fetusType"
                placeholder="请输入胎儿类型"
                style="width: 100%"
              />
            </Form.Item>

            <Form.Item label="宝宝性别" name="babyGender">
              <InputNumber
                v-model:value="formModel.babyGender"
                placeholder="请输入宝宝性别"
                style="width: 100%"
              />
            </Form.Item>

            <Form.Item label="生产医院" name="deliveryHospital">
              <Input
                v-model:value="formModel.deliveryHospital"
                placeholder="请输入生产医院"
                allow-clear
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

            <Form.Item label="房间ID" name="tRoomId">
              <Input
                v-model:value="formModel.tRoomId"
                placeholder="请输入房间ID"
                allow-clear
              />
            </Form.Item>

            <Form.Item label="登记时间" name="registerTime">
              <DatePicker
                v-model:value="formModel.registerTime"
                show-time
                format="YYYY-MM-DD HH:mm:ss"
                placeholder="请选择登记时间"
                style="width: 100%"
              />
            </Form.Item>

            <Form.Item label="签约时间" name="contractSignTime">
              <DatePicker
                v-model:value="formModel.contractSignTime"
                show-time
                format="YYYY-MM-DD HH:mm:ss"
                placeholder="请选择签约时间"
                style="width: 100%"
              />
            </Form.Item>

            <Form.Item label="入住时间" name="checkinTime">
              <DatePicker
                v-model:value="formModel.checkinTime"
                show-time
                format="YYYY-MM-DD HH:mm:ss"
                placeholder="请选择入住时间"
                style="width: 100%"
              />
            </Form.Item>

            <Form.Item label="销售员工ID" name="salesEmployeesId">
              <Input
                v-model:value="formModel.salesEmployeesId"
                placeholder="请输入销售员工ID"
                allow-clear
              />
            </Form.Item>
          </div>

          <!-- 第二列 -->
          <div>
            <Form.Item label="紧急联系人姓名" name="emergencyName">
              <Input
                v-model:value="formModel.emergencyName"
                placeholder="请输入紧急联系人姓名"
                allow-clear
              />
            </Form.Item>

            <Form.Item label="紧急联系人电话" name="emergencyPhone">
              <Input
                v-model:value="formModel.emergencyPhone"
                placeholder="请输入紧急联系人电话"
                allow-clear
              />
            </Form.Item>

            <Form.Item label="紧急联系人关系" name="emergencyRelation">
              <Input
                v-model:value="formModel.emergencyRelation"
                placeholder="请输入紧急联系人关系"
                allow-clear
              />
            </Form.Item>

            <Form.Item label="陪同人姓名" name="companionName">
              <Input
                v-model:value="formModel.companionName"
                placeholder="请输入陪同人姓名"
                allow-clear
              />
            </Form.Item>

            <Form.Item label="陪同人电话" name="companionPhone">
              <Input
                v-model:value="formModel.companionPhone"
                placeholder="请输入陪同人电话"
                allow-clear
              />
            </Form.Item>

            <Form.Item label="陪同人关系" name="companionRelation">
              <Input
                v-model:value="formModel.companionRelation"
                placeholder="请输入陪同人关系"
                allow-clear
              />
            </Form.Item>

            <Form.Item label="籍贯" name="nativePlace">
              <Input
                v-model:value="formModel.nativePlace"
                placeholder="请输入籍贯"
                allow-clear
              />
            </Form.Item>

            <Form.Item label="家庭地址" name="homeAddress">
              <Input.TextArea
                v-model:value="formModel.homeAddress"
                :rows="2"
                placeholder="请输入家庭地址"
                allow-clear
              />
            </Form.Item>

            <Form.Item label="证件类型" name="idType">
              <InputNumber
                v-model:value="formModel.idType"
                placeholder="请输入证件类型"
                style="width: 100%"
              />
            </Form.Item>

            <Form.Item label="证件号码" name="idNumber">
              <Input
                v-model:value="formModel.idNumber"
                placeholder="请输入证件号码"
                allow-clear
              />
            </Form.Item>

            <Form.Item label="国籍" name="nationality">
              <Input
                v-model:value="formModel.nationality"
                placeholder="请输入国籍"
                allow-clear
              />
            </Form.Item>

            <Form.Item label="公司" name="company">
              <Input
                v-model:value="formModel.company"
                placeholder="请输入公司"
                allow-clear
              />
            </Form.Item>

            <Form.Item label="职业" name="occupation">
              <Input
                v-model:value="formModel.occupation"
                placeholder="请输入职业"
                allow-clear
              />
            </Form.Item>

            <Form.Item label="邮箱" name="email">
              <Input
                v-model:value="formModel.email"
                placeholder="请输入邮箱"
                allow-clear
              />
            </Form.Item>

            <Form.Item label="客户来源" name="customerSource">
              <InputNumber
                v-model:value="formModel.customerSource"
                placeholder="请输入客户来源"
                style="width: 100%"
              />
            </Form.Item>

            <Form.Item label="推荐人姓名" name="referrerName">
              <Input
                v-model:value="formModel.referrerName"
                placeholder="请输入推荐人姓名"
                allow-clear
              />
            </Form.Item>

            <Form.Item label="推荐人电话" name="referrerPhone">
              <Input
                v-model:value="formModel.referrerPhone"
                placeholder="请输入推荐人电话"
                allow-clear
              />
            </Form.Item>

            <Form.Item label="身份证正面" name="idcardFront">
              <Input
                v-model:value="formModel.idcardFront"
                placeholder="请输入身份证正面URL"
                allow-clear
              />
            </Form.Item>

            <Form.Item label="身份证反面" name="idcardBack">
              <Input
                v-model:value="formModel.idcardBack"
                placeholder="请输入身份证反面URL"
                allow-clear
              />
            </Form.Item>

            <Form.Item label="备注" name="remark">
              <Input.TextArea
                v-model:value="formModel.remark"
                :rows="4"
                placeholder="请输入备注"
                allow-clear
              />
            </Form.Item>
          </div>
        </div>
      </Form>
    </Modal>
  </div>
</template>


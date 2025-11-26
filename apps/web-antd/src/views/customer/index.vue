<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';

import {
  Button,
  DatePicker,
  Input,
  InputNumber,
  message,
  Modal,
  Pagination,
  Select,
  Table,
  TableColumn,
  Upload,
} from 'ant-design-vue';
import {
  addCustomer,
  deleteCustomer as deleteCustomerApi,
  getCustomersPage,
  getImageById,
  getImagePreviewUrl as getImagePreviewUrlApi,
  updateCustomer as updateCustomerApi,
  uploadImage,
  type ApiCustomer,
  type CustomerPayload,
} from '#/api/customer';

// 客户数据类型定义
interface Customer {
  t_customerid: string;
  customer_name: string;
  employee_number: string;
  birth_date: string;
  age: number;
  phone_area: string;
  phone_number: string;
  wechat: string;
  customer_status: '已入住' | '已出所' | '意向';
  payment_status: '已付清' | '未付' | '部分付款';
  expected_delivery_date: string;
  delivery_date: string;
  delivery_method: '剖宫产' | '顺产';
  parity: number;
  fetus_type: '单胎' | '双胎' | '多胎';
  baby_gender: '女' | '男';
  delivery_hospital: string;
  stay_times: number;
  t_room_id: string;
  register_time: string;
  contract_sign_time: string;
  checkin_time: string;
  checkout_time: string;
  t_branch_id: string;
  sales_employees_id: string;
  register_employees_id: string;
  emergency_name: string;
  emergency_phone: string;
  emergency_relation: string;
  companion_name: string;
  companion_phone: string;
  companion_relation: string;
  native_place: string;
  home_address: string;
  id_type: '护照' | '身份证' | '驾驶证';
  id_number: string;
  nationality: string;
  company: string;
  occupation: string;
  email: string;
  customer_source: '介绍' | '广告' | '网络' | '自来客';
  referrer_name: string;
  referrer_phone: string;
  idcard_front: string;
  idcard_back: string;
  remark: string;
  created_at: string;
  updated_at: string;
}

const createEmptyCustomer = (): Customer => ({
  t_customerid: '',
  customer_name: '',
  employee_number: '男',
  birth_date: '',
  age: 0,
  phone_area: '',
  phone_number: '',
  wechat: '',
  customer_status: '意向',
  payment_status: '未付',
  expected_delivery_date: '',
  delivery_date: '',
  delivery_method: '顺产',
  parity: 1,
  fetus_type: '单胎',
  baby_gender: '男',
  delivery_hospital: '',
  stay_times: 1,
  t_room_id: '',
  register_time: '',
  contract_sign_time: '',
  checkin_time: '',
  checkout_time: '',
  t_branch_id: '',
  sales_employees_id: '',
  register_employees_id: '',
  emergency_name: '',
  emergency_phone: '',
  emergency_relation: '',
  companion_name: '',
  companion_phone: '',
  companion_relation: '',
  native_place: '',
  home_address: '',
  id_type: '身份证',
  id_number: '',
  nationality: '',
  company: '',
  occupation: '',
  email: '',
  customer_source: '自来客',
  referrer_name: '',
  referrer_phone: '',
  idcard_front: '',
  idcard_back: '',
  remark: '',
  created_at: '',
  updated_at: '',
});

const DATE_FORMAT = 'YYYY-MM-DD';

const customerFieldMap: Record<keyof Customer, string> = {
  t_customerid: 'tCustomerId',
  customer_name: 'customerName',
  employee_number: 'employeeNumber',
  birth_date: 'birthDate',
  age: 'age',
  phone_area: 'phoneArea',
  phone_number: 'phoneNumber',
  wechat: 'wechat',
  customer_status: 'customerStatus',
  payment_status: 'paymentStatus',
  expected_delivery_date: 'expectedDeliveryDate',
  delivery_date: 'deliveryDate',
  delivery_method: 'deliveryMethod',
  parity: 'parity',
  fetus_type: 'fetusType',
  baby_gender: 'babyGender',
  delivery_hospital: 'deliveryHospital',
  stay_times: 'stayTimes',
  t_room_id: 'tRoomId',
  register_time: 'registerTime',
  contract_sign_time: 'contractSignTime',
  checkin_time: 'checkinTime',
  checkout_time: 'checkoutTime',
  t_branch_id: 'tBranchId',
  sales_employees_id: 'salesEmployeesId',
  register_employees_id: 'registerEmployeesId',
  emergency_name: 'emergencyName',
  emergency_phone: 'emergencyPhone',
  emergency_relation: 'emergencyRelation',
  companion_name: 'companionName',
  companion_phone: 'companionPhone',
  companion_relation: 'companionRelation',
  native_place: 'nativePlace',
  home_address: 'homeAddress',
  id_type: 'idType',
  id_number: 'idNumber',
  nationality: 'nationality',
  company: 'company',
  occupation: 'occupation',
  email: 'email',
  customer_source: 'customerSource',
  referrer_name: 'referrerName',
  referrer_phone: 'referrerPhone',
  idcard_front: 'idCardFront',
  idcard_back: 'idCardBack',
  remark: 'remark',
  created_at: 'createdAt',
  updated_at: 'updatedAt',
};

const customerFieldKeys = Object.keys(customerFieldMap) as (keyof Customer)[];

const mapApiCustomerToLocal = (apiCustomer: ApiCustomer): Customer => {
  const local = createEmptyCustomer();
  customerFieldKeys.forEach((localKey) => {
    const apiKey = customerFieldMap[localKey];
    const value = (apiCustomer as Record<string, unknown>)[apiKey];
    // 直接使用接口返回的原始值，不做任何格式化处理（包括时间字段）
    (local as Record<string, unknown>)[localKey] =
      value ?? (local as Record<string, unknown>)[localKey];
  });
  return local;
};

const mapLocalCustomerToApiPayload = (customer: Partial<Customer>) => {
  const payload: Record<string, unknown> = {};
  customerFieldKeys.forEach((localKey) => {
    const apiKey = customerFieldMap[localKey];
    const value = customer[localKey];
    if (
      value !== undefined &&
      value !== null &&
      !(typeof value === 'string' && value.trim() === '')
    ) {
      payload[apiKey] = value;
    }
  });
  return payload;
};

const requiredCustomerFields: (keyof Customer)[] = [
  'customer_name',
  'employee_number',
  'phone_number',
  't_branch_id',
];

// 响应式数据
const customers = ref<Customer[]>([]);
const loading = ref(false);
const selectedRowKeys = ref<string[]>([]);

// 弹窗相关
const modalVisible = ref(false);
const modalTitle = ref('新增客户');
const isEditing = ref(false);
const currentCustomerId = ref('');
const submitLoading = ref(false);

// 身份证图片上传
const idcardFrontList = ref<any[]>([]);
const idcardBackList = ref<any[]>([]);

// 文件上传前处理
const beforeUpload = (file: File) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
  if (!isJpgOrPng) {
    message.error('只能上传 JPG/PNG 格式的图片!');
    return false;
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error('图片大小不能超过 2MB!');
    return false;
  }
  return true;
};

// 处理身份证正面图片上传
const handleIdcardFrontUpload = async (options: any) => {
  const { file, onSuccess, onError } = options;
  try {
    const imageId = await uploadImage(file);
    // 将图片ID保存到表单
    customerForm.idcard_front = imageId;
    // 更新文件列表，显示上传成功
    idcardFrontList.value = [
      {
        uid: file.uid,
        name: file.name,
        status: 'done',
        imageId,
      },
    ];
    onSuccess?.();
    message.success('身份证正面图片上传成功');
  } catch (error) {
    console.error('身份证正面图片上传失败：', error);
    message.error(
      error instanceof Error ? error.message : '身份证正面图片上传失败',
    );
    onError?.(error);
  }
};

// 处理身份证反面图片上传
const handleIdcardBackUpload = async (options: any) => {
  const { file, onSuccess, onError } = options;
  try {
    const imageId = await uploadImage(file);
    // 将图片ID保存到表单
    customerForm.idcard_back = imageId;
    // 更新文件列表，显示上传成功
    idcardBackList.value = [
      {
        uid: file.uid,
        name: file.name,
        status: 'done',
        imageId,
      },
    ];
    onSuccess?.();
    message.success('身份证反面图片上传成功');
  } catch (error) {
    console.error('身份证反面图片上传失败：', error);
    message.error(
      error instanceof Error ? error.message : '身份证反面图片上传失败',
    );
    onError?.(error);
  }
};

// 通过图片ID获取Base64并转换为预览URL（用于显示）
const getImagePreviewUrl = async (imageId: string): Promise<string> => {
  try {
    const base64Data = await getImageById(imageId);
    // 如果返回的Base64数据不包含data:image前缀，添加它
    if (base64Data.startsWith('data:image')) {
      return base64Data;
    }
    // 假设返回的是纯Base64字符串，需要判断图片格式
    // 默认使用jpeg格式
    return `data:image/jpeg;base64,${base64Data}`;
  } catch (error) {
    console.error('获取图片失败：', error);
    return '';
  }
};

// 加载编辑时的图片预览
const loadImagePreview = async (imageId: string, type: 'front' | 'back') => {
  try {
    const previewUrl = await getImagePreviewUrl(imageId);
    if (previewUrl) {
      if (type === 'front') {
        idcardFrontList.value = [
          {
            uid: '-1',
            name: '身份证正面',
            status: 'done',
            url: previewUrl,
            imageId,
          },
        ];
      } else {
        idcardBackList.value = [
          {
            uid: '-2',
            name: '身份证反面',
            status: 'done',
            url: previewUrl,
            imageId,
          },
        ];
      }
    }
  } catch (error) {
    console.error('加载图片预览失败：', error);
  }
};

// 在新窗口打开图片预览
const openImagePreview = async (imageId: string) => {
  try {
    const previewUrl = await getImagePreviewUrlApi(imageId);
    if (previewUrl) {
      // 在新窗口打开blob URL
      window.open(previewUrl, '_blank');
    }
  } catch (error) {
    console.error('打开图片预览失败：', error);
    message.error('打开图片预览失败');
  }
};

// 处理身份证正面图片删除
const handleIdcardFrontRemove = () => {
  customerForm.idcard_front = '';
  idcardFrontList.value = [];
  return true;
};

// 处理身份证反面图片删除
const handleIdcardBackRemove = () => {
  customerForm.idcard_back = '';
  idcardBackList.value = [];
  return true;
};

// 客户表单数据
const customerForm = reactive<Customer>(createEmptyCustomer());

// 搜索条件
const searchForm = reactive({
  customer_name: '',
  phone_number: '',
  t_room_id: '',
  customer_status: '' as '' | '已入住' | '已出所' | '意向',
  payment_status: '' as '' | '已付清' | '未付' | '部分付款',
  checkin_time_range: undefined as [string, string] | undefined,
});

// 搜索模块展开状态
const searchExpanded = ref(true);

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
});

const buildPageParams = () => {
  const [checkinStart, checkinEnd] = searchForm.checkin_time_range ?? [];
  return {
    pageIndex: pagination.current,
    pageSize: pagination.pageSize,
    customerName: searchForm.customer_name || undefined,
    phoneNumber: searchForm.phone_number || undefined,
    customerStatus: searchForm.customer_status || undefined,
    paymentStatus: searchForm.payment_status || undefined,
    tRoomId: searchForm.t_room_id || undefined,
    checkinTimeStart: checkinStart,
    checkinTimeEnd: checkinEnd,
  };
};

const requiredFieldLabels: Record<
  (typeof requiredCustomerFields)[number],
  string
> = {
  customer_name: '客户姓名',
  employee_number: '性别',
  phone_number: '联系电话',
  t_branch_id: '分店ID',
};

const validateCustomerForm = () => {
  for (const field of requiredCustomerFields) {
    const value = customerForm[field];
    if (
      value === undefined ||
      value === null ||
      (typeof value === 'string' && value.trim() === '')
    ) {
      message.error(`${requiredFieldLabels[field]}为必填项`);
      return false;
    }
  }
  return true;
};

const loadCustomers = async () => {
  loading.value = true;
  try {
    const response = await getCustomersPage(buildPageParams());
    const items = response?.items ?? [];
    customers.value = items.map((item) => mapApiCustomerToLocal(item));
    pagination.total = response?.totalCount ?? items.length;
    pagination.current = response?.pageIndex ?? pagination.current;
    pagination.pageSize = response?.pageSize ?? pagination.pageSize;
    selectedRowKeys.value = [];
  } catch (error) {
    console.error(error);
    message.error(
      error instanceof Error ? error.message : '获取客户列表失败',
    );
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  pagination.current = 1;
  loadCustomers();
};

const handleReset = () => {
  Object.assign(searchForm, {
    customer_name: '',
    phone_number: '',
    t_room_id: '',
    customer_status: '',
    payment_status: '',
    checkin_time_range: undefined,
  });
  pagination.current = 1;
  pagination.pageSize = 10;
  loadCustomers();
};

// 切换搜索模块展开状态
const toggleSearchExpanded = () => {
  searchExpanded.value = !searchExpanded.value;
};

// 删除客户
const handleDelete = (id: string) => {
  Modal.confirm({
    title: '确认删除',
    content: '确定要删除这个客户吗？',
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      try {
        await deleteCustomerApi(id);
        message.success('客户删除成功');
        await loadCustomers();
      } catch (error) {
        message.error(
          error instanceof Error ? error.message : '客户删除失败',
        );
        throw error;
      }
    },
  });
};

// 新增客户
const handleAdd = () => {
  modalTitle.value = '新增客户';
  isEditing.value = false;
  currentCustomerId.value = '';

  // 重置表单
  Object.assign(customerForm, createEmptyCustomer());

  // 重置图片上传
  idcardFrontList.value = [];
  idcardBackList.value = [];

  modalVisible.value = true;
};

// 编辑客户
const handleEdit = async (record: Customer) => {
  modalTitle.value = '编辑客户';
  isEditing.value = true;
  currentCustomerId.value = record.t_customerid;

  // 填充表单数据
  Object.assign(customerForm, createEmptyCustomer(), record);

  // 设置图片上传（如果有图片ID，通过接口获取Base64显示）
  if (record.idcard_front) {
    await loadImagePreview(record.idcard_front, 'front');
  } else {
    idcardFrontList.value = [];
  }

  if (record.idcard_back) {
    await loadImagePreview(record.idcard_back, 'back');
  } else {
    idcardBackList.value = [];
  }

  modalVisible.value = true;
};

// 保存客户
const handleSave = async () => {
  if (!validateCustomerForm()) {
    return;
  }

  submitLoading.value = true;
  try {
    const payload = mapLocalCustomerToApiPayload(
      customerForm,
    ) as CustomerPayload;
    if (isEditing.value) {
      await updateCustomerApi(currentCustomerId.value, payload);
      message.success('客户信息更新成功');
    } else {
      await addCustomer(payload);
      message.success('客户添加成功');
    }
    modalVisible.value = false;
    await loadCustomers();
  } catch (error) {
    console.error(error);
    message.error(error instanceof Error ? error.message : '保存客户失败');
  } finally {
    submitLoading.value = false;
  }
};

// 关闭弹窗
const handleCancel = () => {
  modalVisible.value = false;
};

// 批量删除
const handleBatchDelete = () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请选择要删除的客户');
    return;
  }

  Modal.confirm({
    title: '确认删除',
    content: `确定要删除选中的 ${selectedRowKeys.value.length} 个客户吗？`,
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      try {
        await Promise.all(
          selectedRowKeys.value.map((id) => deleteCustomerApi(String(id))),
        );
        selectedRowKeys.value = [];
        message.success('批量删除成功');
        await loadCustomers();
      } catch (error) {
        console.error(error);
        message.error(
          error instanceof Error ? error.message : '批量删除失败',
        );
        throw error;
      }
    },
  });
};

// 行选择变化
const onSelectChange = (selectedKeys: (number | string)[]) => {
  selectedRowKeys.value = selectedKeys as string[];
};

// 分页变化
const onPageChange = (page: number, pageSize: number) => {
  pagination.current = page;
  pagination.pageSize = pageSize;
  loadCustomers();
};

// 初始化
onMounted(() => {
  loadCustomers();
});
</script>

<template>
  <div class="p-4">
    <h1 class="mb-4 text-2xl font-bold">客户管理</h1>

    <!-- 搜索模块 -->
    <div
      class="mb-4 rounded-lg bg-white p-6 shadow"
      :class="searchExpanded ? 'h-auto' : 'h-20'"
    >
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold">搜索条件</h2>
        <Button type="link" @click="toggleSearchExpanded">
          {{ searchExpanded ? '收起' : '展开' }}
        </Button>
      </div>
      <div v-if="searchExpanded" class="mt-4 flex flex-wrap items-end gap-4">
        <div class="w-32">
          <label class="mb-2 block text-sm font-medium">姓名</label>
          <Input
            v-model:value="searchForm.customer_name"
            placeholder="请输入姓名"
            allow-clear
          />
        </div>
        <div class="w-32">
          <label class="mb-2 block text-sm font-medium">电话</label>
          <Input
            v-model:value="searchForm.phone_number"
            placeholder="请输入电话"
            allow-clear
          />
        </div>
        <div class="w-32">
          <label class="mb-2 block text-sm font-medium">房号</label>
          <Input
            v-model:value="searchForm.t_room_id"
            placeholder="请输入房号"
            allow-clear
          />
        </div>
        <div class="w-24">
          <label class="mb-2 block text-sm font-medium">客户状态</label>
          <Select
            v-model:value="searchForm.customer_status"
            placeholder="客户状态"
            allow-clear
            style="width: 100%"
          >
            <Select.Option value="意向">意向</Select.Option>
            <Select.Option value="已入住">已入住</Select.Option>
            <Select.Option value="已出所">已出所</Select.Option>
          </Select>
        </div>
        <div class="w-32">
          <label class="mb-2 block text-sm font-medium">付款状态</label>
          <Select
            v-model:value="searchForm.payment_status"
            placeholder="付款状态"
            allow-clear
            style="width: 100%"
          >
            <Select.Option value="未付">未付</Select.Option>
            <Select.Option value="部分付款">部分付款</Select.Option>
            <Select.Option value="已付清">已付清</Select.Option>
          </Select>
        </div>
        <div class="w-64">
          <label class="mb-2 block text-sm font-medium">入住时间段</label>
          <DatePicker.RangePicker
            v-model:value="searchForm.checkin_time_range"
            :value-format="DATE_FORMAT"
            :placeholder="['开始日期', '结束日期']"
            style="width: 100%"
          />
        </div>
        <div class="flex gap-2">
          <Button type="primary" @click="handleSearch">搜索</Button>
          <Button @click="handleReset">重置</Button>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="mb-4 flex justify-between">
      <div class="flex gap-2">
        <Button type="primary" @click="handleAdd">新增客户</Button>
        <Button
          danger
          @click="handleBatchDelete"
          :disabled="selectedRowKeys.length === 0"
        >
          批量删除
        </Button>
      </div>
      <div>已选择 {{ selectedRowKeys.length }} 项</div>
    </div>

    <!-- 客户列表 -->
    <div class="rounded-lg bg-white p-6 shadow">
      <Table
        :data-source="customers"
        :loading="loading"
        :row-selection="{
          selectedRowKeys,
          onChange: onSelectChange,
          checkStrictly: false,
        }"
        :pagination="false"
        :scroll="{ x: 'max-content' }"
        row-key="t_customerid"
      >
        <TableColumn
          title="客户姓名"
          data-index="customer_name"
          key="customer_name"
          :width="100"
        />
        <TableColumn title="年龄" data-index="age" key="age" :width="60" />
        <TableColumn
          title="电话号码"
          data-index="phone_number"
          key="phone_number"
          :width="80"
        />
        <TableColumn
          title="房间号"
          data-index="t_room_id"
          key="t_room_id"
          :width="80"
        />
        <TableColumn
          title="客户状态"
          data-index="customer_status"
          key="customer_status"
          :width="100"
        />
        <TableColumn
          title="付款状态"
          data-index="payment_status"
          key="payment_status"
          :width="100"
        />
        <TableColumn
          title="预产期"
          data-index="expected_delivery_date"
          key="expected_delivery_date"
          :width="120"
        />
        <TableColumn
          title="分娩时间"
          data-index="delivery_date"
          key="delivery_date"
          :width="120"
        />
        <TableColumn
          title="分娩方式"
          data-index="delivery_method"
          key="delivery_method"
          :width="100"
        />
        <TableColumn
          title="胎次"
          data-index="parity"
          key="parity"
          :width="60"
        />
        <TableColumn
          title="胎型"
          data-index="fetus_type"
          key="fetus_type"
          :width="60"
        />
        <TableColumn
          title="宝宝性别"
          data-index="baby_gender"
          key="baby_gender"
          :width="100"
        />
        <TableColumn title="操作" key="action" :width="120">
          <template #default="{ record }">
            <Button type="link" size="small" @click="handleEdit(record)">
              编辑
            </Button>
            <Button
              type="link"
              size="small"
              danger
              @click="handleDelete(record.t_customerid)"
            >
              删除
            </Button>
          </template>
        </TableColumn>
      </Table>

      <!-- 分页 -->
      <div class="mt-4 flex justify-end">
        <Pagination
          v-model:current="pagination.current"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          show-size-changer
          show-quick-jumper
          @change="onPageChange"
        />
      </div>
    </div>

    <!-- 客户表单弹窗 -->
    <Modal
      v-model:open="modalVisible"
      :title="modalTitle"
      :width="800"
      :footer="null"
      :mask-closable="false"
      :keyboard="false"
    >
      <div class="max-h-[70vh] overflow-y-auto">
        <div class="grid grid-cols-2 gap-4 pb-20">
          <!-- 基础信息 -->
          <div class="col-span-2">
            <h3 class="mb-4 text-lg font-semibold">基础信息</h3>
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium">
              姓名 <span class="text-red-500">*</span>
            </label>
            <Input
              v-model:value="customerForm.customer_name"
              placeholder="请输入姓名"
            />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium">
              性别 <span class="text-red-500">*</span>
            </label>
            <Select
              v-model:value="customerForm.employee_number"
              placeholder="请选择性别"
              style="width: 100%"
            >
              <Select.Option value="男">男</Select.Option>
              <Select.Option value="女">女</Select.Option>
            </Select>
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium">出生日期</label>
            <DatePicker
              v-model:value="customerForm.birth_date"
              :value-format="DATE_FORMAT"
              placeholder="请选择出生日期"
              style="width: 100%"
            />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium">年龄</label>
            <InputNumber
              v-model:value="customerForm.age"
              placeholder="请输入年龄"
              style="width: 100%"
            />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium">电话区号</label>
            <Input
              v-model:value="customerForm.phone_area"
              placeholder="请输入电话区号"
            />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium">
              电话号码 <span class="text-red-500">*</span>
            </label>
            <Input
              v-model:value="customerForm.phone_number"
              placeholder="请输入电话号码"
            />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium">微信号</label>
            <Input
              v-model:value="customerForm.wechat"
              placeholder="请输入微信号"
            />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium">客户状态</label>
            <Select
              v-model:value="customerForm.customer_status"
              placeholder="请选择客户状态"
              style="width: 100%"
            >
              <Select.Option value="意向">意向</Select.Option>
              <Select.Option value="已入住">已入住</Select.Option>
              <Select.Option value="已出所">已出所</Select.Option>
            </Select>
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium">付款状态</label>
            <Select
              v-model:value="customerForm.payment_status"
              placeholder="请选择付款状态"
              style="width: 100%"
            >
              <Select.Option value="未付">未付</Select.Option>
              <Select.Option value="部分付款">部分付款</Select.Option>
              <Select.Option value="已付清">已付清</Select.Option>
            </Select>
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium">预产期</label>
            <DatePicker
              v-model:value="customerForm.expected_delivery_date"
              :value-format="DATE_FORMAT"
              placeholder="请选择预产期"
              style="width: 100%"
            />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium">分娩时间</label>
            <DatePicker
              v-model:value="customerForm.delivery_date"
              :value-format="DATE_FORMAT"
              placeholder="请选择分娩时间"
              style="width: 100%"
            />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium">分娩方式</label>
            <Select
              v-model:value="customerForm.delivery_method"
              placeholder="请选择分娩方式"
              style="width: 100%"
            >
              <Select.Option value="顺产">顺产</Select.Option>
              <Select.Option value="剖宫产">剖宫产</Select.Option>
            </Select>
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium">胎次</label>
            <InputNumber
              v-model:value="customerForm.parity"
              placeholder="请输入胎次"
              style="width: 100%"
            />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium">胎型</label>
            <Select
              v-model:value="customerForm.fetus_type"
              placeholder="请选择胎型"
              style="width: 100%"
            >
              <Select.Option value="单胎">单胎</Select.Option>
              <Select.Option value="双胎">双胎</Select.Option>
              <Select.Option value="多胎">多胎</Select.Option>
            </Select>
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium">宝宝性别</label>
            <Select
              v-model:value="customerForm.baby_gender"
              placeholder="请选择宝宝性别"
              style="width: 100%"
            >
              <Select.Option value="男">男</Select.Option>
              <Select.Option value="女">女</Select.Option>
            </Select>
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium">分娩医院</label>
            <Input
              v-model:value="customerForm.delivery_hospital"
              placeholder="请输入分娩医院"
            />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium">入住次数</label>
            <InputNumber
              v-model:value="customerForm.stay_times"
              placeholder="请输入入住次数"
              style="width: 100%"
            />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium">房号</label>
            <Input
              v-model:value="customerForm.t_room_id"
              placeholder="请输入房号"
            />
          </div>

          <!-- 时间信息 -->
          <div class="col-span-2 mt-4">
            <h3 class="mb-4 text-lg font-semibold">时间信息</h3>
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium">登记时间</label>
            <DatePicker
              v-model:value="customerForm.register_time"
              :value-format="DATE_FORMAT"
              placeholder="请选择登记时间"
              style="width: 100%"
            />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium">签订合同时间</label>
            <DatePicker
              v-model:value="customerForm.contract_sign_time"
              :value-format="DATE_FORMAT"
              placeholder="请选择签订合同时间"
              style="width: 100%"
            />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium">入住时间</label>
            <DatePicker
              v-model:value="customerForm.checkin_time"
              :value-format="DATE_FORMAT"
              placeholder="请选择入住时间"
              style="width: 100%"
            />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium">出所时间</label>
            <DatePicker
              v-model:value="customerForm.checkout_time"
              :value-format="DATE_FORMAT"
              placeholder="请选择出所时间"
              style="width: 100%"
            />
          </div>

          <!-- 关联信息 -->
          <div class="col-span-2 mt-4">
            <h3 class="mb-4 text-lg font-semibold">关联信息</h3>
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium">
              分店ID <span class="text-red-500">*</span>
            </label>
            <Input
              v-model:value="customerForm.t_branch_id"
              placeholder="请输入分店ID"
            />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium">销售员工ID</label>
            <Input
              v-model:value="customerForm.sales_employees_id"
              placeholder="请输入销售员工ID"
            />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium">登记员工ID</label>
            <Input
              v-model:value="customerForm.register_employees_id"
              placeholder="请输入登记员工ID"
            />
          </div>

          <!-- 紧急联系人信息 -->
          <div class="col-span-2 mt-4">
            <h3 class="mb-4 text-lg font-semibold">紧急联系人信息</h3>
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium">紧急联系人姓名</label>
            <Input
              v-model:value="customerForm.emergency_name"
              placeholder="请输入紧急联系人姓名"
            />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium">紧急联系人电话</label>
            <Input
              v-model:value="customerForm.emergency_phone"
              placeholder="请输入紧急联系人电话"
            />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium">紧急联系人关系</label>
            <Input
              v-model:value="customerForm.emergency_relation"
              placeholder="请输入紧急联系人关系"
            />
          </div>

          <!-- 陪护人信息 -->
          <div class="col-span-2 mt-4">
            <h3 class="mb-4 text-lg font-semibold">陪护人信息</h3>
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium">陪护人姓名</label>
            <Input
              v-model:value="customerForm.companion_name"
              placeholder="请输入陪护人姓名"
            />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium">陪护人电话</label>
            <Input
              v-model:value="customerForm.companion_phone"
              placeholder="请输入陪护人电话"
            />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium">陪护人关系</label>
            <Input
              v-model:value="customerForm.companion_relation"
              placeholder="请输入陪护人关系"
            />
          </div>

          <!-- 个人详细信息 -->
          <div class="col-span-2 mt-4">
            <h3 class="mb-4 text-lg font-semibold">个人详细信息</h3>
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium">籍贯</label>
            <Input
              v-model:value="customerForm.native_place"
              placeholder="请输入籍贯"
            />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium">家庭住址</label>
            <Input
              v-model:value="customerForm.home_address"
              placeholder="请输入家庭住址"
            />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium">证件类型</label>
            <Select
              v-model:value="customerForm.id_type"
              placeholder="请选择证件类型"
              style="width: 100%"
            >
              <Select.Option value="身份证">身份证</Select.Option>
              <Select.Option value="驾驶证">驾驶证</Select.Option>
              <Select.Option value="护照">护照</Select.Option>
            </Select>
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium">证件号</label>
            <Input
              v-model:value="customerForm.id_number"
              placeholder="请输入证件号"
            />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium">民族</label>
            <Input
              v-model:value="customerForm.nationality"
              placeholder="请输入民族"
            />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium">工作单位</label>
            <Input
              v-model:value="customerForm.company"
              placeholder="请输入工作单位"
            />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium">职业</label>
            <Input
              v-model:value="customerForm.occupation"
              placeholder="请输入职业"
            />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium">邮箱</label>
            <Input
              v-model:value="customerForm.email"
              placeholder="请输入邮箱"
            />
          </div>

          <!-- 客户来源信息 -->
          <div class="col-span-2 mt-4">
            <h3 class="mb-4 text-lg font-semibold">客户来源信息</h3>
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium">客户来源</label>
            <Select
              v-model:value="customerForm.customer_source"
              placeholder="请选择客户来源"
              style="width: 100%"
            >
              <Select.Option value="广告">广告</Select.Option>
              <Select.Option value="介绍">介绍</Select.Option>
              <Select.Option value="网络">网络</Select.Option>
              <Select.Option value="自来客">自来客</Select.Option>
            </Select>
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium">介绍人姓名</label>
            <Input
              v-model:value="customerForm.referrer_name"
              placeholder="请输入介绍人姓名"
            />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium">介绍人电话</label>
            <Input
              v-model:value="customerForm.referrer_phone"
              placeholder="请输入介绍人电话"
            />
          </div>

          <!-- 其他信息 -->
          <div class="col-span-2 mt-4">
            <h3 class="mb-4 text-lg font-semibold">其他信息</h3>
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium">身份证正面图片</label>
            <Upload
              v-model:file-list="idcardFrontList"
              list-type="picture-card"
              :before-upload="beforeUpload"
              :custom-request="handleIdcardFrontUpload"
              :on-remove="handleIdcardFrontRemove"
              :on-preview="(file: any) => {
                if (file.imageId) {
                  openImagePreview(file.imageId);
                } else if (file.url) {
                  window.open(file.url, '_blank');
                }
              }"
              :max-count="1"
              accept="image/*"
            >
              <div v-if="idcardFrontList.length < 1">
                <div class="ant-upload-text">上传</div>
              </div>
            </Upload>
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium">身份证反面图片</label>
            <Upload
              v-model:file-list="idcardBackList"
              list-type="picture-card"
              :before-upload="beforeUpload"
              :custom-request="handleIdcardBackUpload"
              :on-remove="handleIdcardBackRemove"
              :on-preview="(file: any) => {
                if (file.imageId) {
                  openImagePreview(file.imageId);
                } else if (file.url) {
                  window.open(file.url, '_blank');
                }
              }"
              :max-count="1"
              accept="image/*"
            >
              <div v-if="idcardBackList.length < 1">
                <div class="ant-upload-text">上传</div>
              </div>
            </Upload>
          </div>
          <div class="col-span-2">
            <label class="mb-2 block text-sm font-medium">备注</label>
            <Input.TextArea
              v-model:value="customerForm.remark"
              placeholder="请输入备注信息"
              :rows="3"
            />
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div
        class="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white p-4"
      >
        <div class="flex justify-end gap-2">
          <Button @click="handleCancel">取消</Button>
          <Button type="primary" :loading="submitLoading" @click="handleSave">
            保存
          </Button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import {
  getBabyListApi,
  createBabyApi,
  getBabyDetailApi,
  updateBabyApi,
  deleteBabyApi,
  type BabyItem,
  type BabyListParams,
  type CreateBabyParams,
  type UpdateBabyParams,
} from '#/api';

import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
} from 'ant-design-vue';
import type { FormInstance } from 'ant-design-vue';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

// 宝宝性别选项
const babyGenderOptions = [
  { label: '男', value: 1 },
  { label: '女', value: 2 },
  { label: '未知', value: 3 },
];

// 创建类型选项：1 客户ID 2 合同ID
const createdByTypeOptions = [
  { label: '客户ID', value: 1 },
  { label: '合同ID', value: 2 },
];

// 血型选项
const bloodTypeOptions = [
  { label: 'A型', value: 1 },
  { label: 'B型', value: 2 },
  { label: 'O型', value: 3 },
  { label: 'AB型', value: 4 },
  { label: 'RH型', value: 5 },
  { label: '未知', value: 99 },
];

const loading = ref(false);
const dataSource = ref<BabyItem[]>([]);
const total = ref(0);

const queryForm = ref<BabyListParams>({
  BabyName: undefined,
  BirthdayStart: undefined,
  BirthdayEnd: undefined,
  CreatedAtStart: undefined,
  CreatedAtEnd: undefined,
  PageIndex: 1,
  PageSize: 10,
  OrderBy: undefined,
  IsAsc: true,
});

const birthdayDateRange = ref<[Dayjs | null, Dayjs | null]>([null, null]);
const createDateRange = ref<[Dayjs | null, Dayjs | null]>([null, null]);

const columns = [
  {
    title: '客户ID',
    dataIndex: 'tCustomerId',
    key: 'tCustomerId',
    width: 150,
  },
  {
    title: '合同编号',
    dataIndex: 'tContractId',
    key: 'tContractId',
    width: 150,
  },
  {
    title: '宝宝名字',
    dataIndex: 'babyName',
    key: 'babyName',
    width: 120,
  },
  {
    title: '宝宝性别',
    dataIndex: 'babyGenderText',
    key: 'babyGenderText',
    width: 100,
  },
  {
    title: '第几胎',
    dataIndex: 'babyOrder',
    key: 'babyOrder',
    width: 100,
  },
  {
    title: '出生日期',
    dataIndex: 'birthday',
    key: 'birthday',
    width: 160,
  },
  {
    title: '出生医院',
    dataIndex: 'birthHospital',
    key: 'birthHospital',
    width: 150,
  },
  {
    title: '血型',
    dataIndex: 'bloodTypeText',
    key: 'bloodTypeText',
    width: 100,
  },
  {
    title: '头围(cm)',
    dataIndex: 'headCircumference',
    key: 'headCircumference',
    width: 100,
  },
  {
    title: '身长(cm)',
    dataIndex: 'bodyLength',
    key: 'bodyLength',
    width: 100,
  },
  {
    title: '体重(kg)',
    dataIndex: 'weight',
    key: 'weight',
    width: 100,
  },
  {
    title: '胸围(cm)',
    dataIndex: 'chestCircumference',
    key: 'chestCircumference',
    width: 100,
  },
  {
    title: '奶量',
    dataIndex: 'milkIntake',
    key: 'milkIntake',
    width: 120,
  },
  {
    title: '与宝宝关系',
    dataIndex: 'relationshipWithBaby',
    key: 'relationshipWithBaby',
    width: 120,
  },
  {
    title: '入住时间',
    dataIndex: 'checkinTime',
    key: 'checkinTime',
    width: 160,
  },
  {
    title: '离店时间',
    dataIndex: 'checkoutTime',
    key: 'checkoutTime',
    width: 160,
  },
  {
    title: '入住次数',
    dataIndex: 'stayTimes',
    key: 'stayTimes',
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
    const params: BabyListParams = {
      ...queryForm.value,
    };
    if (birthdayDateRange.value[0]) {
      params.BirthdayStart = birthdayDateRange.value[0].format('YYYY-MM-DD');
    }
    if (birthdayDateRange.value[1]) {
      params.BirthdayEnd = birthdayDateRange.value[1].format('YYYY-MM-DD');
    }
    if (createDateRange.value[0]) {
      params.CreatedAtStart = createDateRange.value[0].format('YYYY-MM-DD');
    }
    if (createDateRange.value[1]) {
      params.CreatedAtEnd = createDateRange.value[1].format('YYYY-MM-DD');
    }

    const { items, total: t } = await getBabyListApi(params);
    dataSource.value = items;
    total.value = t;
  } catch (error: any) {
    const errMsg =
      error?.response?.data?.message || error?.message || '获取宝宝信息列表失败';
    message.error(errMsg);
  } finally {
    loading.value = false;
  }
}

function handleReset() {
  queryForm.value.BabyName = undefined;
  queryForm.value.BirthdayStart = undefined;
  queryForm.value.BirthdayEnd = undefined;
  queryForm.value.CreatedAtStart = undefined;
  queryForm.value.CreatedAtEnd = undefined;
  queryForm.value.PageIndex = 1;
  queryForm.value.PageSize = 10;
  queryForm.value.OrderBy = undefined;
  queryForm.value.IsAsc = true;
  birthdayDateRange.value = [null, null];
  createDateRange.value = [null, null];
  fetchList();
}

function handleTableChange(pagination: any) {
  queryForm.value.PageIndex = pagination.current;
  queryForm.value.PageSize = pagination.pageSize;
  fetchList();
}

// 创建/编辑宝宝信息弹窗相关
const createModalVisible = ref(false);
const submitting = ref(false);
const isEditMode = ref(false);
const editingBabyId = ref<string>('');
const formRef = ref<FormInstance>();
const formModel = ref<CreateBabyParams & { 
  birthday?: Dayjs; 
  checkinTime?: Dayjs; 
  checkoutTime?: Dayjs;
}>({
  createdByType: 1,
  sourceReferenceId: '',
  babyName: '',
  babyGender: 1,
  babyOrder: 0,
  birthday: undefined,
  birthHospital: '',
  bloodType: 99,
  headCircumference: 0,
  bodyLength: 0,
  weight: 0,
  chestCircumference: 0,
  milkIntake: '',
  relationshipWithBaby: '',
  checkinTime: undefined,
  checkoutTime: undefined,
  stayTimes: 0,
  remark: '',
});

const formRules = {
  createdByType: [{ required: true, message: '请选择创建类型' }],
  sourceReferenceId: [{ required: true, message: '请输入来源ID' }],
  babyName: [{ required: true, message: '请输入宝宝名字' }],
  babyGender: [{ required: true, message: '请选择宝宝性别' }],
  babyOrder: [{ required: true, message: '请输入宝宝顺序' }],
  birthday: [{ required: true, message: '请选择出生日期' }],
  relationshipWithBaby: [{ required: true, message: '请选择与宝宝关系' }],
  stayTimes: [{ required: true, message: '请输入入住次数' }],
};

function resetForm() {
  formModel.value = {
    createdByType: 1,
    sourceReferenceId: '',
    babyName: '',
    babyGender: 1,
    babyOrder: 0,
    birthday: undefined as Dayjs | undefined,
    birthHospital: '',
    bloodType: 99,
    headCircumference: 0,
    bodyLength: 0,
    weight: 0,
    chestCircumference: 0,
    milkIntake: '',
    relationshipWithBaby: '',
    checkinTime: undefined as Dayjs | undefined,
    checkoutTime: undefined as Dayjs | undefined,
    stayTimes: 0,
    remark: '',
  };
  formRef.value?.resetFields();
}

function openCreateModal() {
  isEditMode.value = false;
  editingBabyId.value = '';
  createModalVisible.value = true;
  resetForm();
}

async function openEditModal(record: BabyItem) {
  isEditMode.value = true;
  editingBabyId.value = record.id;
  createModalVisible.value = true;
  resetForm();

  try {
    const detail = await getBabyDetailApi(record.id);
    // 计算来源ID：1=客户ID -> tCustomerId；2=合同ID -> tContractId；其他为空
    const createdByType = (detail as any).createdByType || 0;
    let sourceReferenceId = '';
    if (createdByType === 1) {
      sourceReferenceId = detail.tCustomerId || '';
    } else if (createdByType === 2) {
      sourceReferenceId = detail.tContractId || '';
    }

    // 填充表单数据
    formModel.value = {
      createdByType,
      sourceReferenceId,
      babyName: detail.babyName || '',
      babyGender: detail.babyGender,
      babyOrder: detail.babyOrder,
      birthday: detail.birthday ? dayjs(detail.birthday) : undefined,
      birthHospital: detail.birthHospital || '',
      bloodType: detail.bloodType,
      headCircumference: detail.headCircumference,
      bodyLength: detail.bodyLength,
      weight: detail.weight,
      chestCircumference: detail.chestCircumference,
      milkIntake: detail.milkIntake || '',
      relationshipWithBaby: detail.relationshipWithBaby || '',
      checkinTime: detail.checkinTime ? dayjs(detail.checkinTime) : undefined,
      checkoutTime: detail.checkoutTime ? dayjs(detail.checkoutTime) : undefined,
      stayTimes: detail.stayTimes,
      remark: detail.remark || '',
    };
  } catch (error: any) {
    const errMsg =
      error?.response?.data?.message ||
      error?.data?.message ||
      error?.message ||
      '获取宝宝信息详情失败';
    message.error(errMsg);
    createModalVisible.value = false;
  }
}

function closeCreateModal() {
  createModalVisible.value = false;
  isEditMode.value = false;
  editingBabyId.value = '';
  resetForm();
}

async function handleSubmit() {
  try {
    const values = await formRef.value?.validate();
    if (!values) return;
    submitting.value = true;

    // 处理日期字段 - DatePicker 返回的是 dayjs 对象
    const baseData = {
      ...values,
      birthday: values.birthday
        ? (values.birthday as Dayjs).toISOString()
        : undefined,
      checkinTime: values.checkinTime
        ? (values.checkinTime as Dayjs).toISOString()
        : undefined,
      checkoutTime: values.checkoutTime
        ? (values.checkoutTime as Dayjs).toISOString()
        : undefined,
    };

    if (isEditMode.value) {
      // 更新宝宝信息
      const updateData: UpdateBabyParams = {
        ...baseData,
        id: editingBabyId.value,
      };
      await updateBabyApi(updateData);
      message.success('更新宝宝信息成功');
    } else {
      // 创建宝宝信息
      await createBabyApi(baseData);
      message.success('创建宝宝信息成功');
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
      (isEditMode.value ? '更新宝宝信息失败' : '创建宝宝信息失败');
    message.error(errMsg);
    // 阻止错误继续传播到控制台
    return;
  } finally {
    submitting.value = false;
  }
}

async function handleDelete(record: BabyItem) {
  try {
    await deleteBabyApi(record.id);
    message.success('删除宝宝信息成功');
    fetchList();
  } catch (error: any) {
    const errMsg =
      error?.response?.data?.message ||
      error?.data?.message ||
      error?.message ||
      '删除宝宝信息失败';
    message.error(errMsg);
  }
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
          创建宝宝信息
        </Button>
      </div>
      <Space>
        <Input
          v-model:value="queryForm.BabyName"
          allow-clear
          placeholder="宝宝名字"
          style="width: 150px"
        />
        <DatePicker.RangePicker
          v-model:value="birthdayDateRange"
          format="YYYY-MM-DD"
          :placeholder="['出生开始日期', '出生结束日期']"
          style="width: 240px"
        />
        <DatePicker.RangePicker
          v-model:value="createDateRange"
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
      :scroll="{ x: 2000 }"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'birthday'">
          <span v-if="record.birthday">
            {{ new Date(record.birthday).toLocaleString('zh-CN') }}
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
        <template v-else-if="column.key === 'babyGenderText'">
          <span>{{ record.babyGenderText || '—' }}</span>
        </template>
        <template v-else-if="column.key === 'bloodTypeText'">
          <span>{{ record.bloodTypeText || '—' }}</span>
        </template>
        <template v-else-if="column.key === 'headCircumference'">
          <span v-if="record.headCircumference !== null && record.headCircumference !== undefined">
            {{ record.headCircumference }}
          </span>
          <span v-else>—</span>
        </template>
        <template v-else-if="column.key === 'bodyLength'">
          <span v-if="record.bodyLength !== null && record.bodyLength !== undefined">
            {{ record.bodyLength }}
          </span>
          <span v-else>—</span>
        </template>
        <template v-else-if="column.key === 'weight'">
          <span v-if="record.weight !== null && record.weight !== undefined">
            {{ record.weight }}
          </span>
          <span v-else>—</span>
        </template>
        <template v-else-if="column.key === 'chestCircumference'">
          <span v-if="record.chestCircumference !== null && record.chestCircumference !== undefined">
            {{ record.chestCircumference }}
          </span>
          <span v-else>—</span>
        </template>
        <template v-else-if="column.key === 'milkIntake'">
          <span>{{ record.milkIntake || '—' }}</span>
        </template>
        <template v-else-if="column.key === 'relationshipWithBaby'">
          <span>{{ record.relationshipWithBaby || '—' }}</span>
        </template>
        <template v-else-if="column.key === 'remark'">
          <span>{{ record.remark || '—' }}</span>
        </template>
        <template v-else-if="column.key === 'birthHospital'">
          <span>{{ record.birthHospital || '—' }}</span>
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
              <Popconfirm
                title="确定删除该宝宝信息吗？"
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

    <!-- 创建/编辑宝宝信息弹窗 -->
    <Modal
      v-model:open="createModalVisible"
      :title="isEditMode ? '更新宝宝信息' : '创建宝宝信息'"
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
            <Form.Item label="创建类型" name="createdByType">
              <Select
                v-model:value="formModel.createdByType"
                :options="createdByTypeOptions"
                placeholder="请选择创建类型"
                style="width: 100%"
              />
            </Form.Item>

            <Form.Item label="来源ID" name="sourceReferenceId">
              <Input
                v-model:value="formModel.sourceReferenceId"
                placeholder="请输入来源ID"
                allow-clear
              />
            </Form.Item>

            <Form.Item label="宝宝名字" name="babyName">
              <Input
                v-model:value="formModel.babyName"
                placeholder="请输入宝宝名字"
                allow-clear
              />
            </Form.Item>

            <Form.Item label="宝宝性别" name="babyGender">
              <Select
                v-model:value="formModel.babyGender"
                placeholder="请选择宝宝性别"
                :options="babyGenderOptions"
                style="width: 100%"
              />
            </Form.Item>

            <Form.Item label="第几胎" name="babyOrder">
              <InputNumber
                v-model:value="formModel.babyOrder"
                placeholder="请输入第几胎"
                :min="0"
                style="width: 100%"
              />
            </Form.Item>

            <Form.Item label="出生日期" name="birthday">
              <DatePicker
                v-model:value="formModel.birthday"
                show-time
                format="YYYY-MM-DD HH:mm:ss"
                placeholder="请选择出生日期"
                style="width: 100%"
              />
            </Form.Item>

            <Form.Item label="出生医院" name="birthHospital">
              <Input
                v-model:value="formModel.birthHospital"
                placeholder="请输入出生医院"
                allow-clear
              />
            </Form.Item>

            <Form.Item label="血型" name="bloodType">
              <Select
                v-model:value="formModel.bloodType"
                placeholder="请选择血型"
                :options="bloodTypeOptions"
                style="width: 100%"
              />
            </Form.Item>

            <Form.Item label="头围(cm)" name="headCircumference">
              <InputNumber
                v-model:value="formModel.headCircumference"
                placeholder="请输入头围"
                :min="0"
                :precision="2"
                style="width: 100%"
              />
            </Form.Item>

            <Form.Item label="身长(cm)" name="bodyLength">
              <InputNumber
                v-model:value="formModel.bodyLength"
                placeholder="请输入身长"
                :min="0"
                :precision="2"
                style="width: 100%"
              />
            </Form.Item>
          </div>

          <!-- 第二列 -->
          <div>
            <Form.Item label="体重(kg)" name="weight">
              <InputNumber
                v-model:value="formModel.weight"
                placeholder="请输入体重"
                :min="0"
                :precision="2"
                style="width: 100%"
              />
            </Form.Item>

            <Form.Item label="胸围(cm)" name="chestCircumference">
              <InputNumber
                v-model:value="formModel.chestCircumference"
                placeholder="请输入胸围"
                :min="0"
                :precision="2"
                style="width: 100%"
              />
            </Form.Item>

            <Form.Item label="奶量" name="milkIntake">
              <Input
                v-model:value="formModel.milkIntake"
                placeholder="请输入奶量"
                allow-clear
              />
            </Form.Item>

            <Form.Item label="与宝宝关系" name="relationshipWithBaby">
              <Select
                v-model:value="formModel.relationshipWithBaby"
                :options="[
                  { label: '母子', value: '母子' },
                  { label: '父子', value: '父子' },
                  { label: '祖孙', value: '祖孙' },
                ]"
                placeholder="请选择与宝宝关系"
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

            <Form.Item label="离店时间" name="checkoutTime">
              <DatePicker
                v-model:value="formModel.checkoutTime"
                show-time
                format="YYYY-MM-DD HH:mm:ss"
                placeholder="请选择离店时间"
                style="width: 100%"
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


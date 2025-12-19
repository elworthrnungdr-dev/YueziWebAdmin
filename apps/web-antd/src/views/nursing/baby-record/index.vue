<script lang="ts" setup>
import { h, onMounted, ref } from 'vue';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

import {
  getCustomerAssessmentListApi,
  type CustomerAssessmentListParams,
  type CustomerAssessmentItem,
  createCustomerAssessmentApi,
  updateCustomerAssessmentApi,
  deleteCustomerAssessmentApi,
  getCustomerAssessmentDetailApi,
  type CreateCustomerAssessmentParams,
  type UpdateCustomerAssessmentParams,
} from '#/api';

import {
  Button,
  DatePicker,
  Form,
  Input,
  message,
  Modal,
  Select,
  Space,
  Table,
} from 'ant-design-vue';
import type { FormInstance } from 'ant-design-vue';

const loading = ref(false);
const dataSource = ref<CustomerAssessmentItem[]>([]);
const total = ref(0);

// 宝宝护理记录单列表查询固定护理类型 3
const queryForm = ref<CustomerAssessmentListParams>({
  CareDateStart: undefined,
  CareDateEnd: undefined,
  CreatedAtStart: undefined,
  CreatedAtEnd: undefined,
  CareType: 3,
  PageIndex: 1,
  PageSize: 10,
  OrderBy: undefined,
  IsAsc: true,
});

const careDateRange = ref<[Dayjs | null, Dayjs | null]>([null, null]);
const createdDateRange = ref<[Dayjs | null, Dayjs | null]>([null, null]);

const createdByTypeOptions = [
  { label: '客户ID', value: 1 },
  { label: '合同ID', value: 2 },
];

const careTypeOptions = [
  { label: '宝宝护理记录单', value: 3 },
];

const columns = [
  { title: '合同编号', dataIndex: 'contractNo', key: 'contractNo', width: 140 },
  {
    title: '护理类型',
    dataIndex: 'careTypeText',
    key: 'careTypeText',
    width: 140,
  },
  { title: '宝宝ID', dataIndex: 'babyId', key: 'babyId', width: 120 },
  { title: '护理日期', dataIndex: 'careDate', key: 'careDate', width: 180 },
  { title: '护理时间', dataIndex: 'careTime', key: 'careTime', width: 120 },
  { title: '护理内容', dataIndex: 'careContent', key: 'careContent', ellipsis: true, width: 200 },
  { title: '护理数据', dataIndex: 'careData', key: 'careData', ellipsis: true, width: 200 },
  { title: '其他情况', dataIndex: 'otherConditions', key: 'otherConditions', ellipsis: true, width: 200 },
  { title: '护士签名', dataIndex: 'nurseSignature', key: 'nurseSignature', width: 140 },
  { title: '特殊事项记录', dataIndex: 'specialNotes', key: 'specialNotes', ellipsis: true, width: 200 },
  { title: '下次护理时间', dataIndex: 'nextCareTime', key: 'nextCareTime', width: 180 },
  { title: '附件列表', dataIndex: 'attachments', key: 'attachments', ellipsis: true, width: 200 },
  { title: '备注', dataIndex: 'remark', key: 'remark', ellipsis: true, width: 200 },
  { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 170 },
  { title: '更新时间', dataIndex: 'updatedAt', key: 'updatedAt', width: 170 },
  { title: '操作', key: 'actions', fixed: 'right', width: 140 },
];

async function fetchList() {
  try {
    loading.value = true;
    if (careDateRange.value[0] && careDateRange.value[1]) {
      queryForm.value.CareDateStart = careDateRange.value[0].toISOString();
      queryForm.value.CareDateEnd = careDateRange.value[1].toISOString();
    } else {
      queryForm.value.CareDateStart = undefined;
      queryForm.value.CareDateEnd = undefined;
    }

    if (createdDateRange.value[0] && createdDateRange.value[1]) {
      queryForm.value.CreatedAtStart = createdDateRange.value[0].toISOString();
      queryForm.value.CreatedAtEnd = createdDateRange.value[1].toISOString();
    } else {
      queryForm.value.CreatedAtStart = undefined;
      queryForm.value.CreatedAtEnd = undefined;
    }

    const result = await getCustomerAssessmentListApi(queryForm.value);
    dataSource.value = result.items || [];
    total.value = result.total || 0;
  } catch (error: any) {
    const errMsg =
      error?.response?.data?.message ||
      error?.data?.message ||
      error?.message ||
      '获取护理记录列表失败';
    message.error(errMsg);
  } finally {
    loading.value = false;
  }
}

function handleReset() {
  queryForm.value = {
    CareDateStart: undefined,
    CareDateEnd: undefined,
    CreatedAtStart: undefined,
    CreatedAtEnd: undefined,
    // 宝宝护理记录单固定类型 3
    CareType: 3,
    PageIndex: 1,
    PageSize: 10,
    OrderBy: undefined,
    IsAsc: true,
  };
  careDateRange.value = [null, null];
  createdDateRange.value = [null, null];
  fetchList();
}

function handleTableChange(pagination: any) {
  queryForm.value.PageIndex = pagination.current;
  queryForm.value.PageSize = pagination.pageSize;
  fetchList();
}

const createModalVisible = ref(false);
const submitting = ref(false);
const isEditMode = ref(false);
const editingId = ref<string>('');
const formRef = ref<FormInstance>();

type FormModelType = CreateCustomerAssessmentParams & {
  careDate?: Dayjs;
  nextCareTime?: Dayjs;
};

const formModel = ref<FormModelType>({
  createdByType: 1,
  sourceReferenceId: '',
  careType: 3,
  careDate: undefined,
  nurseId: '',
  careContent: '',
  careData: '',
  babyId: '',
  otherConditions: '',
  nurseSignature: '',
  specialNotes: '',
  nextCareTime: undefined,
  attachments: '',
  remark: '',
});

const formRules = {
  createdByType: [{ required: true, message: '请选择创建类型' }],
  sourceReferenceId: [{ required: true, message: '请输入客户ID或合同ID' }],
  careType: [{ required: true, message: '请选择护理类型' }],
  careDate: [{ required: true, message: '请选择护理日期' }],
  nurseId: [{ required: true, message: '请输入护理人员ID' }],
  careContent: [{ required: true, message: '请输入护理内容' }],
  careData: [{ required: true, message: '请输入护理数据' }],
};

function resetForm() {
  formModel.value = {
    createdByType: 1,
    sourceReferenceId: '',
    careType: 3,
    careDate: undefined,
    nurseId: '',
    careContent: '',
    careData: '',
    babyId: '',
    otherConditions: '',
    nurseSignature: '',
    specialNotes: '',
    nextCareTime: undefined,
    attachments: '',
    remark: '',
  };
  formRef.value?.resetFields();
}

function openCreateModal() {
  isEditMode.value = false;
  editingId.value = '';
  resetForm();
  // 宝宝护理记录单固定护理类型为 3
  formModel.value.careType = 3;
  createModalVisible.value = true;
}

async function openEditModal(record: CustomerAssessmentItem) {
  isEditMode.value = true;
  editingId.value = record.id;
  createModalVisible.value = true;
  resetForm();
  try {
    const detail = await getCustomerAssessmentDetailApi(record.id);
    formModel.value = {
      createdByType: detail.customerId ? 1 : 2,
      sourceReferenceId: detail.customerId || detail.tContractId || '',
      careType: detail.careType ?? 3,
      careDate: detail.careDate ? dayjs(detail.careDate) : undefined,
      nurseId: detail.nurseId || '',
      careContent: detail.careContent || '',
      careData: detail.careData || '',
      babyId: detail.babyId || '',
      otherConditions: detail.otherConditions || '',
      nurseSignature: detail.nurseSignature || '',
      specialNotes: detail.specialNotes || '',
      nextCareTime: detail.nextCareTime ? dayjs(detail.nextCareTime) : undefined,
      attachments: detail.attachments || '',
      remark: detail.remark || '',
    };
  } catch (error: any) {
    const errMsg =
      error?.response?.data?.message ||
      error?.data?.message ||
      error?.message ||
      '获取护理记录详情失败';
    message.error(errMsg);
    createModalVisible.value = false;
  }
}

function toIso(val?: Dayjs) {
  return val ? val.toISOString() : undefined;
}

async function handleSubmit() {
  try {
    const values = await formRef.value?.validate();
    if (!values) return;
    submitting.value = true;
    const baseData: CreateCustomerAssessmentParams = {
      createdByType: values.createdByType,
      sourceReferenceId: values.sourceReferenceId,
      // 创建宝宝护理记录单时固定为 3，编辑时保留原值
      careType: isEditMode.value ? values.careType : 3,
      careDate: toIso(values.careDate)!,
      nurseId: values.nurseId,
      careContent: values.careContent,
      careData: values.careData,
      babyId: values.babyId || undefined,
      otherConditions: values.otherConditions || undefined,
      nurseSignature: values.nurseSignature || undefined,
      specialNotes: values.specialNotes || undefined,
      nextCareTime: values.nextCareTime ? toIso(values.nextCareTime) : undefined,
      attachments: values.attachments || undefined,
      remark: values.remark || undefined,
    };

    if (isEditMode.value) {
      const updateData: UpdateCustomerAssessmentParams = {
        ...(baseData as CreateCustomerAssessmentParams),
        id: editingId.value,
      };
      await updateCustomerAssessmentApi(updateData);
      message.success('更新护理记录成功');
    } else {
      await createCustomerAssessmentApi(baseData);
      message.success('创建护理记录成功');
    }
    createModalVisible.value = false;
    fetchList();
  } catch (error: any) {
    if (error?.errorFields) return;
    const errMsg =
      error?.response?.data?.message ||
      error?.data?.message ||
      error?.message ||
      (isEditMode.value ? '更新护理记录失败' : '创建护理记录失败');
    message.error(errMsg);
  } finally {
    submitting.value = false;
  }
}

function handleDelete(record: CustomerAssessmentItem) {
  Modal.confirm({
    title: '确认删除',
    content: h('div', { style: { fontSize: '14px', lineHeight: '1.6' } }, [
      h('p', { style: { marginBottom: '8px', color: '#ff4d4f', fontWeight: 500 } }, '⚠️ 警告'),
      h('p', { style: { margin: 0 } }, '确定要删除该护理记录吗？'),
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
        await deleteCustomerAssessmentApi(record.id);
        message.success('删除护理记录成功');
        fetchList();
      } catch (error: any) {
        const errMsg =
          error?.response?.data?.message ||
          error?.data?.message ||
          error?.message ||
          '删除护理记录失败';
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
    <div class="mb-3" style="display: flex; align-items: center; gap: 12px">
      <Button type="primary" class="cursor-pointer" @click="openCreateModal">
        宝宝查访
      </Button>
    </div>
    <div class="mb-4">
      <Space wrap>
        <DatePicker.RangePicker
          v-model:value="careDateRange"
          show-time
          format="YYYY-MM-DD HH:mm:ss"
          :placeholder="['护理开始时间', '护理结束时间']"
          style="width: 320px"
        />
        <DatePicker.RangePicker
          v-model:value="createdDateRange"
          :placeholder="['创建开始时间', '创建结束时间']"
          style="width: 280px"
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
      row-key="id"
      :pagination="{
        current: queryForm.PageIndex,
        pageSize: queryForm.PageSize,
        total: total,
        showSizeChanger: true,
        showTotal: (t) => `共 ${t} 条`,
      }"
      :scroll="{ x: 2400 }"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'careDate'">
          <span v-if="record.careDate">
            {{ dayjs(record.careDate).format('YYYY-MM-DD HH:mm:ss') }}
          </span>
          <span v-else>—</span>
        </template>
        <template v-else-if="column.key === 'nextCareTime'">
          <span v-if="record.nextCareTime">
            {{ dayjs(record.nextCareTime).format('YYYY-MM-DD HH:mm:ss') }}
          </span>
          <span v-else>—</span>
        </template>
        <template v-else-if="column.key === 'createdAt'">
          <span v-if="record.createdAt">
            {{ dayjs(record.createdAt).format('YYYY-MM-DD HH:mm:ss') }}
          </span>
          <span v-else>—</span>
        </template>
        <template v-else-if="column.key === 'updatedAt'">
          <span v-if="record.updatedAt">
            {{ dayjs(record.updatedAt).format('YYYY-MM-DD HH:mm:ss') }}
          </span>
          <span v-else>—</span>
        </template>
        <template v-else-if="column.key === 'careTypeText'">
          <span>
            {{
              record.careTypeText ||
                ({
                  3: '宝宝护理记录单',
                } as Record<number, string>)[record.careType] ||
              '—'
            }}
          </span>
        </template>
        <template v-else-if="column.key === 'actions'">
          <div style="text-align: center">
            <Space>
              <Button size="small" type="link" class="cursor-pointer" @click="openEditModal(record)">
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

    <Modal
      v-model:open="createModalVisible"
      :title="isEditMode ? '更新宝宝护理记录单' : '创建宝宝护理记录单'"
      width="700px"
      :confirm-loading="submitting"
      :body-style="{ maxHeight: '600px', overflowY: 'auto' }"
      @ok="handleSubmit"
      @cancel="createModalVisible = false"
      destroy-on-close
    >
      <Form
        ref="formRef"
        :model="formModel"
        :rules="formRules"
        layout="vertical"
      >
        <div class="grid grid-cols-3 gap-4">
          <Form.Item label="创建类型" name="createdByType">
            <Select
              v-model:value="formModel.createdByType"
              :options="createdByTypeOptions"
              placeholder="请选择创建类型"
            />
          </Form.Item>
          <Form.Item label="客户ID/合同ID" name="sourceReferenceId">
            <Input
              v-model:value="formModel.sourceReferenceId"
              placeholder="请输入客户ID或合同ID"
            />
          </Form.Item>

          <Form.Item label="护理类型" name="careType">
            <Select
              v-model:value="formModel.careType"
              :options="careTypeOptions"
              placeholder="请选择护理类型"
              disabled
            />
          </Form.Item>
          <Form.Item label="护理日期" name="careDate">
            <DatePicker
              v-model:value="formModel.careDate"
              show-time
              format="YYYY-MM-DD HH:mm:ss"
              style="width: 100%"
              placeholder="请选择护理日期"
            />
          </Form.Item>

          <Form.Item label="护理人员ID" name="nurseId">
            <Input v-model:value="formModel.nurseId" placeholder="请输入护理人员ID" />
          </Form.Item>
          <Form.Item label="宝宝ID" name="babyId">
            <Input v-model:value="formModel.babyId" placeholder="请输入宝宝ID" />
          </Form.Item>

          <Form.Item label="其他情况" name="otherConditions">
            <Input v-model:value="formModel.otherConditions" placeholder="请输入其他情况" />
          </Form.Item>
          <Form.Item label="护士签名" name="nurseSignature">
            <Input v-model:value="formModel.nurseSignature" placeholder="请输入护士签名" />
          </Form.Item>

          <Form.Item label="下次护理时间" name="nextCareTime">
            <DatePicker
              v-model:value="formModel.nextCareTime"
              show-time
              format="YYYY-MM-DD HH:mm:ss"
              style="width: 100%"
              placeholder="请选择下次护理时间"
            />
          </Form.Item>
          <Form.Item label="附件列表" name="attachments">
            <Input v-model:value="formModel.attachments" placeholder="请输入附件列表" />
          </Form.Item>
        </div>

        <Form.Item label="护理内容" name="careContent">
          <Input.TextArea
            v-model:value="formModel.careContent"
            :rows="3"
            placeholder="请输入护理内容"
            style="width: calc(100% - 100px); resize: both"
          />
        </Form.Item>
        <Form.Item label="护理数据" name="careData">
          <Input.TextArea
            v-model:value="formModel.careData"
            :rows="3"
            placeholder="请输入护理数据（JSON格式）"
            style="width: calc(100% - 100px); resize: both"
          />
        </Form.Item>
        <Form.Item label="特殊事项记录" name="specialNotes">
          <Input.TextArea
            v-model:value="formModel.specialNotes"
            :rows="3"
            placeholder="请输入特殊事项记录"
            style="width: calc(100% - 100px); resize: both"
          />
        </Form.Item>
        <Form.Item label="备注" name="remark">
          <Input.TextArea
            v-model:value="formModel.remark"
            :rows="3"
            placeholder="请输入备注"
            style="width: calc(100% - 100px); resize: both"
          />
        </Form.Item>
      </Form>
    </Modal>
  </div>
</template>

<style scoped>
/* 两行显示：标签在上，输入框在下（使用垂直布局即可） */
</style>


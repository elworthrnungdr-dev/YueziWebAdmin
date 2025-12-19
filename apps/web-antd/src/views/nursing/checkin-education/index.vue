<script lang="ts" setup>
import { h, onMounted, ref } from 'vue';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

import {
  getCustomerEducationListApi,
  type CustomerEducationListParams,
  type CustomerEducationItem,
  createCustomerEducationApi,
  updateCustomerEducationApi,
  deleteCustomerEducationApi,
  getCustomerEducationDetailApi,
  type CreateCustomerEducationParams,
  type UpdateCustomerEducationParams,
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
const dataSource = ref<CustomerEducationItem[]>([]);
const total = ref(0);

const queryForm = ref<CustomerEducationListParams>({
  CustomerId: undefined,
  TContractId: undefined,
  BabyId: undefined,
  ContractNo: undefined,
  EducationDateStart: undefined,
  EducationDateEnd: undefined,
  CreatedAtStart: undefined,
  CreatedAtEnd: undefined,
  // 入所宣教固定类型 1
  EducationType: 1,
  EducationMethod: undefined,
  IsUnderstood: undefined,
  PageIndex: 1,
  PageSize: 10,
  OrderBy: undefined,
  IsAsc: true,
});

const educationDateRange = ref<[Dayjs | null, Dayjs | null]>([null, null]);
const createdDateRange = ref<[Dayjs | null, Dayjs | null]>([null, null]);

const createdByTypeOptions = [
  { label: '客户ID', value: 1 },
  { label: '合同ID', value: 2 },
];

const educationTypeOptions = [
  { label: '入所宣教', value: 1 },
  { label: '产后护理卫教', value: 2 },
  { label: '护理部出所宣教', value: 3 },
  { label: '健康告知书', value: 4 },
  { label: '特殊情况告知书', value: 5 },
];

const educationMethodOptions = [
  { label: '口头讲解', value: 1 },
  { label: '视频演示', value: 2 },
  { label: '手册发放', value: 3 },
  { label: '实操指导', value: 4 },
];

const understoodOptions = [
  { label: '是', value: 1 },
  { label: '否', value: 2 },
];

const columns = [
  { title: '合同编号', dataIndex: 'contractNo', key: 'contractNo', width: 140 },
  {
    title: '宣教类型',
    dataIndex: 'educationTypeText',
    key: 'educationTypeText',
    width: 140,
  },
  { title: '宝宝ID', dataIndex: 'babyId', key: 'babyId', width: 120 },
  { title: '宣教日期', dataIndex: 'educationDate', key: 'educationDate', width: 180 },
  { title: '宣教时间', dataIndex: 'educationTime', key: 'educationTime', width: 120 },
  { title: '宣教内容', dataIndex: 'educationContent', key: 'educationContent', ellipsis: true, width: 200 },
  {
    title: '宣教方式',
    dataIndex: 'educationMethodText',
    key: 'educationMethodText',
    width: 140,
  },
  {
    title: '是否理解',
    dataIndex: 'isUnderstoodText',
    key: 'isUnderstoodText',
    width: 120,
  },
  { title: '客户反馈', dataIndex: 'customerFeedback', key: 'customerFeedback', ellipsis: true, width: 200 },
  { title: '客户签字', dataIndex: 'customerSign', key: 'customerSign', width: 140 },
  { title: '附件列表', dataIndex: 'attachments', key: 'attachments', ellipsis: true, width: 200 },
  { title: '备注', dataIndex: 'remark', key: 'remark', ellipsis: true, width: 200 },
  { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 170 },
  { title: '更新时间', dataIndex: 'updatedAt', key: 'updatedAt', width: 170 },
  { title: '操作', key: 'actions', fixed: 'right', width: 140 },
];

async function fetchList() {
  try {
    loading.value = true;
    if (educationDateRange.value[0] && educationDateRange.value[1]) {
      queryForm.value.EducationDateStart = educationDateRange.value[0].toISOString();
      queryForm.value.EducationDateEnd = educationDateRange.value[1].toISOString();
    } else {
      queryForm.value.EducationDateStart = undefined;
      queryForm.value.EducationDateEnd = undefined;
    }

    if (createdDateRange.value[0] && createdDateRange.value[1]) {
      queryForm.value.CreatedAtStart = createdDateRange.value[0].toISOString();
      queryForm.value.CreatedAtEnd = createdDateRange.value[1].toISOString();
    } else {
      queryForm.value.CreatedAtStart = undefined;
      queryForm.value.CreatedAtEnd = undefined;
    }

    const result = await getCustomerEducationListApi(queryForm.value);
    dataSource.value = result.items || [];
    total.value = result.total || 0;
  } catch (error: any) {
    const errMsg =
      error?.response?.data?.message ||
      error?.data?.message ||
      error?.message ||
      '获取宣教列表失败';
    message.error(errMsg);
  } finally {
    loading.value = false;
  }
}

function handleReset() {
  queryForm.value = {
    CustomerId: undefined,
    TContractId: undefined,
    BabyId: undefined,
    ContractNo: undefined,
    EducationDateStart: undefined,
    EducationDateEnd: undefined,
    CreatedAtStart: undefined,
    CreatedAtEnd: undefined,
    EducationType: undefined,
    EducationMethod: undefined,
    IsUnderstood: undefined,
    PageIndex: 1,
    PageSize: 10,
    OrderBy: undefined,
    IsAsc: true,
  };
  educationDateRange.value = [null, null];
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

type FormModelType = CreateCustomerEducationParams & {
  educationDate?: Dayjs;
};

const formModel = ref<FormModelType>({
  createdByType: 1,
  sourceReferenceId: '',
  educationType: 1,
  educationDate: undefined,
  educatorId: '',
  educationContent: '',
  babyId: '',
  educationMethod: undefined,
  isUnderstood: undefined,
  customerFeedback: '',
  customerSign: '',
  witnessEmployeeId: '',
  attachments: '',
  remark: '',
});

const formRules = {
  createdByType: [{ required: true, message: '请选择创建类型' }],
  sourceReferenceId: [{ required: true, message: '请输入客户ID或合同ID' }],
  educationType: [{ required: true, message: '请选择宣教类型' }],
  educationDate: [{ required: true, message: '请选择宣教日期' }],
  educatorId: [{ required: true, message: '请输入宣教人ID' }],
  educationContent: [{ required: true, message: '请输入宣教内容' }],
};

function resetForm() {
  formModel.value = {
    createdByType: 1,
    sourceReferenceId: '',
    educationType: 1,
    educationDate: undefined,
    educatorId: '',
    educationContent: '',
    babyId: '',
    educationMethod: undefined,
    isUnderstood: undefined,
    customerFeedback: '',
    customerSign: '',
    witnessEmployeeId: '',
    attachments: '',
    remark: '',
  };
  formRef.value?.resetFields();
}

function openCreateModal() {
  isEditMode.value = false;
  editingId.value = '';
  resetForm();
  // 护理部入所宣教固定宣教类型为 1（入所宣教）
  formModel.value.educationType = 1;
  createModalVisible.value = true;
}

async function openEditModal(record: CustomerEducationItem) {
  isEditMode.value = true;
  editingId.value = record.id;
  createModalVisible.value = true;
  resetForm();
  try {
    const detail = await getCustomerEducationDetailApi(record.id);
    formModel.value = {
      createdByType: detail.customerId ? 1 : 2,
      sourceReferenceId: detail.customerId || detail.tContractId || '',
      educationType: detail.educationType ?? 1,
      educationDate: detail.educationDate ? dayjs(detail.educationDate) : undefined,
      educatorId: detail.educatorId || '',
      educationContent: detail.educationContent || '',
      babyId: detail.babyId || '',
      educationMethod: detail.educationMethod,
      isUnderstood: detail.isUnderstood,
      customerFeedback: detail.customerFeedback || '',
      customerSign: detail.customerSign || '',
      witnessEmployeeId: detail.witnessEmployeeId || '',
      attachments: detail.attachments || '',
      remark: detail.remark || '',
    };
  } catch (error: any) {
    const errMsg =
      error?.response?.data?.message ||
      error?.data?.message ||
      error?.message ||
      '获取宣教详情失败';
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
    const baseData: CreateCustomerEducationParams = {
      createdByType: values.createdByType,
      sourceReferenceId: values.sourceReferenceId,
      // 创建护理部入所宣教时固定为 1（入所宣教），编辑时保留原值
      educationType: isEditMode.value ? values.educationType : 1,
      educationDate: toIso(values.educationDate)!,
      educatorId: values.educatorId,
      educationContent: values.educationContent,
      babyId: values.babyId || undefined,
      educationMethod: values.educationMethod,
      isUnderstood: values.isUnderstood,
      customerFeedback: values.customerFeedback,
      customerSign: values.customerSign,
      witnessEmployeeId: values.witnessEmployeeId,
      attachments: values.attachments,
      remark: values.remark,
    };

    if (isEditMode.value) {
      const updateData: UpdateCustomerEducationParams = {
        ...(baseData as CreateCustomerEducationParams),
        id: editingId.value,
      };
      await updateCustomerEducationApi(updateData);
      message.success('更新宣教信息成功');
    } else {
      await createCustomerEducationApi(baseData);
      message.success('创建宣教信息成功');
    }
    createModalVisible.value = false;
    fetchList();
  } catch (error: any) {
    if (error?.errorFields) return;
    const errMsg =
      error?.response?.data?.message ||
      error?.data?.message ||
      error?.message ||
      (isEditMode.value ? '更新宣教信息失败' : '创建宣教信息失败');
    message.error(errMsg);
  } finally {
    submitting.value = false;
  }
}

function handleDelete(record: CustomerEducationItem) {
  Modal.confirm({
    title: '确认删除',
    content: h('div', { style: { fontSize: '14px', lineHeight: '1.6' } }, [
      h('p', { style: { marginBottom: '8px', color: '#ff4d4f', fontWeight: 500 } }, '⚠️ 警告'),
      h('p', { style: { margin: 0 } }, '确定要删除该宣教记录吗？'),
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
        await deleteCustomerEducationApi(record.id);
        message.success('删除宣教记录成功');
        fetchList();
      } catch (error: any) {
        const errMsg =
          error?.response?.data?.message ||
          error?.data?.message ||
          error?.message ||
          '删除宣教记录失败';
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
        护理部入所宣教
      </Button>
    </div>
    <div class="mb-4">
      <Space wrap>
        <Input v-model:value="queryForm.CustomerId" placeholder="客户ID" style="width: 160px" allow-clear />
        <Input v-model:value="queryForm.TContractId" placeholder="合同ID" style="width: 160px" allow-clear />
        <Input v-model:value="queryForm.ContractNo" placeholder="合同编号" style="width: 160px" allow-clear />
        <Input v-model:value="queryForm.BabyId" placeholder="宝宝ID" style="width: 160px" allow-clear />
        <Select
          v-model:value="queryForm.EducationMethod"
          :options="educationMethodOptions"
          placeholder="宣教方式"
          allow-clear
          style="width: 160px"
        />
        <Select
          v-model:value="queryForm.IsUnderstood"
          :options="understoodOptions"
          placeholder="是否理解"
          allow-clear
          style="width: 140px"
        />
        <DatePicker.RangePicker
          v-model:value="educationDateRange"
          show-time
          format="YYYY-MM-DD HH:mm:ss"
          :placeholder="['宣教开始时间', '宣教结束时间']"
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
      :scroll="{ x: 2200 }"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'educationDate'">
          <span v-if="record.educationDate">
            {{ dayjs(record.educationDate).format('YYYY-MM-DD HH:mm:ss') }}
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
        <template v-else-if="column.key === 'educationTypeText'">
          <span>
            {{
              record.educationTypeText ||
                ({
                  1: '入所宣教',
                  2: '产后护理卫教',
                  3: '护理部出所宣教',
                  4: '健康告知书',
                  5: '特殊情况告知书',
                } as Record<number, string>)[record.educationType] ||
              '—'
            }}
          </span>
        </template>
        <template v-else-if="column.key === 'educationMethodText'">
          <span>
            {{
              record.educationMethodText ||
                ({
                  1: '口头讲解',
                  2: '视频演示',
                  3: '手册发放',
                  4: '实操指导',
                } as Record<number, string>)[record.educationMethod || 0] ||
              '—'
            }}
          </span>
        </template>
        <template v-else-if="column.key === 'isUnderstoodText'">
          <span>
            {{
              record.isUnderstoodText ||
                ({
                  1: '是',
                  2: '否',
                } as Record<number, string>)[record.isUnderstood || 0] ||
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
      :title="isEditMode ? '更新护理部入所宣教' : '创建护理部入所宣教'"
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

          <Form.Item label="宣教类型" name="educationType">
            <Select
              v-model:value="formModel.educationType"
              :options="educationTypeOptions"
              placeholder="请选择宣教类型"
              disabled
            />
          </Form.Item>
          <Form.Item label="宣教日期" name="educationDate">
            <DatePicker
              v-model:value="formModel.educationDate"
              show-time
              format="YYYY-MM-DD HH:mm:ss"
              style="width: 100%"
              placeholder="请选择宣教日期"
            />
          </Form.Item>

          <Form.Item label="宣教人ID" name="educatorId">
            <Input v-model:value="formModel.educatorId" placeholder="请输入宣教人ID" />
          </Form.Item>
          <Form.Item label="宝宝ID" name="babyId">
            <Input v-model:value="formModel.babyId" placeholder="请输入宝宝ID" />
          </Form.Item>

          <Form.Item label="宣教方式" name="educationMethod">
            <Select
              v-model:value="formModel.educationMethod"
              :options="educationMethodOptions"
              placeholder="请选择宣教方式"
              allow-clear
            />
          </Form.Item>
          <Form.Item label="是否理解" name="isUnderstood">
            <Select
              v-model:value="formModel.isUnderstood"
              :options="understoodOptions"
              placeholder="请选择是否理解"
              allow-clear
            />
          </Form.Item>

          <Form.Item label="客户签字" name="customerSign">
            <Input v-model:value="formModel.customerSign" placeholder="请输入客户签字" />
          </Form.Item>
          <Form.Item label="见证人ID" name="witnessEmployeeId">
            <Input
              v-model:value="formModel.witnessEmployeeId"
              placeholder="请输入见证人ID"
            />
          </Form.Item>

          <Form.Item label="附件列表" name="attachments">
            <Input v-model:value="formModel.attachments" placeholder="请输入附件列表" />
          </Form.Item>
        </div>

        <Form.Item label="宣教内容" name="educationContent">
          <Input.TextArea
            v-model:value="formModel.educationContent"
            :rows="3"
            placeholder="请输入宣教内容"
            style="width: calc(100% - 100px); resize: both"
          />
        </Form.Item>
        <Form.Item label="客户反馈" name="customerFeedback">
          <Input.TextArea
            v-model:value="formModel.customerFeedback"
            :rows="3"
            placeholder="请输入客户反馈"
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


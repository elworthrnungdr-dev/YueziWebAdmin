<script lang="ts" setup>
import { h, onMounted, ref } from 'vue';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

import {
  getDoctorRoundRecordListApi,
  type DoctorRoundRecordListParams,
  type DoctorRoundRecordItem,
  createDoctorRoundRecordApi,
  updateDoctorRoundRecordApi,
  deleteDoctorRoundRecordApi,
  getDoctorRoundRecordDetailApi,
  type CreateDoctorRoundRecordParams,
  type UpdateDoctorRoundRecordParams,
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
const dataSource = ref<DoctorRoundRecordItem[]>([]);
const total = ref(0);

// 营养科医生巡房列表查询固定巡房类型 2
const queryForm = ref<DoctorRoundRecordListParams>({
  DoctorName: undefined,
  BabyId: undefined,
  RoundDateStart: undefined,
  RoundDateEnd: undefined,
  CreatedAtStart: undefined,
  CreatedAtEnd: undefined,
  RoundType: 2,
  IsUrgent: undefined,
  PageIndex: 1,
  PageSize: 10,
  OrderBy: undefined,
  IsAsc: true,
});

const roundDateRange = ref<[Dayjs | null, Dayjs | null]>([null, null]);
const createdDateRange = ref<[Dayjs | null, Dayjs | null]>([null, null]);

const createdByTypeOptions = [
  { label: '客户ID', value: 1 },
  { label: '合同ID', value: 2 },
];

const isUrgentOptions = [
  { label: '是', value: 1 },
  { label: '否', value: 2 },
];

const columns = [
  { title: '合同编号', dataIndex: 'contractNo', key: 'contractNo', width: 140 },
  {
    title: '巡房类型',
    dataIndex: 'roundTypeText',
    key: 'roundTypeText',
    width: 120,
  },
  { title: '宝宝ID', dataIndex: 'babyId', key: 'babyId', width: 120 },
  { title: '医生姓名', dataIndex: 'doctorName', key: 'doctorName', width: 120 },
  { title: '医生科室', dataIndex: 'doctorDepartment', key: 'doctorDepartment', width: 120 },
  { title: '巡房日期', dataIndex: 'roundDate', key: 'roundDate', width: 180 },
  { title: '巡房时间', dataIndex: 'roundTime', key: 'roundTime', width: 120 },
  { title: '症状描述', dataIndex: 'symptoms', key: 'symptoms', ellipsis: true, width: 200 },
  { title: '诊断意见', dataIndex: 'diagnosis', key: 'diagnosis', ellipsis: true, width: 200 },
  { title: '处理措施', dataIndex: 'treatment', key: 'treatment', ellipsis: true, width: 200 },
  { title: '处方/建议', dataIndex: 'prescription', key: 'prescription', ellipsis: true, width: 200 },
  { title: '下次巡房日期', dataIndex: 'nextRoundDate', key: 'nextRoundDate', width: 180 },
  {
    title: '是否紧急情况',
    dataIndex: 'isUrgentText',
    key: 'isUrgentText',
    width: 140,
  },
  { title: '附件列表', dataIndex: 'attachments', key: 'attachments', ellipsis: true, width: 200 },
  { title: '备注', dataIndex: 'remark', key: 'remark', ellipsis: true, width: 200 },
  { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 170 },
  { title: '操作', key: 'actions', fixed: 'right', width: 140 },
];

async function fetchList() {
  try {
    loading.value = true;
    if (roundDateRange.value[0] && roundDateRange.value[1]) {
      queryForm.value.RoundDateStart = roundDateRange.value[0].toISOString();
      queryForm.value.RoundDateEnd = roundDateRange.value[1].toISOString();
    } else {
      queryForm.value.RoundDateStart = undefined;
      queryForm.value.RoundDateEnd = undefined;
    }

    if (createdDateRange.value[0] && createdDateRange.value[1]) {
      queryForm.value.CreatedAtStart = createdDateRange.value[0].toISOString();
      queryForm.value.CreatedAtEnd = createdDateRange.value[1].toISOString();
    } else {
      queryForm.value.CreatedAtStart = undefined;
      queryForm.value.CreatedAtEnd = undefined;
    }

    const result = await getDoctorRoundRecordListApi(queryForm.value);
    dataSource.value = result.items || [];
    total.value = result.total || 0;
  } catch (error: any) {
    const errMsg =
      error?.response?.data?.message ||
      error?.data?.message ||
      error?.message ||
      '获取巡房记录列表失败';
    message.error(errMsg);
  } finally {
    loading.value = false;
  }
}

function handleReset() {
  queryForm.value = {
    DoctorName: undefined,
    BabyId: undefined,
    RoundDateStart: undefined,
    RoundDateEnd: undefined,
    CreatedAtStart: undefined,
    CreatedAtEnd: undefined,
    // 营养科医生巡房固定类型 2
    RoundType: 2,
    IsUrgent: undefined,
    PageIndex: 1,
    PageSize: 10,
    OrderBy: undefined,
    IsAsc: true,
  };
  roundDateRange.value = [null, null];
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

type FormModelType = CreateDoctorRoundRecordParams & {
  roundDate?: Dayjs;
  nextRoundDate?: Dayjs;
};

const formModel = ref<FormModelType>({
  createdByType: 1,
  sourceReferenceId: '',
  roundType: 2,
  doctorId: '',
  roundDate: undefined,
  roundTime: '',
  isUrgent: 1,
  babyId: '',
  symptoms: '',
  diagnosis: '',
  treatment: '',
  prescription: '',
  nextRoundDate: undefined,
  attachments: '',
  remark: '',
});

const formRules = {
  createdByType: [{ required: true, message: '请选择创建类型' }],
  sourceReferenceId: [{ required: true, message: '请输入客户ID或合同ID' }],
  roundType: [{ required: true, message: '请选择巡房类型' }],
  doctorId: [{ required: true, message: '请输入医生ID' }],
  roundDate: [{ required: true, message: '请选择巡房日期' }],
  roundTime: [{ required: true, message: '请输入巡房时间' }],
  isUrgent: [{ required: true, message: '请选择是否紧急情况' }],
};

function resetForm() {
  formModel.value = {
    createdByType: 1,
    sourceReferenceId: '',
    roundType: 2,
    doctorId: '',
    roundDate: undefined,
    roundTime: '',
    isUrgent: 1,
    babyId: '',
    symptoms: '',
    diagnosis: '',
    treatment: '',
    prescription: '',
    nextRoundDate: undefined,
    attachments: '',
    remark: '',
  };
  formRef.value?.resetFields();
}

function openCreateModal() {
  isEditMode.value = false;
  editingId.value = '';
  resetForm();
  // 营养科医生巡房固定巡房类型为 2
  formModel.value.roundType = 2;
  createModalVisible.value = true;
}

async function openEditModal(record: DoctorRoundRecordItem) {
  isEditMode.value = true;
  editingId.value = record.id;
  createModalVisible.value = true;
  resetForm();
  try {
    const detail = await getDoctorRoundRecordDetailApi(record.id);
    formModel.value = {
      createdByType: detail.customerId ? 1 : 2,
      sourceReferenceId: detail.customerId || detail.tContractId || '',
      roundType: detail.roundType ?? 2,
      doctorId: detail.doctorId || '',
      roundDate: detail.roundDate ? dayjs(detail.roundDate) : undefined,
      roundTime: detail.roundTime || '',
      isUrgent: detail.isUrgent ?? 1,
      babyId: detail.babyId || '',
      symptoms: detail.symptoms || '',
      diagnosis: detail.diagnosis || '',
      treatment: detail.treatment || '',
      prescription: detail.prescription || '',
      nextRoundDate: detail.nextRoundDate ? dayjs(detail.nextRoundDate) : undefined,
      attachments: detail.attachments || '',
      remark: detail.remark || '',
    };
  } catch (error: any) {
    const errMsg =
      error?.response?.data?.message ||
      error?.data?.message ||
      error?.message ||
      '获取巡房记录详情失败';
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
    const baseData: CreateDoctorRoundRecordParams = {
      createdByType: values.createdByType,
      sourceReferenceId: values.sourceReferenceId,
      // 创建营养科医生巡房时固定为 2，编辑时保留原值
      roundType: isEditMode.value ? values.roundType : 2,
      doctorId: values.doctorId,
      roundDate: toIso(values.roundDate)!,
      roundTime: values.roundTime,
      isUrgent: values.isUrgent,
      babyId: values.babyId || undefined,
      symptoms: values.symptoms || undefined,
      diagnosis: values.diagnosis || undefined,
      treatment: values.treatment || undefined,
      prescription: values.prescription || undefined,
      nextRoundDate: values.nextRoundDate ? toIso(values.nextRoundDate) : undefined,
      attachments: values.attachments || undefined,
      remark: values.remark || undefined,
    };

    if (isEditMode.value) {
      const updateData: UpdateDoctorRoundRecordParams = {
        ...(baseData as CreateDoctorRoundRecordParams),
        id: editingId.value,
      };
      await updateDoctorRoundRecordApi(updateData);
      message.success('更新巡房记录成功');
    } else {
      await createDoctorRoundRecordApi(baseData);
      message.success('创建巡房记录成功');
    }
    createModalVisible.value = false;
    fetchList();
  } catch (error: any) {
    if (error?.errorFields) return;
    const errMsg =
      error?.response?.data?.message ||
      error?.data?.message ||
      error?.message ||
      (isEditMode.value ? '更新巡房记录失败' : '创建巡房记录失败');
    message.error(errMsg);
  } finally {
    submitting.value = false;
  }
}

function handleDelete(record: DoctorRoundRecordItem) {
  Modal.confirm({
    title: '确认删除',
    content: h('div', { style: { fontSize: '14px', lineHeight: '1.6' } }, [
      h('p', { style: { marginBottom: '8px', color: '#ff4d4f', fontWeight: 500 } }, '⚠️ 警告'),
      h('p', { style: { margin: 0 } }, '确定要删除该巡房记录吗？'),
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
        await deleteDoctorRoundRecordApi(record.id);
        message.success('删除巡房记录成功');
        fetchList();
      } catch (error: any) {
        const errMsg =
          error?.response?.data?.message ||
          error?.data?.message ||
          error?.message ||
          '删除巡房记录失败';
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
        营养科医生巡房
      </Button>
    </div>
    <div class="mb-4">
      <Space wrap>
        <Input v-model:value="queryForm.DoctorName" placeholder="医生姓名" style="width: 110px" allow-clear />
        <Input v-model:value="queryForm.BabyId" placeholder="宝宝ID" style="width: 130px" allow-clear />
        <Select
          v-model:value="queryForm.IsUrgent"
          :options="isUrgentOptions"
          placeholder="是否紧急情况"
          allow-clear
          style="width: 140px"
        />
        <DatePicker.RangePicker
          v-model:value="roundDateRange"
          show-time
          format="YYYY-MM-DD HH:mm:ss"
          :placeholder="['巡房开始时间', '巡房结束时间']"
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
      :scroll="{ x: 2600 }"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'roundDate'">
          <span v-if="record.roundDate">
            {{ dayjs(record.roundDate).format('YYYY-MM-DD HH:mm:ss') }}
          </span>
          <span v-else>—</span>
        </template>
        <template v-else-if="column.key === 'nextRoundDate'">
          <span v-if="record.nextRoundDate">
            {{ dayjs(record.nextRoundDate).format('YYYY-MM-DD HH:mm:ss') }}
          </span>
          <span v-else>—</span>
        </template>
        <template v-else-if="column.key === 'createdAt'">
          <span v-if="record.createdAt">
            {{ dayjs(record.createdAt).format('YYYY-MM-DD HH:mm:ss') }}
          </span>
          <span v-else>—</span>
        </template>
        <template v-else-if="column.key === 'roundTypeText'">
          <span>
            {{
              record.roundTypeText ||
                ({
                  2: '营养科医生巡房',
                } as Record<number, string>)[record.roundType] ||
              '—'
            }}
          </span>
        </template>
        <template v-else-if="column.key === 'isUrgentText'">
          <span>
            {{
              record.isUrgentText ||
                ({
                  1: '是',
                  2: '否',
                } as Record<number, string>)[record.isUrgent] ||
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
      :title="isEditMode ? '更新营养科医生巡房' : '创建营养科医生巡房'"
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

          <Form.Item label="医生ID" name="doctorId">
            <Input v-model:value="formModel.doctorId" placeholder="请输入医生ID" />
          </Form.Item>
          <Form.Item label="巡房日期" name="roundDate">
            <DatePicker
              v-model:value="formModel.roundDate"
              show-time
              format="YYYY-MM-DD HH:mm:ss"
              style="width: 100%"
              placeholder="请选择巡房日期"
            />
          </Form.Item>

          <Form.Item label="巡房时间" name="roundTime">
            <Input v-model:value="formModel.roundTime" placeholder="请输入巡房时间" />
          </Form.Item>
          <Form.Item label="是否紧急情况" name="isUrgent">
            <Select
              v-model:value="formModel.isUrgent"
              :options="isUrgentOptions"
              placeholder="请选择是否紧急情况"
            />
          </Form.Item>

          <Form.Item label="宝宝ID" name="babyId">
            <Input v-model:value="formModel.babyId" placeholder="请输入宝宝ID" />
          </Form.Item>
          <Form.Item label="下次巡房日期" name="nextRoundDate">
            <DatePicker
              v-model:value="formModel.nextRoundDate"
              show-time
              format="YYYY-MM-DD HH:mm:ss"
              style="width: 100%"
              placeholder="请选择下次巡房日期"
            />
          </Form.Item>
          <Form.Item label="附件列表" name="attachments">
            <Input v-model:value="formModel.attachments" placeholder="请输入附件列表" />
          </Form.Item>
        </div>

        <Form.Item label="症状描述" name="symptoms">
          <Input.TextArea
            v-model:value="formModel.symptoms"
            :rows="3"
            placeholder="请输入症状描述"
            style="width: calc(100% - 100px); resize: both"
          />
        </Form.Item>
        <Form.Item label="诊断意见" name="diagnosis">
          <Input.TextArea
            v-model:value="formModel.diagnosis"
            :rows="3"
            placeholder="请输入诊断意见"
            style="width: calc(100% - 100px); resize: both"
          />
        </Form.Item>
        <Form.Item label="处理措施" name="treatment">
          <Input.TextArea
            v-model:value="formModel.treatment"
            :rows="3"
            placeholder="请输入处理措施"
            style="width: calc(100% - 100px); resize: both"
          />
        </Form.Item>
        <Form.Item label="处方/建议" name="prescription">
          <Input.TextArea
            v-model:value="formModel.prescription"
            :rows="3"
            placeholder="请输入处方/建议"
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


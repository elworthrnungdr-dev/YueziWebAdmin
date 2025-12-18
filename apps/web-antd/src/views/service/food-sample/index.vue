<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import {
  getMealSampleListApi,
  createMealSampleApi,
  getMealSampleDetailApi,
  updateMealSampleApi,
  deleteMealSampleApi,
  type MealSampleItem,
  type MealSampleListParams,
  type CreateMealSampleParams,
  type UpdateMealSampleParams,
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
  TimePicker,
  message,
} from 'ant-design-vue';
import type { FormInstance } from 'ant-design-vue';
import dayjs from 'dayjs';
import { h } from 'vue';

const loading = ref(false);
const dataSource = ref<MealSampleItem[]>([]);
const total = ref(0);

const queryForm = ref<MealSampleListParams>({
  MealName: undefined,
  SamplerName: undefined,
  WitnessName: undefined,
  SampleDateStart: undefined,
  SampleDateEnd: undefined,
  InspectionTimeStart: undefined,
  InspectionTimeEnd: undefined,
  DisposalTimeStart: undefined,
  DisposalTimeEnd: undefined,
  CreatedAtStart: undefined,
  CreatedAtEnd: undefined,
  MealType: undefined,
  SampleStatus: undefined,
  IsComplaint: undefined,
  PageIndex: 1,
  PageSize: 10,
  OrderBy: undefined,
  IsAsc: true,
});

const mealTypeOptions = [
  { label: '早餐', value: 1 },
  { label: '午餐', value: 2 },
  { label: '晚餐', value: 3 },
  { label: '加餐', value: 4 },
];

const sampleStatusOptions = [
  { label: '保存中', value: 1 },
  { label: '已检测', value: 2 },
  { label: '已销毁', value: 3 },
];

const isComplaintOptions = [
  { label: '是', value: 1 },
  { label: '否', value: 2 },
];

const columns = [
  {
    title: '留样编号',
    dataIndex: 'sampleNo',
    key: 'sampleNo',
    width: 150,
  },
  {
    title: '留样日期',
    dataIndex: 'sampleDate',
    key: 'sampleDate',
    width: 120,
  },
  {
    title: '留样时间',
    dataIndex: 'sampleTime',
    key: 'sampleTime',
    width: 100,
  },
  {
    title: '餐次类型',
    dataIndex: 'mealTypeText',
    key: 'mealTypeText',
    width: 100,
  },
  {
    title: '餐食名称',
    dataIndex: 'mealName',
    key: 'mealName',
    width: 150,
  },
  {
    title: '留样人姓名',
    dataIndex: 'samplerName',
    key: 'samplerName',
    width: 120,
  },
  {
    title: '见证人姓名',
    dataIndex: 'witnessName',
    key: 'witnessName',
    width: 120,
  },
  {
    title: '留样状态',
    dataIndex: 'sampleStatusText',
    key: 'sampleStatusText',
    width: 100,
  },
  {
    title: '是否涉及投诉',
    dataIndex: 'isComplaintText',
    key: 'isComplaintText',
    width: 120,
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
    const params: MealSampleListParams = {
      ...queryForm.value,
      SampleDateStart: queryForm.value.SampleDateStart
        ? dayjs(queryForm.value.SampleDateStart).toISOString()
        : undefined,
      SampleDateEnd: queryForm.value.SampleDateEnd
        ? dayjs(queryForm.value.SampleDateEnd).toISOString()
        : undefined,
      InspectionTimeStart: queryForm.value.InspectionTimeStart
        ? dayjs(queryForm.value.InspectionTimeStart).toISOString()
        : undefined,
      InspectionTimeEnd: queryForm.value.InspectionTimeEnd
        ? dayjs(queryForm.value.InspectionTimeEnd).toISOString()
        : undefined,
      DisposalTimeStart: queryForm.value.DisposalTimeStart
        ? dayjs(queryForm.value.DisposalTimeStart).toISOString()
        : undefined,
      DisposalTimeEnd: queryForm.value.DisposalTimeEnd
        ? dayjs(queryForm.value.DisposalTimeEnd).toISOString()
        : undefined,
      CreatedAtStart: queryForm.value.CreatedAtStart
        ? dayjs(queryForm.value.CreatedAtStart).toISOString()
        : undefined,
      CreatedAtEnd: queryForm.value.CreatedAtEnd
        ? dayjs(queryForm.value.CreatedAtEnd).toISOString()
        : undefined,
    };
    const res = await getMealSampleListApi(params);
    dataSource.value = res.items;
    total.value = res.total;
  } finally {
    loading.value = false;
  }
}

function handleReset() {
  queryForm.value = {
    MealName: undefined,
    SamplerName: undefined,
    WitnessName: undefined,
    SampleDateStart: undefined,
    SampleDateEnd: undefined,
    InspectionTimeStart: undefined,
    InspectionTimeEnd: undefined,
    DisposalTimeStart: undefined,
    DisposalTimeEnd: undefined,
    CreatedAtStart: undefined,
    CreatedAtEnd: undefined,
    MealType: undefined,
    SampleStatus: undefined,
    IsComplaint: undefined,
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

const formModel = ref<CreateMealSampleParams>({
  sampleNo: '',
  sampleDate: '',
  sampleTime: '',
  mealType: 1,
  mealName: '',
  sampleContent: '',
  sampleQuantity: '',
  sampleContainer: '',
  storageLocation: '',
  storageTemperature: '',
  retentionPeriod: 0,
  sampleStatus: 1,
  samplerId: '',
  samplerName: '',
  witnessId: '',
  witnessName: '',
  inspectionTime: '',
  inspectorId: '',
  inspectionResult: '',
  disposalTime: '',
  disposalMethod: '',
  disposalPersonId: '',
  disposalWitnessId: '',
  isComplaint: 2,
  complaintId: '',
  safetyNotes: '',
  attachments: '',
  remark: '',
});

const formRules = {
  sampleNo: [{ required: true, message: '请输入留样编号' }],
  sampleDate: [{ required: true, message: '请选择留样日期' }],
  sampleTime: [{ required: true, message: '请选择留样时间' }],
  mealType: [{ required: true, message: '请选择餐次类型' }],
  mealName: [{ required: true, message: '请输入餐食名称' }],
  sampleContent: [{ required: true, message: '请输入留样内容' }],
  sampleQuantity: [{ required: true, message: '请输入留样数量' }],
  sampleContainer: [{ required: true, message: '请输入留样容器' }],
  storageLocation: [{ required: true, message: '请输入存放位置' }],
  storageTemperature: [{ required: true, message: '请输入存储温度' }],
  retentionPeriod: [{ required: true, message: '请输入保留时间' }],
  sampleStatus: [{ required: true, message: '请选择留样状态' }],
  samplerId: [{ required: true, message: '请输入留样人ID' }],
  samplerName: [{ required: true, message: '请输入留样人姓名' }],
  isComplaint: [{ required: true, message: '请选择是否涉及投诉' }],
};

function openCreateModal() {
  isEditMode.value = false;
  editingId.value = '';
  formModel.value = {
    sampleNo: '',
    sampleDate: '',
    sampleTime: '',
    mealType: 1,
    mealName: '',
    sampleContent: '',
    sampleQuantity: '',
    sampleContainer: '',
    storageLocation: '',
    storageTemperature: '',
    retentionPeriod: 0,
    sampleStatus: 1,
    samplerId: '',
    samplerName: '',
    witnessId: '',
    witnessName: '',
    inspectionTime: '',
    inspectorId: '',
    inspectionResult: '',
    disposalTime: '',
    disposalMethod: '',
    disposalPersonId: '',
    disposalWitnessId: '',
    isComplaint: 2,
    complaintId: '',
    safetyNotes: '',
    attachments: '',
    remark: '',
  };
  createModalVisible.value = true;
}

async function openEditModal(record: MealSampleItem) {
  isEditMode.value = true;
  editingId.value = record.id;
  try {
    const detail = await getMealSampleDetailApi(record.id);
    formModel.value = {
      sampleNo: detail.sampleNo || '',
      sampleDate: detail.sampleDate ? (dayjs(detail.sampleDate) as any) : '',
      sampleTime: detail.sampleTime || '',
      mealType: detail.mealType,
      mealName: detail.mealName || '',
      sampleContent: detail.sampleContent || '',
      sampleQuantity: detail.sampleQuantity || '',
      sampleContainer: detail.sampleContainer || '',
      storageLocation: detail.storageLocation || '',
      storageTemperature: detail.storageTemperature || '',
      retentionPeriod: detail.retentionPeriod || 0,
      sampleStatus: detail.sampleStatus,
      samplerId: detail.samplerId || '',
      samplerName: detail.samplerName || '',
      witnessId: detail.witnessId || '',
      witnessName: detail.witnessName || '',
      inspectionTime: detail.inspectionTime
        ? (dayjs(detail.inspectionTime) as any)
        : '',
      inspectorId: detail.inspectorId || '',
      inspectionResult: detail.inspectionResult || '',
      disposalTime: detail.disposalTime
        ? (dayjs(detail.disposalTime) as any)
        : '',
      disposalMethod: detail.disposalMethod || '',
      disposalPersonId: detail.disposalPersonId || '',
      disposalWitnessId: detail.disposalWitnessId || '',
      isComplaint: detail.isComplaint,
      complaintId: detail.complaintId || '',
      safetyNotes: detail.safetyNotes || '',
      attachments: detail.attachments || '',
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
    const params: CreateMealSampleParams = {
      ...formModel.value,
      sampleDate: formModel.value.sampleDate
        ? dayjs(formModel.value.sampleDate as any).toISOString()
        : '',
      inspectionTime: formModel.value.inspectionTime
        ? dayjs(formModel.value.inspectionTime as any).toISOString()
        : undefined,
      disposalTime: formModel.value.disposalTime
        ? dayjs(formModel.value.disposalTime as any).toISOString()
        : undefined,
    };

    if (isEditMode.value) {
      await updateMealSampleApi({
        ...params,
        id: editingId.value,
      } as UpdateMealSampleParams);
      message.success('更新餐食留样成功');
    } else {
      await createMealSampleApi(params);
      message.success('创建餐食留样成功');
    }
    closeCreateModal();
    fetchList();
  } catch {
    // 由全局拦截器处理错误
  } finally {
    submitting.value = false;
  }
}

function handleDelete(record: MealSampleItem) {
  Modal.confirm({
    title: '确认删除',
    content: h('div', { style: { fontSize: '14px', lineHeight: '1.6' } }, [
      h('p', {
        style: { marginBottom: '8px', color: '#ff4d4f', fontWeight: 500 },
      }, '⚠️ 警告'),
      h('p', { style: { margin: 0 } }, '确定要删除该餐食留样记录吗？'),
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
        await deleteMealSampleApi(record.id);
        message.success('删除餐食留样成功');
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
        创建餐食留样
      </Button>
      <Space wrap>
        <Input
          v-model:value="queryForm.MealName"
          placeholder="餐食名称"
          style="width: 150px"
          allow-clear
        />
        <Input
          v-model:value="queryForm.SamplerName"
          placeholder="留样人姓名"
          style="width: 150px"
          allow-clear
        />
        <Input
          v-model:value="queryForm.WitnessName"
          placeholder="见证人姓名"
          style="width: 150px"
          allow-clear
        />
        <DatePicker
          v-model:value="queryForm.SampleDateStart"
          placeholder="留样日期开始"
          style="width: 150px"
        />
        <DatePicker
          v-model:value="queryForm.SampleDateEnd"
          placeholder="留样日期结束"
          style="width: 150px"
        />
        <DatePicker
          v-model:value="queryForm.InspectionTimeStart"
          placeholder="检测时间开始"
          style="width: 150px"
        />
        <DatePicker
          v-model:value="queryForm.InspectionTimeEnd"
          placeholder="检测时间结束"
          style="width: 150px"
        />
        <DatePicker
          v-model:value="queryForm.DisposalTimeStart"
          placeholder="销毁时间开始"
          style="width: 150px"
        />
        <DatePicker
          v-model:value="queryForm.DisposalTimeEnd"
          placeholder="销毁时间结束"
          style="width: 150px"
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
        <Select
          v-model:value="queryForm.MealType"
          :options="mealTypeOptions"
          placeholder="餐次类型"
          style="width: 120px"
          allow-clear
        />
        <Select
          v-model:value="queryForm.SampleStatus"
          :options="sampleStatusOptions"
          placeholder="留样状态"
          style="width: 120px"
          allow-clear
        />
        <Select
          v-model:value="queryForm.IsComplaint"
          :options="isComplaintOptions"
          placeholder="是否涉及投诉"
          style="width: 140px"
          allow-clear
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
        <template v-if="column.key === 'sampleDate'">
          <span v-if="record.sampleDate">
            {{ dayjs(record.sampleDate).format('YYYY-MM-DD') }}
          </span>
          <span v-else>—</span>
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

    <!-- 创建 / 编辑餐食留样弹窗 -->
    <Modal
      v-model:open="createModalVisible"
      :title="isEditMode ? '更新餐食留样' : '创建餐食留样'"
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
        layout="vertical"
      >
        <div class="grid grid-cols-2 gap-4">
          <Form.Item label="留样编号（如：LY2024010001）" name="sampleNo">
            <Input
              v-model:value="formModel.sampleNo"
              placeholder="请输入留样编号"
            />
          </Form.Item>
          <Form.Item label="留样日期" name="sampleDate">
            <DatePicker
              v-model:value="formModel.sampleDate"
              style="width: 100%"
              placeholder="请选择留样日期"
            />
          </Form.Item>
          <Form.Item label="留样时间" name="sampleTime">
            <TimePicker
              v-model:value="formModel.sampleTime"
              format="HH:mm:ss"
              value-format="HH:mm:ss"
              style="width: 100%"
              placeholder="请选择留样时间"
            />
          </Form.Item>
          <Form.Item label="餐次类型" name="mealType">
            <Select
              v-model:value="formModel.mealType"
              :options="mealTypeOptions"
              placeholder="请选择餐次类型"
            />
          </Form.Item>
          <Form.Item label="餐食名称" name="mealName">
            <Input
              v-model:value="formModel.mealName"
              placeholder="请输入餐食名称"
            />
          </Form.Item>
          <Form.Item label="留样内容（具体菜品）" name="sampleContent">
            <Input.TextArea
              v-model:value="formModel.sampleContent"
              :rows="2"
              placeholder="请输入留样内容"
            />
          </Form.Item>
          <Form.Item label="留样数量" name="sampleQuantity">
            <Input
              v-model:value="formModel.sampleQuantity"
              placeholder="请输入留样数量"
            />
          </Form.Item>
          <Form.Item label="留样容器" name="sampleContainer">
            <Input
              v-model:value="formModel.sampleContainer"
              placeholder="请输入留样容器"
            />
          </Form.Item>
          <Form.Item label="存放位置" name="storageLocation">
            <Input
              v-model:value="formModel.storageLocation"
              placeholder="请输入存放位置"
            />
          </Form.Item>
          <Form.Item label="存储温度" name="storageTemperature">
            <Input
              v-model:value="formModel.storageTemperature"
              placeholder="请输入存储温度"
            />
          </Form.Item>
          <Form.Item label="保留时间（小时）" name="retentionPeriod">
            <InputNumber
              v-model:value="formModel.retentionPeriod"
              :min="0"
              style="width: 100%"
              placeholder="请输入保留时间"
            />
          </Form.Item>
          <Form.Item label="留样状态" name="sampleStatus">
            <Select
              v-model:value="formModel.sampleStatus"
              :options="sampleStatusOptions"
              placeholder="请选择留样状态"
            />
          </Form.Item>
          <Form.Item label="留样人ID" name="samplerId">
            <Input
              v-model:value="formModel.samplerId"
              placeholder="请输入留样人ID"
            />
          </Form.Item>
          <Form.Item label="留样人姓名" name="samplerName">
            <Input
              v-model:value="formModel.samplerName"
              placeholder="请输入留样人姓名"
            />
          </Form.Item>
          <Form.Item label="见证人ID" name="witnessId">
            <Input
              v-model:value="formModel.witnessId"
              placeholder="请输入见证人ID"
            />
          </Form.Item>
          <Form.Item label="见证人姓名" name="witnessName">
            <Input
              v-model:value="formModel.witnessName"
              placeholder="请输入见证人姓名"
            />
          </Form.Item>
          <Form.Item label="检测时间" name="inspectionTime">
            <DatePicker
              v-model:value="formModel.inspectionTime"
              show-time
              style="width: 100%"
              placeholder="请选择检测时间"
            />
          </Form.Item>
          <Form.Item label="检测人ID" name="inspectorId">
            <Input
              v-model:value="formModel.inspectorId"
              placeholder="请输入检测人ID"
            />
          </Form.Item>
          <Form.Item label="检测结果" name="inspectionResult">
            <Input.TextArea
              v-model:value="formModel.inspectionResult"
              :rows="2"
              placeholder="请输入检测结果"
            />
          </Form.Item>
          <Form.Item label="销毁时间" name="disposalTime">
            <DatePicker
              v-model:value="formModel.disposalTime"
              show-time
              style="width: 100%"
              placeholder="请选择销毁时间"
            />
          </Form.Item>
          <Form.Item label="销毁方式" name="disposalMethod">
            <Input
              v-model:value="formModel.disposalMethod"
              placeholder="请输入销毁方式"
            />
          </Form.Item>
          <Form.Item label="销毁人ID" name="disposalPersonId">
            <Input
              v-model:value="formModel.disposalPersonId"
              placeholder="请输入销毁人ID"
            />
          </Form.Item>
          <Form.Item label="销毁见证人ID" name="disposalWitnessId">
            <Input
              v-model:value="formModel.disposalWitnessId"
              placeholder="请输入销毁见证人ID"
            />
          </Form.Item>
          <Form.Item label="是否涉及投诉" name="isComplaint">
            <Select
              v-model:value="formModel.isComplaint"
              :options="isComplaintOptions"
              placeholder="请选择是否涉及投诉"
            />
          </Form.Item>
          <Form.Item label="投诉ID" name="complaintId">
            <Input
              v-model:value="formModel.complaintId"
              placeholder="请输入投诉ID"
            />
          </Form.Item>
          <Form.Item label="安全备注" name="safetyNotes">
            <Input.TextArea
              v-model:value="formModel.safetyNotes"
              :rows="2"
              placeholder="请输入安全备注"
            />
          </Form.Item>
          <Form.Item label="附件" name="attachments">
            <Input
              v-model:value="formModel.attachments"
              placeholder="请输入附件"
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



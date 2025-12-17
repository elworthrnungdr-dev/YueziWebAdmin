<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import {
  getLeaveListApi,
  createLeaveApi,
  getLeaveDetailApi,
  updateLeaveApi,
  deleteLeaveApi,
  type LeaveItem,
  type LeaveListParams,
  type CreateLeaveParams,
  type UpdateLeaveParams,
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

const loading = ref(false);
const dataSource = ref<LeaveItem[]>([]);
const total = ref(0);

const queryForm = ref<LeaveListParams>({
  CreatedAtStart: undefined,
  CreatedAtEnd: undefined,
  PageIndex: 1,
  PageSize: 10,
  OrderBy: undefined,
  IsAsc: true,
});

const createdDateRange = ref<[Dayjs | null, Dayjs | null]>([null, null]);

const leaveTypeOptions = [
  { label: '临时外出', value: 1 },
  { label: '短期请假', value: 2 },
  { label: '长期请假', value: 3 },
];

const documentStatusOptions = [
  { label: '草稿', value: 1 },
  { label: '提交', value: 2 },
];

const babyAccompanyOptions = [
  { label: '是', value: 1 },
  { label: '否', value: 2 },
];

const columns = [
  {
    title: '客户ID',
    dataIndex: 'customerId',
    key: 'customerId',
    width: 150,
  },
  {
    title: '请假类型',
    dataIndex: 'leaveTypeText',
    key: 'leaveTypeText',
    width: 120,
  },
  {
    title: '申请时间',
    dataIndex: 'applyTime',
    key: 'applyTime',
    width: 170,
  },
  {
    title: '计划开始',
    dataIndex: 'plannedStart',
    key: 'plannedStart',
    width: 170,
  },
  {
    title: '计划结束',
    dataIndex: 'plannedEnd',
    key: 'plannedEnd',
    width: 170,
  },
  {
    title: '是否带宝宝',
    dataIndex: 'isBabyAccompanyText',
    key: 'isBabyAccompanyText',
    width: 120,
  },
  {
    title: '单据状态',
    dataIndex: 'documentStatus',
    key: 'documentStatus',
    width: 120,
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 170,
  },
  {
    title: '更新时间',
    dataIndex: 'updatedAt',
    key: 'updatedAt',
    width: 170,
  },
  {
    title: '操作',
    key: 'actions',
    width: 140,
    fixed: 'right',
  },
];

async function fetchList() {
  try {
    loading.value = true;

    if (createdDateRange.value[0] && createdDateRange.value[1]) {
      queryForm.value.CreatedAtStart = createdDateRange.value[0].format(
        'YYYY-MM-DD',
      );
      queryForm.value.CreatedAtEnd = createdDateRange.value[1].format(
        'YYYY-MM-DD',
      );
    } else {
      queryForm.value.CreatedAtStart = undefined;
      queryForm.value.CreatedAtEnd = undefined;
    }

    const result = await getLeaveListApi(queryForm.value);
    dataSource.value = result.items || [];
    total.value = result.total || 0;
  } catch (error: any) {
    const errMsg =
      error?.response?.data?.message ||
      error?.data?.message ||
      error?.message ||
      '获取请假记录列表失败';
    message.error(errMsg);
  } finally {
    loading.value = false;
  }
}

function handleReset() {
  queryForm.value = {
    CreatedAtStart: undefined,
    CreatedAtEnd: undefined,
    PageIndex: 1,
    PageSize: 10,
    OrderBy: undefined,
    IsAsc: true,
  };
  createdDateRange.value = [null, null];
  fetchList();
}

function handleTableChange(pagination: any) {
  queryForm.value.PageIndex = pagination.current;
  queryForm.value.PageSize = pagination.pageSize;
  fetchList();
}

// 创建/编辑请假记录弹窗相关
const createModalVisible = ref(false);
const submitting = ref(false);
const isEditMode = ref(false);
const editingLeaveId = ref<string>('');
const formRef = ref<FormInstance>();
const formModel = ref<
  CreateLeaveParams & {
    applyTime?: Dayjs;
    plannedStart?: Dayjs;
    plannedEnd?: Dayjs;
    actualStart?: Dayjs;
    actualEnd?: Dayjs;
  }
>({
  customerId: '',
  leaveType: 1,
  applyTime: undefined,
  plannedStart: undefined,
  plannedEnd: undefined,
  actualStart: undefined,
  actualEnd: undefined,
  leaveReason: '',
  destination: '',
  companion: '',
  emergencyContact: '',
  documentStatus: 1,
  isBabyAccompany: 1,
  maternalCheckinTemp: 0,
  babyCheckinTemp: '',
  maternalCheckoutTemp: 0,
  babyCheckoutTemp: '',
  riskNotice: '',
  customerSign: '',
  remark: '',
});

const formRules = {
  customerId: [{ required: true, message: '请输入客户ID' }],
  leaveType: [{ required: true, message: '请选择请假类型' }],
  applyTime: [{ required: true, message: '请选择申请时间' }],
  plannedStart: [{ required: true, message: '请选择计划开始时间' }],
  plannedEnd: [{ required: true, message: '请选择计划结束时间' }],
  leaveReason: [{ required: true, message: '请输入请假原因' }],
  documentStatus: [{ required: true, message: '请选择单据状态' }],
  isBabyAccompany: [{ required: true, message: '请选择是否带宝宝' }],
};

function resetForm() {
  formModel.value = {
    customerId: '',
    leaveType: 1,
    applyTime: undefined,
    plannedStart: undefined,
    plannedEnd: undefined,
    actualStart: undefined,
    actualEnd: undefined,
    leaveReason: '',
    destination: '',
    companion: '',
    emergencyContact: '',
    documentStatus: 1,
    isBabyAccompany: 1,
    maternalCheckinTemp: 0,
    babyCheckinTemp: '',
    maternalCheckoutTemp: 0,
    babyCheckoutTemp: '',
    riskNotice: '',
    customerSign: '',
    remark: '',
  };
  formRef.value?.resetFields();
}

function openCreateModal() {
  isEditMode.value = false;
  editingLeaveId.value = '';
  createModalVisible.value = true;
  resetForm();
}

async function openEditModal(record: LeaveItem) {
  isEditMode.value = true;
  editingLeaveId.value = record.id;
  createModalVisible.value = true;
  resetForm();

  try {
    const detail = await getLeaveDetailApi(record.id);
    formModel.value = {
      customerId: detail.customerId || '',
      leaveType: detail.leaveType ?? 1,
      applyTime: detail.applyTime ? dayjs(detail.applyTime) : undefined,
      plannedStart: detail.plannedStart ? dayjs(detail.plannedStart) : undefined,
      plannedEnd: detail.plannedEnd ? dayjs(detail.plannedEnd) : undefined,
      actualStart: detail.actualStart ? dayjs(detail.actualStart) : undefined,
      actualEnd: detail.actualEnd ? dayjs(detail.actualEnd) : undefined,
      leaveReason: detail.leaveReason || '',
      destination: detail.destination || '',
      companion: detail.companion || '',
      emergencyContact: detail.emergencyContact || '',
      documentStatus: detail.documentStatus ?? 1,
      isBabyAccompany: detail.isBabyAccompany ?? 1,
      maternalCheckinTemp: detail.maternalCheckinTemp ?? 0,
      babyCheckinTemp: detail.babyCheckinTemp || '',
      maternalCheckoutTemp: detail.maternalCheckoutTemp ?? 0,
      babyCheckoutTemp: detail.babyCheckoutTemp || '',
      riskNotice: detail.riskNotice || '',
      customerSign: detail.customerSign || '',
      remark: detail.remark || '',
    };
  } catch (error: any) {
    const errMsg =
      error?.response?.data?.message ||
      error?.data?.message ||
      error?.message ||
      '获取请假记录详情失败';
    message.error(errMsg);
    createModalVisible.value = false;
  }
}

function closeCreateModal() {
  createModalVisible.value = false;
  isEditMode.value = false;
  editingLeaveId.value = '';
  resetForm();
}

function toIso(val?: Dayjs) {
  return val ? val.toISOString() : undefined;
}

async function handleSubmit() {
  try {
    const values = await formRef.value?.validate();
    if (!values) return;
    submitting.value = true;

    const baseData = {
      ...values,
      applyTime: toIso(values.applyTime as Dayjs | undefined),
      plannedStart: toIso(values.plannedStart as Dayjs | undefined),
      plannedEnd: toIso(values.plannedEnd as Dayjs | undefined),
      actualStart: toIso(values.actualStart as Dayjs | undefined),
      actualEnd: toIso(values.actualEnd as Dayjs | undefined),
    };

    if (isEditMode.value) {
      const updateData: UpdateLeaveParams = {
        ...(baseData as CreateLeaveParams),
        id: editingLeaveId.value,
      };
      await updateLeaveApi(updateData);
      message.success('更新请假记录成功');
    } else {
      await createLeaveApi(baseData as CreateLeaveParams);
      message.success('创建请假记录成功');
    }
    closeCreateModal();
    fetchList();
  } catch (error: any) {
    if (error?.errorFields) {
      return;
    }
    const errMsg =
      error?.response?.data?.message ||
      error?.data?.message ||
      error?.message ||
      (isEditMode.value ? '更新请假记录失败' : '创建请假记录失败');
    message.error(errMsg);
    return;
  } finally {
    submitting.value = false;
  }
}

async function handleDelete(record: LeaveItem) {
  try {
    await deleteLeaveApi(record.id);
    message.success('删除请假记录成功');
    fetchList();
  } catch (error: any) {
    const errMsg =
      error?.response?.data?.message ||
      error?.data?.message ||
      error?.message ||
      '删除请假记录失败';
    message.error(errMsg);
  }
}

onMounted(() => {
  fetchList();
});
</script>

<template>
  <div class="p-4">
    <!-- 创建按钮和查询条件 -->
    <div
      class="mb-4"
      style="display: flex; justify-content: space-between; align-items: center"
    >
      <Button type="primary" class="cursor-pointer" @click="openCreateModal">
        创建请假记录
      </Button>
      <Space wrap>
        <DatePicker.RangePicker
          v-model:value="createdDateRange"
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
      :scroll="{ x: 1800 }"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'applyTime'">
          <span v-if="record.applyTime">
            {{ dayjs(record.applyTime).format('YYYY-MM-DD HH:mm:ss') }}
          </span>
          <span v-else>—</span>
        </template>
        <template v-else-if="column.key === 'plannedStart'">
          <span v-if="record.plannedStart">
            {{ dayjs(record.plannedStart).format('YYYY-MM-DD HH:mm:ss') }}
          </span>
          <span v-else>—</span>
        </template>
        <template v-else-if="column.key === 'plannedEnd'">
          <span v-if="record.plannedEnd">
            {{ dayjs(record.plannedEnd).format('YYYY-MM-DD HH:mm:ss') }}
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
        <template v-else-if="column.key === 'isBabyAccompanyText'">
          <span>
            {{
              record.isBabyAccompanyText ||
              (record.isBabyAccompany === 1 ? '是' : '否')
            }}
          </span>
        </template>
        <template v-else-if="column.key === 'documentStatus'">
          <span>
            {{
              ({ 1: '草稿', 2: '提交' } as Record<number, string>)[
                record.documentStatus
              ] || '—'
            }}
          </span>
        </template>
        <template v-else-if="column.key === 'actions'">
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
              title="确定删除该请假记录吗？"
              ok-text="删除"
              cancel-text="取消"
              @confirm="handleDelete(record)"
            >
              <Button type="link" danger size="small" class="cursor-pointer">
                删除
              </Button>
            </Popconfirm>
          </Space>
        </template>
      </template>
    </Table>

    <!-- 创建/编辑请假记录弹窗 -->
    <Modal
      v-model:open="createModalVisible"
      :title="isEditMode ? '更新请假记录' : '创建请假记录'"
      width="1100px"
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
        <div class="grid grid-cols-2 gap-x-6">
          <Form.Item label="客户ID" name="customerId">
            <Input
              v-model:value="formModel.customerId"
              placeholder="请输入客户ID"
            />
          </Form.Item>
          <Form.Item label="请假类型" name="leaveType">
            <Select
              v-model:value="formModel.leaveType"
              :options="leaveTypeOptions"
              placeholder="请选择请假类型"
            />
          </Form.Item>

          <Form.Item label="申请时间" name="applyTime">
            <DatePicker
              v-model:value="formModel.applyTime"
              show-time
              format="YYYY-MM-DD HH:mm:ss"
              style="width: 100%"
              placeholder="请选择申请时间"
            />
          </Form.Item>
          <Form.Item label="计划开始" name="plannedStart">
            <DatePicker
              v-model:value="formModel.plannedStart"
              show-time
              format="YYYY-MM-DD HH:mm:ss"
              style="width: 100%"
              placeholder="请选择计划开始时间"
            />
          </Form.Item>

          <Form.Item label="计划结束" name="plannedEnd">
            <DatePicker
              v-model:value="formModel.plannedEnd"
              show-time
              format="YYYY-MM-DD HH:mm:ss"
              style="width: 100%"
              placeholder="请选择计划结束时间"
            />
          </Form.Item>
          <Form.Item label="实际开始" name="actualStart">
            <DatePicker
              v-model:value="formModel.actualStart"
              show-time
              format="YYYY-MM-DD HH:mm:ss"
              style="width: 100%"
              placeholder="请选择实际开始时间"
            />
          </Form.Item>

          <Form.Item label="实际结束" name="actualEnd">
            <DatePicker
              v-model:value="formModel.actualEnd"
              show-time
              format="YYYY-MM-DD HH:mm:ss"
              style="width: 100%"
              placeholder="请选择实际结束时间"
            />
          </Form.Item>
          <Form.Item label="是否带宝宝" name="isBabyAccompany">
            <Select
              v-model:value="formModel.isBabyAccompany"
              :options="babyAccompanyOptions"
              placeholder="请选择是否带宝宝"
            />
          </Form.Item>

          <Form.Item label="单据状态" name="documentStatus">
            <Select
              v-model:value="formModel.documentStatus"
              :options="documentStatusOptions"
              placeholder="请选择单据状态"
            />
          </Form.Item>
          <Form.Item label="请假原因" name="leaveReason">
            <Input
              v-model:value="formModel.leaveReason"
              placeholder="请输入请假原因"
            />
          </Form.Item>

          <Form.Item label="目的地" name="destination">
            <Input
              v-model:value="formModel.destination"
              placeholder="请输入目的地"
            />
          </Form.Item>
          <Form.Item label="同行人" name="companion">
            <Input
              v-model:value="formModel.companion"
              placeholder="请输入同行人"
            />
          </Form.Item>

          <Form.Item label="紧急联系人" name="emergencyContact">
            <Input
              v-model:value="formModel.emergencyContact"
              placeholder="请输入紧急联系人"
            />
          </Form.Item>
          <Form.Item label="入所体温(妈)" name="maternalCheckinTemp">
            <InputNumber
              v-model:value="formModel.maternalCheckinTemp"
              :min="0"
              style="width: 100%"
              placeholder="请输入入所体温(妈)"
            />
          </Form.Item>

          <Form.Item label="入所体温(宝)" name="babyCheckinTemp">
            <Input
              v-model:value="formModel.babyCheckinTemp"
              placeholder="请输入入所体温(宝)"
            />
          </Form.Item>
          <Form.Item label="返所体温(妈)" name="maternalCheckoutTemp">
            <InputNumber
              v-model:value="formModel.maternalCheckoutTemp"
              :min="0"
              style="width: 100%"
              placeholder="请输入返所体温(妈)"
            />
          </Form.Item>

          <Form.Item label="返所体温(宝)" name="babyCheckoutTemp">
            <Input
              v-model:value="formModel.babyCheckoutTemp"
              placeholder="请输入返所体温(宝)"
            />
          </Form.Item>
          <Form.Item label="风险告知" name="riskNotice">
            <Input
              v-model:value="formModel.riskNotice"
              placeholder="请输入风险告知"
            />
          </Form.Item>

          <Form.Item label="客户签名" name="customerSign">
            <Input
              v-model:value="formModel.customerSign"
              placeholder="请输入客户签名"
            />
          </Form.Item>
        </div>
        <Form.Item label="备注" name="remark">
          <Input.TextArea
            v-model:value="formModel.remark"
            :rows="4"
            placeholder="请输入备注"
          />
        </Form.Item>
      </Form>
    </Modal>
  </div>
</template>


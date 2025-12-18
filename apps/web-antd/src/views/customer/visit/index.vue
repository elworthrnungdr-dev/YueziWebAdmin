<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import {
  getVisitListApi,
  createVisitApi,
  getVisitDetailApi,
  updateVisitApi,
  deleteVisitApi,
  type VisitItem,
  type VisitListParams,
  type CreateVisitParams,
  type UpdateVisitParams,
} from '#/api';

import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Select,
  Space,
  Table,
} from 'ant-design-vue';
import type { FormInstance } from 'ant-design-vue';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { h } from 'vue';

const loading = ref(false);
const dataSource = ref<VisitItem[]>([]);
const total = ref(0);

const queryForm = ref<VisitListParams>({
  VisitorName: undefined,
  CreatedAtStart: undefined,
  CreatedAtEnd: undefined,
  PageIndex: 1,
  PageSize: 10,
  OrderBy: undefined,
  IsAsc: true,
});

const createdDateRange = ref<[Dayjs | null, Dayjs | null]>([null, null]);

const relationOptions = [
  { label: '家人', value: 1 },
  { label: '朋友', value: 2 },
  { label: '同事', value: 3 },
  { label: '其他', value: 4 },
];

const idTypeOptions = [
  { label: '身份证', value: 1 },
  { label: '驾驶证', value: 2 },
  { label: '护照', value: 3 },
];

const approveOptions = [
  { label: '未批准', value: 0 },
  { label: '已批准', value: 1 },
];

const babyMeetOptions = [
  { label: '是', value: 1 },
  { label: '否', value: 2 },
];

const columns = [
  {
    title: '来访人姓名',
    dataIndex: 'visitorName',
    key: 'visitorName',
    width: 140,
  },
  {
    title: '来访人电话',
    dataIndex: 'visitorPhone',
    key: 'visitorPhone',
    width: 140,
  },
  {
    title: '来访人数',
    dataIndex: 'visitorCount',
    key: 'visitorCount',
    width: 100,
  },
  {
    title: '关系',
    dataIndex: 'relationText',
    key: 'relationText',
    width: 100,
  },
  {
    title: '证件类型',
    dataIndex: 'idTypeText',
    key: 'idTypeText',
    width: 120,
  },
  {
    title: '证件号',
    dataIndex: 'idNumber',
    key: 'idNumber',
    width: 180,
    ellipsis: true,
  },
  {
    title: '来访目的',
    dataIndex: 'visitPurpose',
    key: 'visitPurpose',
    width: 160,
    ellipsis: true,
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
    title: '审批状态',
    dataIndex: 'isApprovedText',
    key: 'isApprovedText',
    width: 100,
  },
  {
    title: '拜访宝宝',
    dataIndex: 'babyMeetText',
    key: 'babyMeetText',
    width: 100,
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
    align: 'center',
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

    const result = await getVisitListApi(queryForm.value);
    dataSource.value = result.items || [];
    total.value = result.total || 0;
  } catch (error: any) {
    const errMsg =
      error?.response?.data?.message ||
      error?.data?.message ||
      error?.message ||
      '获取来访登记列表失败';
    message.error(errMsg);
  } finally {
    loading.value = false;
  }
}

function handleReset() {
  queryForm.value = {
    VisitorName: undefined,
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

// 创建/编辑来访登记弹窗相关
const createModalVisible = ref(false);
const submitting = ref(false);
const isEditMode = ref(false);
const editingVisitId = ref<string>('');
const formRef = ref<FormInstance>();
const formModel = ref<CreateVisitParams & {
  plannedStart?: Dayjs;
  plannedEnd?: Dayjs;
  actualStart?: Dayjs;
  actualEnd?: Dayjs;
  approveTime?: Dayjs;
}>({
  customerId: '',
  visitorName: '',
  visitorPhone: '',
  visitorCount: 0,
  relation: 1,
  idType: 1,
  idNumber: '',
  visitPurpose: '',
  plannedStart: undefined,
  plannedEnd: undefined,
  actualStart: undefined,
  actualEnd: undefined,
  visitDuration: 0,
  isApproved: 0,
  approverId: '',
  approveTime: undefined,
  rejectReason: '',
  visitLocation: '',
  roomId: '',
  carryItems: '',
  healthStatus: '',
  babyMeet: 1,
  remark: '',
});

const formRules = {
  customerId: [{ required: true, message: '请输入客户ID' }],
  visitorName: [{ required: true, message: '请输入来访人姓名' }],
  visitorPhone: [{ required: true, message: '请输入来访人电话' }],
  visitorCount: [{ required: true, message: '请输入来访人数' }],
  relation: [{ required: true, message: '请选择关系' }],
  visitPurpose: [{ required: true, message: '请输入来访目的' }],
  plannedStart: [{ required: true, message: '请选择计划开始时间' }],
  plannedEnd: [{ required: true, message: '请选择计划结束时间' }],
  isApproved: [{ required: true, message: '请选择审批状态' }],
  babyMeet: [{ required: true, message: '请选择是否拜访宝宝' }],
  idType: [{ required: true, message: '请选择证件类型' }],
};

function resetForm() {
  formModel.value = {
    customerId: '',
    visitorName: '',
    visitorPhone: '',
    visitorCount: 0,
    relation: 1,
    idType: 1,
    idNumber: '',
    visitPurpose: '',
    plannedStart: undefined,
    plannedEnd: undefined,
    actualStart: undefined,
    actualEnd: undefined,
    visitDuration: 0,
    isApproved: 0,
    approverId: '',
    approveTime: undefined,
    rejectReason: '',
    visitLocation: '',
    roomId: '',
    carryItems: '',
    healthStatus: '',
    babyMeet: 1,
    remark: '',
  };
  formRef.value?.resetFields();
}

function openCreateModal() {
  isEditMode.value = false;
  editingVisitId.value = '';
  createModalVisible.value = true;
  resetForm();
}

async function openEditModal(record: VisitItem) {
  isEditMode.value = true;
  editingVisitId.value = record.id;
  createModalVisible.value = true;
  resetForm();

  try {
    const detail = await getVisitDetailApi(record.id);
    formModel.value = {
      customerId: detail.customerId || '',
      visitorName: detail.visitorName || '',
      visitorPhone: detail.visitorPhone || '',
      visitorCount: detail.visitorCount ?? 0,
      relation: detail.relation ?? 1,
      idType: detail.idType ?? 1,
      idNumber: detail.idNumber || '',
      visitPurpose: detail.visitPurpose || '',
      plannedStart: detail.plannedStart ? dayjs(detail.plannedStart) : undefined,
      plannedEnd: detail.plannedEnd ? dayjs(detail.plannedEnd) : undefined,
      actualStart: detail.actualStart ? dayjs(detail.actualStart) : undefined,
      actualEnd: detail.actualEnd ? dayjs(detail.actualEnd) : undefined,
      visitDuration: detail.visitDuration ?? 0,
      isApproved: detail.isApproved ?? 0,
      approverId: detail.approverId || '',
      approveTime: detail.approveTime ? dayjs(detail.approveTime) : undefined,
      rejectReason: detail.rejectReason || '',
      visitLocation: detail.visitLocation || '',
      roomId: detail.roomId || '',
      carryItems: detail.carryItems || '',
      healthStatus: detail.healthStatus || '',
      babyMeet: detail.babyMeet ?? 1,
      remark: detail.remark || '',
    };
  } catch (error: any) {
    const errMsg =
      error?.response?.data?.message ||
      error?.data?.message ||
      error?.message ||
      '获取来访登记详情失败';
    message.error(errMsg);
    createModalVisible.value = false;
  }
}

function closeCreateModal() {
  createModalVisible.value = false;
  isEditMode.value = false;
  editingVisitId.value = '';
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
      plannedStart: toIso(values.plannedStart as Dayjs | undefined),
      plannedEnd: toIso(values.plannedEnd as Dayjs | undefined),
      actualStart: toIso(values.actualStart as Dayjs | undefined),
      actualEnd: toIso(values.actualEnd as Dayjs | undefined),
      approveTime: toIso(values.approveTime as Dayjs | undefined),
    };

    if (isEditMode.value) {
      const updateData: UpdateVisitParams = {
        ...(baseData as CreateVisitParams),
        id: editingVisitId.value,
      };
      await updateVisitApi(updateData);
      message.success('更新来访登记成功');
    } else {
      await createVisitApi(baseData as CreateVisitParams);
      message.success('创建来访登记成功');
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
      (isEditMode.value ? '更新来访登记失败' : '创建来访登记失败');
    message.error(errMsg);
    return;
  } finally {
    submitting.value = false;
  }
}

function handleDelete(record: VisitItem) {
  Modal.confirm({
    title: '确认删除',
    content: h('div', { style: { fontSize: '14px', lineHeight: '1.6' } }, [
      h('p', {
        style: { marginBottom: '8px', color: '#ff4d4f', fontWeight: 500 },
      }, '⚠️ 警告'),
      h('p', { style: { margin: 0 } }, '确定要删除该来访登记吗？'),
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
        await deleteVisitApi(record.id);
        message.success('删除来访登记成功');
        fetchList();
      } catch (error: any) {
        const errMsg =
          error?.response?.data?.message ||
          error?.data?.message ||
          error?.message ||
          '删除来访登记失败';
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
    <!-- 创建按钮和查询条件 -->
    <div
      class="mb-4"
      style="display: flex; justify-content: space-between; align-items: center"
    >
      <Button type="primary" class="cursor-pointer" @click="openCreateModal">
        创建来访登记
      </Button>
      <Space wrap>
        <Input
          v-model:value="queryForm.VisitorName"
          placeholder="来访人姓名"
          style="width: 200px"
          allow-clear
        />
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
        <template v-if="column.key === 'plannedStart'">
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
        <template v-else-if="column.key === 'isApprovedText'">
          <span>{{ record.isApprovedText || (record.isApproved === 1 ? '已批准' : '未批准') }}</span>
        </template>
        <template v-else-if="column.key === 'babyMeetText'">
          <span>{{ record.babyMeetText || (record.babyMeet === 1 ? '是' : '否') }}</span>
        </template>
        <template v-else-if="column.key === 'relationText'">
          <span>
            {{
              record.relationText ||
              ({
                1: '家人',
                2: '朋友',
                3: '同事',
                4: '其他',
              } as Record<number, string>)[record.relation] ||
              '—'
            }}
          </span>
        </template>
        <template v-else-if="column.key === 'idTypeText'">
          <span>
            {{
              record.idTypeText ||
              ({
                1: '身份证',
                2: '驾驶证',
                3: '护照',
              } as Record<number, string>)[record.idType] ||
              '—'
            }}
          </span>
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

    <!-- 创建/编辑来访登记弹窗 -->
    <Modal
      v-model:open="createModalVisible"
      :title="isEditMode ? '更新来访登记' : '创建来访登记'"
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
            <Input v-model:value="formModel.customerId" placeholder="请输入客户ID" />
          </Form.Item>
          <Form.Item label="来访人姓名" name="visitorName">
            <Input v-model:value="formModel.visitorName" placeholder="请输入来访人姓名" />
          </Form.Item>

          <Form.Item label="来访人电话" name="visitorPhone">
            <Input v-model:value="formModel.visitorPhone" placeholder="请输入来访人电话" />
          </Form.Item>
          <Form.Item label="来访人数" name="visitorCount">
            <InputNumber
              v-model:value="formModel.visitorCount"
              :min="0"
              placeholder="请输入来访人数"
              style="width: 100%"
            />
          </Form.Item>

          <Form.Item label="关系" name="relation">
            <Select
              v-model:value="formModel.relation"
              :options="relationOptions"
              placeholder="请选择关系"
            />
          </Form.Item>
          <Form.Item label="证件类型" name="idType">
            <Select
              v-model:value="formModel.idType"
              :options="idTypeOptions"
              placeholder="请选择证件类型"
            />
          </Form.Item>

          <Form.Item label="证件号" name="idNumber">
            <Input v-model:value="formModel.idNumber" placeholder="请输入证件号" />
          </Form.Item>
          <Form.Item label="来访目的" name="visitPurpose">
            <Input v-model:value="formModel.visitPurpose" placeholder="请输入来访目的" />
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

          <Form.Item label="拜访宝宝" name="babyMeet">
            <Select
              v-model:value="formModel.babyMeet"
              :options="babyMeetOptions"
              placeholder="请选择是否拜访宝宝"
            />
          </Form.Item>
          <Form.Item label="审批状态" name="isApproved">
            <Select
              v-model:value="formModel.isApproved"
              :options="approveOptions"
              placeholder="请选择审批状态"
            />
          </Form.Item>

          <Form.Item label="来访时长" name="visitDuration">
            <InputNumber
              v-model:value="formModel.visitDuration"
              :min="0"
              placeholder="请输入来访时长"
              style="width: 100%"
            />
          </Form.Item>
          <Form.Item label="审批人ID" name="approverId">
            <Input v-model:value="formModel.approverId" placeholder="请输入审批人ID" />
          </Form.Item>

          <Form.Item label="审批时间" name="approveTime">
            <DatePicker
              v-model:value="formModel.approveTime"
              show-time
              format="YYYY-MM-DD HH:mm:ss"
              style="width: 100%"
              placeholder="请选择审批时间"
            />
          </Form.Item>
          <Form.Item label="驳回原因" name="rejectReason">
            <Input v-model:value="formModel.rejectReason" placeholder="请输入驳回原因" />
          </Form.Item>

          <Form.Item label="来访位置" name="visitLocation">
            <Input v-model:value="formModel.visitLocation" placeholder="请输入来访位置" />
          </Form.Item>
          <Form.Item label="房间ID" name="roomId">
            <Input v-model:value="formModel.roomId" placeholder="请输入房间ID" />
          </Form.Item>

          <Form.Item label="携带物品" name="carryItems">
            <Input v-model:value="formModel.carryItems" placeholder="请输入携带物品" />
          </Form.Item>
          <Form.Item label="健康状况" name="healthStatus">
            <Input v-model:value="formModel.healthStatus" placeholder="请输入健康状况" />
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


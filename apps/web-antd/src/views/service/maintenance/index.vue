<script lang="ts" setup>
import { h, onMounted, ref, reactive } from 'vue';
import dayjs from 'dayjs';
import {
  Button,
  DatePicker,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Table,
  message,
} from 'ant-design-vue';
import type { FormInstance } from 'ant-design-vue';

import {
  getMaintenanceRecordListApi,
  getMaintenanceRecordDetailApi,
  createMaintenanceRecordApi,
  updateMaintenanceRecordApi,
  deleteMaintenanceRecordApi,
  updateMaintenanceRecordStatusApi,
  type MaintenanceRecordListParams,
  type BackendMaintenanceRecordItem,
  type CreateMaintenanceRecordParams,
  type UpdateMaintenanceRecordParams,
  type UpdateMaintenanceStatusParams,
  getSafetyProjectListApi,
  type SafetyProjectItem,
} from '#/api';

const loading = ref(false);
const dataSource = ref<BackendMaintenanceRecordItem[]>([]);
const total = ref(0);

const queryForm = ref<MaintenanceRecordListParams>({
  ExecutorName: undefined,
  MaintenanceDateStart: undefined,
  MaintenanceDateEnd: undefined,
  PlanStartDateStart: undefined,
  PlanStartDateEnd: undefined,
  PlanEndDateStart: undefined,
  PlanEndDateEnd: undefined,
  ActualStartDateStart: undefined,
  ActualStartDateEnd: undefined,
  ActualEndDateStart: undefined,
  ActualEndDateEnd: undefined,
  CompletedTimeStart: undefined,
  CompletedTimeEnd: undefined,
  CreatedAtStart: undefined,
  CreatedAtEnd: undefined,
  UpdatedAtStart: undefined,
  UpdatedAtEnd: undefined,
  PageIndex: 1,
  PageSize: 10,
  OrderBy: undefined,
  IsAsc: true,
});

const columns = [
  { title: '记录号', dataIndex: 'recordNo', key: 'recordNo', width: 140 },
  { title: '执行人', dataIndex: 'executorName', key: 'executorName', width: 120 },
  { title: '维护类型', dataIndex: 'maintenanceTypeText', key: 'maintenanceTypeText', width: 110 },
  {
    title: '维护日期',
    dataIndex: 'maintenanceDate',
    key: 'maintenanceDate',
    width: 160,
    customRender: ({ record }: any) =>
      record.maintenanceDate ? dayjs(record.maintenanceDate).format('YYYY-MM-DD HH:mm') : '—',
  },
  {
    title: '计划开始',
    dataIndex: 'planStartDate',
    key: 'planStartDate',
    width: 160,
    customRender: ({ record }: any) =>
      record.planStartDate ? dayjs(record.planStartDate).format('YYYY-MM-DD HH:mm') : '—',
  },
  {
    title: '计划完成',
    dataIndex: 'planEndDate',
    key: 'planEndDate',
    width: 160,
    customRender: ({ record }: any) =>
      record.planEndDate ? dayjs(record.planEndDate).format('YYYY-MM-DD HH:mm') : '—',
  },
  {
    title: '实际开始',
    dataIndex: 'actualStartDate',
    key: 'actualStartDate',
    width: 160,
    customRender: ({ record }: any) =>
      record.actualStartDate ? dayjs(record.actualStartDate).format('YYYY-MM-DD HH:mm') : '—',
  },
  {
    title: '实际完成',
    dataIndex: 'actualEndDate',
    key: 'actualEndDate',
    width: 160,
    customRender: ({ record }: any) =>
      record.actualEndDate ? dayjs(record.actualEndDate).format('YYYY-MM-DD HH:mm') : '—',
  },
  {
    title: '完成时间',
    dataIndex: 'completedTime',
    key: 'completedTime',
    width: 160,
    customRender: ({ record }: any) =>
      record.completedTime ? dayjs(record.completedTime).format('YYYY-MM-DD HH:mm') : '—',
  },
  { title: '紧急程度', dataIndex: 'isUrgentText', key: 'isUrgentText', width: 100 },
  { title: '状态', dataIndex: 'maintenanceStatusText', key: 'maintenanceStatusText', width: 100 },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 170,
    customRender: ({ record }: any) =>
      record.createdAt ? dayjs(record.createdAt).format('YYYY-MM-DD HH:mm:ss') : '—',
  },
  { title: '操作', key: 'actions', width: 160, fixed: 'right' },
];

const maintenanceTypeOptions = [
  { label: '检修', value: 1 },
  { label: '清洁', value: 2 },
  { label: '保养', value: 3 },
  { label: '检测', value: 4 },
];

const urgentOptions = [
  { label: '是', value: 1 },
  { label: '否', value: 2 },
];

const projectOptions = ref<SafetyProjectItem[]>([]);

async function loadProjectOptions() {
  try {
    const res = await getSafetyProjectListApi({
      PageIndex: 1,
      PageSize: 100,
    });
    projectOptions.value = res.items;
  } catch (error: any) {
    const errMsg = error?.response?.data?.message || error?.message || '获取关联项目失败';
    message.error(errMsg);
  }
}

function setSingleDate(startKey: keyof MaintenanceRecordListParams, endKey: keyof MaintenanceRecordListParams, value: any) {
  if (value) {
    const iso = dayjs(value).toISOString();
    queryForm.value[startKey] = iso;
    queryForm.value[endKey] = iso;
  } else {
    queryForm.value[startKey] = undefined;
    queryForm.value[endKey] = undefined;
  }
}

async function fetchList() {
  try {
    loading.value = true;
    const params = { ...queryForm.value };
    const res = await getMaintenanceRecordListApi(params);
    dataSource.value = res.items;
    total.value = res.total;
  } catch (error: any) {
    const errMsg = error?.response?.data?.message || error?.message || '获取检修清洁列表失败';
    message.error(errMsg);
  } finally {
    loading.value = false;
  }
}

function handleReset() {
  queryForm.value = {
    ExecutorName: undefined,
    MaintenanceDateStart: undefined,
    MaintenanceDateEnd: undefined,
    PlanStartDateStart: undefined,
    PlanStartDateEnd: undefined,
    PlanEndDateStart: undefined,
    PlanEndDateEnd: undefined,
    ActualStartDateStart: undefined,
    ActualStartDateEnd: undefined,
    ActualEndDateStart: undefined,
    ActualEndDateEnd: undefined,
    CompletedTimeStart: undefined,
    CompletedTimeEnd: undefined,
    CreatedAtStart: undefined,
    CreatedAtEnd: undefined,
    UpdatedAtStart: undefined,
    UpdatedAtEnd: undefined,
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
  loadProjectOptions();
});

// 创建 / 编辑弹窗相关
const createModalVisible = ref(false);
const isEditMode = ref(false);
const submitting = ref(false);
const formRef = ref<FormInstance>();
const editingId = ref('');

const formModel = ref<CreateMaintenanceRecordParams>({
  projectId: '',
  maintenanceType: 1,
  maintenanceDate: dayjs().format('YYYY-MM-DDTHH:mm:ss[Z]'),
  maintenanceContent: '',
  isUrgent: 2,
  planStartDate: undefined,
  planEndDate: undefined,
  remark: '',
});

const formRules = {
  projectId: [{ required: true, message: '请选择关联项目' }],
  maintenanceType: [{ required: true, message: '请选择类型' }],
  maintenanceDate: [{ required: true, message: '请选择维护日期' }],
  maintenanceContent: [{ required: true, message: '请输入维护内容' }],
  isUrgent: [{ required: true, message: '请选择是否紧急' }],
};

// 更新状态弹窗相关
const statusModalVisible = ref(false);
const statusSubmitting = ref(false);
const statusFormRef = ref<FormInstance>();

const statusFormModel = reactive<UpdateMaintenanceStatusParams>({
  id: '',
  maintenanceStatus: 1,
  actualStartDate: undefined,
  actualEndDate: undefined,
  executorId: '',
  supervisorId: '',
  completedTime: undefined,
  verificationResult: undefined,
  verificationEmployeeId: '',
  remark: '',
});

function openCreateModal() {
  isEditMode.value = false;
  editingId.value = '';
  formModel.value = {
    projectId: '',
    maintenanceType: 1,
    maintenanceDate: dayjs().toISOString(),
    maintenanceContent: '',
    isUrgent: 2,
    planStartDate: undefined,
    planEndDate: undefined,
    remark: '',
  };
  createModalVisible.value = true;
}

async function openEditModal(record: BackendMaintenanceRecordItem) {
  try {
    loading.value = true;
    const detail = await getMaintenanceRecordDetailApi(record.id);
    isEditMode.value = true;
    editingId.value = detail.id;
    formModel.value = {
      projectId: detail.projectId || '',
      maintenanceType: detail.maintenanceType ?? 1,
      maintenanceDate: detail.maintenanceDate || dayjs().format('YYYY-MM-DDTHH:mm:ss[Z]'),
      maintenanceContent: detail.maintenanceContent || '',
      isUrgent: detail.isUrgent ?? 2,
      planStartDate: detail.planStartDate,
      planEndDate: detail.planEndDate,
      remark: detail.remark || '',
    };
    createModalVisible.value = true;
  } catch (error: any) {
    const errMsg = error?.response?.data?.message || error?.message || '获取检修清洁详情失败';
    message.error(errMsg);
  } finally {
    loading.value = false;
  }
}

function openStatusModal(record: BackendMaintenanceRecordItem) {
  statusFormModel.id = record.id;
  statusFormModel.maintenanceStatus =
    typeof record.maintenanceStatus === 'number'
      ? record.maintenanceStatus
      : Number(record.maintenanceStatus) || 1;
  statusFormModel.actualStartDate = record.actualStartDate;
  statusFormModel.actualEndDate = record.actualEndDate;
  statusFormModel.executorId = record.executorId;
  statusFormModel.supervisorId = record.supervisorId;
  statusFormModel.completedTime = record.completedTime;
  statusFormModel.verificationResult =
    record.verificationResult !== undefined && record.verificationResult !== null
      ? Number(record.verificationResult)
      : undefined;
  statusFormModel.verificationEmployeeId = record.verificationEmployeeId;
  statusFormModel.remark = record.remark;
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
    await updateMaintenanceRecordStatusApi(statusFormModel);
    message.success('更新状态成功');
    closeStatusModal();
    fetchList();
  } catch (error: any) {
    if (error?.errorFields) return;
    const errMsg = error?.response?.data?.message || error?.message || '更新状态失败';
    message.error(errMsg);
  } finally {
    statusSubmitting.value = false;
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
    const payload: CreateMaintenanceRecordParams = {
      projectId: formModel.value.projectId,
      maintenanceType: formModel.value.maintenanceType,
      maintenanceDate: formModel.value.maintenanceDate,
      maintenanceContent: formModel.value.maintenanceContent,
      isUrgent: formModel.value.isUrgent,
      planStartDate: formModel.value.planStartDate,
      planEndDate: formModel.value.planEndDate,
      remark: formModel.value.remark,
    };

    if (isEditMode.value) {
      await updateMaintenanceRecordApi({
        ...(payload as any),
        id: editingId.value,
      } as UpdateMaintenanceRecordParams);
      message.success('更新检修清洁成功');
    } else {
      await createMaintenanceRecordApi(payload);
      message.success('创建检修清洁成功');
    }
    closeCreateModal();
    fetchList();
  } catch (error: any) {
    if (error?.errorFields) return;
    const errMsg = error?.response?.data?.message || error?.message || '操作失败';
    message.error(errMsg);
  } finally {
    submitting.value = false;
  }
}

function handleDelete(record: BackendMaintenanceRecordItem) {
  Modal.confirm({
    title: '确认删除',
    content: h('div', { style: { fontSize: '14px' } }, `确定删除记录【${record.recordNo || ''}】吗？`),
    okText: '删除',
    cancelText: '取消',
    okType: 'danger',
    centered: true,
    onOk: async () => {
      try {
        loading.value = true;
        await deleteMaintenanceRecordApi(record.id);
        message.success('删除成功');
        fetchList();
      } catch (error: any) {
        const errMsg = error?.response?.data?.message || error?.message || '删除失败';
        message.error(errMsg);
        throw error;
      } finally {
        loading.value = false;
      }
    },
  });
}
</script>

<template>
  <div class="p-4">
    <!-- 顶部操作和搜索 -->
    <div class="mb-4 flex items-center justify-between gap-3 flex-wrap">
      <Button type="primary" class="cursor-pointer" @click="openCreateModal">
        创建检修清洁
      </Button>
      <Space wrap>
        <Input
          v-model:value="queryForm.ExecutorName"
          placeholder="执行人姓名"
          style="width: 160px"
          allow-clear
        />
        <DatePicker
          show-time
          format="YYYY-MM-DD HH:mm"
          placeholder="维护日期"
          style="width: 220px"
          value-format="YYYY-MM-DDTHH:mm:ss[Z]"
          @change="(val) => setSingleDate('MaintenanceDateStart', 'MaintenanceDateEnd', val)"
        />
        <DatePicker
          show-time
          format="YYYY-MM-DD HH:mm"
          placeholder="计划开始日期"
          style="width: 220px"
          value-format="YYYY-MM-DDTHH:mm:ss[Z]"
          @change="(val) => setSingleDate('PlanStartDateStart', 'PlanStartDateEnd', val)"
        />
        <DatePicker
          show-time
          format="YYYY-MM-DD HH:mm"
          placeholder="计划完成日期"
          style="width: 220px"
          value-format="YYYY-MM-DDTHH:mm:ss[Z]"
          @change="(val) => setSingleDate('PlanEndDateStart', 'PlanEndDateEnd', val)"
        />
        <DatePicker
          show-time
          format="YYYY-MM-DD HH:mm"
          placeholder="实际开始日期"
          style="width: 220px"
          value-format="YYYY-MM-DDTHH:mm:ss[Z]"
          @change="(val) => setSingleDate('ActualStartDateStart', 'ActualStartDateEnd', val)"
        />
        <DatePicker
          show-time
          format="YYYY-MM-DD HH:mm"
          placeholder="实际完成日期"
          style="width: 220px"
          value-format="YYYY-MM-DDTHH:mm:ss[Z]"
          @change="(val) => setSingleDate('ActualEndDateStart', 'ActualEndDateEnd', val)"
        />
        <DatePicker
          show-time
          format="YYYY-MM-DD HH:mm"
          placeholder="完成时间"
          style="width: 220px"
          value-format="YYYY-MM-DDTHH:mm:ss[Z]"
          @change="(val) => setSingleDate('CompletedTimeStart', 'CompletedTimeEnd', val)"
        />
        <DatePicker
          show-time
          format="YYYY-MM-DD HH:mm"
          placeholder="创建时间"
          style="width: 220px"
          value-format="YYYY-MM-DDTHH:mm:ss[Z]"
          @change="(val) => setSingleDate('CreatedAtStart', 'CreatedAtEnd', val)"
        />
        <DatePicker
          show-time
          format="YYYY-MM-DD HH:mm"
          placeholder="更新时间"
          style="width: 220px"
          value-format="YYYY-MM-DDTHH:mm:ss[Z]"
          @change="(val) => setSingleDate('UpdatedAtStart', 'UpdatedAtEnd', val)"
        />
        <Button type="primary" class="cursor-pointer" @click="fetchList">
          查询
        </Button>
        <Button class="cursor-pointer" @click="handleReset">重置</Button>
      </Space>
    </div>

    <!-- 表格 -->
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
      :scroll="{ x: 'max-content' }"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'actions'">
          <Space>
            <Button type="link" size="small" @click="openEditModal(record)">更新</Button>
            <Button type="link" size="small" @click="openStatusModal(record)">更新状态</Button>
            <Button type="link" size="small" danger @click="handleDelete(record)">删除</Button>
          </Space>
        </template>
      </template>
    </Table>

    <!-- 创建 / 编辑弹窗 -->
    <Modal
      v-model:open="createModalVisible"
      :title="isEditMode ? '更新检修清洁' : '创建检修清洁'"
      width="660px"
      :confirm-loading="submitting"
      :body-style="{ maxHeight: '640px', overflowY: 'auto' }"
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
          <Form.Item label="关联项目" name="projectId">
            <Select
              v-model:value="formModel.projectId"
              :options="projectOptions.map((p) => ({ label: p.projectName, value: p.id }))"
              placeholder="请选择关联项目"
              show-search
              option-filter-prop="label"
            />
          </Form.Item>
          <Form.Item label="类型" name="maintenanceType">
            <Select
              v-model:value="formModel.maintenanceType"
              :options="maintenanceTypeOptions"
              placeholder="请选择类型"
            />
          </Form.Item>
          <Form.Item label="维护日期" name="maintenanceDate">
            <DatePicker
              v-model:value="formModel.maintenanceDate"
              show-time
              style="width: 100%"
              value-format="YYYY-MM-DDTHH:mm:ss[Z]"
              placeholder="请选择维护日期"
            />
          </Form.Item>
          <Form.Item label="计划开始日期" name="planStartDate">
            <DatePicker
              v-model:value="formModel.planStartDate"
              show-time
              style="width: 100%"
              value-format="YYYY-MM-DDTHH:mm:ss[Z]"
              placeholder="请选择计划开始日期"
            />
          </Form.Item>
          <Form.Item label="计划完成日期" name="planEndDate">
            <DatePicker
              v-model:value="formModel.planEndDate"
              show-time
              style="width: 100%"
              value-format="YYYY-MM-DDTHH:mm:ss[Z]"
              placeholder="请选择计划完成日期"
            />
          </Form.Item>
          <Form.Item label="是否紧急" name="isUrgent">
            <Select
              v-model:value="formModel.isUrgent"
              :options="urgentOptions"
              placeholder="请选择是否紧急"
            />
          </Form.Item>
        </div>
        <div class="grid grid-cols-3 gap-4">
          <Form.Item class="col-span-3" label="维护内容" name="maintenanceContent">
            <Input.TextArea
              v-model:value="formModel.maintenanceContent"
              :rows="3"
              placeholder="请输入维护内容"
            />
          </Form.Item>
          <Form.Item class="col-span-3" label="备注" name="remark">
            <Input.TextArea v-model:value="formModel.remark" :rows="3" placeholder="请输入备注" />
          </Form.Item>
        </div>
      </Form>
    </Modal>

    <!-- 更新状态弹窗 -->
    <Modal
      v-model:open="statusModalVisible"
      title="更新状态"
      width="570px"
      :confirm-loading="statusSubmitting"
      :body-style="{ maxHeight: '480px', overflowY: 'auto' }"
      @ok="handleStatusSubmit"
      @cancel="closeStatusModal"
      destroy-on-close
    >
      <Form
        ref="statusFormRef"
        :model="statusFormModel"
        layout="vertical"
      >
        <div class="grid grid-cols-3 gap-4">
          <Form.Item
            label="状态"
            name="maintenanceStatus"
            :rules="[{ required: true, message: '请选择状态' }]"
          >
            <Select
              v-model:value="statusFormModel.maintenanceStatus"
              :options="[
                { label: '待执行', value: 1 },
                { label: '进行中', value: 2 },
                { label: '已完成', value: 3 },
                { label: '已取消', value: 4 },
              ]"
              placeholder="请选择状态"
            />
          </Form.Item>
          <Form.Item
            label="实际开始日期"
            name="actualStartDate"
            :rules="[{ required: true, message: '请选择实际开始日期' }]"
          >
            <DatePicker
              v-model:value="statusFormModel.actualStartDate"
              show-time
              format="YYYY-MM-DD HH:mm"
              value-format="YYYY-MM-DDTHH:mm:ss[Z]"
              style="width: 100%"
              placeholder="请选择实际开始日期"
            />
          </Form.Item>
          <Form.Item
            label="实际完成日期"
            name="actualEndDate"
            :rules="[{ required: true, message: '请选择实际完成日期' }]"
          >
            <DatePicker
              v-model:value="statusFormModel.actualEndDate"
              show-time
              format="YYYY-MM-DD HH:mm"
              value-format="YYYY-MM-DDTHH:mm:ss[Z]"
              style="width: 100%"
              placeholder="请选择实际完成日期"
            />
          </Form.Item>
          <Form.Item label="执行人ID" name="executorId">
            <Input
              v-model:value="statusFormModel.executorId"
              placeholder="请输入执行人ID"
            />
          </Form.Item>
          <Form.Item label="监督人ID" name="supervisorId">
            <Input
              v-model:value="statusFormModel.supervisorId"
              placeholder="请输入监督人ID"
            />
          </Form.Item>
          <Form.Item label="完成时间" name="completedTime">
            <DatePicker
              v-model:value="statusFormModel.completedTime"
              show-time
              format="YYYY-MM-DD HH:mm"
              value-format="YYYY-MM-DDTHH:mm:ss[Z]"
              style="width: 100%"
              placeholder="请选择完成时间"
            />
          </Form.Item>
          <Form.Item label="验收结果" name="verificationResult">
            <Select
              v-model:value="statusFormModel.verificationResult"
              :options="[
                { label: '合格', value: 1 },
                { label: '不合格', value: 2 },
                { label: '待定', value: 3 },
              ]"
              placeholder="请选择验收结果"
              allow-clear
            />
          </Form.Item>
          <Form.Item label="验收人ID" name="verificationEmployeeId">
            <Input
              v-model:value="statusFormModel.verificationEmployeeId"
              placeholder="请输入验收人ID"
            />
          </Form.Item>
          <Form.Item
            label="备注"
            name="remark"
            class="col-span-3"
          >
            <Input.TextArea
              v-model:value="statusFormModel.remark"
              :rows="3"
              placeholder="请输入备注"
            />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  </div>
</template>


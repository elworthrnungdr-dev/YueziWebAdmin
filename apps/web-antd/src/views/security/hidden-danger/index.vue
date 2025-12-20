<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import {
  getSafetyHazardReportListApi,
  createSafetyHazardReportApi,
  getSafetyHazardReportDetailApi,
  updateSafetyHazardReportApi,
  deleteSafetyHazardReportApi,
  getSafetyProjectListApi,
  getEmployeeListApi,
  type SafetyHazardReportItem,
  type SafetyHazardReportListParams,
  type CreateSafetyHazardReportParams,
  type UpdateSafetyHazardReportParams,
  type SafetyProjectItem,
  type EmployeeItem,
} from '#/api';

import {
  Button,
  DatePicker,
  Form,
  Input,
  Select,
  Space,
  Table,
  Modal,
  message,
  Radio,
} from 'ant-design-vue';
import type { FormInstance } from 'ant-design-vue';
import dayjs from 'dayjs';
import { h } from 'vue';

const loading = ref(false);
const dataSource = ref<SafetyHazardReportItem[]>([]);
const total = ref(0);

const queryForm = ref<SafetyHazardReportListParams>({
  DiscovererName: undefined,
  ReportTimeStart: undefined,
  ReportTimeEnd: undefined,
  CreatedAtStart: undefined,
  CreatedAtEnd: undefined,
  PageIndex: 1,
  PageSize: 10,
  OrderBy: undefined,
  IsAsc: true,
});

const hazardTypeOptions = [
  { label: '火灾隐患', value: 1 },
  { label: '电气隐患', value: 2 },
  { label: '结构隐患', value: 3 },
  { label: '设备隐患', value: 4 },
  { label: '其他隐患', value: 5 },
];

const hazardLevelOptions = [
  { label: '低', value: 1 },
  { label: '中', value: 2 },
  { label: '高', value: 3 },
];

const isUrgentOptions = [
  { label: '是', value: 1 },
  { label: '否', value: 2 },
];

const documentStatusOptions = [
  { label: '草稿', value: 1 },
  { label: '已提交', value: 2 },
];

const columns = [
  {
    title: '上报编号',
    dataIndex: 'reportNo',
    key: 'reportNo',
    width: 140,
  },
  {
    title: '隐患类型',
    dataIndex: 'hazardTypeText',
    key: 'hazardTypeText',
    width: 120,
  },
  {
    title: '隐患等级',
    dataIndex: 'hazardLevelText',
    key: 'hazardLevelText',
    width: 100,
  },
  {
    title: '位置',
    dataIndex: 'location',
    key: 'location',
    width: 180,
    ellipsis: true,
  },
  {
    title: '发现人',
    dataIndex: 'discovererName',
    key: 'discovererName',
    width: 120,
  },
  {
    title: '发现时间',
    dataIndex: 'discoverTime',
    key: 'discoverTime',
    width: 170,
  },
  {
    title: '是否紧急',
    dataIndex: 'isUrgentText',
    key: 'isUrgentText',
    width: 100,
  },
  {
    title: '上报时间',
    dataIndex: 'reportTime',
    key: 'reportTime',
    width: 170,
  },
  {
    title: '操作',
    key: 'actions',
    width: 160,
    fixed: 'right',
    align: 'center',
  },
];

async function fetchList() {
  try {
    loading.value = true;
    const params: SafetyHazardReportListParams = {
      ...queryForm.value,
      ReportTimeStart: queryForm.value.ReportTimeStart
        ? dayjs(queryForm.value.ReportTimeStart).toISOString()
        : undefined,
      ReportTimeEnd: queryForm.value.ReportTimeEnd
        ? dayjs(queryForm.value.ReportTimeEnd).toISOString()
        : undefined,
      CreatedAtStart: queryForm.value.CreatedAtStart
        ? dayjs(queryForm.value.CreatedAtStart).toISOString()
        : undefined,
      CreatedAtEnd: queryForm.value.CreatedAtEnd
        ? dayjs(queryForm.value.CreatedAtEnd).toISOString()
        : undefined,
    };
    const result = await getSafetyHazardReportListApi(params);
    dataSource.value = result.items || [];
    total.value = result.total || 0;
  } catch (error: any) {
    const errMsg =
      error?.response?.data?.message ||
      error?.data?.message ||
      error?.message ||
      '获取隐患上报列表失败';
    message.error(errMsg);
  } finally {
    loading.value = false;
  }
}

function handleReset() {
  queryForm.value = {
    DiscovererName: undefined,
    ReportTimeStart: undefined,
    ReportTimeEnd: undefined,
    CreatedAtStart: undefined,
    CreatedAtEnd: undefined,
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

// 创建 / 编辑弹窗
const createModalVisible = ref(false);
const submitting = ref(false);
const isEditMode = ref(false);
const editingId = ref<string>('');
const formRef = ref<FormInstance>();

const projectOptions = ref<SafetyProjectItem[]>([]);
const employeeOptions = ref<EmployeeItem[]>([]);

const formModel = ref<{
  projectId: string;
  documentStatus: number;
  hazardType: number;
  hazardLevel: number;
  location: string;
  roomId?: string;
  discovererId: string;
  discoverTime: any;
  description: string;
  photos?: string;
  immediateMeasures?: string;
  isUrgent: number;
  reporterId: string;
  reportTime: any;
  remark?: string;
}>({
  projectId: '',
  documentStatus: 1,
  hazardType: 1,
  hazardLevel: 1,
  location: '',
  roomId: undefined,
  discovererId: '',
  discoverTime: dayjs(),
  description: '',
  photos: undefined,
  immediateMeasures: undefined,
  isUrgent: 2,
  reporterId: '',
  reportTime: dayjs(),
  remark: undefined,
});

const formRules = {
  projectId: [{ required: true, message: '请选择项目' }],
  hazardType: [{ required: true, message: '请选择隐患类型' }],
  hazardLevel: [{ required: true, message: '请选择隐患等级' }],
  location: [{ required: true, message: '请输入位置' }],
  discovererId: [{ required: true, message: '请选择发现人' }],
  discoverTime: [{ required: true, message: '请选择发现时间' }],
  description: [{ required: true, message: '请输入隐患描述' }],
  isUrgent: [{ required: true, message: '请选择是否紧急' }],
  reporterId: [{ required: true, message: '请选择上报人' }],
  reportTime: [{ required: true, message: '请选择上报时间' }],
};

async function loadProjectOptions() {
  try {
    const result = await getSafetyProjectListApi({
      ProjectCode: undefined,
      ProjectName: undefined,
      CreatedAtStart: undefined,
      CreatedAtEnd: undefined,
      PageIndex: 1,
      PageSize: 10,
      OrderBy: undefined,
      IsAsc: true,
    });
    projectOptions.value = result.items || [];
  } catch (error: any) {
    console.error('加载项目列表失败:', error);
    // 静默失败，不影响主流程
  }
}

async function loadEmployeeOptions() {
  try {
    const result = await getEmployeeListApi({
      TEmployeesid: '',
      EmployeesName: '',
      EmployeeNumber: '',
      PageIndex: 1,
      PageSize: 10,
      OrderBy: '',
      IsAsc: true,
    });
    employeeOptions.value = result.items || [];
  } catch (error: any) {
    console.error('加载员工列表失败:', error);
    // 静默失败，不影响主流程
  }
}

function resetForm() {
  formModel.value = {
    projectId: '',
    documentStatus: 1,
    hazardType: 1,
    hazardLevel: 1,
    location: '',
    roomId: undefined,
    discovererId: '',
    discoverTime: dayjs(),
    description: '',
    photos: undefined,
    immediateMeasures: undefined,
    isUrgent: 2,
    reporterId: '',
    reportTime: dayjs(),
    remark: undefined,
  };
  formRef.value?.resetFields();
}

function openCreateModal() {
  isEditMode.value = false;
  editingId.value = '';
  createModalVisible.value = true;
  resetForm();
  loadProjectOptions();
  loadEmployeeOptions();
}

async function openEditModal(record: SafetyHazardReportItem) {
  isEditMode.value = true;
  editingId.value = record.id;
  createModalVisible.value = true;
  resetForm();
  loadProjectOptions();
  loadEmployeeOptions();

  try {
    const detail = await getSafetyHazardReportDetailApi(record.id);
    formModel.value = {
      projectId: detail.projectId || '',
      documentStatus: detail.documentStatus ?? 1,
      hazardType: detail.hazardType ?? 1,
      hazardLevel: detail.hazardLevel ?? 1,
      location: detail.location || '',
      roomId: detail.roomId,
      discovererId: detail.discovererId || '',
      discoverTime: detail.discoverTime
        ? dayjs(detail.discoverTime)
        : dayjs(),
      description: detail.description || '',
      photos: detail.photos,
      immediateMeasures: detail.immediateMeasures,
      isUrgent: detail.isUrgent ?? 2,
      reporterId: detail.reporterId || '',
      reportTime: detail.reportTime
        ? dayjs(detail.reportTime)
        : dayjs(),
      remark: detail.remark,
    };
  } catch (error: any) {
    const errMsg =
      error?.response?.data?.message ||
      error?.data?.message ||
      error?.message ||
      '获取隐患上报详情失败';
    message.error(errMsg);
    createModalVisible.value = false;
  }
}

function closeCreateModal() {
  createModalVisible.value = false;
  isEditMode.value = false;
  editingId.value = '';
  resetForm();
}

async function handleSubmit() {
  try {
    const values = await formRef.value?.validate();
    if (!values) return;
    submitting.value = true;

    const baseData: CreateSafetyHazardReportParams = {
      projectId: formModel.value.projectId,
      documentStatus: formModel.value.documentStatus,
      hazardType: formModel.value.hazardType,
      hazardLevel: formModel.value.hazardLevel,
      location: formModel.value.location,
      roomId: formModel.value.roomId,
      discovererId: formModel.value.discovererId,
      discoverTime: formModel.value.discoverTime
        ? dayjs(formModel.value.discoverTime).format('YYYY-MM-DD HH:mm:ss')
        : '',
      description: formModel.value.description,
      photos: formModel.value.photos,
      immediateMeasures: formModel.value.immediateMeasures,
      isUrgent: formModel.value.isUrgent,
      reporterId: formModel.value.reporterId,
      reportTime: formModel.value.reportTime
        ? dayjs(formModel.value.reportTime).format('YYYY-MM-DD HH:mm:ss')
        : '',
      remark: formModel.value.remark,
    };

    if (isEditMode.value) {
      const updateData: UpdateSafetyHazardReportParams = {
        ...baseData,
        id: editingId.value,
      };
      await updateSafetyHazardReportApi(updateData);
      message.success('更新隐患上报成功');
    } else {
      await createSafetyHazardReportApi(baseData);
      message.success('创建隐患上报成功');
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
      (isEditMode.value ? '更新隐患上报失败' : '创建隐患上报失败');
    message.error(errMsg);
    return;
  } finally {
    submitting.value = false;
  }
}

function handleDelete(record: SafetyHazardReportItem) {
  Modal.confirm({
    title: '确认删除',
    content: h('div', { style: { fontSize: '14px', lineHeight: '1.6' } }, [
      h('p', {
        style: { marginBottom: '8px', color: '#ff4d4f', fontWeight: 500 },
      }, '⚠️ 警告'),
      h('p', { style: { margin: 0 } }, '确定要删除该隐患上报吗？'),
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
        await deleteSafetyHazardReportApi(record.id);
        message.success('删除隐患上报成功');
        fetchList();
      } catch (error: any) {
        const errMsg =
          error?.response?.data?.message ||
          error?.data?.message ||
          error?.message ||
          '删除隐患上报失败';
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
    <!-- 顶部：创建隐患上报 + 查询条件 -->
    <div class="mb-3 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <Button type="primary" class="cursor-pointer" @click="openCreateModal">
          创建隐患上报
        </Button>
      </div>
      <Space>
        <Input
          v-model:value="queryForm.DiscovererName"
          placeholder="发现人姓名"
          allow-clear
          style="width: 160px"
        />
        <DatePicker
          v-model:value="queryForm.ReportTimeStart"
          placeholder="上报时间开始"
          show-time
          style="width: 180px"
        />
        <DatePicker
          v-model:value="queryForm.ReportTimeEnd"
          placeholder="上报时间结束"
          show-time
          style="width: 180px"
        />
        <DatePicker
          v-model:value="queryForm.CreatedAtStart"
          placeholder="创建时间开始"
          show-time
          style="width: 180px"
        />
        <DatePicker
          v-model:value="queryForm.CreatedAtEnd"
          placeholder="创建时间结束"
          show-time
          style="width: 180px"
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
      :scroll="{ x: 1200 }"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'discoverTime'">
          <span v-if="record.discoverTime">
            {{ dayjs(record.discoverTime).format('YYYY-MM-DD HH:mm:ss') }}
          </span>
          <span v-else>—</span>
        </template>
        <template v-else-if="column.key === 'reportTime'">
          <span v-if="record.reportTime">
            {{ dayjs(record.reportTime).format('YYYY-MM-DD HH:mm:ss') }}
          </span>
          <span v-else>—</span>
        </template>
        <template v-else-if="column.key === 'hazardTypeText'">
          <span>
            {{
              record.hazardTypeText ||
              (hazardTypeOptions.find((opt) => opt.value === record.hazardType)
                ?.label || '未知')
            }}
          </span>
        </template>
        <template v-else-if="column.key === 'hazardLevelText'">
          <span>
            {{
              record.hazardLevelText ||
              (hazardLevelOptions.find((opt) => opt.value === record.hazardLevel)
                ?.label || '未知')
            }}
          </span>
        </template>
        <template v-else-if="column.key === 'isUrgentText'">
          <span>
            {{
              record.isUrgentText ||
              (isUrgentOptions.find((opt) => opt.value === record.isUrgent)
                ?.label || '未知')
            }}
          </span>
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

    <!-- 创建 / 编辑隐患上报弹窗 -->
    <Modal
      v-model:open="createModalVisible"
      :title="isEditMode ? '更新隐患上报' : '创建隐患上报'"
      width="700px"
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
        class="max-h-[600px] overflow-y-auto"
      >
        <div class="grid grid-cols-3 gap-4">
          <Form.Item label="项目" name="projectId">
            <Select
              v-model:value="formModel.projectId"
              :options="
                projectOptions.map((item) => ({
                  label: item.projectName,
                  value: item.id,
                }))
              "
              placeholder="请选择项目"
              :style="{ width: 'calc(100% - 30px)' }"
            />
          </Form.Item>
          <Form.Item label="文档状态" name="documentStatus">
            <Select
              v-model:value="formModel.documentStatus"
              :options="documentStatusOptions"
              placeholder="请选择文档状态"
              :style="{ width: 'calc(100% - 30px)' }"
            />
          </Form.Item>
          <Form.Item label="隐患类型" name="hazardType">
            <Select
              v-model:value="formModel.hazardType"
              :options="hazardTypeOptions"
              placeholder="请选择隐患类型"
              :style="{ width: 'calc(100% - 30px)' }"
            />
          </Form.Item>
          <Form.Item label="隐患等级" name="hazardLevel">
            <Select
              v-model:value="formModel.hazardLevel"
              :options="hazardLevelOptions"
              placeholder="请选择隐患等级"
              :style="{ width: 'calc(100% - 30px)' }"
            />
          </Form.Item>
          <Form.Item label="位置" name="location">
            <Input
              v-model:value="formModel.location"
              placeholder="请输入位置"
              :style="{ width: 'calc(100% - 30px)' }"
            />
          </Form.Item>
          <Form.Item label="房间ID" name="roomId">
            <Input
              v-model:value="formModel.roomId"
              placeholder="请输入房间ID（可选）"
              :style="{ width: 'calc(100% - 30px)' }"
            />
          </Form.Item>
          <Form.Item label="发现人" name="discovererId">
            <Select
              v-model:value="formModel.discovererId"
              :options="
                employeeOptions.map((item) => ({
                  label: item.name,
                  value: item.id,
                }))
              "
              placeholder="请选择发现人"
              show-search
              :filter-option="
                (input, option) =>
                  (option?.label ?? '')
                    .toLowerCase()
                    .includes(input.toLowerCase())
              "
              :style="{ width: 'calc(100% - 30px)' }"
            />
          </Form.Item>
          <Form.Item label="发现时间" name="discoverTime">
            <DatePicker
              v-model:value="formModel.discoverTime"
              show-time
              format="YYYY-MM-DD HH:mm:ss"
              :style="{ width: 'calc(100% - 30px)' }"
              placeholder="请选择发现时间"
            />
          </Form.Item>
          <Form.Item label="上报人" name="reporterId">
            <Select
              v-model:value="formModel.reporterId"
              :options="
                employeeOptions.map((item) => ({
                  label: item.name,
                  value: item.id,
                }))
              "
              placeholder="请选择上报人"
              show-search
              :filter-option="
                (input, option) =>
                  (option?.label ?? '')
                    .toLowerCase()
                    .includes(input.toLowerCase())
              "
              :style="{ width: 'calc(100% - 30px)' }"
            />
          </Form.Item>
          <Form.Item label="上报时间" name="reportTime">
            <DatePicker
              v-model:value="formModel.reportTime"
              show-time
              format="YYYY-MM-DD HH:mm:ss"
              :style="{ width: 'calc(100% - 30px)' }"
              placeholder="请选择上报时间"
            />
          </Form.Item>
          <Form.Item label="是否紧急" name="isUrgent">
            <Radio.Group v-model:value="formModel.isUrgent">
              <Radio :value="1">是</Radio>
              <Radio :value="2">否</Radio>
            </Radio.Group>
          </Form.Item>
        </div>
        <Form.Item label="隐患描述" name="description">
          <Input.TextArea
            v-model:value="formModel.description"
            :rows="4"
            placeholder="请输入隐患描述"
            :style="{ width: 'calc(100% - 190px)' }"
          />
        </Form.Item>
        <Form.Item label="照片" name="photos">
          <Input
            v-model:value="formModel.photos"
            placeholder="请输入照片URL（可选）"
            :style="{ width: 'calc(100% - 30px)' }"
          />
        </Form.Item>
        <Form.Item label="紧急措施" name="immediateMeasures">
          <Input.TextArea
            v-model:value="formModel.immediateMeasures"
            :rows="3"
            placeholder="请输入紧急措施（可选）"
            :style="{ width: 'calc(100% - 190px)' }"
          />
        </Form.Item>
        <Form.Item label="备注" name="remark">
          <Input.TextArea
            v-model:value="formModel.remark"
            :rows="3"
            placeholder="请输入备注（可选）"
            :style="{ width: 'calc(100% - 190px)' }"
          />
        </Form.Item>
      </Form>
    </Modal>
  </div>
</template>


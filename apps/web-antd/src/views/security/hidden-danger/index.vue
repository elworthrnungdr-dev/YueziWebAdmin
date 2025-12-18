<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import {
  getSafetyHazardReportListApi,
  createSafetyHazardReportApi,
  getSafetyHazardReportDetailApi,
  updateSafetyHazardReportApi,
  deleteSafetyHazardReportApi,
  type SafetyHazardReportItem,
  type SafetyHazardReportListParams,
  type CreateSafetyHazardReportParams,
  type UpdateSafetyHazardReportParams,
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
  message,
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

const documentStatusOptions = [
  { label: '草稿', value: 1 },
  { label: '提交', value: 2 },
];

const hazardTypeOptions = [
  { label: '漏水', value: 1 },
  { label: '漏电', value: 2 },
  { label: '损坏', value: 3 },
  { label: '松动', value: 4 },
  { label: '老化', value: 5 },
  { label: '其他', value: 99 },
];

const hazardLevelOptions = [
  { label: '重大', value: 1 },
  { label: '较大', value: 2 },
  { label: '一般', value: 3 },
];

const urgentOptions = [
  { label: '是', value: 1 },
  { label: '否', value: 2 },
];

const columns = [
  {
    title: '上报编号',
    dataIndex: 'reportNo',
    key: 'reportNo',
    width: 160,
  },
  {
    title: '关联项目ID',
    dataIndex: 'projectId',
    key: 'projectId',
    width: 180,
  },
  {
    title: '隐患类型',
    dataIndex: 'hazardTypeText',
    key: 'hazardTypeText',
    width: 120,
  },
  {
    title: '隐患级别',
    dataIndex: 'hazardLevelText',
    key: 'hazardLevelText',
    width: 120,
  },
  {
    title: '具体位置',
    dataIndex: 'location',
    key: 'location',
    width: 200,
    ellipsis: true,
  },
  {
    title: '发现人',
    dataIndex: 'discovererName',
    key: 'discovererName',
    width: 140,
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
    title: '上报状态',
    dataIndex: 'reportStatusText',
    key: 'reportStatusText',
    width: 120,
  },
  {
    title: '上报时间',
    dataIndex: 'reportTime',
    key: 'reportTime',
    width: 170,
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
    width: 180,
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
    // 全局拦截器已统一弹出错误提示，这里不再额外处理，避免重复
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

// 表单里日期字段使用 dayjs 对象，提交时再格式化为字符串
const formModel = ref<any>({
  projectId: '',
  documentStatus: 1,
  hazardType: 1,
  hazardLevel: 1,
  location: '',
  roomId: '',
  discovererId: '',
  discoverTime: dayjs(),
  description: '',
  photos: '',
  immediateMeasures: '',
  isUrgent: 2,
  reporterId: '',
  reportTime: dayjs(),
  remark: '',
});

const formRules = {
  projectId: [{ required: true, message: '请输入关联项目设备的登记ID' }],
  documentStatus: [{ required: true, message: '请选择单据状态' }],
  hazardType: [{ required: true, message: '请选择隐患类型' }],
  hazardLevel: [{ required: true, message: '请选择隐患级别' }],
  location: [{ required: true, message: '请输入具体位置' }],
  discovererId: [{ required: true, message: '请输入发现人ID' }],
  discoverTime: [{ required: true, message: '请选择发现时间' }],
  description: [{ required: true, message: '请输入详细描述' }],
  isUrgent: [{ required: true, message: '请选择是否紧急' }],
  reporterId: [{ required: true, message: '请输入上报人ID' }],
  reportTime: [{ required: true, message: '请选择上报时间' }],
};

function resetForm() {
  formModel.value = {
    projectId: '',
    documentStatus: 1,
    hazardType: 1,
    hazardLevel: 1,
    location: '',
    roomId: '',
    discovererId: '',
    discoverTime: dayjs(),
    description: '',
    photos: '',
    immediateMeasures: '',
    isUrgent: 2,
    reporterId: '',
    reportTime: dayjs(),
    remark: '',
  };
  formRef.value?.resetFields();
}

function openCreateModal() {
  isEditMode.value = false;
  editingId.value = '';
  createModalVisible.value = true;
  resetForm();
}

async function openEditModal(record: SafetyHazardReportItem) {
  isEditMode.value = true;
  editingId.value = record.id;
  createModalVisible.value = true;
  resetForm();

  try {
    const detail = await getSafetyHazardReportDetailApi(record.id);
    formModel.value = {
      projectId: detail.projectId || '',
      documentStatus: detail.documentStatus ?? 1,
      hazardType: detail.hazardType ?? 1,
      hazardLevel: detail.hazardLevel ?? 1,
      location: detail.location || '',
      roomId: detail.roomId || '',
      discovererId: detail.discovererId || '',
      discoverTime: detail.discoverTime ? dayjs(detail.discoverTime) : dayjs(),
      description: detail.description || '',
      photos: detail.photos || '',
      immediateMeasures: detail.immediateMeasures || '',
      isUrgent: detail.isUrgent ?? 2,
      reporterId: detail.reporterId || '',
      reportTime: detail.reportTime ? dayjs(detail.reportTime) : dayjs(),
      remark: detail.remark || '',
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
      discoverTime: dayjs(formModel.value.discoverTime).toISOString(),
      description: formModel.value.description,
      photos: formModel.value.photos,
      immediateMeasures: formModel.value.immediateMeasures,
      isUrgent: formModel.value.isUrgent,
      reporterId: formModel.value.reporterId,
      reportTime: dayjs(formModel.value.reportTime).toISOString(),
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
    // 全局拦截器已弹出错误，这里不再额外处理
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
      h('p', { style: { margin: 0 } }, '确定要删除该隐患上报记录吗？'),
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
          style="width: 170px"
        />
        <DatePicker
          v-model:value="queryForm.ReportTimeEnd"
          placeholder="上报时间结束"
          style="width: 170px"
        />
        <DatePicker
          v-model:value="queryForm.CreatedAtStart"
          placeholder="创建时间开始"
          style="width: 170px"
        />
        <DatePicker
          v-model:value="queryForm.CreatedAtEnd"
          placeholder="创建时间结束"
          style="width: 170px"
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
      :scroll="{ x: 1300 }"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'hazardTypeText'">
          <span>
            {{
              record.hazardTypeText ||
              (record.hazardType === 1
                ? '漏水'
                : record.hazardType === 2
                ? '漏电'
                : record.hazardType === 3
                ? '损坏'
                : record.hazardType === 4
                ? '松动'
                : record.hazardType === 5
                ? '老化'
                : record.hazardType === 99
                ? '其他'
                : '未知')
            }}
          </span>
        </template>
        <template v-else-if="column.key === 'hazardLevelText'">
          <span>
            {{
              record.hazardLevelText ||
              (record.hazardLevel === 1
                ? '重大'
                : record.hazardLevel === 2
                ? '较大'
                : record.hazardLevel === 3
                ? '一般'
                : '未知')
            }}
          </span>
        </template>
        <template v-else-if="column.key === 'isUrgentText'">
          <span>
            {{
              record.isUrgentText ||
              (record.isUrgent === 1
                ? '是'
                : record.isUrgent === 2
                ? '否'
                : '未知')
            }}
          </span>
        </template>
        <template v-else-if="column.key === 'discoverTime'">
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

    <!-- 创建 / 编辑隐患上报弹窗 -->
    <Modal
      v-model:open="createModalVisible"
      :title="isEditMode ? '更新隐患上报' : '创建隐患上报'"
      width="800px"
      :confirm-loading="submitting"
      :body-style="{ maxHeight: '600px', overflowY: 'auto' }"
      @ok="handleSubmit"
      @cancel="closeCreateModal"
      destroy-on-close
    >
      <Form
        ref="formRef"
        :model="formModel"
        :rules="formRules"
        :label-col="{ span: 7 }"
        :wrapper-col="{ span: 14 }"
      >
        <div class="grid grid-cols-2 gap-4">
          <!-- 第一列 -->
          <div>
          <Form.Item label="关联项目设备登记ID" name="projectId">
            <Input
              v-model:value="formModel.projectId"
              placeholder="请输入关联项目设备登记ID"
            />
          </Form.Item>
          <Form.Item label="单据状态" name="documentStatus">
            <Select
              v-model:value="formModel.documentStatus"
              :options="documentStatusOptions"
              placeholder="请选择单据状态"
            />
          </Form.Item>
          <Form.Item label="隐患类型" name="hazardType">
            <Select
              v-model:value="formModel.hazardType"
              :options="hazardTypeOptions"
              placeholder="请选择隐患类型"
            />
          </Form.Item>
          <Form.Item label="隐患级别" name="hazardLevel">
            <Select
              v-model:value="formModel.hazardLevel"
              :options="hazardLevelOptions"
              placeholder="请选择隐患级别"
            />
          </Form.Item>
          <Form.Item label="具体位置" name="location">
            <Input
              v-model:value="formModel.location"
              placeholder="请输入具体位置"
            />
          </Form.Item>
          <Form.Item label="房间ID" name="roomId">
            <Input
              v-model:value="formModel.roomId"
              placeholder="请输入房间ID"
            />
          </Form.Item>
          </div>

          <!-- 第二列 -->
          <div>
          <Form.Item label="发现人ID" name="discovererId">
            <Input
              v-model:value="formModel.discovererId"
              placeholder="请输入发现人ID"
            />
          </Form.Item>
          <Form.Item label="发现时间" name="discoverTime">
            <DatePicker
              v-model:value="formModel.discoverTime"
              show-time
              style="width: 100%"
              placeholder="请选择发现时间"
            />
          </Form.Item>
          <Form.Item label="是否紧急" name="isUrgent">
            <Select
              v-model:value="formModel.isUrgent"
              :options="urgentOptions"
              placeholder="请选择是否紧急"
            />
          </Form.Item>
          <Form.Item label="上报人ID" name="reporterId">
            <Input
              v-model:value="formModel.reporterId"
              placeholder="请输入上报人ID"
            />
          </Form.Item>
          <Form.Item label="上报时间" name="reportTime">
            <DatePicker
              v-model:value="formModel.reportTime"
              show-time
              style="width: 100%"
              placeholder="请选择上报时间"
            />
          </Form.Item>
          </div>
        </div>

        <Form.Item label="详细描述" name="description">
          <Input.TextArea
            v-model:value="formModel.description"
            :rows="3"
            placeholder="请输入隐患详细描述"
          />
        </Form.Item>
        <Form.Item label="照片地址(可选)" name="photos">
          <Input.TextArea
            v-model:value="formModel.photos"
            :rows="2"
            placeholder="请输入照片地址（如有多个可用逗号分隔）"
          />
        </Form.Item>
        <Form.Item label="立即采取的措施(可选)" name="immediateMeasures">
          <Input.TextArea
            v-model:value="formModel.immediateMeasures"
            :rows="2"
            placeholder="请输入立即采取的处置措施"
          />
        </Form.Item>
        <Form.Item label="备注(可选)" name="remark">
          <Input.TextArea
            v-model:value="formModel.remark"
            :rows="2"
            placeholder="请输入备注"
          />
        </Form.Item>
      </Form>
    </Modal>
  </div>
</template>

<style scoped>
/* 增加表单标签和输入框之间的间距 */
:deep(.ant-form-item-label) {
  padding-right: 16px !important;
}
</style>



<script lang="ts" setup>
import { h, onMounted, ref } from 'vue';
import dayjs from 'dayjs';
import {
  Button,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Table,
  message,
  DatePicker,
} from 'ant-design-vue';
import type { FormInstance } from 'ant-design-vue';

import {
  getMarketingScriptListApi,
  getMarketingScriptDetailApi,
  createMarketingScriptApi,
  updateMarketingScriptApi,
  deleteMarketingScriptApi,
  type MarketingScriptListParams,
  type MarketingScriptItem,
  type CreateMarketingScriptParams,
  type UpdateMarketingScriptParams,
} from '#/api';

const loading = ref(false);
const dataSource = ref<MarketingScriptItem[]>([]);
const total = ref(0);

const queryForm = ref<MarketingScriptListParams>({
  ScriptCode: undefined,
  ScriptName: undefined,
  CreatedAtStart: undefined,
  CreatedAtEnd: undefined,
  ScriptType: undefined,
  IsDefault: undefined,
  ScriptStatus: undefined,
  PageIndex: 1,
  PageSize: 10,
  OrderBy: undefined,
  IsAsc: true,
});

const scriptTypeOptions = [
  { label: '电话邀约', value: 1 },
  { label: '接待咨询', value: 2 },
  { label: '价格谈判', value: 3 },
  { label: '异议处理', value: 4 },
  { label: '跟进回访', value: 5 },
  { label: '其它', value: 99 },
];

const isDefaultOptions = [
  { label: '是', value: 1 },
  { label: '否', value: 2 },
];

const scriptStatusOptions = [
  { label: '启用', value: 1 },
  { label: '禁用', value: 2 },
];

const columns = [
  { title: '话术编码', dataIndex: 'scriptCode', key: 'scriptCode', width: 150 },
  { title: '话术名称', dataIndex: 'scriptName', key: 'scriptName', width: 180 },
  { title: '话术类型', dataIndex: 'scriptTypeText', key: 'scriptTypeText', width: 120 },
  { title: '使用场景', dataIndex: 'useScenario', key: 'useScenario', width: 200, ellipsis: true },
  { title: '话术内容', dataIndex: 'scriptContent', key: 'scriptContent', width: 250, ellipsis: true },
  { title: '关键要点', dataIndex: 'keyPoints', key: 'keyPoints', width: 200, ellipsis: true },
  { title: '是否默认', dataIndex: 'isDefaultText', key: 'isDefaultText', width: 100 },
  { title: '状态', dataIndex: 'scriptStatusText', key: 'scriptStatusText', width: 80 },
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

async function fetchList() {
  try {
    loading.value = true;
    const params: any = { ...queryForm.value };
    if (params.CreatedAtStart) {
      params.CreatedAtStart = dayjs(params.CreatedAtStart).format('YYYY-MM-DD HH:mm:ss');
    }
    if (params.CreatedAtEnd) {
      params.CreatedAtEnd = dayjs(params.CreatedAtEnd).format('YYYY-MM-DD HH:mm:ss');
    }
    const res = await getMarketingScriptListApi(params);
    dataSource.value = res.items;
    total.value = res.total;
  } catch (error: any) {
    const errMsg = error?.response?.data?.message || error?.message || '获取话术管理列表失败';
    message.error(errMsg);
  } finally {
    loading.value = false;
  }
}

function handleReset() {
  queryForm.value = {
    ScriptCode: undefined,
    ScriptName: undefined,
    CreatedAtStart: undefined,
    CreatedAtEnd: undefined,
    ScriptType: undefined,
    IsDefault: undefined,
    ScriptStatus: undefined,
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

// 弹窗相关
const createModalVisible = ref(false);
const isEditMode = ref(false);
const submitting = ref(false);
const formRef = ref<FormInstance>();
const editingId = ref('');

const formModel = ref<CreateMarketingScriptParams>({
  scriptName: '',
  scriptType: undefined as any,
  useScenario: '',
  scriptContent: '',
  keyPoints: '',
  commonQuestions: '',
  isDefault: undefined as any,
  scriptStatus: undefined as any,
  remark: '',
});

const formRules = {
  scriptName: [{ required: true, message: '请输入话术名称' }],
  scriptType: [{ required: true, message: '请选择话术类型' }],
  scriptContent: [{ required: true, message: '请输入话术内容' }],
  isDefault: [{ required: true, message: '请选择是否默认话术' }],
  scriptStatus: [{ required: true, message: '请选择话术状态' }],
};

function openCreateModal() {
  isEditMode.value = false;
  editingId.value = '';
  formModel.value = {
    scriptName: '',
    scriptType: undefined as any,
    useScenario: '',
    scriptContent: '',
    keyPoints: '',
    commonQuestions: '',
    isDefault: undefined as any,
    scriptStatus: undefined as any,
    remark: '',
  };
  createModalVisible.value = true;
}

async function openEditModal(record: MarketingScriptItem) {
  try {
    loading.value = true;
    const detail = await getMarketingScriptDetailApi(record.id);
    isEditMode.value = true;
    editingId.value = detail.id;
    formModel.value = {
      scriptName: detail.scriptName || '',
      scriptType: detail.scriptType,
      useScenario: detail.useScenario || '',
      scriptContent: detail.scriptContent || '',
      keyPoints: detail.keyPoints || '',
      commonQuestions: detail.commonQuestions || '',
      isDefault: detail.isDefault,
      scriptStatus: detail.scriptStatus,
      remark: detail.remark || '',
    };
    createModalVisible.value = true;
  } catch (error: any) {
    const errMsg = error?.response?.data?.message || error?.message || '获取话术管理详情失败';
    message.error(errMsg);
  } finally {
    loading.value = false;
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
    const payload: CreateMarketingScriptParams = {
      scriptName: formModel.value.scriptName,
      scriptType: formModel.value.scriptType,
      useScenario: formModel.value.useScenario || undefined,
      scriptContent: formModel.value.scriptContent,
      keyPoints: formModel.value.keyPoints || undefined,
      commonQuestions: formModel.value.commonQuestions || undefined,
      isDefault: formModel.value.isDefault,
      scriptStatus: formModel.value.scriptStatus,
      remark: formModel.value.remark || undefined,
    };

    if (isEditMode.value) {
      await updateMarketingScriptApi({ ...payload, id: editingId.value } as UpdateMarketingScriptParams);
      message.success('更新话术管理成功');
    } else {
      await createMarketingScriptApi(payload);
      message.success('创建话术管理成功');
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

function handleDelete(record: MarketingScriptItem) {
  Modal.confirm({
    title: '确认删除',
    content: h('div', { style: { fontSize: '14px' } }, `确定删除话术【${record.scriptName || ''}】吗？`),
    okText: '删除',
    cancelText: '取消',
    okType: 'danger',
    centered: true,
    onOk: async () => {
      try {
        loading.value = true;
        await deleteMarketingScriptApi(record.id);
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
        创建话术管理
      </Button>
      <Space wrap>
        <Input
          v-model:value="queryForm.ScriptCode"
          placeholder="话术编码"
          style="width: 160px"
          allow-clear
        />
        <Input
          v-model:value="queryForm.ScriptName"
          placeholder="话术名称"
          style="width: 160px"
          allow-clear
        />
        <Select
          v-model:value="queryForm.ScriptType"
          :options="scriptTypeOptions"
          placeholder="话术类型"
          style="width: 140px"
          allow-clear
        />
        <Select
          v-model:value="queryForm.IsDefault"
          :options="isDefaultOptions"
          placeholder="是否默认"
          style="width: 120px"
          allow-clear
        />
        <Select
          v-model:value="queryForm.ScriptStatus"
          :options="scriptStatusOptions"
          placeholder="状态"
          style="width: 120px"
          allow-clear
        />
        <DatePicker
          v-model:value="queryForm.CreatedAtStart"
          show-time
          format="YYYY-MM-DD HH:mm"
          placeholder="创建时间开始"
          style="width: 180px"
        />
        <DatePicker
          v-model:value="queryForm.CreatedAtEnd"
          show-time
          format="YYYY-MM-DD HH:mm"
          placeholder="创建时间结束"
          style="width: 180px"
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
            <Button type="link" size="small" danger @click="handleDelete(record)">删除</Button>
          </Space>
        </template>
      </template>
    </Table>

    <!-- 创建 / 编辑弹窗 -->
    <Modal
      v-model:open="createModalVisible"
      :title="isEditMode ? '更新话术管理' : '创建话术管理'"
      width="820px"
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
        layout="vertical"
      >
        <div class="grid grid-cols-3 gap-4">
          <Form.Item label="话术名称" name="scriptName">
            <Input
              v-model:value="formModel.scriptName"
              placeholder="请输入话术名称"
            />
          </Form.Item>
          <Form.Item label="话术类型" name="scriptType">
            <Select
              v-model:value="formModel.scriptType"
              :options="scriptTypeOptions"
              placeholder="请选择话术类型"
            />
          </Form.Item>
          <Form.Item label="是否默认话术" name="isDefault">
            <Select
              v-model:value="formModel.isDefault"
              :options="isDefaultOptions"
              placeholder="请选择是否默认话术"
            />
          </Form.Item>
          <Form.Item label="话术状态" name="scriptStatus" class="col-span-3">
            <Select
              v-model:value="formModel.scriptStatus"
              :options="scriptStatusOptions"
              placeholder="请选择话术状态"
            />
          </Form.Item>
          <Form.Item label="使用场景描述" name="useScenario" class="col-span-3">
            <Input.TextArea
              v-model:value="formModel.useScenario"
              :rows="3"
              placeholder="请输入使用场景描述"
            />
          </Form.Item>
          <Form.Item label="话术内容" name="scriptContent" class="col-span-3">
            <Input.TextArea
              v-model:value="formModel.scriptContent"
              :rows="4"
              placeholder="请输入话术内容"
            />
          </Form.Item>
          <Form.Item label="关键要点" name="keyPoints" class="col-span-3">
            <Input.TextArea
              v-model:value="formModel.keyPoints"
              :rows="3"
              placeholder="请输入关键要点"
            />
          </Form.Item>
          <Form.Item label="常见问题及应对" name="commonQuestions" class="col-span-3">
            <Input.TextArea
              v-model:value="formModel.commonQuestions"
              :rows="3"
              placeholder="请输入常见问题及应对"
            />
          </Form.Item>
          <Form.Item label="备注" name="remark" class="col-span-3">
            <Input.TextArea
              v-model:value="formModel.remark"
              :rows="3"
              placeholder="请输入备注"
            />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  </div>
</template>


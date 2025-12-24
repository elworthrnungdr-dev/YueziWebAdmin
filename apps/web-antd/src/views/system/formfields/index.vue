<script lang="ts" setup>
import { h, onMounted, ref } from 'vue';
import dayjs from 'dayjs';
import {
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Table,
  message,
  DatePicker,
} from 'ant-design-vue';
import type { FormInstance } from 'ant-design-vue';

import {
  getFormFieldsListApi,
  getFormFieldsDetailApi,
  createFormFieldsApi,
  updateFormFieldsApi,
  deleteFormFieldsApi,
  type FormFieldsListParams,
  type FormFieldsItem,
  type CreateFormFieldsParams,
  type UpdateFormFieldsParams,
} from '#/api';

const loading = ref(false);
const dataSource = ref<FormFieldsItem[]>([]);
const total = ref(0);

const queryForm = ref<FormFieldsListParams>({
  FormType: undefined,
  FieldGroup: undefined,
  CreatedTimeStart: undefined,
  CreatedTimeEnd: undefined,
  PageIndex: 1,
  PageSize: 10,
  OrderBy: undefined,
  IsAsc: true,
});

const formTypeOptions = [
  { label: '产妇入所评估', value: 1 },
  { label: '宝宝入所评估', value: 2 },
  { label: '宝宝护理', value: 3 },
  { label: '产妇护理', value: 4 },
  { label: '宝宝每日查房', value: 5 },
  { label: '产妇每日查房', value: 6 },
  { label: '宝宝喂养', value: 7 },
  { label: '产后护理', value: 8 },
  { label: '产后心情', value: 9 },
  { label: '产妇出所评估', value: 10 },
  { label: '宝宝出所评估', value: 11 },
  { label: '房间检查', value: 12 },
];

const fieldTypeOptions = [
  { label: 'radio', value: 1 },
  { label: 'checkbox', value: 2 },
  { label: 'text', value: 3 },
  { label: 'select', value: 4 },
  { label: 'number', value: 5 },
  { label: 'date', value: 6 },
  { label: 'radio_with_text', value: 7 },
  { label: 'checkbox_with_text', value: 8 },
];

const columns = [
  { title: '表单类型', dataIndex: 'formTypeText', key: 'formTypeText', width: 140 },
  { title: '字段标识', dataIndex: 'fieldKey', key: 'fieldKey', width: 150 },
  { title: '显示名称', dataIndex: 'fieldLabel', key: 'fieldLabel', width: 150 },
  { title: '字段类型', dataIndex: 'fieldTypeText', key: 'fieldTypeText', width: 120 },
  { title: '单位', dataIndex: 'unit', key: 'unit', width: 80 },
  { title: '选项', dataIndex: 'options', key: 'options', width: 200, ellipsis: true },
  { title: '分组', dataIndex: 'fieldGroup', key: 'fieldGroup', width: 120 },
  { title: '分组排序', dataIndex: 'groupOrder', key: 'groupOrder', width: 100 },
  { title: '显示顺序', dataIndex: 'sortOrder', key: 'sortOrder', width: 100 },
  {
    title: '创建时间',
    dataIndex: 'createdTime',
    key: 'createdTime',
    width: 170,
    customRender: ({ record }: any) =>
      record.createdTime ? dayjs(record.createdTime).format('YYYY-MM-DD HH:mm:ss') : '—',
  },
  { title: '操作', key: 'actions', width: 160, fixed: 'right' },
];

async function fetchList() {
  try {
    loading.value = true;
    const params: any = { ...queryForm.value };
    if (params.CreatedTimeStart) {
      params.CreatedTimeStart = dayjs(params.CreatedTimeStart).format('YYYY-MM-DD HH:mm:ss');
    }
    if (params.CreatedTimeEnd) {
      params.CreatedTimeEnd = dayjs(params.CreatedTimeEnd).format('YYYY-MM-DD HH:mm:ss');
    }
    const res = await getFormFieldsListApi(params);
    dataSource.value = res.items;
    total.value = res.total;
  } catch (error: any) {
    const errMsg = error?.response?.data?.message || error?.message || '获取表单数据管理列表失败';
    message.error(errMsg);
  } finally {
    loading.value = false;
  }
}

function handleReset() {
  queryForm.value = {
    FormType: undefined,
    FieldGroup: undefined,
    CreatedTimeStart: undefined,
    CreatedTimeEnd: undefined,
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

const formModel = ref<CreateFormFieldsParams>({
  formType: undefined as any,
  fieldKey: '',
  fieldLabel: '',
  fieldType: undefined as any,
  unit: '',
  options: '',
  fieldGroup: '',
  groupOrder: 0,
  sortOrder: 0,
});

const formRules = {
  formType: [{ required: true, message: '请选择表单类型' }],
  fieldKey: [{ required: true, message: '请输入字段标识' }],
  fieldLabel: [{ required: true, message: '请输入显示名称' }],
  fieldType: [{ required: true, message: '请选择字段类型' }],
  fieldGroup: [{ required: true, message: '请输入分组' }],
  groupOrder: [{ required: true, message: '请输入分组排序' }],
  sortOrder: [{ required: true, message: '请输入显示顺序' }],
};

function openCreateModal() {
  isEditMode.value = false;
  editingId.value = '';
  formModel.value = {
    formType: undefined as any,
    fieldKey: '',
    fieldLabel: '',
    fieldType: undefined as any,
    unit: '',
    options: '',
    fieldGroup: '',
    groupOrder: 0,
    sortOrder: 0,
  };
  createModalVisible.value = true;
}

async function openEditModal(record: FormFieldsItem) {
  try {
    loading.value = true;
    const detail = await getFormFieldsDetailApi(record.id);
    isEditMode.value = true;
    editingId.value = detail.id;
    formModel.value = {
      formType: detail.formType,
      fieldKey: detail.fieldKey || '',
      fieldLabel: detail.fieldLabel || '',
      fieldType: detail.fieldType,
      unit: detail.unit || '',
      options: detail.options || '',
      fieldGroup: detail.fieldGroup || '',
      groupOrder: detail.groupOrder ?? 0,
      sortOrder: detail.sortOrder ?? 0,
    };
    createModalVisible.value = true;
  } catch (error: any) {
    const errMsg = error?.response?.data?.message || error?.message || '获取表单数据管理详情失败';
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
    const payload: CreateFormFieldsParams = {
      formType: formModel.value.formType,
      fieldKey: formModel.value.fieldKey,
      fieldLabel: formModel.value.fieldLabel,
      fieldType: formModel.value.fieldType,
      unit: formModel.value.unit || undefined,
      options: formModel.value.options || undefined,
      fieldGroup: formModel.value.fieldGroup,
      groupOrder: formModel.value.groupOrder,
      sortOrder: formModel.value.sortOrder,
    };

    if (isEditMode.value) {
      await updateFormFieldsApi({ ...payload, id: editingId.value } as UpdateFormFieldsParams);
      message.success('更新表单数据管理成功');
    } else {
      await createFormFieldsApi(payload);
      message.success('创建表单数据管理成功');
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

function handleDelete(record: FormFieldsItem) {
  Modal.confirm({
    title: '确认删除',
    content: h('div', { style: { fontSize: '14px' } }, `确定删除字段【${record.fieldLabel || ''}】吗？`),
    okText: '删除',
    cancelText: '取消',
    okType: 'danger',
    centered: true,
    onOk: async () => {
      try {
        loading.value = true;
        await deleteFormFieldsApi(record.id);
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
        创建表单数据管理
      </Button>
      <Space wrap>
        <Select
          v-model:value="queryForm.FormType"
          :options="formTypeOptions"
          placeholder="表单类型"
          style="width: 160px"
          allow-clear
        />
        <Input
          v-model:value="queryForm.FieldGroup"
          placeholder="分组"
          style="width: 180px"
          allow-clear
        />
        <DatePicker
          v-model:value="queryForm.CreatedTimeStart"
          show-time
          format="YYYY-MM-DD HH:mm"
          placeholder="创建时间开始"
          style="width: 180px"
        />
        <DatePicker
          v-model:value="queryForm.CreatedTimeEnd"
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
      :title="isEditMode ? '更新表单数据管理' : '创建表单数据管理'"
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
          <Form.Item label="表单类型" name="formType">
            <Select
              v-model:value="formModel.formType"
              :options="formTypeOptions"
              placeholder="请选择表单类型"
            />
          </Form.Item>
          <Form.Item label="字段标识" name="fieldKey">
            <Input
              v-model:value="formModel.fieldKey"
              placeholder="请输入字段标识（英文）"
            />
          </Form.Item>
          <Form.Item label="显示名称" name="fieldLabel">
            <Input
              v-model:value="formModel.fieldLabel"
              placeholder="请输入显示名称（中文）"
            />
          </Form.Item>
          <Form.Item label="字段类型" name="fieldType">
            <Select
              v-model:value="formModel.fieldType"
              :options="fieldTypeOptions"
              placeholder="请选择字段类型"
            />
          </Form.Item>
          <Form.Item label="单位" name="unit">
            <Input
              v-model:value="formModel.unit"
              placeholder="请输入单位（如：℃）"
            />
          </Form.Item>
          <Form.Item label="选项" name="options">
            <Input
              v-model:value="formModel.options"
              placeholder="请输入选项（用逗号分隔）"
            />
          </Form.Item>
          <Form.Item label="分组" name="fieldGroup">
            <Input
              v-model:value="formModel.fieldGroup"
              placeholder="请输入分组（如：生命体征/产后情况/伤口情况等）"
            />
          </Form.Item>
          <Form.Item label="分组排序" name="groupOrder">
            <InputNumber
              v-model:value="formModel.groupOrder"
              :min="0"
              style="width: 100%"
              placeholder="请输入分组排序"
            />
          </Form.Item>
          <Form.Item label="显示顺序" name="sortOrder">
            <InputNumber
              v-model:value="formModel.sortOrder"
              :min="0"
              style="width: 100%"
              placeholder="请输入显示顺序"
            />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  </div>
</template>


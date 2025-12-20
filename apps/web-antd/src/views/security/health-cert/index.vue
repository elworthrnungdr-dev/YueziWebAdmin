<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import {
  getEmployeeHealthCertListApi,
  createEmployeeHealthCertApi,
  getEmployeeHealthCertDetailApi,
  updateEmployeeHealthCertApi,
  deleteEmployeeHealthCertApi,
  getEmployeeListApi,
  type EmployeeHealthCertItem,
  type EmployeeHealthCertListParams,
  type CreateEmployeeHealthCertParams,
  type UpdateEmployeeHealthCertParams,
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
} from 'ant-design-vue';
import type { FormInstance } from 'ant-design-vue';
import dayjs from 'dayjs';
import { h } from 'vue';

const loading = ref(false);
const dataSource = ref<EmployeeHealthCertItem[]>([]);
const total = ref(0);

const queryForm = ref<EmployeeHealthCertListParams>({
  EmployeeName: undefined,
  IssueDateEnd: undefined,
  PhysicalExamDateStart: undefined,
  PhysicalExamDateEnd: undefined,
  CreatedAtStart: undefined,
  CreatedAtEnd: undefined,
  PageIndex: 1,
  PageSize: 10,
  OrderBy: undefined,
  IsAsc: true,
});

const certTypeOptions = [
  { label: '健康证', value: 1 },
  { label: '其他', value: 2 },
];

const certStatusOptions = [
  { label: '有效', value: 1 },
  { label: '过期', value: 2 },
  { label: '即将过期', value: 3 },
  { label: '遗失', value: 4 },
];

const physicalExamResultOptions = [
  { label: '合格', value: 1 },
  { label: '不合格', value: 2 },
];

const columns = [
  {
    title: '员工姓名',
    dataIndex: 'employeeName',
    key: 'employeeName',
    width: 120,
  },
  {
    title: '健康证编号',
    dataIndex: 'certNumber',
    key: 'certNumber',
    width: 160,
  },
  {
    title: '证件类型',
    dataIndex: 'certTypeText',
    key: 'certTypeText',
    width: 160,
  },
  {
    title: '发证机构',
    dataIndex: 'issuingAuthority',
    key: 'issuingAuthority',
    width: 180,
    ellipsis: true,
  },
  {
    title: '发证日期',
    dataIndex: 'issueDate',
    key: 'issueDate',
    width: 120,
  },
  {
    title: '到期日期',
    dataIndex: 'expiryDate',
    key: 'expiryDate',
    width: 120,
  },
  {
    title: '证书状态',
    dataIndex: 'certStatusText',
    key: 'certStatusText',
    width: 100,
  },
  {
    title: '体检日期',
    dataIndex: 'physicalExamDate',
    key: 'physicalExamDate',
    width: 120,
  },
  {
    title: '体检结果',
    dataIndex: 'physicalExamResultText',
    key: 'physicalExamResultText',
    width: 100,
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
    const params: EmployeeHealthCertListParams = {
      ...queryForm.value,
      IssueDateEnd: queryForm.value.IssueDateEnd
        ? dayjs(queryForm.value.IssueDateEnd).format('YYYY-MM-DD')
        : undefined,
      PhysicalExamDateStart: queryForm.value.PhysicalExamDateStart
        ? dayjs(queryForm.value.PhysicalExamDateStart).format('YYYY-MM-DD')
        : undefined,
      PhysicalExamDateEnd: queryForm.value.PhysicalExamDateEnd
        ? dayjs(queryForm.value.PhysicalExamDateEnd).format('YYYY-MM-DD')
        : undefined,
      CreatedAtStart: queryForm.value.CreatedAtStart
        ? dayjs(queryForm.value.CreatedAtStart).toISOString()
        : undefined,
      CreatedAtEnd: queryForm.value.CreatedAtEnd
        ? dayjs(queryForm.value.CreatedAtEnd).toISOString()
        : undefined,
    };
    const result = await getEmployeeHealthCertListApi(params);
    dataSource.value = result.items || [];
    total.value = result.total || 0;
  } catch (error: any) {
    const errMsg =
      error?.response?.data?.message ||
      error?.data?.message ||
      error?.message ||
      '获取健康证列表失败';
    message.error(errMsg);
  } finally {
    loading.value = false;
  }
}

function handleReset() {
  queryForm.value = {
    EmployeeName: undefined,
    IssueDateEnd: undefined,
    PhysicalExamDateStart: undefined,
    PhysicalExamDateEnd: undefined,
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

const employeeOptions = ref<EmployeeItem[]>([]);

const formModel = ref<{
  employeeId: string;
  certNumber: string;
  certType: number;
  issuingAuthority?: string;
  issueDate: any;
  expiryDate: any;
  certStatus: number;
  certFrontImage?: string;
  certBackImage?: string;
  attachmentUrls?: string;
  physicalExamDate?: any;
  physicalExamHospital?: string;
  physicalExamResult: number;
  nextExamDate?: any;
  remark?: string;
}>({
  employeeId: '',
  certNumber: '',
  certType: 1,
  issuingAuthority: undefined,
  issueDate: dayjs(),
  expiryDate: dayjs().add(1, 'year'),
  certStatus: 1,
  certFrontImage: undefined,
  certBackImage: undefined,
  attachmentUrls: undefined,
  physicalExamDate: undefined,
  physicalExamHospital: undefined,
  physicalExamResult: 1,
  nextExamDate: undefined,
  remark: undefined,
});

const formRules = {
  employeeId: [{ required: true, message: '请选择员工' }],
  certNumber: [{ required: true, message: '请输入健康证编号' }],
  certType: [{ required: true, message: '请选择证件类型' }],
  issueDate: [{ required: true, message: '请选择发证日期' }],
  expiryDate: [{ required: true, message: '请选择到期日期' }],
  certStatus: [{ required: true, message: '请选择证书状态' }],
  physicalExamResult: [{ required: true, message: '请选择体检结果' }],
};

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
    employeeId: '',
    certNumber: '',
    certType: 1,
    issuingAuthority: undefined,
    issueDate: dayjs(),
    expiryDate: dayjs().add(1, 'year'),
    certStatus: 1,
    certFrontImage: undefined,
    certBackImage: undefined,
    attachmentUrls: undefined,
    physicalExamDate: undefined,
    physicalExamHospital: undefined,
    physicalExamResult: 1,
    nextExamDate: undefined,
    remark: undefined,
  };
  formRef.value?.resetFields();
}

function openCreateModal() {
  isEditMode.value = false;
  editingId.value = '';
  createModalVisible.value = true;
  resetForm();
  loadEmployeeOptions();
}

async function openEditModal(record: EmployeeHealthCertItem) {
  isEditMode.value = true;
  editingId.value = record.id;
  createModalVisible.value = true;
  resetForm();
  loadEmployeeOptions();

  try {
    const detail = await getEmployeeHealthCertDetailApi(record.id);
    formModel.value = {
      employeeId: detail.employeeId || '',
      certNumber: detail.certNumber || '',
      certType: detail.certType ?? 1,
      issuingAuthority: detail.issuingAuthority,
      issueDate: detail.issueDate ? dayjs(detail.issueDate) : dayjs(),
      expiryDate: detail.expiryDate ? dayjs(detail.expiryDate) : dayjs().add(1, 'year'),
      certStatus: detail.certStatus ?? 1,
      certFrontImage: detail.certFrontImage,
      certBackImage: detail.certBackImage,
      attachmentUrls: detail.attachmentUrls,
      physicalExamDate: detail.physicalExamDate
        ? dayjs(detail.physicalExamDate)
        : undefined,
      physicalExamHospital: detail.physicalExamHospital,
      physicalExamResult: detail.physicalExamResult ?? 1,
      nextExamDate: detail.nextExamDate ? dayjs(detail.nextExamDate) : undefined,
      remark: detail.remark,
    };
  } catch (error: any) {
    const errMsg =
      error?.response?.data?.message ||
      error?.data?.message ||
      error?.message ||
      '获取健康证详情失败';
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

    const baseData: CreateEmployeeHealthCertParams = {
      employeeId: formModel.value.employeeId,
      certNumber: formModel.value.certNumber,
      certType: formModel.value.certType,
      issuingAuthority: formModel.value.issuingAuthority,
      issueDate: formModel.value.issueDate
        ? dayjs(formModel.value.issueDate).format('YYYY-MM-DD')
        : '',
      expiryDate: formModel.value.expiryDate
        ? dayjs(formModel.value.expiryDate).format('YYYY-MM-DD')
        : '',
      certStatus: formModel.value.certStatus,
      certFrontImage: formModel.value.certFrontImage,
      certBackImage: formModel.value.certBackImage,
      attachmentUrls: formModel.value.attachmentUrls,
      physicalExamDate: formModel.value.physicalExamDate
        ? dayjs(formModel.value.physicalExamDate).format('YYYY-MM-DD')
        : undefined,
      physicalExamHospital: formModel.value.physicalExamHospital,
      physicalExamResult: formModel.value.physicalExamResult,
      nextExamDate: formModel.value.nextExamDate
        ? dayjs(formModel.value.nextExamDate).format('YYYY-MM-DD')
        : undefined,
      remark: formModel.value.remark,
    };

    if (isEditMode.value) {
      const updateData: UpdateEmployeeHealthCertParams = {
        ...baseData,
        id: editingId.value,
      };
      await updateEmployeeHealthCertApi(updateData);
      message.success('更新健康证成功');
    } else {
      await createEmployeeHealthCertApi(baseData);
      message.success('创建健康证成功');
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
      (isEditMode.value ? '更新健康证失败' : '创建健康证失败');
    message.error(errMsg);
    return;
  } finally {
    submitting.value = false;
  }
}

function handleDelete(record: EmployeeHealthCertItem) {
  Modal.confirm({
    title: '确认删除',
    content: h('div', { style: { fontSize: '14px', lineHeight: '1.6' } }, [
      h('p', {
        style: { marginBottom: '8px', color: '#ff4d4f', fontWeight: 500 },
      }, '⚠️ 警告'),
      h('p', { style: { margin: 0 } }, '确定要删除该健康证吗？'),
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
        await deleteEmployeeHealthCertApi(record.id);
        message.success('删除健康证成功');
        fetchList();
      } catch (error: any) {
        const errMsg =
          error?.response?.data?.message ||
          error?.data?.message ||
          error?.message ||
          '删除健康证失败';
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
    <!-- 顶部：创建健康证 + 查询条件 -->
    <div class="mb-3 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <Button type="primary" class="cursor-pointer" @click="openCreateModal">
          创建健康证
        </Button>
      </div>
      <Space>
        <Input
          v-model:value="queryForm.EmployeeName"
          placeholder="员工姓名"
          allow-clear
          style="width: 160px"
        />
        <DatePicker
          v-model:value="queryForm.IssueDateEnd"
          placeholder="发证日期结束"
          style="width: 160px"
        />
        <DatePicker
          v-model:value="queryForm.PhysicalExamDateStart"
          placeholder="体检日期开始"
          style="width: 160px"
        />
        <DatePicker
          v-model:value="queryForm.PhysicalExamDateEnd"
          placeholder="体检日期结束"
          style="width: 160px"
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
        <template v-if="column.key === 'issueDate'">
          <span v-if="record.issueDate">
            {{ dayjs(record.issueDate).format('YYYY-MM-DD') }}
          </span>
          <span v-else>—</span>
        </template>
        <template v-else-if="column.key === 'expiryDate'">
          <span v-if="record.expiryDate">
            {{ dayjs(record.expiryDate).format('YYYY-MM-DD') }}
          </span>
          <span v-else>—</span>
        </template>
        <template v-else-if="column.key === 'physicalExamDate'">
          <span v-if="record.physicalExamDate">
            {{ dayjs(record.physicalExamDate).format('YYYY-MM-DD') }}
          </span>
          <span v-else>—</span>
        </template>
        <template v-else-if="column.key === 'certTypeText'">
          <span>
            {{
              record.certTypeText ||
              (certTypeOptions.find((opt) => opt.value === record.certType)
                ?.label || '未知')
            }}
          </span>
        </template>
        <template v-else-if="column.key === 'certStatusText'">
          <span>
            {{
              record.certStatusText ||
              (certStatusOptions.find((opt) => opt.value === record.certStatus)
                ?.label || '未知')
            }}
          </span>
        </template>
        <template v-else-if="column.key === 'physicalExamResultText'">
          <span>
            {{
              record.physicalExamResultText ||
              (physicalExamResultOptions.find(
                (opt) => opt.value === record.physicalExamResult,
              )?.label || '未知')
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

    <!-- 创建 / 编辑健康证弹窗 -->
    <Modal
      v-model:open="createModalVisible"
      :title="isEditMode ? '更新健康证' : '创建健康证'"
      width="780px"
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
          <Form.Item label="员工" name="employeeId">
            <Select
              v-model:value="formModel.employeeId"
              :options="
                employeeOptions.map((item) => ({
                  label: item.name,
                  value: item.id,
                }))
              "
              placeholder="请选择员工"
              show-search
              :filter-option="
                (input, option) =>
                  (option?.label ?? '')
                    .toLowerCase()
                    .includes(input.toLowerCase())
              "
              :style="{ width: 'calc(100% - 50px)' }"
            />
          </Form.Item>
          <Form.Item label="健康证编号" name="certNumber">
            <Input
              v-model:value="formModel.certNumber"
              placeholder="请输入健康证编号"
              :style="{ width: 'calc(100% - 50px)' }"
            />
          </Form.Item>
          <Form.Item label="证件类型" name="certType">
            <Select
              v-model:value="formModel.certType"
              :options="certTypeOptions"
              placeholder="请选择证件类型"
              :style="{ width: 'calc(100% - 50px)' }"
            />
          </Form.Item>
          <Form.Item label="发证机构" name="issuingAuthority">
            <Input
              v-model:value="formModel.issuingAuthority"
              placeholder="请输入发证机构（可选）"
              :style="{ width: 'calc(100% - 50px)' }"
            />
          </Form.Item>
          <Form.Item label="发证日期" name="issueDate">
            <DatePicker
              v-model:value="formModel.issueDate"
              format="YYYY-MM-DD"
              :style="{ width: 'calc(100% - 50px)' }"
              placeholder="请选择发证日期"
            />
          </Form.Item>
          <Form.Item label="到期日期" name="expiryDate">
            <DatePicker
              v-model:value="formModel.expiryDate"
              format="YYYY-MM-DD"
              :style="{ width: 'calc(100% - 50px)' }"
              placeholder="请选择到期日期"
            />
          </Form.Item>
          <Form.Item label="证书状态" name="certStatus">
            <Select
              v-model:value="formModel.certStatus"
              :options="certStatusOptions"
              placeholder="请选择证书状态"
              :style="{ width: 'calc(100% - 50px)' }"
            />
          </Form.Item>
          <Form.Item label="健康证正面照片" name="certFrontImage">
            <Input
              v-model:value="formModel.certFrontImage"
              placeholder="请输入健康证正面照片URL（可选）"
              :style="{ width: 'calc(100% - 50px)' }"
            />
          </Form.Item>
          <Form.Item label="健康证反面照片" name="certBackImage">
            <Input
              v-model:value="formModel.certBackImage"
              placeholder="请输入健康证反面照片URL（可选）"
              :style="{ width: 'calc(100% - 50px)' }"
            />
          </Form.Item>
          <Form.Item label="其他附件" name="attachmentUrls">
            <Input
              v-model:value="formModel.attachmentUrls"
              placeholder="请输入其他附件URL（可选）"
              :style="{ width: 'calc(100% - 50px)' }"
            />
          </Form.Item>
          <Form.Item label="体检日期" name="physicalExamDate">
            <DatePicker
              v-model:value="formModel.physicalExamDate"
              format="YYYY-MM-DD"
              :style="{ width: 'calc(100% - 50px)' }"
              placeholder="请选择体检日期（可选）"
            />
          </Form.Item>
          <Form.Item label="体检医院" name="physicalExamHospital">
            <Input
              v-model:value="formModel.physicalExamHospital"
              placeholder="请输入体检医院（可选）"
              :style="{ width: 'calc(100% - 50px)' }"
            />
          </Form.Item>
          <Form.Item label="体检结果" name="physicalExamResult">
            <Select
              v-model:value="formModel.physicalExamResult"
              :options="physicalExamResultOptions"
              placeholder="请选择体检结果"
              :style="{ width: 'calc(100% - 50px)' }"
            />
          </Form.Item>
          <Form.Item label="下次体检日期" name="nextExamDate">
            <DatePicker
              v-model:value="formModel.nextExamDate"
              format="YYYY-MM-DD"
              :style="{ width: 'calc(100% - 50px)' }"
              placeholder="请选择下次体检日期（可选）"
            />
          </Form.Item>
        </div>
        <Form.Item label="备注" name="remark">
          <Input.TextArea
            v-model:value="formModel.remark"
            :rows="3"
            placeholder="请输入备注（可选）"
            :style="{ width: 'calc(100% - 50px)' }"
          />
        </Form.Item>
      </Form>
    </Modal>
  </div>
</template>


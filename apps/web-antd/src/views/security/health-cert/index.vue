<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import {
  getEmployeeHealthCertListApi,
  createEmployeeHealthCertApi,
  getEmployeeHealthCertDetailApi,
  updateEmployeeHealthCertApi,
  deleteEmployeeHealthCertApi,
  type EmployeeHealthCertItem,
  type EmployeeHealthCertListParams,
  type CreateEmployeeHealthCertParams,
  type UpdateEmployeeHealthCertParams,
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
  Popconfirm,
  message,
} from 'ant-design-vue';
import type { FormInstance } from 'ant-design-vue';
import dayjs from 'dayjs';

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
    width: 140,
  },
  {
    title: '健康证编号',
    dataIndex: 'certNumber',
    key: 'certNumber',
    width: 180,
  },
  {
    title: '证件类型',
    dataIndex: 'certTypeText',
    key: 'certTypeText',
    width: 120,
  },
  {
    title: '发证机构',
    dataIndex: 'issuingAuthority',
    key: 'issuingAuthority',
    width: 160,
  },
  {
    title: '发证日期',
    dataIndex: 'issueDate',
    key: 'issueDate',
    width: 150,
  },
  {
    title: '过期日期',
    dataIndex: 'expiryDate',
    key: 'expiryDate',
    width: 150,
  },
  {
    title: '状态',
    dataIndex: 'certStatusText',
    key: 'certStatusText',
    width: 120,
  },
  {
    title: '体检日期',
    dataIndex: 'physicalExamDate',
    key: 'physicalExamDate',
    width: 150,
  },
  {
    title: '下次体检日期',
    dataIndex: 'nextExamDate',
    key: 'nextExamDate',
    width: 150,
  },
  {
    title: '体检结果',
    dataIndex: 'physicalExamResultText',
    key: 'physicalExamResultText',
    width: 120,
  },
  {
    title: '备注',
    dataIndex: 'remark',
    key: 'remark',
    width: 220,
    ellipsis: true,
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
    const params: EmployeeHealthCertListParams = {
      ...queryForm.value,
      IssueDateEnd: queryForm.value.IssueDateEnd
        ? dayjs(queryForm.value.IssueDateEnd).toISOString()
        : undefined,
      PhysicalExamDateStart: queryForm.value.PhysicalExamDateStart
        ? dayjs(queryForm.value.PhysicalExamDateStart).toISOString()
        : undefined,
      PhysicalExamDateEnd: queryForm.value.PhysicalExamDateEnd
        ? dayjs(queryForm.value.PhysicalExamDateEnd).toISOString()
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
    // 错误提示由全局拦截器处理，这里不再重复 message
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

// 日期字段使用 dayjs 对象，提交时再格式化
const formModel = ref<any>({
  employeeId: '',
  certNumber: '',
  certType: 1,
  issuingAuthority: '',
  issueDate: dayjs(),
  expiryDate: dayjs(),
  certStatus: 1,
  certFrontImage: '',
  certBackImage: '',
  attachmentUrls: '',
  physicalExamDate: undefined as any,
  physicalExamHospital: '',
  physicalExamResult: 1,
  nextExamDate: undefined as any,
  remark: '',
});

const formRules = {
  employeeId: [{ required: true, message: '请输入员工ID' }],
  certNumber: [{ required: true, message: '请输入健康证编号' }],
  issueDate: [{ required: true, message: '请选择发证日期' }],
  expiryDate: [{ required: true, message: '请选择过期日期' }],
};

function resetForm() {
  formModel.value = {
    employeeId: '',
    certNumber: '',
    certType: 1,
    issuingAuthority: '',
    issueDate: dayjs(),
    expiryDate: dayjs(),
    certStatus: 1,
    certFrontImage: '',
    certBackImage: '',
    attachmentUrls: '',
    physicalExamDate: undefined,
    physicalExamHospital: '',
    physicalExamResult: 1,
    nextExamDate: undefined,
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

async function openEditModal(record: EmployeeHealthCertItem) {
  isEditMode.value = true;
  editingId.value = record.id;
  createModalVisible.value = true;
  resetForm();

  try {
    const detail = await getEmployeeHealthCertDetailApi(record.id);
    formModel.value = {
      employeeId: detail.employeeId || '',
      certNumber: detail.certNumber || '',
      certType: detail.certType ?? 1,
      issuingAuthority: detail.issuingAuthority || '',
      issueDate: detail.issueDate ? dayjs(detail.issueDate) : dayjs(),
      expiryDate: detail.expiryDate ? dayjs(detail.expiryDate) : dayjs(),
      certStatus: detail.certStatus ?? 1,
      certFrontImage: detail.certFrontImage || '',
      certBackImage: detail.certBackImage || '',
      attachmentUrls: detail.attachmentUrls || '',
      physicalExamDate: detail.physicalExamDate
        ? dayjs(detail.physicalExamDate)
        : undefined,
      physicalExamHospital: detail.physicalExamHospital || '',
      physicalExamResult: detail.physicalExamResult ?? 1,
      nextExamDate: detail.nextExamDate ? dayjs(detail.nextExamDate) : undefined,
      remark: detail.remark || '',
    };
  } catch (error: any) {
    // 全局拦截器会提示错误，这里关闭弹窗即可
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
      issueDate: dayjs(formModel.value.issueDate).toISOString(),
      expiryDate: dayjs(formModel.value.expiryDate).toISOString(),
      certStatus: formModel.value.certStatus,
      certFrontImage: formModel.value.certFrontImage,
      certBackImage: formModel.value.certBackImage,
      attachmentUrls: formModel.value.attachmentUrls,
      physicalExamDate: formModel.value.physicalExamDate
        ? dayjs(formModel.value.physicalExamDate).toISOString()
        : undefined,
      physicalExamHospital: formModel.value.physicalExamHospital,
      physicalExamResult: formModel.value.physicalExamResult,
      nextExamDate: formModel.value.nextExamDate
        ? dayjs(formModel.value.nextExamDate).toISOString()
        : undefined,
      remark: formModel.value.remark,
    };

    if (isEditMode.value) {
      const updateData: UpdateEmployeeHealthCertParams = {
        ...baseData,
        id: editingId.value,
      };
      await updateEmployeeHealthCertApi(updateData);
      message.success('更新健康证信息成功');
    } else {
      await createEmployeeHealthCertApi(baseData);
      message.success('创建健康证信息成功');
    }
    closeCreateModal();
    fetchList();
  } catch (error: any) {
    if (error?.errorFields) {
      return;
    }
    // 其它错误由全局拦截器提示
    return;
  } finally {
    submitting.value = false;
  }
}

async function handleDelete(record: EmployeeHealthCertItem) {
  try {
    await deleteEmployeeHealthCertApi(record.id);
    message.success('删除健康证信息成功');
    fetchList();
  } catch (error: any) {
    // 错误由全局拦截器提示
  }
}

onMounted(() => {
  fetchList();
});
</script>

<template>
  <div class="p-4">
    <!-- 第一行：创建按钮 -->
    <div class="mb-3">
      <Button type="primary" class="cursor-pointer" @click="openCreateModal">
        创建健康证管理
      </Button>
    </div>

    <!-- 第二行：搜索条件 -->
    <div class="mb-3 flex justify-between">
      <div />
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
          style="width: 160px"
        />
        <DatePicker
          v-model:value="queryForm.CreatedAtEnd"
          placeholder="创建时间结束"
          style="width: 160px"
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
      :scroll="{ x: 1400 }"
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
        <template v-else-if="column.key === 'nextExamDate'">
          <span v-if="record.nextExamDate">
            {{ dayjs(record.nextExamDate).format('YYYY-MM-DD') }}
          </span>
          <span v-else>—</span>
        </template>
        <template v-else-if="column.key === 'createdAt'">
          <span v-if="record.createdAt">
            {{ dayjs(record.createdAt).format('YYYY-MM-DD HH:mm:ss') }}
          </span>
          <span v-else>—</span>
        </template>
        <template v-else-if="column.key === 'certTypeText'">
          <span>
            {{
              record.certTypeText ||
              (record.certType === 1
                ? '健康证'
                : record.certType === 2
                ? '其他'
                : '未知')
            }}
          </span>
        </template>
        <template v-else-if="column.key === 'certStatusText'">
          <span>
            {{
              record.certStatusText ||
              (record.certStatus === 1
                ? '有效'
                : record.certStatus === 2
                ? '过期'
                : record.certStatus === 3
                ? '即将过期'
                : record.certStatus === 4
                ? '遗失'
                : '未知')
            }}
          </span>
        </template>
        <template v-else-if="column.key === 'physicalExamResultText'">
          <span>
            {{
              record.physicalExamResultText ||
              (record.physicalExamResult === 1
                ? '合格'
                : record.physicalExamResult === 2
                ? '不合格'
                : '未知')
            }}
          </span>
        </template>
        <template v-else-if="column.key === 'remark'">
          <span>{{ record.remark || '—' }}</span>
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
              <Popconfirm
                title="确定删除该健康证记录吗？"
                ok-text="删除"
                cancel-text="取消"
                @confirm="handleDelete(record)"
              >
                <Button type="link" danger size="small" class="cursor-pointer">
                  删除
                </Button>
              </Popconfirm>
            </Space>
          </div>
        </template>
      </template>
    </Table>

    <!-- 创建 / 编辑健康证管理弹窗 -->
    <Modal
      v-model:open="createModalVisible"
      :title="isEditMode ? '更新健康证管理' : '创建健康证管理'"
      width="900px"
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
          <Form.Item label="员工ID" name="employeeId">
            <Input
              v-model:value="formModel.employeeId"
              placeholder="请输入员工ID"
            />
          </Form.Item>
          <Form.Item label="健康证编号" name="certNumber">
            <Input
              v-model:value="formModel.certNumber"
              placeholder="请输入健康证编号"
            />
          </Form.Item>
          <Form.Item label="证件类型" name="certType">
            <Select
              v-model:value="formModel.certType"
              :options="certTypeOptions"
              placeholder="请选择证件类型"
            />
          </Form.Item>
          <Form.Item label="发证机构" name="issuingAuthority">
            <Input
              v-model:value="formModel.issuingAuthority"
              placeholder="请输入发证机构"
            />
          </Form.Item>
          <Form.Item label="发证日期" name="issueDate">
            <DatePicker
              v-model:value="formModel.issueDate"
              style="width: 100%"
              placeholder="请选择发证日期"
            />
          </Form.Item>
          <Form.Item label="过期日期" name="expiryDate">
            <DatePicker
              v-model:value="formModel.expiryDate"
              style="width: 100%"
              placeholder="请选择过期日期"
            />
          </Form.Item>
          <Form.Item label="状态" name="certStatus">
            <Select
              v-model:value="formModel.certStatus"
              :options="certStatusOptions"
              placeholder="请选择状态"
            />
          </Form.Item>
          <Form.Item label="体检日期" name="physicalExamDate">
            <DatePicker
              v-model:value="formModel.physicalExamDate"
              style="width: 100%"
              placeholder="请选择体检日期"
            />
          </Form.Item>
          <Form.Item label="体检医院" name="physicalExamHospital">
            <Input
              v-model:value="formModel.physicalExamHospital"
              placeholder="请输入体检医院"
            />
          </Form.Item>
          <Form.Item label="体检结果" name="physicalExamResult">
            <Select
              v-model:value="formModel.physicalExamResult"
              :options="physicalExamResultOptions"
              placeholder="请选择体检结果"
            />
          </Form.Item>
          <Form.Item label="下次体检日期" name="nextExamDate">
            <DatePicker
              v-model:value="formModel.nextExamDate"
              style="width: 100%"
              placeholder="请选择下次体检日期"
            />
          </Form.Item>
        </div>
        <Form.Item label="健康证正面图片地址" name="certFrontImage">
          <Input
            v-model:value="formModel.certFrontImage"
            placeholder="请输入健康证正面图片地址"
          />
        </Form.Item>
        <Form.Item label="健康证反面图片地址" name="certBackImage">
          <Input
            v-model:value="formModel.certBackImage"
            placeholder="请输入健康证反面图片地址"
          />
        </Form.Item>
        <Form.Item label="附件地址" name="attachmentUrls">
          <Input.TextArea
            v-model:value="formModel.attachmentUrls"
            :rows="2"
            placeholder="请输入附件地址（可选，多个可用逗号分隔）"
          />
        </Form.Item>
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



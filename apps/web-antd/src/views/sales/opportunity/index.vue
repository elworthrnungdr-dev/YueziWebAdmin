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
  getSalesLeadMyAssignedListApi,
  getSalesLeadDetailApi,
  createSalesLeadApi,
  updateSalesLeadApi,
  deleteSalesLeadApi,
  convertLeadToCustomerApi,
  type SalesLeadListParams,
  type SalesLeadItem,
  type CreateSalesLeadParams,
  type UpdateSalesLeadParams,
  type ConvertLeadToCustomerParams,
  getAllBranchApi,
  type BranchItem,
} from '#/api';

const loading = ref(false);
const dataSource = ref<SalesLeadItem[]>([]);
const total = ref(0);

const queryForm = ref<SalesLeadListParams>({
  CustomerName: undefined,
  AssignedEmployeeId: undefined,
  CreatedAtStart: undefined,
  CreatedAtEnd: undefined,
  LeadSource: undefined,
  LeadStatus: undefined,
  VisitedCompetitors: undefined,
  VisitIntention: undefined,
  AssignStatus: undefined,
  IsConverted: undefined,
  ConversionType: undefined,
  PageIndex: 1,
  PageSize: 10,
  OrderBy: undefined,
  IsAsc: true,
});

const leadSourceOptions = [
  { label: '网络咨询', value: 1 },
  { label: '电话咨询', value: 2 },
  { label: '到店咨询', value: 3 },
  { label: '转介绍', value: 4 },
  { label: '广告', value: 5 },
  { label: '其它', value: 99 },
];

const leadStatusOptions = [
  { label: '待跟进', value: 1 },
  { label: '跟进中', value: 2 },
  { label: '已预约参观', value: 3 },
  { label: '已转化', value: 4 },
  { label: '已流失', value: 5 },
  { label: '无效线索', value: 6 },
];

const visitedCompetitorsOptions = [
  { label: '是', value: 1 },
  { label: '否', value: 2 },
];

const visitIntentionOptions = [
  { label: '强烈', value: 1 },
  { label: '一般', value: 2 },
  { label: '较弱', value: 3 },
];

const assignStatusOptions = [
  { label: '未派单', value: 1 },
  { label: '已派单', value: 2 },
  { label: '已接收', value: 3 },
  { label: '已拒绝', value: 4 },
];

const isConvertedOptions = [
  { label: '是', value: 1 },
  { label: '否', value: 2 },
];

const conversionTypeOptions = [
  { label: '直接签约', value: 1 },
  { label: '后续跟进签约', value: 2 },
  { label: '转介绍签约', value: 3 },
];

const columns = [
  { title: '线索编号', dataIndex: 'leadNo', key: 'leadNo', width: 150 },
  { title: '客户姓名', dataIndex: 'customerName', key: 'customerName', width: 120 },
  { title: '客户电话', dataIndex: 'customerPhone', key: 'customerPhone', width: 130 },
  { title: '线索来源', dataIndex: 'leadSourceText', key: 'leadSourceText', width: 100 },
  { title: '线索状态', dataIndex: 'leadStatusText', key: 'leadStatusText', width: 100 },
  { title: '预产期', dataIndex: 'expectedDeliveryDate', key: 'expectedDeliveryDate', width: 120 },
  { title: '参观意向', dataIndex: 'visitIntentionText', key: 'visitIntentionText', width: 100 },
  { title: '派单状态', dataIndex: 'assignStatusText', key: 'assignStatusText', width: 100 },
  { title: '是否已转化', dataIndex: 'isConvertedText', key: 'isConvertedText', width: 100 },
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
    const res = await getSalesLeadMyAssignedListApi(params);
    dataSource.value = res.items;
    total.value = res.total;
  } catch (error: any) {
    const errMsg = error?.response?.data?.message || error?.message || '获取我的商机列表失败';
    message.error(errMsg);
  } finally {
    loading.value = false;
  }
}

function handleReset() {
  queryForm.value = {
    CustomerName: undefined,
    AssignedEmployeeId: undefined,
    CreatedAtStart: undefined,
    CreatedAtEnd: undefined,
    LeadSource: undefined,
    LeadStatus: undefined,
    VisitedCompetitors: undefined,
    VisitIntention: undefined,
    AssignStatus: undefined,
    IsConverted: undefined,
    ConversionType: undefined,
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
  loadBranchOptions();
});

// 弹窗相关
const createModalVisible = ref(false);
const isEditMode = ref(false);
const submitting = ref(false);
const formRef = ref<FormInstance>();
const editingId = ref('');

const formModel = ref<CreateSalesLeadParams & { expectedDeliveryDate?: any; visitDate?: any }>({
  leadSource: undefined as any,
  customerName: '',
  customerPhone: '',
  customerWechat: '',
  expectedDeliveryDate: undefined,
  parity: undefined,
  gestationalWeeks: undefined,
  currentAddress: '',
  workAddress: '',
  distanceToBranch: undefined,
  preferredBranchId: undefined,
  budgetRange: '',
  visitedCompetitors: undefined,
  competitorsInfo: '',
  visitIntention: undefined,
  visitDate: undefined,
  visitNotes: '',
  dataSource: '',
  remark: '',
});

const formRules = {
  leadSource: [{ required: true, message: '请选择线索来源' }],
  customerName: [{ required: true, message: '请输入客户姓名' }],
  customerPhone: [{ required: true, message: '请输入客户电话' }],
  expectedDeliveryDate: [{ required: true, message: '请选择预产期' }],
};

const branchOptions = ref<BranchItem[]>([]);

async function loadBranchOptions() {
  try {
    const list = await getAllBranchApi();
    branchOptions.value = list;
  } catch (error: any) {
    const errMsg = error?.response?.data?.message || error?.message || '获取分店列表失败';
    message.error(errMsg);
  }
}

function openCreateModal() {
  isEditMode.value = false;
  editingId.value = '';
  formModel.value = {
    leadSource: undefined as any,
    customerName: '',
    customerPhone: '',
    customerWechat: '',
    expectedDeliveryDate: undefined,
    parity: undefined,
    gestationalWeeks: undefined,
    currentAddress: '',
    workAddress: '',
    distanceToBranch: undefined,
    preferredBranchId: undefined,
    budgetRange: '',
    visitedCompetitors: undefined,
    competitorsInfo: '',
    visitIntention: undefined,
    visitDate: undefined,
    visitNotes: '',
    dataSource: '',
    remark: '',
  };
  createModalVisible.value = true;
}

async function openEditModal(record: SalesLeadItem) {
  try {
    loading.value = true;
    const detail = await getSalesLeadDetailApi(record.id);
    isEditMode.value = true;
    editingId.value = detail.id;
    formModel.value = {
      leadSource: detail.leadSource,
      customerName: detail.customerName || '',
      customerPhone: detail.customerPhone || '',
      customerWechat: detail.customerWechat || '',
      expectedDeliveryDate: detail.expectedDeliveryDate
        ? dayjs(detail.expectedDeliveryDate)
        : undefined,
      parity: detail.parity,
      gestationalWeeks: detail.gestationalWeeks,
      currentAddress: detail.currentAddress || '',
      workAddress: detail.workAddress || '',
      distanceToBranch: detail.distanceToBranch,
      preferredBranchId: detail.preferredBranchId,
      budgetRange: detail.budgetRange || '',
      visitedCompetitors: detail.visitedCompetitors,
      competitorsInfo: detail.competitorsInfo || '',
      visitIntention: detail.visitIntention,
      visitDate: detail.visitDate ? dayjs(detail.visitDate) : undefined,
      visitNotes: detail.visitNotes || '',
      dataSource: detail.dataSource || '',
      remark: detail.remark || '',
    };
    createModalVisible.value = true;
  } catch (error: any) {
    const errMsg = error?.response?.data?.message || error?.message || '获取商机详情失败';
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
    const payload: CreateSalesLeadParams = {
      leadSource: formModel.value.leadSource,
      customerName: formModel.value.customerName,
      customerPhone: formModel.value.customerPhone,
      customerWechat: formModel.value.customerWechat || undefined,
      expectedDeliveryDate: formModel.value.expectedDeliveryDate
        ? (typeof formModel.value.expectedDeliveryDate === 'string'
            ? formModel.value.expectedDeliveryDate
            : dayjs(formModel.value.expectedDeliveryDate).format('YYYY-MM-DD'))
        : '',
      parity: formModel.value.parity,
      gestationalWeeks: formModel.value.gestationalWeeks,
      currentAddress: formModel.value.currentAddress || undefined,
      workAddress: formModel.value.workAddress || undefined,
      distanceToBranch: formModel.value.distanceToBranch,
      preferredBranchId: formModel.value.preferredBranchId,
      budgetRange: formModel.value.budgetRange || undefined,
      visitedCompetitors: formModel.value.visitedCompetitors,
      competitorsInfo: formModel.value.competitorsInfo || undefined,
      visitIntention: formModel.value.visitIntention,
      visitDate: formModel.value.visitDate
        ? (typeof formModel.value.visitDate === 'string'
            ? formModel.value.visitDate
            : dayjs(formModel.value.visitDate).format('YYYY-MM-DD HH:mm:ss'))
        : undefined,
      visitNotes: formModel.value.visitNotes || undefined,
      dataSource: formModel.value.dataSource || undefined,
      remark: formModel.value.remark || undefined,
    };

    if (isEditMode.value) {
      await updateSalesLeadApi({ ...payload, id: editingId.value } as UpdateSalesLeadParams);
      message.success('更新我的商机成功');
    } else {
      await createSalesLeadApi(payload);
      message.success('创建我的商机成功');
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

function handleDelete(record: SalesLeadItem) {
  Modal.confirm({
    title: '确认删除',
    content: h('div', { style: { fontSize: '14px' } }, `确定删除商机【${record.customerName || ''}】吗？`),
    okText: '删除',
    cancelText: '取消',
    okType: 'danger',
    centered: true,
    onOk: async () => {
      try {
        loading.value = true;
        await deleteSalesLeadApi(record.id);
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

// 线索转客户相关
const convertModalVisible = ref(false);
const convertSubmitting = ref(false);
const convertFormRef = ref<FormInstance>();
const convertFormModel = ref<ConvertLeadToCustomerParams>({
  id: '',
  branchId: undefined,
});

const convertFormRules = {
  id: [{ required: true, message: '线索ID不能为空' }],
};

function openConvertModal(record: SalesLeadItem) {
  convertFormModel.value = {
    id: record.id,
    branchId: undefined,
  };
  convertModalVisible.value = true;
}

function closeConvertModal() {
  convertModalVisible.value = false;
  convertFormRef.value?.resetFields();
}

async function handleConvertSubmit() {
  try {
    await convertFormRef.value?.validate();
    convertSubmitting.value = true;
    await convertLeadToCustomerApi(convertFormModel.value);
    message.success('线索转客户成功');
    closeConvertModal();
    fetchList();
  } catch (error: any) {
    if (error?.errorFields) return;
    const errMsg = error?.response?.data?.message || error?.message || '操作失败';
    message.error(errMsg);
  } finally {
    convertSubmitting.value = false;
  }
}
</script>

<template>
  <div class="p-4">
    <!-- 顶部操作和搜索 -->
    <div class="mb-4 flex items-center justify-between gap-3 flex-wrap">
      <Button type="primary" class="cursor-pointer" @click="openCreateModal">
        创建我的商机
      </Button>
      <Space wrap>
        <Input
          v-model:value="queryForm.CustomerName"
          placeholder="客户姓名"
          style="width: 140px"
          allow-clear
        />
        <Select
          v-model:value="queryForm.LeadSource"
          :options="leadSourceOptions"
          placeholder="线索来源"
          style="width: 120px"
          allow-clear
        />
        <Select
          v-model:value="queryForm.LeadStatus"
          :options="leadStatusOptions"
          placeholder="线索状态"
          style="width: 120px"
          allow-clear
        />
        <Select
          v-model:value="queryForm.VisitedCompetitors"
          :options="visitedCompetitorsOptions"
          placeholder="是否了解其他"
          style="width: 130px"
          allow-clear
        />
        <Select
          v-model:value="queryForm.VisitIntention"
          :options="visitIntentionOptions"
          placeholder="参观意向"
          style="width: 120px"
          allow-clear
        />
        <Select
          v-model:value="queryForm.AssignStatus"
          :options="assignStatusOptions"
          placeholder="派单状态"
          style="width: 120px"
          allow-clear
        />
        <Select
          v-model:value="queryForm.IsConverted"
          :options="isConvertedOptions"
          placeholder="是否已转化"
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
        <template v-if="column.key === 'expectedDeliveryDate'">
          {{ record.expectedDeliveryDate ? dayjs(record.expectedDeliveryDate).format('YYYY-MM-DD') : '—' }}
        </template>
        <template v-if="column.key === 'actions'">
          <Space>
            <Button type="link" size="small" @click="openEditModal(record)">更新</Button>
            <Button type="link" size="small" @click="openConvertModal(record)">线索转客户</Button>
            <Button type="link" size="small" danger @click="handleDelete(record)">删除</Button>
          </Space>
        </template>
      </template>
    </Table>

    <!-- 创建 / 编辑弹窗 -->
    <Modal
      v-model:open="createModalVisible"
      :title="isEditMode ? '更新我的商机' : '创建我的商机'"
      width="720px"
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
        class="opportunity-form"
      >
        <div class="grid grid-cols-3 gap-2">
          <Form.Item label="线索来源" name="leadSource">
            <Select
              v-model:value="formModel.leadSource"
              :options="leadSourceOptions"
              placeholder="请选择线索来源"
            />
          </Form.Item>
          <Form.Item label="客户姓名" name="customerName">
            <Input
              v-model:value="formModel.customerName"
              placeholder="请输入客户姓名"
            />
          </Form.Item>
          <Form.Item label="客户电话" name="customerPhone">
            <Input
              v-model:value="formModel.customerPhone"
              placeholder="请输入客户电话"
            />
          </Form.Item>
          <Form.Item label="客户微信" name="customerWechat">
            <Input
              v-model:value="formModel.customerWechat"
              placeholder="请输入客户微信"
            />
          </Form.Item>
          <Form.Item label="预产期" name="expectedDeliveryDate">
            <DatePicker
              v-model:value="formModel.expectedDeliveryDate"
              format="YYYY-MM-DD"
              placeholder="请选择预产期"
            />
          </Form.Item>
          <Form.Item label="第几胎" name="parity">
            <InputNumber
              v-model:value="formModel.parity"
              :min="1"
              placeholder="请输入第几胎"
            />
          </Form.Item>
          <Form.Item label="孕周" name="gestationalWeeks">
            <InputNumber
              v-model:value="formModel.gestationalWeeks"
              :min="0"
              placeholder="请输入孕周"
            />
          </Form.Item>
          <Form.Item label="现住址" name="currentAddress">
            <Input
              v-model:value="formModel.currentAddress"
              placeholder="请输入现住址"
            />
          </Form.Item>
          <Form.Item label="工作地址" name="workAddress">
            <Input
              v-model:value="formModel.workAddress"
              placeholder="请输入工作地址"
            />
          </Form.Item>
          <Form.Item label="距离最近分店（公里）" name="distanceToBranch">
            <InputNumber
              v-model:value="formModel.distanceToBranch"
              :min="0"
              :precision="2"
              placeholder="请输入距离"
            />
          </Form.Item>
          <Form.Item label="意向分店" name="preferredBranchId">
            <Select
              v-model:value="formModel.preferredBranchId"
              :options="branchOptions.map((b) => ({ label: b.branchName, value: b.id }))"
              placeholder="请选择意向分店"
              show-search
              option-filter-prop="label"
            />
          </Form.Item>
          <Form.Item label="预算范围" name="budgetRange">
            <Input
              v-model:value="formModel.budgetRange"
              placeholder="请输入预算范围"
            />
          </Form.Item>
          <Form.Item label="是否了解其他月子会所" name="visitedCompetitors">
            <Select
              v-model:value="formModel.visitedCompetitors"
              :options="visitedCompetitorsOptions"
              placeholder="请选择"
            />
          </Form.Item>
          <Form.Item label="了解过的竞争对手信息" name="competitorsInfo" class="col-span-2">
            <Input
              v-model:value="formModel.competitorsInfo"
              placeholder="请输入了解过的竞争对手信息"
            />
          </Form.Item>
          <Form.Item label="参观意向" name="visitIntention">
            <Select
              v-model:value="formModel.visitIntention"
              :options="visitIntentionOptions"
              placeholder="请选择参观意向"
            />
          </Form.Item>
          <Form.Item label="参观时间" name="visitDate">
            <DatePicker
              v-model:value="formModel.visitDate"
              show-time
              format="YYYY-MM-DD HH:mm"
              placeholder="请选择参观时间"
            />
          </Form.Item>
          <Form.Item label="数据来源" name="dataSource">
            <Input
              v-model:value="formModel.dataSource"
              placeholder="请输入数据来源"
            />
          </Form.Item>
          <Form.Item label="参观记录/备注" name="visitNotes" class="col-span-3">
            <Input.TextArea
              v-model:value="formModel.visitNotes"
              :rows="3"
              placeholder="请输入参观记录/备注"
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

    <!-- 线索转客户弹窗 -->
    <Modal
      v-model:open="convertModalVisible"
      title="线索转客户"
      width="500px"
      :confirm-loading="convertSubmitting"
      @ok="handleConvertSubmit"
      @cancel="closeConvertModal"
      destroy-on-close
    >
      <Form
        ref="convertFormRef"
        :model="convertFormModel"
        :rules="convertFormRules"
        layout="vertical"
      >
        <Form.Item name="id" style="display: none;">
          <Input v-model:value="convertFormModel.id" />
        </Form.Item>
        <Form.Item label="指定客户所属分店" name="branchId">
          <Select
            v-model:value="convertFormModel.branchId"
            :options="branchOptions.map((b) => ({ label: b.branchName, value: b.id }))"
            placeholder="请选择分店（可选）"
            allow-clear
            show-search
            option-filter-prop="label"
          />
        </Form.Item>
      </Form>
    </Modal>
  </div>
</template>

<style scoped>
.opportunity-form :deep(.ant-input),
.opportunity-form :deep(.ant-input-number),
.opportunity-form :deep(.ant-input-number-input),
.opportunity-form :deep(.ant-picker),
.opportunity-form :deep(.ant-select) {
  width: calc(100% - 20px) !important;
  max-width: calc(100% - 20px) !important;
}
</style>


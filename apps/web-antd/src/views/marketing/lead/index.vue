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
  getSalesLeadListApi,
  getSalesLeadDetailApi,
  createSalesLeadApi,
  updateSalesLeadApi,
  deleteSalesLeadApi,
  assignSalesLeadApi,
  type SalesLeadListParams,
  type SalesLeadItem,
  type CreateSalesLeadParams,
  type UpdateSalesLeadParams,
  type AssignSalesLeadParams,
  getAllBranchApi,
  getEmployeeListApi,
  type BranchItem,
  type EmployeeItem,
} from '#/api';

const leadLoading = ref(false);
const leadDataSource = ref<SalesLeadItem[]>([]);
const leadTotal = ref(0);

const leadQueryForm = ref<SalesLeadListParams>({
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

const leadSourceOptionsList = [
  { label: '网络咨询', value: 1 },
  { label: '电话咨询', value: 2 },
  { label: '到店咨询', value: 3 },
  { label: '转介绍', value: 4 },
  { label: '广告', value: 5 },
  { label: '其它', value: 99 },
];

const leadStatusOptionsList = [
  { label: '待跟进', value: 1 },
  { label: '跟进中', value: 2 },
  { label: '已预约参观', value: 3 },
  { label: '已转化', value: 4 },
  { label: '已流失', value: 5 },
  { label: '无效线索', value: 6 },
];

const visitedCompetitorsOptionsList = [
  { label: '是', value: 1 },
  { label: '否', value: 2 },
];

const visitIntentionOptionsList = [
  { label: '强烈', value: 1 },
  { label: '一般', value: 2 },
  { label: '较弱', value: 3 },
];

const assignStatusOptionsList = [
  { label: '未派单', value: 1 },
  { label: '已派单', value: 2 },
  { label: '已接收', value: 3 },
  { label: '已拒绝', value: 4 },
];

const isConvertedOptionsList = [
  { label: '是', value: 1 },
  { label: '否', value: 2 },
];

const conversionTypeOptionsList = [
  { label: '直接签约', value: 1 },
  { label: '后续跟进签约', value: 2 },
  { label: '转介绍签约', value: 3 },
];

const leadColumns = [
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

async function leadFetchList() {
  try {
    leadLoading.value = true;
    const params: any = { ...leadQueryForm.value };
    if (params.CreatedAtStart) {
      params.CreatedAtStart = dayjs(params.CreatedAtStart).format('YYYY-MM-DD HH:mm:ss');
    }
    if (params.CreatedAtEnd) {
      params.CreatedAtEnd = dayjs(params.CreatedAtEnd).format('YYYY-MM-DD HH:mm:ss');
    }
    const res = await getSalesLeadListApi(params);
    leadDataSource.value = res.items;
    leadTotal.value = res.total;
  } catch (error: any) {
    const errMsg = error?.response?.data?.message || error?.message || '获取客户线索列表失败';
    message.error(errMsg);
  } finally {
    leadLoading.value = false;
  }
}

function leadHandleReset() {
  leadQueryForm.value = {
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
  leadFetchList();
}

function leadHandleTableChange(pagination: any) {
  leadQueryForm.value.PageIndex = pagination.current;
  leadQueryForm.value.PageSize = pagination.pageSize;
  leadFetchList();
}

onMounted(() => {
  leadFetchList();
  leadLoadBranchOptions();
  // leadLoadEmployeeOptions(); // 暂时隐藏员工列表接口调用
});

// 弹窗相关
const leadCreateModalVisible = ref(false);
const leadIsEditMode = ref(false);
const leadSubmitting = ref(false);
const leadFormRef = ref<FormInstance>();
const leadEditingId = ref('');

const leadFormModel = ref<CreateSalesLeadParams & { expectedDeliveryDate?: any; visitDate?: any }>({
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

const leadFormRules = {
  leadSource: [{ required: true, message: '请选择线索来源' }],
  customerName: [{ required: true, message: '请输入客户姓名' }],
  customerPhone: [{ required: true, message: '请输入客户电话' }],
  expectedDeliveryDate: [{ required: true, message: '请选择预产期' }],
};

const leadBranchOptions = ref<BranchItem[]>([]);

async function leadLoadBranchOptions() {
  try {
    const list = await getAllBranchApi();
    leadBranchOptions.value = list;
  } catch (error: any) {
    const errMsg = error?.response?.data?.message || error?.message || '获取分店列表失败';
    message.error(errMsg);
  }
}

function leadOpenCreateModal() {
  leadIsEditMode.value = false;
  leadEditingId.value = '';
  leadFormModel.value = {
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
  leadCreateModalVisible.value = true;
}

async function leadOpenEditModal(record: SalesLeadItem) {
  try {
    leadLoading.value = true;
    const detail = await getSalesLeadDetailApi(record.id);
    leadIsEditMode.value = true;
    leadEditingId.value = detail.id;
    leadFormModel.value = {
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
    leadCreateModalVisible.value = true;
  } catch (error: any) {
    const errMsg = error?.response?.data?.message || error?.message || '获取线索详情失败';
    message.error(errMsg);
  } finally {
    leadLoading.value = false;
  }
}

function leadCloseCreateModal() {
  leadCreateModalVisible.value = false;
  leadFormRef.value?.resetFields();
}

async function leadHandleSubmit() {
  try {
    await leadFormRef.value?.validate();
    leadSubmitting.value = true;
    const payload: CreateSalesLeadParams = {
      leadSource: leadFormModel.value.leadSource,
      customerName: leadFormModel.value.customerName,
      customerPhone: leadFormModel.value.customerPhone,
      customerWechat: leadFormModel.value.customerWechat || undefined,
      expectedDeliveryDate: leadFormModel.value.expectedDeliveryDate
        ? (typeof leadFormModel.value.expectedDeliveryDate === 'string'
            ? leadFormModel.value.expectedDeliveryDate
            : dayjs(leadFormModel.value.expectedDeliveryDate).format('YYYY-MM-DD'))
        : '',
      parity: leadFormModel.value.parity,
      gestationalWeeks: leadFormModel.value.gestationalWeeks,
      currentAddress: leadFormModel.value.currentAddress || undefined,
      workAddress: leadFormModel.value.workAddress || undefined,
      distanceToBranch: leadFormModel.value.distanceToBranch,
      preferredBranchId: leadFormModel.value.preferredBranchId,
      budgetRange: leadFormModel.value.budgetRange || undefined,
      visitedCompetitors: leadFormModel.value.visitedCompetitors,
      competitorsInfo: leadFormModel.value.competitorsInfo || undefined,
      visitIntention: leadFormModel.value.visitIntention,
      visitDate: leadFormModel.value.visitDate
        ? (typeof leadFormModel.value.visitDate === 'string'
            ? leadFormModel.value.visitDate
            : dayjs(leadFormModel.value.visitDate).format('YYYY-MM-DD HH:mm:ss'))
        : undefined,
      visitNotes: leadFormModel.value.visitNotes || undefined,
      dataSource: leadFormModel.value.dataSource || undefined,
      remark: leadFormModel.value.remark || undefined,
    };

    if (leadIsEditMode.value) {
      await updateSalesLeadApi({ ...payload, id: leadEditingId.value } as UpdateSalesLeadParams);
      message.success('更新客户线索成功');
    } else {
      await createSalesLeadApi(payload);
      message.success('创建客户线索成功');
    }
    leadCloseCreateModal();
    leadFetchList();
  } catch (error: any) {
    if (error?.errorFields) return;
    const errMsg = error?.response?.data?.message || error?.message || '操作失败';
    message.error(errMsg);
  } finally {
    leadSubmitting.value = false;
  }
}

function leadHandleDelete(record: SalesLeadItem) {
  Modal.confirm({
    title: '确认删除',
    content: h('div', { style: { fontSize: '14px' } }, `确定删除线索【${record.customerName || ''}】吗？`),
    okText: '删除',
    cancelText: '取消',
    okType: 'danger',
    centered: true,
    onOk: async () => {
      try {
        leadLoading.value = true;
        await deleteSalesLeadApi(record.id);
        message.success('删除成功');
        leadFetchList();
      } catch (error: any) {
        const errMsg = error?.response?.data?.message || error?.message || '删除失败';
        message.error(errMsg);
        throw error;
      } finally {
        leadLoading.value = false;
      }
    },
  });
}

// 指派销售相关
const leadAssignModalVisible = ref(false);
const leadAssignSubmitting = ref(false);
const leadAssignFormRef = ref<FormInstance>();
const leadAssignFormModel = ref<AssignSalesLeadParams>({
  id: '',
  assignedEmployeeId: '',
});

const leadAssignFormRules = {
  id: [{ required: true, message: '线索ID不能为空' }],
  assignedEmployeeId: [{ required: true, message: '请选择指派的销售员工' }],
};

const leadEmployeeOptions = ref<EmployeeItem[]>([]);

async function leadLoadEmployeeOptions() {
  try {
    const res = await getEmployeeListApi({
      PageIndex: 1,
      PageSize: 1000,
    });
    leadEmployeeOptions.value = res.items;
  } catch (error: any) {
    const errMsg = error?.response?.data?.message || error?.message || '获取员工列表失败';
    message.error(errMsg);
  }
}

function leadOpenAssignModal(record: SalesLeadItem) {
  leadAssignFormModel.value = {
    id: record.id,
    assignedEmployeeId: '',
  };
  leadAssignModalVisible.value = true;
}

function leadCloseAssignModal() {
  leadAssignModalVisible.value = false;
  leadAssignFormRef.value?.resetFields();
}

async function leadHandleAssignSubmit() {
  try {
    await leadAssignFormRef.value?.validate();
    leadAssignSubmitting.value = true;
    await assignSalesLeadApi(leadAssignFormModel.value);
    message.success('指派销售成功');
    leadCloseAssignModal();
    leadFetchList();
  } catch (error: any) {
    if (error?.errorFields) return;
    const errMsg = error?.response?.data?.message || error?.message || '操作失败';
    message.error(errMsg);
  } finally {
    leadAssignSubmitting.value = false;
  }
}
</script>

<template>
  <div class="p-4">
    <!-- 顶部操作和搜索 -->
    <div class="mb-4 flex items-center justify-between gap-3 flex-wrap">
      <Button type="primary" class="cursor-pointer" @click="leadOpenCreateModal">
        创建客户线索
      </Button>
      <Space wrap>
        <Input
          v-model:value="leadQueryForm.CustomerName"
          placeholder="客户姓名"
          style="width: 140px"
          allow-clear
        />
        <Select
          v-model:value="leadQueryForm.LeadSource"
          :options="leadSourceOptionsList"
          placeholder="线索来源"
          style="width: 120px"
          allow-clear
        />
        <Select
          v-model:value="leadQueryForm.LeadStatus"
          :options="leadStatusOptionsList"
          placeholder="线索状态"
          style="width: 120px"
          allow-clear
        />
        <Select
          v-model:value="leadQueryForm.VisitedCompetitors"
          :options="visitedCompetitorsOptionsList"
          placeholder="是否了解其他"
          style="width: 130px"
          allow-clear
        />
        <Select
          v-model:value="leadQueryForm.VisitIntention"
          :options="visitIntentionOptionsList"
          placeholder="参观意向"
          style="width: 120px"
          allow-clear
        />
        <Select
          v-model:value="leadQueryForm.AssignStatus"
          :options="assignStatusOptionsList"
          placeholder="派单状态"
          style="width: 120px"
          allow-clear
        />
        <Select
          v-model:value="leadQueryForm.IsConverted"
          :options="isConvertedOptionsList"
          placeholder="是否已转化"
          style="width: 120px"
          allow-clear
        />
        <DatePicker
          v-model:value="leadQueryForm.CreatedAtStart"
          show-time
          format="YYYY-MM-DD HH:mm"
          placeholder="创建时间开始"
          style="width: 180px"
        />
        <DatePicker
          v-model:value="leadQueryForm.CreatedAtEnd"
          show-time
          format="YYYY-MM-DD HH:mm"
          placeholder="创建时间结束"
          style="width: 180px"
        />
        <Button type="primary" class="cursor-pointer" @click="leadFetchList">
          查询
        </Button>
        <Button class="cursor-pointer" @click="leadHandleReset">重置</Button>
      </Space>
    </div>

    <!-- 表格 -->
    <Table
      :columns="leadColumns"
      :data-source="leadDataSource"
      :loading="leadLoading"
      :pagination="{
        current: leadQueryForm.PageIndex,
        pageSize: leadQueryForm.PageSize,
        total: leadTotal,
        showSizeChanger: true,
      }"
      row-key="id"
      :scroll="{ x: 'max-content' }"
      @change="leadHandleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'expectedDeliveryDate'">
          {{ record.expectedDeliveryDate ? dayjs(record.expectedDeliveryDate).format('YYYY-MM-DD') : '—' }}
        </template>
        <template v-if="column.key === 'actions'">
          <Space>
            <Button type="link" size="small" @click="leadOpenEditModal(record)">更新</Button>
            <Button type="link" size="small" @click="leadOpenAssignModal(record)">指派销售</Button>
            <Button type="link" size="small" danger @click="leadHandleDelete(record)">删除</Button>
          </Space>
        </template>
      </template>
    </Table>

    <!-- 创建 / 编辑弹窗 -->
    <Modal
      v-model:open="leadCreateModalVisible"
      :title="leadIsEditMode ? '更新客户线索' : '创建客户线索'"
      width="720px"
      :confirm-loading="leadSubmitting"
      :body-style="{ maxHeight: '600px', overflowY: 'auto' }"
      @ok="leadHandleSubmit"
      @cancel="leadCloseCreateModal"
      destroy-on-close
    >
      <Form
        ref="leadFormRef"
        :model="leadFormModel"
        :rules="leadFormRules"
        layout="vertical"
        class="lead-form"
      >
        <div class="grid grid-cols-3 gap-2">
          <Form.Item label="线索来源" name="leadSource">
            <Select
              v-model:value="leadFormModel.leadSource"
              :options="leadSourceOptionsList"
              placeholder="请选择线索来源"
            />
          </Form.Item>
          <Form.Item label="客户姓名" name="customerName">
            <Input
              v-model:value="leadFormModel.customerName"
              placeholder="请输入客户姓名"
            />
          </Form.Item>
          <Form.Item label="客户电话" name="customerPhone">
            <Input
              v-model:value="leadFormModel.customerPhone"
              placeholder="请输入客户电话"
            />
          </Form.Item>
          <Form.Item label="客户微信" name="customerWechat">
            <Input
              v-model:value="leadFormModel.customerWechat"
              placeholder="请输入客户微信"
            />
          </Form.Item>
          <Form.Item label="预产期" name="expectedDeliveryDate">
            <DatePicker
              v-model:value="leadFormModel.expectedDeliveryDate"
              format="YYYY-MM-DD"
              placeholder="请选择预产期"
            />
          </Form.Item>
          <Form.Item label="第几胎" name="parity">
            <InputNumber
              v-model:value="leadFormModel.parity"
              :min="1"
              placeholder="请输入第几胎"
            />
          </Form.Item>
          <Form.Item label="孕周" name="gestationalWeeks">
            <InputNumber
              v-model:value="leadFormModel.gestationalWeeks"
              :min="0"
              placeholder="请输入孕周"
            />
          </Form.Item>
          <Form.Item label="现住址" name="currentAddress">
            <Input
              v-model:value="leadFormModel.currentAddress"
              placeholder="请输入现住址"
            />
          </Form.Item>
          <Form.Item label="工作地址" name="workAddress">
            <Input
              v-model:value="leadFormModel.workAddress"
              placeholder="请输入工作地址"
            />
          </Form.Item>
          <Form.Item label="距离最近分店（公里）" name="distanceToBranch">
            <InputNumber
              v-model:value="leadFormModel.distanceToBranch"
              :min="0"
              :precision="2"
              placeholder="请输入距离"
            />
          </Form.Item>
          <Form.Item label="意向分店" name="preferredBranchId">
            <Select
              v-model:value="leadFormModel.preferredBranchId"
              :options="leadBranchOptions.map((b) => ({ label: b.branchName, value: b.id }))"
              placeholder="请选择意向分店"
              show-search
              option-filter-prop="label"
            />
          </Form.Item>
          <Form.Item label="预算范围" name="budgetRange">
            <Input
              v-model:value="leadFormModel.budgetRange"
              placeholder="请输入预算范围"
            />
          </Form.Item>
          <Form.Item label="是否了解其他月子会所" name="visitedCompetitors">
            <Select
              v-model:value="leadFormModel.visitedCompetitors"
              :options="visitedCompetitorsOptionsList"
              placeholder="请选择"
            />
          </Form.Item>
          <Form.Item label="了解过的竞争对手信息" name="competitorsInfo" class="col-span-2">
            <Input
              v-model:value="leadFormModel.competitorsInfo"
              placeholder="请输入了解过的竞争对手信息"
            />
          </Form.Item>
          <Form.Item label="参观意向" name="visitIntention">
            <Select
              v-model:value="leadFormModel.visitIntention"
              :options="visitIntentionOptionsList"
              placeholder="请选择参观意向"
            />
          </Form.Item>
          <Form.Item label="参观时间" name="visitDate">
            <DatePicker
              v-model:value="leadFormModel.visitDate"
              show-time
              format="YYYY-MM-DD HH:mm"
              placeholder="请选择参观时间"
            />
          </Form.Item>
          <Form.Item label="数据来源" name="dataSource">
            <Input
              v-model:value="leadFormModel.dataSource"
              placeholder="请输入数据来源"
            />
          </Form.Item>
          <Form.Item label="参观记录/备注" name="visitNotes" class="col-span-3">
            <Input.TextArea
              v-model:value="leadFormModel.visitNotes"
              :rows="3"
              placeholder="请输入参观记录/备注"
            />
          </Form.Item>
          <Form.Item label="备注" name="remark" class="col-span-3">
            <Input.TextArea
              v-model:value="leadFormModel.remark"
              :rows="3"
              placeholder="请输入备注"
            />
          </Form.Item>
        </div>
      </Form>
    </Modal>

    <!-- 指派销售弹窗 -->
    <Modal
      v-model:open="leadAssignModalVisible"
      title="指派销售"
      width="500px"
      :confirm-loading="leadAssignSubmitting"
      @ok="leadHandleAssignSubmit"
      @cancel="leadCloseAssignModal"
      destroy-on-close
    >
      <Form
        ref="leadAssignFormRef"
        :model="leadAssignFormModel"
        :rules="leadAssignFormRules"
        layout="vertical"
      >
        <Form.Item name="id" style="display: none;">
          <Input v-model:value="leadAssignFormModel.id" />
        </Form.Item>
        <Form.Item label="指派的销售员工" name="assignedEmployeeId">
          <Select
            v-model:value="leadAssignFormModel.assignedEmployeeId"
            :options="leadEmployeeOptions.map((e) => ({ label: e.name, value: e.id }))"
            placeholder="请选择指派的销售员工"
            show-search
            option-filter-prop="label"
          />
        </Form.Item>
      </Form>
    </Modal>
  </div>
</template>

<style scoped>
.lead-form :deep(.ant-input),
.lead-form :deep(.ant-input-number),
.lead-form :deep(.ant-input-number-input),
.lead-form :deep(.ant-picker),
.lead-form :deep(.ant-select) {
  width: calc(100% - 20px) !important;
  max-width: calc(100% - 20px) !important;
}
</style>


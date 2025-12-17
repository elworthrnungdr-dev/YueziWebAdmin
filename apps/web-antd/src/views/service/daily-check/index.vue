<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import {
  getDailyCheckListApi,
  createDailyCheckApi,
  getDailyCheckDetailApi,
  updateDailyCheckApi,
  deleteDailyCheckApi,
  type DailyCheckItem,
  type DailyCheckListParams,
  type CreateDailyCheckParams,
  type UpdateDailyCheckParams,
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
  Popconfirm,
  TimePicker,
  message,
} from 'ant-design-vue';
import type { FormInstance } from 'ant-design-vue';
import dayjs from 'dayjs';

const loading = ref(false);
const dataSource = ref<DailyCheckItem[]>([]);
const total = ref(0);

const queryForm = ref<DailyCheckListParams>({
  VisitorName: undefined,
  VisitDateStart: undefined,
  VisitDateEnd: undefined,
  CreatedAtStart: undefined,
  CreatedAtEnd: undefined,
  VisitType: undefined,
  CustomerMood: undefined,
  SleepQuality: undefined,
  Appetite: undefined,
  IsProblem: undefined,
  FollowUpRequired: undefined,
  PageIndex: 1,
  PageSize: 10,
  OrderBy: undefined,
  IsAsc: true,
});

const visitTypeOptions = [
  { label: '日常查访', value: 1 },
  { label: '专项检查', value: 2 },
  { label: '问题跟进', value: 3 },
  { label: '其他', value: 99 },
];

const customerMoodOptions = [
  { label: '愉快', value: 1 },
  { label: '平静', value: 2 },
  { label: '焦虑', value: 3 },
  { label: '烦躁', value: 4 },
  { label: '其他', value: 99 },
];

const sleepQualityOptions = [
  { label: '良好', value: 1 },
  { label: '一般', value: 2 },
  { label: '差', value: 3 },
];

const appetiteOptions = [
  { label: '良好', value: 1 },
  { label: '一般', value: 2 },
  { label: '差', value: 3 },
];

const isProblemOptions = [
  { label: '是', value: 1 },
  { label: '否', value: 2 },
];

const followUpRequiredOptions = [
  { label: '是', value: 1 },
  { label: '否', value: 2 },
];

const columns = [
  {
    title: '客户ID',
    dataIndex: 'customerId',
    key: 'customerId',
    width: 140,
  },
  {
    title: '合同编号',
    dataIndex: 'contractNo',
    key: 'contractNo',
    width: 150,
  },
  {
    title: '查访日期',
    dataIndex: 'visitDate',
    key: 'visitDate',
    width: 120,
  },
  {
    title: '查访时间',
    dataIndex: 'visitTime',
    key: 'visitTime',
    width: 100,
  },
  {
    title: '查访人姓名',
    dataIndex: 'visitorName',
    key: 'visitorName',
    width: 120,
  },
  {
    title: '查访类型',
    dataIndex: 'visitTypeText',
    key: 'visitTypeText',
    width: 120,
  },
  {
    title: '是否存在问题',
    dataIndex: 'isProblemText',
    key: 'isProblemText',
    width: 120,
  },
  {
    title: '是否需要跟进',
    dataIndex: 'followUpRequiredText',
    key: 'followUpRequiredText',
    width: 120,
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
    width: 150,
    fixed: 'right',
    align: 'center',
  },
];

async function fetchList() {
  try {
    loading.value = true;
    const params: DailyCheckListParams = {
      ...queryForm.value,
      VisitDateStart: queryForm.value.VisitDateStart
        ? dayjs(queryForm.value.VisitDateStart).toISOString()
        : undefined,
      VisitDateEnd: queryForm.value.VisitDateEnd
        ? dayjs(queryForm.value.VisitDateEnd).toISOString()
        : undefined,
      CreatedAtStart: queryForm.value.CreatedAtStart
        ? dayjs(queryForm.value.CreatedAtStart).toISOString()
        : undefined,
      CreatedAtEnd: queryForm.value.CreatedAtEnd
        ? dayjs(queryForm.value.CreatedAtEnd).toISOString()
        : undefined,
    };
    const res = await getDailyCheckListApi(params);
    dataSource.value = res.items;
    total.value = res.total;
  } finally {
    loading.value = false;
  }
}

function handleReset() {
  queryForm.value = {
    VisitorName: undefined,
    VisitDateStart: undefined,
    VisitDateEnd: undefined,
    CreatedAtStart: undefined,
    CreatedAtEnd: undefined,
    VisitType: undefined,
    CustomerMood: undefined,
    SleepQuality: undefined,
    Appetite: undefined,
    IsProblem: undefined,
    FollowUpRequired: undefined,
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

// 创建 / 编辑弹窗
const createModalVisible = ref(false);
const isEditMode = ref(false);
const submitting = ref(false);
const formRef = ref<FormInstance | null>(null);
const editingId = ref('');

const formModel = ref<CreateDailyCheckParams>({
  customerId: '',
  visitDate: '',
  visitTime: '',
  visitorId: '',
  visitorName: '',
  visitType: 1,
  visitContent: '',
  customerMood: undefined,
  sleepQuality: undefined,
  appetite: undefined,
  breastfeeding: '',
  lochiaSituation: '',
  incisionCondition: '',
  babyCondition: '',
  specialConcerns: '',
  nextFocus: '',
  isProblem: 2,
  problemDescription: '',
  solution: '',
  followUpRequired: 2,
  followUpPlan: '',
  nextVisitDate: '',
  customerFeedback: '',
  attachments: '',
  remark: '',
});

const formRules = {
  customerId: [{ required: true, message: '请输入客户ID' }],
  visitDate: [{ required: true, message: '请选择查访日期' }],
  visitTime: [{ required: true, message: '请选择查访时间' }],
  visitorId: [{ required: true, message: '请输入查访人ID' }],
  visitorName: [{ required: true, message: '请输入查访人姓名' }],
  visitType: [{ required: true, message: '请选择查访类型' }],
  visitContent: [{ required: true, message: '请输入查访内容' }],
  isProblem: [{ required: true, message: '请选择是否存在问题' }],
  followUpRequired: [{ required: true, message: '请选择是否需要跟进' }],
};

function openCreateModal() {
  isEditMode.value = false;
  editingId.value = '';
  formModel.value = {
    customerId: '',
    visitDate: '',
    visitTime: '',
    visitorId: '',
    visitorName: '',
    visitType: 1,
    visitContent: '',
    customerMood: undefined,
    sleepQuality: undefined,
    appetite: undefined,
    breastfeeding: '',
    lochiaSituation: '',
    incisionCondition: '',
    babyCondition: '',
    specialConcerns: '',
    nextFocus: '',
    isProblem: 2,
    problemDescription: '',
    solution: '',
    followUpRequired: 2,
    followUpPlan: '',
    nextVisitDate: '',
    customerFeedback: '',
    attachments: '',
    remark: '',
  };
  createModalVisible.value = true;
}

async function openEditModal(record: DailyCheckItem) {
  isEditMode.value = true;
  editingId.value = record.id;
  try {
    const detail = await getDailyCheckDetailApi(record.id);
    formModel.value = {
      customerId: detail.customerId || '',
      visitDate: detail.visitDate ? (dayjs(detail.visitDate) as any) : '',
      visitTime: detail.visitTime || '',
      visitorId: detail.visitorId || '',
      visitorName: detail.visitorName || '',
      visitType: detail.visitType,
      visitContent: detail.visitContent || '',
      customerMood: detail.customerMood,
      sleepQuality: detail.sleepQuality,
      appetite: detail.appetite,
      breastfeeding: detail.breastfeeding || '',
      lochiaSituation: detail.lochiaSituation || '',
      incisionCondition: detail.incisionCondition || '',
      babyCondition: detail.babyCondition || '',
      specialConcerns: detail.specialConcerns || '',
      nextFocus: detail.nextFocus || '',
      isProblem: detail.isProblem,
      problemDescription: detail.problemDescription || '',
      solution: detail.solution || '',
      followUpRequired: detail.followUpRequired,
      followUpPlan: detail.followUpPlan || '',
      nextVisitDate: detail.nextVisitDate
        ? (dayjs(detail.nextVisitDate) as any)
        : '',
      customerFeedback: detail.customerFeedback || '',
      attachments: detail.attachments || '',
      remark: detail.remark || '',
    };
    createModalVisible.value = true;
  } catch {
    // 由全局拦截器处理错误
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
    const params: CreateDailyCheckParams = {
      ...formModel.value,
      visitDate: formModel.value.visitDate
        ? dayjs(formModel.value.visitDate as any).toISOString()
        : '',
      nextVisitDate: formModel.value.nextVisitDate
        ? dayjs(formModel.value.nextVisitDate as any).toISOString()
        : undefined,
    };

    if (isEditMode.value) {
      await updateDailyCheckApi({
        ...params,
        id: editingId.value,
      } as UpdateDailyCheckParams);
      message.success('更新每日查房成功');
    } else {
      await createDailyCheckApi(params);
      message.success('创建每日查房成功');
    }
    closeCreateModal();
    fetchList();
  } catch {
    // 由全局拦截器处理错误
  } finally {
    submitting.value = false;
  }
}

async function handleDelete(record: DailyCheckItem) {
  try {
    await deleteDailyCheckApi(record.id);
    message.success('删除每日查房成功');
    fetchList();
  } catch {
    // 由全局拦截器处理错误
  }
}
</script>

<template>
  <div class="p-4">
    <!-- 创建按钮和搜索表单 -->
    <div
      class="mb-4"
      style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px;
      "
    >
      <Button type="primary" class="cursor-pointer" @click="openCreateModal">
        创建每日查房
      </Button>
      <Space wrap>
        <Input
          v-model:value="queryForm.VisitorName"
          placeholder="查访人姓名"
          style="width: 150px"
          allow-clear
        />
        <DatePicker
          v-model:value="queryForm.VisitDateStart"
          placeholder="查房日期开始"
          style="width: 150px"
        />
        <DatePicker
          v-model:value="queryForm.VisitDateEnd"
          placeholder="查房日期结束"
          style="width: 150px"
        />
        <DatePicker
          v-model:value="queryForm.CreatedAtStart"
          placeholder="创建时间开始"
          style="width: 150px"
        />
        <DatePicker
          v-model:value="queryForm.CreatedAtEnd"
          placeholder="创建时间结束"
          style="width: 150px"
        />
        <Select
          v-model:value="queryForm.VisitType"
          :options="visitTypeOptions"
          placeholder="查访类型"
          style="width: 150px"
          allow-clear
        />
        <Select
          v-model:value="queryForm.CustomerMood"
          :options="customerMoodOptions"
          placeholder="客户情绪状态"
          style="width: 150px"
          allow-clear
        />
        <Select
          v-model:value="queryForm.SleepQuality"
          :options="sleepQualityOptions"
          placeholder="睡眠质量"
          style="width: 120px"
          allow-clear
        />
        <Select
          v-model:value="queryForm.Appetite"
          :options="appetiteOptions"
          placeholder="食欲情况"
          style="width: 120px"
          allow-clear
        />
        <Select
          v-model:value="queryForm.IsProblem"
          :options="isProblemOptions"
          placeholder="是否存在问题"
          style="width: 140px"
          allow-clear
        />
        <Select
          v-model:value="queryForm.FollowUpRequired"
          :options="followUpRequiredOptions"
          placeholder="是否需要跟进"
          style="width: 140px"
          allow-clear
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
      :scroll="{ x: 1500 }"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'visitDate'">
          <span v-if="record.visitDate">
            {{ dayjs(record.visitDate).format('YYYY-MM-DD') }}
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
              <Popconfirm
                title="确定删除该每日查房记录吗？"
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

    <!-- 创建 / 编辑每日查房弹窗 -->
    <Modal
      v-model:open="createModalVisible"
      :title="isEditMode ? '更新每日查房' : '创建每日查房'"
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
          <Form.Item label="客户ID" name="customerId">
            <Input
              v-model:value="formModel.customerId"
              placeholder="请输入客户ID"
            />
          </Form.Item>
          <Form.Item label="查访日期" name="visitDate">
            <DatePicker
              v-model:value="formModel.visitDate"
              style="width: 100%"
              placeholder="请选择查访日期"
            />
          </Form.Item>
          <Form.Item label="查访时间" name="visitTime">
            <TimePicker
              v-model:value="formModel.visitTime"
              format="HH:mm:ss"
              value-format="HH:mm:ss"
              style="width: 100%"
              placeholder="请选择查访时间"
            />
          </Form.Item>
          <Form.Item label="查访人ID（员工ID）" name="visitorId">
            <Input
              v-model:value="formModel.visitorId"
              placeholder="请输入查访人ID"
            />
          </Form.Item>
          <Form.Item label="查访人姓名" name="visitorName">
            <Input
              v-model:value="formModel.visitorName"
              placeholder="请输入查访人姓名"
            />
          </Form.Item>
          <Form.Item label="查访类型" name="visitType">
            <Select
              v-model:value="formModel.visitType"
              :options="visitTypeOptions"
              placeholder="请选择查访类型"
            />
          </Form.Item>
          <Form.Item label="客户情绪状态" name="customerMood">
            <Select
              v-model:value="formModel.customerMood"
              :options="customerMoodOptions"
              placeholder="请选择客户情绪状态"
              allow-clear
            />
          </Form.Item>
          <Form.Item label="睡眠质量" name="sleepQuality">
            <Select
              v-model:value="formModel.sleepQuality"
              :options="sleepQualityOptions"
              placeholder="请选择睡眠质量"
              allow-clear
            />
          </Form.Item>
          <Form.Item label="食欲情况" name="appetite">
            <Select
              v-model:value="formModel.appetite"
              :options="appetiteOptions"
              placeholder="请选择食欲情况"
              allow-clear
            />
          </Form.Item>
          <Form.Item label="是否存在问题" name="isProblem">
            <Select
              v-model:value="formModel.isProblem"
              :options="isProblemOptions"
              placeholder="请选择是否存在问题"
            />
          </Form.Item>
          <Form.Item label="是否需要跟进" name="followUpRequired">
            <Select
              v-model:value="formModel.followUpRequired"
              :options="followUpRequiredOptions"
              placeholder="请选择是否需要跟进"
            />
          </Form.Item>
          <Form.Item label="下次查访日期" name="nextVisitDate">
            <DatePicker
              v-model:value="formModel.nextVisitDate"
              style="width: 100%"
              placeholder="请选择下次查访日期"
            />
          </Form.Item>
        </div>
        <Form.Item label="查访内容" name="visitContent">
          <Input.TextArea
            v-model:value="formModel.visitContent"
            :rows="3"
            placeholder="请输入查访内容"
          />
        </Form.Item>
        <Form.Item label="哺乳情况" name="breastfeeding">
          <Input.TextArea
            v-model:value="formModel.breastfeeding"
            :rows="2"
            placeholder="请输入哺乳情况"
          />
        </Form.Item>
        <Form.Item label="恶露情况" name="lochiaSituation">
          <Input.TextArea
            v-model:value="formModel.lochiaSituation"
            :rows="2"
            placeholder="请输入恶露情况"
          />
        </Form.Item>
        <Form.Item label="伤口情况描述" name="incisionCondition">
          <Input.TextArea
            v-model:value="formModel.incisionCondition"
            :rows="2"
            placeholder="请输入伤口情况描述"
          />
        </Form.Item>
        <Form.Item label="宝宝情况（多宝宝用JSON格式）" name="babyCondition">
          <Input.TextArea
            v-model:value="formModel.babyCondition"
            :rows="2"
            placeholder="请输入宝宝情况"
          />
        </Form.Item>
        <Form.Item label="特殊关注" name="specialConcerns">
          <Input.TextArea
            v-model:value="formModel.specialConcerns"
            :rows="2"
            placeholder="请输入特殊关注"
          />
        </Form.Item>
        <Form.Item label="下一步关注重点" name="nextFocus">
          <Input.TextArea
            v-model:value="formModel.nextFocus"
            :rows="2"
            placeholder="请输入下一步关注重点"
          />
        </Form.Item>
        <Form.Item label="问题描述" name="problemDescription">
          <Input.TextArea
            v-model:value="formModel.problemDescription"
            :rows="2"
            placeholder="请输入问题描述"
          />
        </Form.Item>
        <Form.Item label="解决方案" name="solution">
          <Input.TextArea
            v-model:value="formModel.solution"
            :rows="2"
            placeholder="请输入解决方案"
          />
        </Form.Item>
        <Form.Item label="跟进计划" name="followUpPlan">
          <Input.TextArea
            v-model:value="formModel.followUpPlan"
            :rows="2"
            placeholder="请输入跟进计划"
          />
        </Form.Item>
        <Form.Item label="客户反馈" name="customerFeedback">
          <Input.TextArea
            v-model:value="formModel.customerFeedback"
            :rows="2"
            placeholder="请输入客户反馈"
          />
        </Form.Item>
        <Form.Item label="附件" name="attachments">
          <Input
            v-model:value="formModel.attachments"
            placeholder="请输入附件"
          />
        </Form.Item>
        <Form.Item label="备注" name="remark">
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


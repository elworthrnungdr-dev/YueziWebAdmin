<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import {
  getCustomerFeedbackListApi,
  createCustomerFeedbackApi,
  getCustomerFeedbackDetailApi,
  updateCustomerFeedbackApi,
  deleteCustomerFeedbackApi,
  respondCustomerFeedbackApi,
  type CustomerFeedbackItem,
  type CustomerFeedbackListParams,
  type CreateCustomerFeedbackParams,
  type UpdateCustomerFeedbackParams,
  type RespondCustomerFeedbackParams,
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
const dataSource = ref<CustomerFeedbackItem[]>([]);
const total = ref(0);

const queryForm = ref<CustomerFeedbackListParams>({
  CustomerId: undefined,
  FeedbackTimeStart: undefined,
  FeedbackTimeEnd: undefined,
  ResponseTimeStart: undefined,
  ResponseTimeEnd: undefined,
  FeedbackType: undefined,
  FeedbackCategory: undefined,
  FeedbackChannel: undefined,
  ResponseStatus: undefined,
  IsResolved: undefined,
  PageIndex: 1,
  PageSize: 10,
  OrderBy: undefined,
  IsAsc: true,
});

const feedbackTypeOptions = [
  { label: '服务评价', value: 1 },
  { label: '投诉建议', value: 2 },
  { label: '意见反馈', value: 3 },
  { label: '表扬信', value: 4 },
  { label: '其他反馈', value: 5 },
];

const feedbackCategoryOptions = [
  { label: '餐饮', value: 1 },
  { label: '护理', value: 2 },
  { label: '环境', value: 3 },
  { label: '设施', value: 4 },
  { label: '员工', value: 5 },
  { label: '其他', value: 99 },
];

const ratingScoreOptions = [
  { label: '1分', value: 1 },
  { label: '2分', value: 2 },
  { label: '3分', value: 3 },
  { label: '4分', value: 4 },
  { label: '5分', value: 5 },
];

const feedbackChannelOptions = [
  { label: '前台', value: 1 },
  { label: '电话', value: 2 },
  { label: '微信', value: 3 },
  { label: '问卷', value: 4 },
  { label: 'APP', value: 5 },
  { label: '其他', value: 99 },
];

const responseStatusOptions = [
  { label: '待处理', value: 1 },
  { label: '处理中', value: 2 },
  { label: '已回复', value: 3 },
  { label: '已关闭', value: 4 },
];

const isAnonymousOptions = [
  { label: '是', value: 1 },
  { label: '否', value: 2 },
];

const contactPermissionOptions = [
  { label: '是', value: 1 },
  { label: '否', value: 2 },
];

const isResolvedOptions = [
  { label: '是', value: 1 },
  { label: '否', value: 2 },
];

const columns = [
  {
    title: '反馈类型',
    dataIndex: 'feedbackTypeText',
    key: 'feedbackTypeText',
    width: 120,
  },
  {
    title: '反馈分类',
    dataIndex: 'feedbackCategoryText',
    key: 'feedbackCategoryText',
    width: 100,
  },
  {
    title: '反馈内容',
    dataIndex: 'feedbackContent',
    key: 'feedbackContent',
    width: 200,
    ellipsis: true,
  },
  {
    title: '评分',
    dataIndex: 'ratingScoreText',
    key: 'ratingScoreText',
    width: 80,
  },
  {
    title: '反馈渠道',
    dataIndex: 'feedbackChannelText',
    key: 'feedbackChannelText',
    width: 100,
  },
  {
    title: '反馈时间',
    dataIndex: 'feedbackTime',
    key: 'feedbackTime',
    width: 170,
  },
  {
    title: '处理状态',
    dataIndex: 'responseStatusText',
    key: 'responseStatusText',
    width: 100,
  },
  {
    title: '是否匿名',
    dataIndex: 'isAnonymousText',
    key: 'isAnonymousText',
    width: 100,
  },
  {
    title: '是否允许联系',
    dataIndex: 'contactPermissionText',
    key: 'contactPermissionText',
    width: 120,
  },
  {
    title: '是否已解决',
    dataIndex: 'isResolvedText',
    key: 'isResolvedText',
    width: 100,
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
    width: 220,
    fixed: 'right',
    align: 'center',
  },
];

async function fetchList() {
  try {
    loading.value = true;
    const params: CustomerFeedbackListParams = {
      ...queryForm.value,
      FeedbackTimeStart: queryForm.value.FeedbackTimeStart
        ? dayjs(queryForm.value.FeedbackTimeStart).toISOString()
        : undefined,
      FeedbackTimeEnd: queryForm.value.FeedbackTimeEnd
        ? dayjs(queryForm.value.FeedbackTimeEnd).toISOString()
        : undefined,
      ResponseTimeStart: queryForm.value.ResponseTimeStart
        ? dayjs(queryForm.value.ResponseTimeStart).toISOString()
        : undefined,
      ResponseTimeEnd: queryForm.value.ResponseTimeEnd
        ? dayjs(queryForm.value.ResponseTimeEnd).toISOString()
        : undefined,
    };
    const res = await getCustomerFeedbackListApi(params);
    dataSource.value = res.items;
    total.value = res.total;
  } finally {
    loading.value = false;
  }
}

function handleReset() {
  queryForm.value = {
    CustomerId: undefined,
    FeedbackTimeStart: undefined,
    FeedbackTimeEnd: undefined,
    ResponseTimeStart: undefined,
    ResponseTimeEnd: undefined,
    FeedbackType: undefined,
    FeedbackCategory: undefined,
    FeedbackChannel: undefined,
    ResponseStatus: undefined,
    IsResolved: undefined,
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

const formModel = ref<CreateCustomerFeedbackParams>({
  customerId: '',
  feedbackType: 1,
  feedbackCategory: 1,
  feedbackContent: '',
  ratingScore: undefined,
  ratingDimensions: '',
  feedbackChannel: 1,
  feedbackTime: '',
  respondentId: '',
  isAnonymous: 2,
  contactPermission: 1,
  attachmentUrls: '',
  remark: '',
});

const formRules = {
  customerId: [{ required: true, message: '请输入客户ID' }],
  feedbackType: [{ required: true, message: '请选择反馈类型' }],
  feedbackCategory: [{ required: true, message: '请选择反馈分类' }],
  feedbackContent: [{ required: true, message: '请输入反馈内容' }],
  feedbackChannel: [{ required: true, message: '请选择反馈渠道' }],
  feedbackTime: [{ required: true, message: '请选择反馈时间' }],
  isAnonymous: [{ required: true, message: '请选择是否匿名' }],
  contactPermission: [{ required: true, message: '请选择是否允许联系' }],
};

function openCreateModal() {
  isEditMode.value = false;
  editingId.value = '';
  formModel.value = {
    customerId: '',
    feedbackType: 1,
    feedbackCategory: 1,
    feedbackContent: '',
    ratingScore: undefined,
    ratingDimensions: '',
    feedbackChannel: 1,
    feedbackTime: '',
    respondentId: '',
    isAnonymous: 2,
    contactPermission: 1,
    attachmentUrls: '',
    remark: '',
  };
  createModalVisible.value = true;
}

async function openEditModal(record: CustomerFeedbackItem) {
  isEditMode.value = true;
  editingId.value = record.id;
  try {
    const detail = await getCustomerFeedbackDetailApi(record.id);
    formModel.value = {
      customerId: detail.customerId || '',
      feedbackType: detail.feedbackType,
      feedbackCategory: detail.feedbackCategory,
      feedbackContent: detail.feedbackContent || '',
      ratingScore: detail.ratingScore,
      ratingDimensions: detail.ratingDimensions || '',
      feedbackChannel: detail.feedbackChannel,
      feedbackTime: detail.feedbackTime
        ? (dayjs(detail.feedbackTime) as any)
        : '',
      respondentId: detail.respondentId || '',
      isAnonymous: detail.isAnonymous,
      contactPermission: detail.contactPermission,
      attachmentUrls: detail.attachmentUrls || '',
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
    const params: CreateCustomerFeedbackParams = {
      ...formModel.value,
      feedbackTime: formModel.value.feedbackTime
        ? dayjs(formModel.value.feedbackTime as any).toISOString()
        : '',
    };

    if (isEditMode.value) {
      await updateCustomerFeedbackApi({
        ...params,
        id: editingId.value,
      } as UpdateCustomerFeedbackParams);
      message.success('更新客户反馈成功');
    } else {
      await createCustomerFeedbackApi(params);
      message.success('提交客户反馈成功');
    }
    closeCreateModal();
    fetchList();
  } catch {
    // 由全局拦截器处理错误
  } finally {
    submitting.value = false;
  }
}

function handleDelete(record: CustomerFeedbackItem) {
  Modal.confirm({
    title: '确认删除',
    content: h('div', { style: { fontSize: '14px', lineHeight: '1.6' } }, [
      h('p', {
        style: { marginBottom: '8px', color: '#ff4d4f', fontWeight: 500 },
      }, '⚠️ 警告'),
      h('p', { style: { margin: 0 } }, '确定要删除该客户反馈吗？'),
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
        await deleteCustomerFeedbackApi(record.id);
        message.success('删除客户反馈成功');
        fetchList();
      } catch {
        throw new Error();
      } finally {
        loading.value = false;
      }
    },
  });
}

// 处理/回复弹窗
const respondModalVisible = ref(false);
const respondSubmitting = ref(false);
const respondFormRef = ref<FormInstance | null>(null);

const respondFormModel = ref<RespondCustomerFeedbackParams>({
  id: '',
  responseStatus: 1,
  responseContent: '',
  responderId: '',
  responseTime: undefined,
  followUpPlan: '',
  customerSatisfaction: undefined,
  isResolved: undefined,
  resolutionDate: undefined,
});

const respondFormRules = {
  responseStatus: [{ required: true, message: '请选择处理状态' }],
};

const customerSatisfactionOptions = [
  { label: '非常满意', value: 1 },
  { label: '满意', value: 2 },
  { label: '一般', value: 3 },
  { label: '不满意', value: 4 },
  { label: '非常不满意', value: 5 },
];

function openRespondModal(record: CustomerFeedbackItem) {
  respondFormModel.value = {
    id: record.id,
    responseStatus: record.responseStatus || 1,
    responseContent: record.responseContent || '',
    responderId: record.responderId || '',
    responseTime: record.responseTime ? (dayjs(record.responseTime) as any) : undefined,
    followUpPlan: record.followUpPlan || '',
    customerSatisfaction: record.customerSatisfaction,
    isResolved: record.isResolved,
    resolutionDate: record.resolutionDate ? (dayjs(record.resolutionDate) as any) : undefined,
  };
  respondModalVisible.value = true;
}

function closeRespondModal() {
  respondModalVisible.value = false;
  respondFormRef.value?.resetFields();
}

async function handleRespondSubmit() {
  try {
    await respondFormRef.value?.validate();
    respondSubmitting.value = true;
    const params: RespondCustomerFeedbackParams = {
      id: respondFormModel.value.id,
      responseStatus: respondFormModel.value.responseStatus,
      responseContent: respondFormModel.value.responseContent || undefined,
      responderId: respondFormModel.value.responderId || undefined,
      responseTime: respondFormModel.value.responseTime
        ? dayjs(respondFormModel.value.responseTime as any).toISOString()
        : undefined,
      followUpPlan: respondFormModel.value.followUpPlan || undefined,
      customerSatisfaction: respondFormModel.value.customerSatisfaction,
      isResolved: respondFormModel.value.isResolved,
      resolutionDate: respondFormModel.value.resolutionDate
        ? dayjs(respondFormModel.value.resolutionDate as any).toISOString()
        : undefined,
    };
    await respondCustomerFeedbackApi(params);
    message.success('处理/回复成功');
    closeRespondModal();
    fetchList();
  } catch {
    // 由全局拦截器处理错误
  } finally {
    respondSubmitting.value = false;
  }
}
</script>

<template>
  <div class="p-4">
    <!-- 创建按钮 -->
    <div class="mb-4">
      <Button type="primary" class="cursor-pointer" @click="openCreateModal">
        提交客户反馈
      </Button>
    </div>

    <!-- 搜索表单 -->
    <div class="mb-4">
      <Space wrap>
        <Input
          v-model:value="queryForm.CustomerId"
          placeholder="客户ID"
          style="width: 140px"
          allow-clear
        />
        <Select
          v-model:value="queryForm.FeedbackType"
          :options="feedbackTypeOptions"
          placeholder="反馈类型"
          style="width: 130px"
          allow-clear
        />
        <Select
          v-model:value="queryForm.FeedbackCategory"
          :options="feedbackCategoryOptions"
          placeholder="反馈分类"
          style="width: 120px"
          allow-clear
        />
        <Select
          v-model:value="queryForm.FeedbackChannel"
          :options="feedbackChannelOptions"
          placeholder="反馈渠道"
          style="width: 120px"
          allow-clear
        />
        <Select
          v-model:value="queryForm.ResponseStatus"
          :options="responseStatusOptions"
          placeholder="处理状态"
          style="width: 120px"
          allow-clear
        />
        <Select
          v-model:value="queryForm.IsResolved"
          :options="isResolvedOptions"
          placeholder="是否已解决"
          style="width: 130px"
          allow-clear
        />
        <DatePicker
          v-model:value="queryForm.FeedbackTimeStart"
          placeholder="反馈时间开始"
          style="width: 150px"
        />
        <DatePicker
          v-model:value="queryForm.FeedbackTimeEnd"
          placeholder="反馈时间结束"
          style="width: 150px"
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
      :scroll="{ x: 1900 }"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'feedbackTime'">
          <span v-if="record.feedbackTime">
            {{ dayjs(record.feedbackTime).format('YYYY-MM-DD HH:mm:ss') }}
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
                @click="openRespondModal(record)"
              >
                处理/回复
              </Button>
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

    <!-- 创建 / 编辑客户反馈弹窗 -->
    <Modal
      v-model:open="createModalVisible"
      :title="isEditMode ? '更新客户反馈' : '提交客户反馈'"
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
          <Form.Item label="客户ID" name="customerId">
            <Input
              v-model:value="formModel.customerId"
              placeholder="请输入客户ID"
            />
          </Form.Item>
          <Form.Item label="反馈类型" name="feedbackType">
            <Select
              v-model:value="formModel.feedbackType"
              :options="feedbackTypeOptions"
              placeholder="请选择反馈类型"
            />
          </Form.Item>
          <Form.Item label="反馈分类" name="feedbackCategory">
            <Select
              v-model:value="formModel.feedbackCategory"
              :options="feedbackCategoryOptions"
              placeholder="请选择反馈分类"
            />
          </Form.Item>
          <Form.Item label="反馈渠道" name="feedbackChannel">
            <Select
              v-model:value="formModel.feedbackChannel"
              :options="feedbackChannelOptions"
              placeholder="请选择反馈渠道"
            />
          </Form.Item>
          <Form.Item label="反馈时间" name="feedbackTime">
            <DatePicker
              v-model:value="formModel.feedbackTime"
              show-time
              style="width: 100%"
              placeholder="请选择反馈时间"
            />
          </Form.Item>
          <Form.Item label="评分(1-5分)" name="ratingScore">
            <Select
              v-model:value="formModel.ratingScore"
              :options="ratingScoreOptions"
              placeholder="请选择评分"
              allow-clear
            />
          </Form.Item>
          <Form.Item label="是否匿名" name="isAnonymous">
            <Select
              v-model:value="formModel.isAnonymous"
              :options="isAnonymousOptions"
              placeholder="请选择是否匿名"
            />
          </Form.Item>
          <Form.Item label="是否允许联系" name="contactPermission">
            <Select
              v-model:value="formModel.contactPermission"
              :options="contactPermissionOptions"
              placeholder="请选择是否允许联系"
            />
          </Form.Item>
          <Form.Item label="响应人ID" name="respondentId">
            <Input
              v-model:value="formModel.respondentId"
              placeholder="请输入响应人ID"
            />
          </Form.Item>
        </div>
        <Form.Item label="反馈内容" name="feedbackContent">
          <Input.TextArea
            v-model:value="formModel.feedbackContent"
            :rows="3"
            placeholder="请输入反馈内容"
          />
        </Form.Item>
        <Form.Item label="评分维度" name="ratingDimensions">
          <Input.TextArea
            v-model:value="formModel.ratingDimensions"
            :rows="2"
            placeholder="请输入评分维度"
          />
        </Form.Item>
        <Form.Item label="附件链接" name="attachmentUrls">
          <Input.TextArea
            v-model:value="formModel.attachmentUrls"
            :rows="2"
            placeholder="请输入附件链接"
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

    <!-- 处理/回复弹窗 -->
    <Modal
      v-model:open="respondModalVisible"
      title="处理/回复"
      width="700px"
      :confirm-loading="respondSubmitting"
      @ok="handleRespondSubmit"
      @cancel="closeRespondModal"
      destroy-on-close
    >
      <Form
        ref="respondFormRef"
        :model="respondFormModel"
        :rules="respondFormRules"
        layout="vertical"
      >
        <div class="grid grid-cols-2 gap-4">
          <Form.Item label="处理状态" name="responseStatus">
            <Select
              v-model:value="respondFormModel.responseStatus"
              :options="responseStatusOptions"
              placeholder="请选择处理状态"
            />
          </Form.Item>
          <Form.Item label="回复人ID" name="responderId">
            <Input
              v-model:value="respondFormModel.responderId"
              placeholder="请输入回复人ID"
            />
          </Form.Item>
          <Form.Item label="回复时间" name="responseTime">
            <DatePicker
              v-model:value="respondFormModel.responseTime"
              show-time
              style="width: 100%"
              placeholder="请选择回复时间"
            />
          </Form.Item>
          <Form.Item label="客户满意度" name="customerSatisfaction">
            <Select
              v-model:value="respondFormModel.customerSatisfaction"
              :options="customerSatisfactionOptions"
              placeholder="请选择客户满意度"
              allow-clear
            />
          </Form.Item>
          <Form.Item label="是否已解决" name="isResolved">
            <Select
              v-model:value="respondFormModel.isResolved"
              :options="isResolvedOptions"
              placeholder="请选择是否已解决"
              allow-clear
            />
          </Form.Item>
          <Form.Item label="解决日期" name="resolutionDate">
            <DatePicker
              v-model:value="respondFormModel.resolutionDate"
              style="width: 100%"
              placeholder="请选择解决日期"
            />
          </Form.Item>
        </div>
        <Form.Item label="回复内容" name="responseContent">
          <Input.TextArea
            v-model:value="respondFormModel.responseContent"
            :rows="3"
            placeholder="请输入回复内容"
          />
        </Form.Item>
        <Form.Item label="后续跟进计划" name="followUpPlan">
          <Input.TextArea
            v-model:value="respondFormModel.followUpPlan"
            :rows="2"
            placeholder="请输入后续跟进计划"
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

<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import {
  getContractListApi,
  createContractApi,
  getContractDetailApi,
  updateContractApi,
  deleteContractApi,
  type ContractItem,
  type ContractListParams,
  type CreateContractParams,
  type UpdateContractParams,
} from '#/api';

import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Select,
  Space,
  Table,
} from 'ant-design-vue';
import type { FormInstance } from 'ant-design-vue';
import dayjs, { type Dayjs } from 'dayjs';
import { h } from 'vue';

// 服务模式选项
const serviceModeOptions = [
  { label: '集中托管', value: 1 },
  { label: '1+N对1', value: 2 },
];

// 产妇病史选项
const maternalHistoryOptions = [
  { label: '无', value: 1 },
  { label: '有', value: 2 },
];

// 宝宝病史选项
const babyHistoryOptions = [
  { label: '无', value: 1 },
  { label: '有', value: 2 },
];

// 胎儿类型选项
const fetusTypeOptions = [
  { label: '单胎', value: 1 },
  { label: '双胎', value: 2 },
  { label: '多胎', value: 3 },
];

// 分娩方式选项
const deliveryMethodOptions = [
  { label: '顺产', value: 1 },
  { label: '剖宫产', value: 2 },
];

const loading = ref(false);
const dataSource = ref<ContractItem[]>([]);
const total = ref(0);

const queryForm = ref<ContractListParams>({
  Tcustomerid: undefined,
  Customername: undefined,
  ContractNumber: undefined,
  Idnumber: undefined,
  CreatedAtStart: undefined,
  CreatedAtEnd: undefined,
  PageIndex: 1,
  PageSize: 10,
  OrderBy: undefined,
  IsAsc: true,
});

const dateRange = ref<[Dayjs | null, Dayjs | null]>([null, null]);

const columns = [
  {
    title: '合同编号',
    dataIndex: 'contractnumber',
    key: 'contractnumber',
    width: 150,
  },
  {
    title: '客户姓名',
    dataIndex: 'customername',
    key: 'customername',
    width: 150,
  },
  {
    title: '身份证号',
    dataIndex: 'idnumber',
    key: 'idnumber',
    width: 180,
  },
  {
    title: '联系电话',
    dataIndex: 'phonenumber',
    key: 'phonenumber',
    width: 150,
  },
  {
    title: '产检医院',
    dataIndex: 'inspectionhospital',
    key: 'inspectionhospital',
    width: 150,
  },
  {
    title: '预计入住时间',
    dataIndex: 'expectedcheckintime',
    key: 'expectedcheckintime',
    width: 180,
  },
  {
    title: '套餐天数',
    dataIndex: 'packagedays',
    key: 'packagedays',
    width: 100,
  },
  {
    title: '房型',
    dataIndex: 'roomtype',
    key: 'roomtype',
    width: 120,
  },
  {
    title: '原价',
    dataIndex: 'originalprice',
    key: 'originalprice',
    width: 100,
  },
  {
    title: '优惠价',
    dataIndex: 'discountedprice',
    key: 'discountedprice',
    width: 100,
  },
  {
    title: '押金金额',
    dataIndex: 'depositamount',
    key: 'depositamount',
    width: 100,
  },
  {
    title: '未付金额',
    dataIndex: 'unpaidamount',
    key: 'unpaidamount',
    width: 100,
  },
  {
    title: '创建时间',
    dataIndex: 'createdat',
    key: 'createdat',
    width: 160,
  },
  {
    title: '操作',
    key: 'actions',
    width: 120,
    fixed: 'right',
    align: 'center',
  },
];

async function fetchList() {
  loading.value = true;
  try {
    // 处理日期范围
    const params: ContractListParams = {
      ...queryForm.value,
    };
    if (dateRange.value[0]) {
      params.CreatedAtStart = dateRange.value[0].format('YYYY-MM-DD');
    }
    if (dateRange.value[1]) {
      params.CreatedAtEnd = dateRange.value[1].format('YYYY-MM-DD');
    }

    const { items, total: t } = await getContractListApi(params);
    dataSource.value = items;
    total.value = t;
  } catch (error: any) {
    const errMsg =
      error?.response?.data?.message || error?.message || '获取合同列表失败';
    message.error(errMsg);
  } finally {
    loading.value = false;
  }
}

function handleReset() {
  queryForm.value.Tcustomerid = undefined;
  queryForm.value.Customername = undefined;
  queryForm.value.ContractNumber = undefined;
  queryForm.value.Idnumber = undefined;
  queryForm.value.CreatedAtStart = undefined;
  queryForm.value.CreatedAtEnd = undefined;
  queryForm.value.PageIndex = 1;
  queryForm.value.PageSize = 10;
  queryForm.value.OrderBy = undefined;
  queryForm.value.IsAsc = true;
  dateRange.value = [null, null];
  fetchList();
}

function handleTableChange(pagination: any) {
  queryForm.value.PageIndex = pagination.current;
  queryForm.value.PageSize = pagination.pageSize;
  fetchList();
}

// 创建/编辑合同弹窗相关
const createModalVisible = ref(false);
const submitting = ref(false);
const isEditMode = ref(false);
const editingContractId = ref<string>('');
const formRef = ref<FormInstance>();
const formModel = ref<CreateContractParams>({
  tcustomerid: '',
  expectedcheckintime: undefined,
  packagedays: undefined,
  roomId: '',
  servicemode: undefined,
  maternalhistory: undefined,
  maternalhistorydesc: '',
  babyhistory: undefined,
  babyhistorydesc: '',
  fetustype: undefined,
  deliverydate: undefined,
  deliverymethod: undefined,
  pregnancycount: undefined,
  paritycount: undefined,
  weight: undefined,
  discountedprice: undefined,
  depositamount: undefined,
  unpaidamount: undefined,
  standardterms: '',
  additionalterms: '',
  staytimes: undefined,
  remark: '',
});

const formRules = {
  tcustomerid: [{ required: true, message: '请输入客户ID' }],
  expectedcheckintime: [{ required: true, message: '请选择预计入住时间' }],
  packagedays: [{ required: true, message: '请输入套餐天数' }],
  roomId: [{ required: true, message: '请输入房间ID' }],
  servicemode: [{ required: true, message: '请选择服务模式' }],
  discountedprice: [{ required: true, message: '请输入优惠价' }],
  staytimes: [{ required: true, message: '请输入入住次数' }],
};

function resetForm() {
  formModel.value = {
    tcustomerid: '',
    expectedcheckintime: undefined,
    packagedays: undefined,
    roomId: '',
    servicemode: undefined,
    maternalhistory: undefined,
    maternalhistorydesc: '',
    babyhistory: undefined,
    babyhistorydesc: '',
    fetustype: undefined,
    deliverydate: undefined,
    deliverymethod: undefined,
    pregnancycount: undefined,
    paritycount: undefined,
    weight: undefined,
    discountedprice: undefined,
    depositamount: undefined,
    unpaidamount: undefined,
    standardterms: '',
    additionalterms: '',
    staytimes: undefined,
    remark: '',
  };
  formRef.value?.resetFields();
}

function openCreateModal() {
  isEditMode.value = false;
  editingContractId.value = '';
  createModalVisible.value = true;
  resetForm();
}

async function openEditModal(record: ContractItem) {
  isEditMode.value = true;
  editingContractId.value = record.id;
  createModalVisible.value = true;
  resetForm();

  try {
    const detail = await getContractDetailApi(record.id);
    // 填充表单数据
    formModel.value = {
      tcustomerid: detail.tcustomerid || '',
      expectedcheckintime: detail.expectedcheckintime
        ? dayjs(detail.expectedcheckintime)
        : undefined,
      packagedays: detail.packagedays,
      roomId: detail.roomtype || '',
      servicemode: detail.servicemode,
      maternalhistory: detail.maternalhistory,
      maternalhistorydesc: detail.maternalhistorydesc || '',
      babyhistory: detail.babyhistory,
      babyhistorydesc: detail.babyhistorydesc || '',
      fetustype: detail.fetustype,
      deliverydate: detail.deliverydate ? dayjs(detail.deliverydate) : undefined,
      deliverymethod: detail.deliverymethod,
      pregnancycount: detail.pregnancycount,
      paritycount: detail.paritycount,
      weight: detail.weight,
      discountedprice: detail.discountedprice,
      depositamount: detail.depositamount,
      unpaidamount: detail.unpaidamount,
      standardterms: detail.standardterms || '',
      additionalterms: detail.additionalterms || '',
      staytimes: detail.staytimes,
      remark: detail.remark || '',
    };
  } catch (error: any) {
    const errMsg =
      error?.response?.data?.message ||
      error?.data?.message ||
      error?.message ||
      '获取合同详情失败';
    message.error(errMsg);
    createModalVisible.value = false;
  }
}

function closeCreateModal() {
  createModalVisible.value = false;
  isEditMode.value = false;
  editingContractId.value = '';
  resetForm();
}

async function handleSubmit() {
  try {
    const values = await formRef.value?.validate();
    if (!values) return;
    submitting.value = true;

    // 处理日期字段 - DatePicker 返回的是 dayjs 对象
    const baseData = {
      ...values,
      expectedcheckintime: values.expectedcheckintime
        ? (values.expectedcheckintime as Dayjs).toISOString()
        : undefined,
      deliverydate: values.deliverydate
        ? (values.deliverydate as Dayjs).toISOString()
        : undefined,
    };

    if (isEditMode.value) {
      // 更新合同
      const updateData: UpdateContractParams = {
        ...baseData,
        id: editingContractId.value,
      };
      await updateContractApi(updateData);
      message.success('更新合同成功');
    } else {
      // 创建合同
      await createContractApi(baseData);
      message.success('创建合同成功');
    }
    closeCreateModal();
    fetchList();
  } catch (error: any) {
    // 表单验证错误，不处理
    if (error?.errorFields) {
      return;
    }
    // 提取错误消息，优先使用 response.data.message，然后是 data.message，最后是 error.message
    const errMsg =
      error?.response?.data?.message ||
      error?.data?.message ||
      error?.message ||
      (isEditMode.value ? '更新合同失败' : '创建合同失败');
    message.error(errMsg);
    // 阻止错误继续传播到控制台
    return;
  } finally {
    submitting.value = false;
  }
}

function handleDelete(record: ContractItem) {
  Modal.confirm({
    title: '确认删除',
    content: h('div', { style: { fontSize: '14px', lineHeight: '1.6' } }, [
      h('p', {
        style: { marginBottom: '8px', color: '#ff4d4f', fontWeight: 500 },
      }, '⚠️ 警告'),
      h('p', { style: { margin: 0 } }, '确定要删除该合同吗？'),
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
        await deleteContractApi(record.id);
        message.success('删除合同成功');
        fetchList();
      } catch (error: any) {
        const errMsg =
          error?.response?.data?.message ||
          error?.data?.message ||
          error?.message ||
          '删除合同失败';
        message.error(errMsg);
        throw error;
      } finally {
        loading.value = false;
      }
    },
  });
}

onMounted(fetchList);
</script>

<template>
  <div class="p-4">
    <div class="mb-3 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <Button
          type="primary"
          class="cursor-pointer"
          @click="openCreateModal"
        >
          创建合同
        </Button>
      </div>
      <Space>
        <Input
          v-model:value="queryForm.Tcustomerid"
          allow-clear
          placeholder="客户ID"
          style="width: 150px"
        />
        <Input
          v-model:value="queryForm.Customername"
          allow-clear
          placeholder="客户姓名"
          style="width: 150px"
        />
        <Input
          v-model:value="queryForm.ContractNumber"
          allow-clear
          placeholder="合同编号"
          style="width: 150px"
        />
        <Input
          v-model:value="queryForm.Idnumber"
          allow-clear
          placeholder="身份证号"
          style="width: 180px"
        />
        <DatePicker.RangePicker
          v-model:value="dateRange"
          format="YYYY-MM-DD"
          :placeholder="['创建开始时间', '创建结束时间']"
          style="width: 240px"
        />
        <Button type="primary" class="cursor-pointer" @click="fetchList">
          查询
        </Button>
        <Button class="cursor-pointer" @click="handleReset">重置</Button>
      </Space>
    </div>

    <Table
      class="list-table"
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
        <template v-if="column.key === 'expectedcheckintime'">
          <span v-if="record.expectedcheckintime">
            {{ new Date(record.expectedcheckintime).toLocaleString('zh-CN') }}
          </span>
          <span v-else>—</span>
        </template>
        <template v-else-if="column.key === 'originalprice'">
          <span v-if="record.originalprice !== null && record.originalprice !== undefined">
            ¥{{ record.originalprice.toLocaleString() }}
          </span>
          <span v-else>—</span>
        </template>
        <template v-else-if="column.key === 'discountedprice'">
          <span v-if="record.discountedprice !== null && record.discountedprice !== undefined">
            ¥{{ record.discountedprice.toLocaleString() }}
          </span>
          <span v-else>—</span>
        </template>
        <template v-else-if="column.key === 'depositamount'">
          <span v-if="record.depositamount !== null && record.depositamount !== undefined">
            ¥{{ record.depositamount.toLocaleString() }}
          </span>
          <span v-else>—</span>
        </template>
        <template v-else-if="column.key === 'unpaidamount'">
          <span v-if="record.unpaidamount !== null && record.unpaidamount !== undefined">
            ¥{{ record.unpaidamount.toLocaleString() }}
          </span>
          <span v-else>—</span>
        </template>
        <template v-else-if="column.key === 'createdat'">
          <span v-if="record.createdat">
            {{ new Date(record.createdat).toLocaleString('zh-CN') }}
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

    <!-- 创建/编辑合同弹窗 -->
    <Modal
      v-model:open="createModalVisible"
      :title="isEditMode ? '更新合同' : '创建合同'"
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
            <Form.Item label="客户ID" name="tcustomerid">
              <Input
                v-model:value="formModel.tcustomerid"
                placeholder="请输入客户ID"
                allow-clear
              />
            </Form.Item>

            <Form.Item label="预计入住时间" name="expectedcheckintime">
              <DatePicker
                v-model:value="formModel.expectedcheckintime"
                show-time
                format="YYYY-MM-DD HH:mm:ss"
                placeholder="请选择预计入住时间"
                style="width: 100%"
              />
            </Form.Item>

            <Form.Item label="套餐天数" name="packagedays">
              <InputNumber
                v-model:value="formModel.packagedays"
                placeholder="请输入套餐天数"
                :min="0"
                style="width: 100%"
              />
            </Form.Item>

            <Form.Item label="房间ID" name="roomId">
              <Input
                v-model:value="formModel.roomId"
                placeholder="请输入房间ID"
                allow-clear
              />
            </Form.Item>

            <Form.Item label="服务模式" name="servicemode">
              <Select
                v-model:value="formModel.servicemode"
                :options="serviceModeOptions"
                placeholder="请选择服务模式"
                style="width: 100%"
              />
            </Form.Item>

            <Form.Item label="产妇病史" name="maternalhistory">
              <Select
                v-model:value="formModel.maternalhistory"
                :options="maternalHistoryOptions"
                placeholder="请选择产妇病史"
                style="width: 100%"
                allow-clear
              />
            </Form.Item>

            <Form.Item label="产妇病史描述" name="maternalhistorydesc">
              <Input.TextArea
                v-model:value="formModel.maternalhistorydesc"
                :rows="2"
                placeholder="请输入产妇病史描述"
                allow-clear
              />
            </Form.Item>

            <Form.Item label="宝宝病史" name="babyhistory">
              <Select
                v-model:value="formModel.babyhistory"
                :options="babyHistoryOptions"
                placeholder="请选择宝宝病史"
                style="width: 100%"
                allow-clear
              />
            </Form.Item>

            <Form.Item label="宝宝病史描述" name="babyhistorydesc">
              <Input.TextArea
                v-model:value="formModel.babyhistorydesc"
                :rows="2"
                placeholder="请输入宝宝病史描述"
                allow-clear
              />
            </Form.Item>

            <Form.Item label="胎儿类型" name="fetustype">
              <Select
                v-model:value="formModel.fetustype"
                :options="fetusTypeOptions"
                placeholder="请选择胎儿类型"
                style="width: 100%"
                allow-clear
              />
            </Form.Item>

            <Form.Item label="生产日期" name="deliverydate">
              <DatePicker
                v-model:value="formModel.deliverydate"
                format="YYYY-MM-DD"
                placeholder="请选择生产日期"
                style="width: 100%"
              />
            </Form.Item>

            <Form.Item label="分娩方式" name="deliverymethod">
              <Select
                v-model:value="formModel.deliverymethod"
                :options="deliveryMethodOptions"
                placeholder="请选择分娩方式"
                style="width: 100%"
                allow-clear
              />
            </Form.Item>

            <Form.Item label="怀孕次数" name="pregnancycount">
              <InputNumber
                v-model:value="formModel.pregnancycount"
                placeholder="请输入怀孕次数"
                :min="0"
                style="width: 100%"
              />
            </Form.Item>

            <Form.Item label="生产次数" name="paritycount">
              <InputNumber
                v-model:value="formModel.paritycount"
                placeholder="请输入生产次数"
                :min="0"
                style="width: 100%"
              />
            </Form.Item>

            <Form.Item label="体重" name="weight">
              <InputNumber
                v-model:value="formModel.weight"
                placeholder="请输入体重"
                :min="0"
                style="width: 100%"
              />
            </Form.Item>
          </div>

          <!-- 第二列 -->
          <div>
            <Form.Item label="优惠价" name="discountedprice">
              <InputNumber
                v-model:value="formModel.discountedprice"
                placeholder="请输入优惠价"
                :min="0"
                :precision="2"
                style="width: 100%"
              />
            </Form.Item>

            <Form.Item label="押金金额" name="depositamount">
              <InputNumber
                v-model:value="formModel.depositamount"
                placeholder="请输入押金金额"
                :min="0"
                :precision="2"
                style="width: 100%"
              />
            </Form.Item>

            <Form.Item label="未付金额" name="unpaidamount">
              <InputNumber
                v-model:value="formModel.unpaidamount"
                placeholder="请输入未付金额"
                :min="0"
                :precision="2"
                style="width: 100%"
              />
            </Form.Item>

            <Form.Item label="标准条款" name="standardterms">
              <Input.TextArea
                v-model:value="formModel.standardterms"
                :rows="4"
                placeholder="请输入标准条款"
                allow-clear
              />
            </Form.Item>

            <Form.Item label="补充条款" name="additionalterms">
              <Input.TextArea
                v-model:value="formModel.additionalterms"
                :rows="4"
                placeholder="请输入补充条款"
                allow-clear
              />
            </Form.Item>

            <Form.Item label="入住次数" name="staytimes">
              <InputNumber
                v-model:value="formModel.staytimes"
                placeholder="请输入入住次数"
                :min="0"
                style="width: 100%"
              />
            </Form.Item>

            <Form.Item label="备注" name="remark">
              <Input.TextArea
                v-model:value="formModel.remark"
                :rows="4"
                placeholder="请输入备注"
                allow-clear
              />
            </Form.Item>
          </div>
        </div>
      </Form>
    </Modal>
  </div>
</template>

<style scoped>
.list-table :deep(.ant-table-thead > tr > th) {
  white-space: nowrap;
}

.list-table :deep(.ant-table-body) {
  overflow-x: scroll;
}

/* 增加表单标签和输入框之间的间距 */
:deep(.ant-form-item-label) {
  padding-right: 16px !important;
}
</style>

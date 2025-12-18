<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import {
  getMaterialListApi,
  createMaterialApi,
  getMaterialDetailApi,
  updateMaterialApi,
  deleteMaterialApi,
  type MaterialItem,
  type MaterialListParams,
  type CreateMaterialParams,
  type UpdateMaterialParams,
} from '#/api';

import {
  Button,
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
import { h } from 'vue';

const loading = ref(false);
const dataSource = ref<MaterialItem[]>([]);
const total = ref(0);

const queryForm = ref<MaterialListParams>({
  MaterialCode: undefined,
  MaterialName: undefined,
  PageIndex: 1,
  PageSize: 10,
  OrderBy: undefined,
  IsAsc: true,
});

const statusOptions = [
  { label: '正常', value: 1 },
  { label: '锁定', value: 2 },
];

const perishableOptions = [
  { label: '否', value: 0 },
  { label: '是', value: 1 },
];

const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 200,
  },
  {
    title: '物资编码',
    dataIndex: 'materialCode',
    key: 'materialCode',
    width: 160,
  },
  {
    title: '物资名称',
    dataIndex: 'materialName',
    key: 'materialName',
    width: 160,
  },
  {
    title: '物资类别ID',
    dataIndex: 'categoryId',
    key: 'categoryId',
    width: 180,
  },
  {
    title: '规格型号',
    dataIndex: 'specification',
    key: 'specification',
    width: 160,
  },
  {
    title: '计量单位',
    dataIndex: 'unit',
    key: 'unit',
    width: 120,
  },
  {
    title: '最低库存',
    dataIndex: 'minStock',
    key: 'minStock',
    width: 120,
  },
  {
    title: '最高库存',
    dataIndex: 'maxStock',
    key: 'maxStock',
    width: 120,
  },
  {
    title: '当前库存',
    dataIndex: 'currentStock',
    key: 'currentStock',
    width: 120,
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 120,
  },
  {
    title: '采购单价',
    dataIndex: 'purchasePrice',
    key: 'purchasePrice',
    width: 120,
  },
  {
    title: '销售单价',
    dataIndex: 'salePrice',
    key: 'salePrice',
    width: 120,
  },
  {
    title: '成本单价',
    dataIndex: 'costPrice',
    key: 'costPrice',
    width: 120,
  },
  {
    title: '是否易耗品',
    dataIndex: 'isPerishable',
    key: 'isPerishable',
    width: 130,
  },
  {
    title: '使用场景',
    dataIndex: 'usageScenario',
    key: 'usageScenario',
    width: 180,
  },
  {
    title: '备注',
    dataIndex: 'remark',
    key: 'remark',
    width: 220,
    ellipsis: true,
  },
  {
    title: '操作',
    key: 'actions',
    width: 200,
    fixed: 'right',
    align: 'center',
  },
];

async function fetchList() {
  try {
    loading.value = true;
    const params: MaterialListParams = {
      ...queryForm.value,
    };
    const res = await getMaterialListApi(params);
    dataSource.value = res.items;
    total.value = res.total;
  } finally {
    loading.value = false;
  }
}

function handleReset() {
  queryForm.value = {
    MaterialCode: undefined,
    MaterialName: undefined,
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

const formModel = ref<CreateMaterialParams>({
  materialCode: '',
  materialName: '',
  categoryId: '',
  specification: '',
  unit: '',
  minStock: undefined,
  maxStock: undefined,
  currentStock: undefined,
  status: 1,
  purchasePrice: undefined,
  salePrice: undefined,
  costPrice: undefined,
  isPerishable: 0,
  usageScenario: '',
  remark: '',
});

const formRules = {
  materialCode: [{ required: true, message: '请输入物资编码' }],
  materialName: [{ required: true, message: '请输入物资名称' }],
  unit: [{ required: true, message: '请输入计量单位' }],
};

function openCreateModal() {
  isEditMode.value = false;
  editingId.value = '';
  formModel.value = {
    materialCode: '',
    materialName: '',
    categoryId: '',
    specification: '',
    unit: '',
    minStock: undefined,
    maxStock: undefined,
    currentStock: undefined,
    status: 1,
    purchasePrice: undefined,
    salePrice: undefined,
    costPrice: undefined,
    isPerishable: 0,
    usageScenario: '',
    remark: '',
  };
  createModalVisible.value = true;
}

async function openEditModal(record: MaterialItem) {
  isEditMode.value = true;
  editingId.value = record.id;
  try {
    const detail = await getMaterialDetailApi(record.id);
    formModel.value = {
      materialCode: detail.materialCode || '',
      materialName: detail.materialName || '',
      categoryId: detail.categoryId || '',
      specification: detail.specification || '',
      unit: detail.unit || '',
      minStock: detail.minStock,
      maxStock: detail.maxStock,
      currentStock: detail.currentStock,
      status: detail.status ?? 1,
      purchasePrice: detail.purchasePrice,
      salePrice: detail.salePrice,
      costPrice: detail.costPrice,
      isPerishable: detail.isPerishable ?? 0,
      usageScenario: detail.usageScenario || '',
      remark: detail.remark || '',
    };
    createModalVisible.value = true;
  } catch {
    // 错误由全局拦截器处理
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
    const params: CreateMaterialParams = {
      ...formModel.value,
    };

    if (isEditMode.value) {
      await updateMaterialApi({
        ...(params as CreateMaterialParams),
        id: editingId.value,
      } as UpdateMaterialParams);
      message.success('更新物资信息成功');
    } else {
      await createMaterialApi(params);
      message.success('创建物资信息成功');
    }
    closeCreateModal();
    fetchList();
  } finally {
    submitting.value = false;
  }
}

function formatStatus(status?: number) {
  if (status === 1) return '正常';
  if (status === 2) return '锁定';
  return '—';
}

function formatPerishable(value?: number) {
  if (value === 1) return '是';
  if (value === 0) return '否';
  return '—';
}

function handleDelete(record: MaterialItem) {
  Modal.confirm({
    title: '确认删除',
    content: h('div', { style: { fontSize: '14px', lineHeight: '1.6' } }, [
      h(
        'p',
        {
          style: { marginBottom: '8px', color: '#ff4d4f', fontWeight: 500 },
        },
        '⚠️ 警告',
      ),
      h('p', { style: { margin: 0 } }, '确定要删除该物资信息吗？'),
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
        await deleteMaterialApi(record.id);
        message.success('删除物资信息成功');
        fetchList();
      } finally {
        loading.value = false;
      }
    },
  });
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
        创建物资信息
      </Button>
      <Space wrap>
        <Input
          v-model:value="queryForm.MaterialCode"
          placeholder="物资编码"
          style="width: 180px"
          allow-clear
        />
        <Input
          v-model:value="queryForm.MaterialName"
          placeholder="物资名称"
          style="width: 180px"
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
      :scroll="{ x: 2000 }"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'categoryId'">
          <span>{{ record.categoryId || '—' }}</span>
        </template>
        <template v-else-if="column.key === 'specification'">
          <span>{{ record.specification || '—' }}</span>
        </template>
        <template v-else-if="column.key === 'minStock'">
          <span v-if="record.minStock !== null && record.minStock !== undefined">
            {{ record.minStock }}
          </span>
          <span v-else>—</span>
        </template>
        <template v-else-if="column.key === 'maxStock'">
          <span v-if="record.maxStock !== null && record.maxStock !== undefined">
            {{ record.maxStock }}
          </span>
          <span v-else>—</span>
        </template>
        <template v-else-if="column.key === 'currentStock'">
          <span
            v-if="record.currentStock !== null && record.currentStock !== undefined"
          >
            {{ record.currentStock }}
          </span>
          <span v-else>—</span>
        </template>
        <template v-else-if="column.key === 'status'">
          <span>{{ formatStatus(record.status) }}</span>
        </template>
        <template v-else-if="column.key === 'purchasePrice'">
          <span
            v-if="
              record.purchasePrice !== null && record.purchasePrice !== undefined
            "
          >
            {{ record.purchasePrice }}
          </span>
          <span v-else>—</span>
        </template>
        <template v-else-if="column.key === 'salePrice'">
          <span v-if="record.salePrice !== null && record.salePrice !== undefined">
            {{ record.salePrice }}
          </span>
          <span v-else>—</span>
        </template>
        <template v-else-if="column.key === 'costPrice'">
          <span v-if="record.costPrice !== null && record.costPrice !== undefined">
            {{ record.costPrice }}
          </span>
          <span v-else>—</span>
        </template>
        <template v-else-if="column.key === 'isPerishable'">
          <span>{{ formatPerishable(record.isPerishable) }}</span>
        </template>
        <template v-else-if="column.key === 'usageScenario'">
          <span>{{ record.usageScenario || '—' }}</span>
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

    <!-- 创建 / 编辑物资信息弹窗 -->
    <Modal
      v-model:open="createModalVisible"
      :title="isEditMode ? '更新物资信息' : '创建物资信息'"
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
        <div class="grid grid-cols-3 gap-4">
          <Form.Item label="物资编码" name="materialCode">
            <Input
              v-model:value="formModel.materialCode"
              placeholder="请输入物资编码"
            />
          </Form.Item>
          <Form.Item label="物资名称" name="materialName">
            <Input
              v-model:value="formModel.materialName"
              placeholder="请输入物资名称"
            />
          </Form.Item>
          <Form.Item label="物资类别ID" name="categoryId">
            <Input
              v-model:value="formModel.categoryId"
              placeholder="请输入物资类别ID"
            />
          </Form.Item>
          <Form.Item label="规格型号" name="specification">
            <Input
              v-model:value="formModel.specification"
              placeholder="请输入规格型号"
            />
          </Form.Item>
          <Form.Item label="计量单位" name="unit">
            <Input
              v-model:value="formModel.unit"
              placeholder="请输入计量单位"
            />
          </Form.Item>
          <Form.Item label="最低库存预警值" name="minStock">
            <InputNumber
              v-model:value="formModel.minStock"
              :min="0"
              style="width: 100%"
              placeholder="请输入最低库存预警值"
            />
          </Form.Item>
          <Form.Item label="最高库存值" name="maxStock">
            <InputNumber
              v-model:value="formModel.maxStock"
              :min="0"
              style="width: 100%"
              placeholder="请输入最高库存值"
            />
          </Form.Item>
          <Form.Item label="当前库存数量" name="currentStock">
            <InputNumber
              v-model:value="formModel.currentStock"
              :min="0"
              style="width: 100%"
              placeholder="请输入当前库存数量"
            />
          </Form.Item>
          <Form.Item label="状态" name="status">
            <Select
              v-model:value="formModel.status"
              :options="statusOptions"
              placeholder="请选择状态"
            />
          </Form.Item>
          <Form.Item label="采购单价" name="purchasePrice">
            <InputNumber
              v-model:value="formModel.purchasePrice"
              :min="0"
              :step="0.01"
              style="width: 100%"
              placeholder="请输入采购单价"
            />
          </Form.Item>
          <Form.Item label="销售单价" name="salePrice">
            <InputNumber
              v-model:value="formModel.salePrice"
              :min="0"
              :step="0.01"
              style="width: 100%"
              placeholder="请输入销售单价"
            />
          </Form.Item>
          <Form.Item label="成本单价" name="costPrice">
            <InputNumber
              v-model:value="formModel.costPrice"
              :min="0"
              :step="0.01"
              style="width: 100%"
              placeholder="请输入成本单价"
            />
          </Form.Item>
          <Form.Item label="是否易耗品" name="isPerishable">
            <Select
              v-model:value="formModel.isPerishable"
              :options="perishableOptions"
              placeholder="请选择是否易耗品"
            />
          </Form.Item>
          <Form.Item label="使用场景" name="usageScenario">
            <Input
              v-model:value="formModel.usageScenario"
              placeholder="请输入使用场景"
            />
          </Form.Item>
        </div>
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



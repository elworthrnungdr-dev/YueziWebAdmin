<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import {
  getCarePackageListApi,
  createCarePackageApi,
  getCarePackageDetailApi,
  updateCarePackageApi,
  deleteCarePackageApi,
  type CarePackageItem,
  type CarePackageListParams,
  type CreateCarePackageParams,
  type UpdateCarePackageParams,
  type CarePackageItemInput,
  // 产康项目列表，用于套餐项目下拉
  getCareProjectListApi,
  type CareProjectListParams,
  type CareProjectItem,
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
import dayjs from 'dayjs';
import { h } from 'vue';

const loading = ref(false);
const dataSource = ref<CarePackageItem[]>([]);
const total = ref(0);

const queryForm = ref<CarePackageListParams>({
  PackageName: undefined,
  Status: undefined,
  PageIndex: 1,
  PageSize: 10,
  OrderBy: undefined,
  IsAsc: true,
});

const statusOptions = [
  { label: '启用', value: 1 },
  { label: '禁用', value: 2 },
];

// 产康项目下拉选项（从 /api/CareProject/list 获取）
const careProjectOptions = ref<{ label: string; value: string }[]>([]);

const columns = [
  {
    title: '套餐名称',
    dataIndex: 'packageName',
    key: 'packageName',
    width: 180,
  },
  {
    title: '总价',
    dataIndex: 'totalPrice',
    key: 'totalPrice',
    width: 120,
  },
  {
    title: '状态',
    dataIndex: 'statusText',
    key: 'statusText',
    width: 100,
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
    width: 160,
    fixed: 'right',
    align: 'center',
  },
];

// 获取产康项目列表，用于套餐项目下拉
async function fetchCareProjectOptions() {
  try {
    careProjectOptions.value = [];
    const pageSize = 10; // 接口限制最大 10
    let pageIndex = 1;
    let allItems: CareProjectItem[] = [];
    // 循环分页，直到取完所有项目
    while (true) {
      const params: CareProjectListParams = {
        ProductCode: undefined,
        ProjectName: undefined,
        Status: 1, // 只取启用的项目
        PageIndex: pageIndex,
        PageSize: pageSize,
        OrderBy: undefined,
        IsAsc: true,
      };
      const result = await getCareProjectListApi(params);
      const items: CareProjectItem[] = result.items || [];
      if (!items.length) break;
      allItems = allItems.concat(items);
      // 如果已经取完所有页，结束循环
      const total = result.total || 0;
      const pages = result.pages || Math.ceil(total / pageSize) || 1;
      if (pageIndex >= pages) break;
      pageIndex += 1;
    }

    careProjectOptions.value = allItems.map((item) => ({
      label: item.projectName,
      value: item.id,
    }));
  } catch (error: any) {
    const errMsg =
      error?.response?.data?.message ||
      error?.data?.message ||
      error?.message ||
      '获取产康项目列表失败';
    message.error(errMsg);
  }
}

async function fetchList() {
  try {
    loading.value = true;
    const result = await getCarePackageListApi(queryForm.value);
    dataSource.value = result.items || [];
    total.value = result.total || 0;
  } catch (error: any) {
    const errMsg =
      error?.response?.data?.message ||
      error?.data?.message ||
      error?.message ||
      '获取产康套餐项目列表失败';
    message.error(errMsg);
  } finally {
    loading.value = false;
  }
}

function handleReset() {
  queryForm.value = {
    PackageName: undefined,
    Status: undefined,
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

// 创建/编辑产康套餐项目弹窗相关
const createModalVisible = ref(false);
const submitting = ref(false);
const isEditMode = ref(false);
const editingId = ref<string>('');
const formRef = ref<FormInstance>();

const formModel = ref<
  CreateCarePackageParams & {
    items: CarePackageItemInput[];
  }
>({
  packageName: '',
  totalPrice: 0,
  status: 1,
  remark: '',
  items: [
    {
      projectId: '',
      quantity: 1,
    },
  ],
});

const formRules = {
  packageName: [{ required: true, message: '请输入套餐名称' }],
  totalPrice: [{ required: true, message: '请输入总价' }],
  status: [{ required: true, message: '请选择状态' }],
};

function resetForm() {
  formModel.value = {
    packageName: '',
    totalPrice: 0,
    status: 1,
    remark: '',
    items: [
      {
        projectId: '',
        quantity: 1,
      },
    ],
  };
  formRef.value?.resetFields();
}

function addItemRow() {
  formModel.value.items.push({
    projectId: '',
    quantity: 1,
  });
}

function removeItemRow(index: number) {
  if (formModel.value.items.length <= 1) return;
  formModel.value.items.splice(index, 1);
}

function openCreateModal() {
  isEditMode.value = false;
  editingId.value = '';
  createModalVisible.value = true;
  resetForm();
}

async function openEditModal(record: CarePackageItem) {
  isEditMode.value = true;
  editingId.value = record.id;
  createModalVisible.value = true;
  resetForm();

  try {
    const detail = await getCarePackageDetailApi(record.id);
    formModel.value = {
      packageName: detail.packageName || '',
      totalPrice: detail.totalPrice ?? 0,
      status: detail.status ?? 1,
      remark: detail.remark || '',
      items:
        detail.items?.map((x) => ({
          projectId: x.projectId,
          quantity: x.quantity ?? 1,
        })) || [
          {
            projectId: '',
            quantity: 1,
          },
        ],
    };
  } catch (error: any) {
    const errMsg =
      error?.response?.data?.message ||
      error?.data?.message ||
      error?.message ||
      '获取产康套餐项目详情失败';
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

    const baseData: CreateCarePackageParams = {
      packageName: formModel.value.packageName,
      totalPrice: formModel.value.totalPrice,
      status: formModel.value.status,
      remark: formModel.value.remark,
      items: formModel.value.items.map((x) => ({
        projectId: x.projectId,
        quantity: x.quantity,
      })),
    };

    if (isEditMode.value) {
      const updateData: UpdateCarePackageParams = {
        ...baseData,
        id: editingId.value,
      };
      await updateCarePackageApi(updateData);
      message.success('更新产康套餐项目成功');
    } else {
      await createCarePackageApi(baseData);
      message.success('创建产康套餐项目成功');
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
      (isEditMode.value ? '更新产康套餐项目失败' : '创建产康套餐项目失败');
    message.error(errMsg);
    return;
  } finally {
    submitting.value = false;
  }
}

function handleDelete(record: CarePackageItem) {
  Modal.confirm({
    title: '确认删除',
    content: h('div', { style: { fontSize: '14px', lineHeight: '1.6' } }, [
      h('p', {
        style: { marginBottom: '8px', color: '#ff4d4f', fontWeight: 500 },
      }, '⚠️ 警告'),
      h('p', { style: { margin: 0 } }, '确定要删除该产康套餐项目吗？'),
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
        await deleteCarePackageApi(record.id);
        message.success('删除产康套餐项目成功');
        fetchList();
      } catch (error: any) {
        const errMsg =
          error?.response?.data?.message ||
          error?.data?.message ||
          error?.message ||
          '删除产康套餐项目失败';
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
  fetchCareProjectOptions();
});
</script>

<template>
  <div class="p-4">
    <!-- 顶部：创建按钮 + 查询条件 -->
    <div class="mb-3 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <Button type="primary" class="cursor-pointer" @click="openCreateModal">
          创建产康套餐项目
        </Button>
      </div>
      <Space>
        <Input
          v-model:value="queryForm.PackageName"
          placeholder="套餐名称"
          allow-clear
          style="width: 180px"
        />
        <Select
          v-model:value="queryForm.Status"
          :options="statusOptions"
          placeholder="项目状态"
          allow-clear
          style="width: 140px"
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
        <template v-if="column.key === 'totalPrice'">
          <span
            v-if="record.totalPrice !== null && record.totalPrice !== undefined"
          >
            ¥{{ record.totalPrice.toLocaleString() }}
          </span>
          <span v-else>—</span>
        </template>
        <template v-else-if="column.key === 'statusText'">
          <span>
            {{
              record.statusText ||
              (record.status === 1 ? '启用' : record.status === 2 ? '禁用' : '未知')
            }}
          </span>
        </template>
        <template v-else-if="column.key === 'remark'">
          <span>{{ record.remark || '—' }}</span>
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

    <!-- 创建/编辑产康套餐项目弹窗 -->
    <Modal
      v-model:open="createModalVisible"
      :title="isEditMode ? '更新产康套餐项目' : '创建产康套餐项目'"
      width="550px"
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
          <Form.Item label="套餐名称" name="packageName">
            <Input
              v-model:value="formModel.packageName"
              placeholder="请输入套餐名称"
            />
          </Form.Item>
          <Form.Item label="总价" name="totalPrice">
            <InputNumber
              v-model:value="formModel.totalPrice"
              :min="0"
              :precision="2"
              style="width: 100%"
              placeholder="请输入总价"
            />
          </Form.Item>
          <Form.Item label="状态" name="status">
            <Select
              v-model:value="formModel.status"
              :options="statusOptions"
              placeholder="请选择状态"
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

        <Form.Item label="套餐项目" required>
          <div class="space-y-2">
            <div
              v-for="(item, index) in formModel.items"
              :key="index"
              class="flex items-center gap-2"
            >
              <Select
                v-model:value="item.projectId"
                :options="careProjectOptions"
                placeholder="请选择产康项目"
                style="width: 260px"
                show-search
                option-filter-prop="label"
              />
              <InputNumber
                v-model:value="item.quantity"
                :min="1"
                style="width: 140px"
                placeholder="次数"
              />
              <Button
                v-if="formModel.items.length > 1"
                danger
                size="small"
                class="cursor-pointer"
                @click="removeItemRow(index)"
              >
                删除
              </Button>
            </div>
            <Button type="dashed" size="small" class="cursor-pointer" @click="addItemRow">
              新增项目
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  </div>
</template>



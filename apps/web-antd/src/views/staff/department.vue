<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';

import {
  Button,
  Input,
  InputNumber,
  message,
  Modal,
  Pagination,
  Select,
  Switch,
  Table,
  TableColumn,
} from 'ant-design-vue';
import {
  addDepartment,
  deleteDepartment as deleteDepartmentApi,
  getDepartmentsList,
  getDepartmentsPage,
  updateDepartment as updateDepartmentApi,
  type ApiDepartment,
  type DepartmentPayload,
} from '#/api/department';
import { $t } from '#/locales';

// 部门数据类型定义
interface Department {
  tDepartmentId: string;
  deptCode: string;
  deptName: string;
  parentId: string | null;
  leaderId: string | null;
  sortno: number | null;
  status: number | null; // 0:禁用, 1:启用
  remark: string | null;
  createTime: string;
  updateTime: string;
}

// 创建空部门对象
const createEmptyDepartment = (): Department => ({
  tDepartmentId: '',
  deptCode: '',
  deptName: '',
  parentId: null,
  leaderId: null,
  sortno: null,
  status: 1, // 默认启用
  remark: null,
  createTime: '',
  updateTime: '',
});

// API数据映射到本地数据
const toNullableNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const mapApiDepartmentToLocal = (api: ApiDepartment): Department => ({
  tDepartmentId: api.tDepartmentId ?? '',
  deptCode: api.deptCode ?? '',
  deptName: api.deptName ?? '',
  parentId: api.parentId ?? null,
  leaderId: api.leaderId ?? null,
  sortno: toNullableNumber(api.sortno),
  status: toNullableNumber(api.status),
  remark: api.remark ?? null,
  createTime: api.createTime ?? '',
  updateTime: api.updateTime ?? '',
});

// 本地数据映射到API载荷
const mapLocalDepartmentToApiPayload = (
  dept: Department,
): DepartmentPayload => {
  const payload: DepartmentPayload = {
    deptCode: dept.deptCode,
    deptName: dept.deptName,
  };
  if (dept.parentId) payload.parentId = dept.parentId;
  if (dept.leaderId) payload.leaderId = dept.leaderId;
  if (typeof dept.sortno === 'number' && Number.isFinite(dept.sortno)) {
    payload.sortno = dept.sortno;
  }
  if (typeof dept.status === 'number') {
    payload.status = dept.status;
  }
  if (dept.remark) payload.remark = dept.remark;
  return payload;
};

// 响应式数据
const departments = ref<Department[]>([]);
const allDepartments = ref<Department[]>([]); // 用于父部门选择
const loading = ref(false);
const selectedRowKeys = ref<string[]>([]);

// 搜索表单
const searchForm = reactive({
  deptCode: '',
  deptName: '',
  status: undefined as number | undefined,
});

// 弹窗相关
const modalVisible = ref(false);
const modalTitle = ref('新增部门');
const isEditing = ref(false);
const currentDepartmentId = ref('');
const submitLoading = ref(false);

// 表单数据
const departmentForm = reactive<Department>(createEmptyDepartment());
const handleSortnoChange = (value: number | string | null) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    departmentForm.sortno = value;
  } else {
    departmentForm.sortno = null;
  }
};

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
});

// 构建分页查询参数
const buildPageParams = () => {
  return {
    pageIndex: pagination.current,
    pageSize: pagination.pageSize,
    deptCode: searchForm.deptCode || undefined,
    deptName: searchForm.deptName || undefined,
    status: searchForm.status,
  };
};

// 验证表单
const validateDepartmentForm = () => {
  if (!departmentForm.deptCode || departmentForm.deptCode.trim() === '') {
    message.error('部门编号为必填项');
    return false;
  }
  if (!departmentForm.deptName || departmentForm.deptName.trim() === '') {
    message.error('部门名称为必填项');
    return false;
  }
  return true;
};

// 加载部门列表
const loadDepartments = async () => {
  loading.value = true;
  try {
    const response = await getDepartmentsPage(buildPageParams());
    const items = response?.items ?? [];
    departments.value = items.map((item) => mapApiDepartmentToLocal(item));
    pagination.total = response?.totalCount ?? items.length;
    pagination.current = response?.pageIndex ?? pagination.current;
    pagination.pageSize = response?.pageSize ?? pagination.pageSize;
    selectedRowKeys.value = [];
  } catch (error) {
    console.error(error);
    message.error(
      error instanceof Error ? error.message : '获取部门列表失败',
    );
  } finally {
    loading.value = false;
  }
};

// 加载所有部门（用于父部门选择）
const loadAllDepartments = async () => {
  try {
    const response = await getDepartmentsList();
    const items = response ?? [];
    allDepartments.value = items.map((item) => mapApiDepartmentToLocal(item));
  } catch (error) {
    console.error('加载部门列表失败：', error);
  }
};

// 搜索
const handleSearch = () => {
  pagination.current = 1;
  loadDepartments();
};

// 重置搜索
const handleReset = () => {
  Object.assign(searchForm, {
    deptCode: '',
    deptName: '',
    status: undefined,
  });
  pagination.current = 1;
  pagination.pageSize = 10;
  loadDepartments();
};

// 删除部门
const handleDelete = (id: string) => {
  Modal.confirm({
    title: '确认删除',
    content: '确定要删除这个部门吗？',
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      try {
        await deleteDepartmentApi(id);
        message.success('部门删除成功');
        await loadDepartments();
      } catch (error) {
        message.error(
          error instanceof Error ? error.message : '部门删除失败',
        );
        throw error;
      }
    },
  });
};

// 新增部门
const handleAdd = () => {
  modalTitle.value = '新增部门';
  isEditing.value = false;
  currentDepartmentId.value = '';
  Object.assign(departmentForm, createEmptyDepartment());
  modalVisible.value = true;
};

// 编辑部门
const handleEdit = async (record: Department) => {
  modalTitle.value = '编辑部门';
  isEditing.value = true;
  currentDepartmentId.value = record.tDepartmentId;
  Object.assign(departmentForm, createEmptyDepartment(), record);
  modalVisible.value = true;
};

// 保存部门
const handleSave = async () => {
  if (!validateDepartmentForm()) {
    return;
  }

  submitLoading.value = true;
  try {
    const payload = mapLocalDepartmentToApiPayload(departmentForm);
    if (isEditing.value) {
      await updateDepartmentApi(currentDepartmentId.value, payload);
      message.success('部门信息更新成功');
    } else {
      await addDepartment(payload);
      message.success('部门添加成功');
    }
    modalVisible.value = false;
    await loadDepartments();
    await loadAllDepartments(); // 刷新父部门列表
  } catch (error) {
    console.error(error);
    message.error(error instanceof Error ? error.message : '保存部门失败');
  } finally {
    submitLoading.value = false;
  }
};

// 关闭弹窗
const handleCancel = () => {
  modalVisible.value = false;
};

// 批量删除
const handleBatchDelete = () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请选择要删除的部门');
    return;
  }

  Modal.confirm({
    title: '确认删除',
    content: `确定要删除选中的 ${selectedRowKeys.value.length} 个部门吗？`,
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      try {
        await Promise.all(
          selectedRowKeys.value.map((id) => deleteDepartmentApi(id)),
        );
        message.success('批量删除成功');
        await loadDepartments();
        await loadAllDepartments();
      } catch (error) {
        message.error(
          error instanceof Error ? error.message : '批量删除失败',
        );
        throw error;
      }
    },
  });
};

// 分页变化
const handlePageChange = (page: number, pageSize: number) => {
  pagination.current = page;
  pagination.pageSize = pageSize;
  loadDepartments();
};

// 获取状态文本
const getStatusText = (status: number | null) => {
  return status === 1 ? '启用' : '禁用';
};

// 获取父部门名称
const getParentDeptName = (parentId: string | null) => {
  if (!parentId) return '-';
  const parent = allDepartments.value.find(
    (d) => d.tDepartmentId === parentId,
  );
  return parent?.deptName ?? '-';
};

// 初始化
onMounted(async () => {
  await loadAllDepartments();
  await loadDepartments();
});
</script>

<template>
  <div class="p-4">
    <h1 class="mb-4 text-2xl font-bold">{{ $t('page.staff.department') }}</h1>

    <!-- 搜索区域 -->
    <div class="mb-4 rounded-lg bg-white p-4 shadow">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div>
          <label class="mb-1 block text-sm font-medium">部门编号</label>
          <Input
            v-model:value="searchForm.deptCode"
            placeholder="请输入部门编号"
            allow-clear
            @press-enter="handleSearch"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium">部门名称</label>
          <Input
            v-model:value="searchForm.deptName"
            placeholder="请输入部门名称"
            allow-clear
            @press-enter="handleSearch"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium">状态</label>
          <Select
            v-model:value="searchForm.status"
            placeholder="请选择状态"
            allow-clear
            class="w-full"
          >
            <Select.Option :value="1">启用</Select.Option>
            <Select.Option :value="0">禁用</Select.Option>
          </Select>
        </div>
        <div class="flex items-end gap-2">
          <Button type="primary" @click="handleSearch">搜索</Button>
          <Button @click="handleReset">重置</Button>
        </div>
      </div>
    </div>

    <!-- 操作栏 -->
    <div class="mb-4 flex justify-between">
      <div class="flex gap-2">
        <Button type="primary" @click="handleAdd">新增部门</Button>
        <Button
          danger
          :disabled="selectedRowKeys.length === 0"
          @click="handleBatchDelete"
        >
          批量删除
        </Button>
      </div>
    </div>

    <!-- 表格 -->
    <div class="rounded-lg bg-white shadow">
      <Table
        :data-source="departments"
        :loading="loading"
        :row-selection="{
          selectedRowKeys,
          onChange: (keys: string[]) => {
            selectedRowKeys = keys;
          },
        }"
        :row-key="(record) => record.tDepartmentId"
        :pagination="false"
      >
        <TableColumn
          title="部门编号"
          data-index="deptCode"
          :width="120"
        />
        <TableColumn title="部门名称" data-index="deptName" :width="150" />
        <TableColumn
          title="父部门"
          :width="150"
          :custom-render="({ record }: { record: Department }) =>
            getParentDeptName(record.parentId)"
        />
        <TableColumn
          title="排序号"
          data-index="sortno"
          :width="100"
          :custom-render="({ record }: { record: Department }) =>
            record.sortno ?? '-'"
        />
        <TableColumn
          title="状态"
          :width="100"
          :custom-render="({ record }: { record: Department }) =>
            getStatusText(record.status)"
        >
          <template #default="{ record }">
            <span
              :class="record.status === 1 ? 'text-green-600' : 'text-gray-500'"
            >
              {{ getStatusText(record.status) }}
            </span>
          </template>
        </TableColumn>
        <TableColumn
          title="备注"
          data-index="remark"
          :width="200"
          :custom-render="({ record }: { record: Department }) =>
            record.remark ?? '-'"
        />
        <TableColumn
          title="创建时间"
          data-index="createTime"
          :width="180"
          :custom-render="({ record }: { record: Department }) =>
            record.createTime || '-'"
        />
        <TableColumn title="操作" :width="150" fixed="right">
          <template #default="{ record }">
            <div class="flex gap-2">
              <Button type="link" size="small" @click="handleEdit(record)">
                编辑
              </Button>
              <Button
                type="link"
                danger
                size="small"
                @click="handleDelete(record.tDepartmentId)"
              >
                删除
              </Button>
            </div>
          </template>
        </TableColumn>
      </Table>

      <!-- 分页 -->
      <div class="mt-4 flex justify-end p-4">
        <Pagination
          v-model:current="pagination.current"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :show-size-changer="true"
          :show-total="(total) => `共 ${total} 条`"
          @change="handlePageChange"
        />
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <Modal
      v-model:open="modalVisible"
      :title="modalTitle"
      :width="600"
      :confirm-loading="submitLoading"
      @ok="handleSave"
      @cancel="handleCancel"
    >
      <div class="space-y-4">
        <div>
          <label class="mb-1 block text-sm font-medium">
            部门编号 <span class="text-red-500">*</span>
          </label>
          <Input
            v-model:value="departmentForm.deptCode"
            placeholder="请输入部门编号"
            :maxlength="20"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium">
            部门名称 <span class="text-red-500">*</span>
          </label>
          <Input
            v-model:value="departmentForm.deptName"
            placeholder="请输入部门名称"
            :maxlength="50"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium">父部门</label>
          <Select
            v-model:value="departmentForm.parentId"
            placeholder="请选择父部门（可选）"
            allow-clear
            class="w-full"
          >
            <Select.Option
              v-for="dept in allDepartments.filter(
                (d) =>
                  !isEditing || d.tDepartmentId !== currentDepartmentId,
              )"
              :key="dept.tDepartmentId"
              :value="dept.tDepartmentId"
            >
              {{ dept.deptName }}
            </Select.Option>
          </Select>
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium">负责人ID</label>
          <Input
            v-model:value="departmentForm.leaderId"
            placeholder="请输入负责人ID（可选）"
            allow-clear
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium">排序号</label>
          <InputNumber
            v-model:value="departmentForm.sortno"
            placeholder="请输入排序号（可选）"
            :min="0"
            class="w-full"
            @change="handleSortnoChange"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium">状态</label>
          <Switch
            v-model:checked="departmentForm.status"
            :checked-value="1"
            :unchecked-value="0"
            checked-children="启用"
            un-checked-children="禁用"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium">备注</label>
          <Input
            v-model:value="departmentForm.remark"
            type="textarea"
            placeholder="请输入备注（可选）"
            :maxlength="500"
            :rows="3"
          />
        </div>
      </div>
    </Modal>
  </div>
</template>

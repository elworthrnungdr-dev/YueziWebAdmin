<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';

import {
  Button,
  DatePicker,
  Input,
  InputNumber,
  message,
  Modal,
  Pagination,
  Select,
  Table,
  TableColumn,
} from 'ant-design-vue';
import {
  addEmployee,
  deleteEmployee as deleteEmployeeApi,
  getEmployeesPage,
  updateEmployee as updateEmployeeApi,
  type ApiEmployee,
  type EmployeePayload,
} from '#/api/employee';
import { getDepartmentsList, type ApiDepartment } from '#/api/department';
import { $t } from '#/locales';

interface Employee {
  tEmployeesId: string;
  employeesName: string;
  employeeNumber: string;
  tDepartmentId: string;
  gender: string;
  age: number | null;
  birthDate: string;
  nativePlace: string;
  address: string;
  phoneNumber: string;
  email: string;
  wechat: string;
  status: string;
  hireDate: string;
  resignationDate: string;
  bankCard: string;
  bankName: string;
  branchName: string;
  roleId: string;
  emergencyContact: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  createdAt: string;
  updatedAt: string;
}

const createEmptyEmployee = (): Employee => ({
  tEmployeesId: '',
  employeesName: '',
  employeeNumber: '',
  tDepartmentId: '',
  gender: '',
  age: null,
  birthDate: '',
  nativePlace: '',
  address: '',
  phoneNumber: '',
  email: '',
  wechat: '',
  status: '在职',
  hireDate: '',
  resignationDate: '',
  bankCard: '',
  bankName: '',
  branchName: '',
  roleId: '',
  emergencyContact: '',
  emergencyContactPhone: '',
  emergencyContactRelation: '',
  createdAt: '',
  updatedAt: '',
});

const toNullableNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const mapApiEmployeeToLocal = (api: ApiEmployee): Employee => ({
  tEmployeesId: api.tEmployeesId ?? '',
  employeesName: api.employeesName ?? '',
  employeeNumber: api.employeeNumber ?? '',
  tDepartmentId: api.tDepartmentId ?? '',
  gender: api.gender ?? '',
  age: toNullableNumber(api.age),
  birthDate: api.birthDate ?? '',
  nativePlace: api.nativePlace ?? '',
  address: api.address ?? '',
  phoneNumber: api.phoneNumber ?? '',
  email: api.email ?? '',
  wechat: api.wechat ?? '',
  status: api.status ?? '',
  hireDate: api.hireDate ?? '',
  resignationDate: api.resignationDate ?? '',
  bankCard: api.bankCard ?? '',
  bankName: api.bankName ?? '',
  branchName: api.branchName ?? '',
  roleId: api.roleId ?? '',
  emergencyContact: api.emergencyContact ?? '',
  emergencyContactPhone: api.emergencyContactPhone ?? '',
  emergencyContactRelation: api.emergencyContactRelation ?? '',
  createdAt: api.createdAt ?? '',
  updatedAt: api.updatedAt ?? '',
});

const employeeFieldKeys: (keyof Employee)[] = [
  'employeesName',
  'employeeNumber',
  'tDepartmentId',
  'gender',
  'age',
  'birthDate',
  'nativePlace',
  'address',
  'phoneNumber',
  'email',
  'wechat',
  'status',
  'hireDate',
  'resignationDate',
  'bankCard',
  'bankName',
  'branchName',
  'roleId',
  'emergencyContact',
  'emergencyContactPhone',
  'emergencyContactRelation',
];

const DATE_FORMAT = 'YYYY-MM-DD';

const mapLocalEmployeeToApiPayload = (
  employee: Employee,
): EmployeePayload => {
  const payload: Record<string, unknown> = {};
  employeeFieldKeys.forEach((key) => {
    const value = employee[key];
    if (
      value !== undefined &&
      value !== null &&
      !(typeof value === 'string' && value.trim() === '')
    ) {
      payload[key] = value;
    }
  });
  payload.tDepartmentId = employee.tDepartmentId;
  payload.employeesName = employee.employeesName;
  payload.employeeNumber = employee.employeeNumber;
  payload.phoneNumber = employee.phoneNumber;
  return payload as EmployeePayload;
};

const requiredEmployeeFields: (keyof Employee)[] = [
  'employeesName',
  'employeeNumber',
  'tDepartmentId',
  'phoneNumber',
];

const requiredFieldLabels: Record<
  (typeof requiredEmployeeFields)[number],
  string
> = {
  employeesName: '职工姓名',
  employeeNumber: '工号',
  tDepartmentId: '所属部门',
  phoneNumber: '手机号',
};

const employees = ref<Employee[]>([]);
const loading = ref(false);
const selectedRowKeys = ref<string[]>([]);

const modalVisible = ref(false);
const modalTitle = ref('新增职工');
const isEditing = ref(false);
const currentEmployeeId = ref('');
const submitLoading = ref(false);

const employeeForm = reactive<Employee>(createEmptyEmployee());

const searchForm = reactive({
  employeesName: '',
  employeeNumber: '',
  departmentId: '',
  status: '',
});

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
});

const allDepartments = ref<ApiDepartment[]>([]);

const loadDepartments = async () => {
  try {
    const data = await getDepartmentsList();
    allDepartments.value = data ?? [];
  } catch (error) {
    console.error('加载部门列表失败：', error);
  }
};

const getDepartmentName = (id: string) => {
  if (!id) return '-';
  const dept = allDepartments.value.find(
    (item) => item.tDepartmentId === id,
  );
  return dept?.deptName ?? '-';
};

const validateEmployeeForm = () => {
  for (const field of requiredEmployeeFields) {
    const value = employeeForm[field];
    if (
      value === undefined ||
      value === null ||
      (typeof value === 'string' && value.trim() === '')
    ) {
      message.error(`${requiredFieldLabels[field]}为必填项`);
      return false;
    }
  }
  return true;
};

const buildPageParams = () => ({
  pageIndex: pagination.current,
  pageSize: pagination.pageSize,
  employeesName: searchForm.employeesName || undefined,
  employeeNumber: searchForm.employeeNumber || undefined,
  departmentId: searchForm.departmentId || undefined,
  status: searchForm.status || undefined,
});

const loadEmployees = async () => {
  loading.value = true;
  try {
    const response = await getEmployeesPage(buildPageParams());
    const items = response?.items ?? [];
    employees.value = items.map((item) => mapApiEmployeeToLocal(item));
    pagination.total = response?.totalCount ?? items.length;
    pagination.current = response?.pageIndex ?? pagination.current;
    pagination.pageSize = response?.pageSize ?? pagination.pageSize;
    selectedRowKeys.value = [];
  } catch (error) {
    console.error(error);
    message.error(error instanceof Error ? error.message : '获取职工列表失败');
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  pagination.current = 1;
  loadEmployees();
};

const handleReset = () => {
  Object.assign(searchForm, {
    employeesName: '',
    employeeNumber: '',
    departmentId: '',
    status: '',
  });
  pagination.current = 1;
  pagination.pageSize = 10;
  loadEmployees();
};

const handleAdd = () => {
  modalTitle.value = '新增职工';
  isEditing.value = false;
  currentEmployeeId.value = '';
  Object.assign(employeeForm, createEmptyEmployee());
  modalVisible.value = true;
};

const handleEdit = (record: Employee) => {
  modalTitle.value = '编辑职工';
  isEditing.value = true;
  currentEmployeeId.value = record.tEmployeesId;
  Object.assign(employeeForm, createEmptyEmployee(), record);
  modalVisible.value = true;
};

const handleSave = async () => {
  if (!validateEmployeeForm()) {
    return;
  }

  submitLoading.value = true;
  try {
    const payload = mapLocalEmployeeToApiPayload(employeeForm);
    if (isEditing.value) {
      await updateEmployeeApi(currentEmployeeId.value, payload);
      message.success('职工信息更新成功');
    } else {
      await addEmployee(payload);
      message.success('职工添加成功');
    }
    modalVisible.value = false;
    await loadEmployees();
  } catch (error) {
    console.error(error);
    message.error(error instanceof Error ? error.message : '保存职工失败');
  } finally {
    submitLoading.value = false;
  }
};

const handleDelete = (id: string) => {
  Modal.confirm({
    title: '确认删除',
    content: '确定要删除这个职工吗？',
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      try {
        await deleteEmployeeApi(id);
        message.success('删除成功');
        await loadEmployees();
      } catch (error) {
        message.error(error instanceof Error ? error.message : '删除失败');
        throw error;
      }
    },
  });
};

const handleBatchDelete = () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请选择要删除的职工');
    return;
  }
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除选中的 ${selectedRowKeys.value.length} 位职工吗？`,
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      try {
        await Promise.all(
          selectedRowKeys.value.map((id) => deleteEmployeeApi(id)),
        );
        message.success('批量删除成功');
        await loadEmployees();
      } catch (error) {
        message.error(error instanceof Error ? error.message : '批量删除失败');
        throw error;
      }
    },
  });
};

const handleCancel = () => {
  modalVisible.value = false;
};

const handlePageChange = (page: number, pageSize: number) => {
  pagination.current = page;
  pagination.pageSize = pageSize;
  loadEmployees();
};

const departmentOptions = computed(() =>
  allDepartments.value.map((dept) => ({
    label: dept.deptName ?? '-',
    value: dept.tDepartmentId ?? '',
  })),
);

const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys: string[]) => {
    selectedRowKeys.value = keys;
  },
}));

onMounted(async () => {
  await loadDepartments();
  await loadEmployees();
});
</script>

<template>
  <div class="p-4">
    <h1 class="mb-4 text-2xl font-bold">{{ $t('page.staff.index') }}</h1>

    <div class="mb-4 rounded-lg bg-white p-4 shadow">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div>
          <label class="mb-1 block text-sm font-medium">职工姓名</label>
          <Input
            v-model:value="searchForm.employeesName"
            allow-clear
            placeholder="请输入职工姓名"
            @press-enter="handleSearch"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium">工号</label>
          <Input
            v-model:value="searchForm.employeeNumber"
            allow-clear
            placeholder="请输入工号"
            @press-enter="handleSearch"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium">所属部门</label>
          <Select
            v-model:value="searchForm.departmentId"
            allow-clear
            placeholder="请选择部门"
            class="w-full"
          >
            <Select.Option
              v-for="dept in departmentOptions"
              :key="dept.value"
              :value="dept.value"
            >
              {{ dept.label }}
            </Select.Option>
          </Select>
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium">状态</label>
          <Select
            v-model:value="searchForm.status"
            allow-clear
            placeholder="请选择状态"
            class="w-full"
          >
            <Select.Option value="在职">在职</Select.Option>
            <Select.Option value="离职">离职</Select.Option>
            <Select.Option value="试用">试用</Select.Option>
          </Select>
        </div>
      </div>
      <div class="mt-4 flex justify-end gap-2">
        <Button type="primary" @click="handleSearch">搜索</Button>
        <Button @click="handleReset">重置</Button>
      </div>
    </div>

    <div class="mb-4 flex justify-between">
      <div class="flex gap-2">
        <Button type="primary" @click="handleAdd">新增职工</Button>
        <Button
          danger
          :disabled="selectedRowKeys.length === 0"
          @click="handleBatchDelete"
        >
          批量删除
        </Button>
      </div>
    </div>

    <div class="rounded-lg bg-white shadow">
      <Table
        :data-source="employees"
        :loading="loading"
        :row-key="(record) => record.tEmployeesId"
        :pagination="false"
        :row-selection="rowSelection"
      >
        <TableColumn title="职工姓名" data-index="employeesName" :width="140" />
        <TableColumn title="工号" data-index="employeeNumber" :width="120" />
        <TableColumn title="部门" :width="160">
          <template #default="{ record }">
            {{ getDepartmentName(record.tDepartmentId) }}
          </template>
        </TableColumn>
        <TableColumn title="手机号" data-index="phoneNumber" :width="150" />
        <TableColumn title="状态" data-index="status" :width="100" />
        <TableColumn title="入职日期" data-index="hireDate" :width="160" />
        <TableColumn title="离职日期" data-index="resignationDate" :width="160" />
        <TableColumn title="更新日期" data-index="updatedAt" :width="180" />
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
                @click="handleDelete(record.tEmployeesId)"
              >
                删除
              </Button>
            </div>
          </template>
        </TableColumn>
      </Table>
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

    <Modal
      v-model:open="modalVisible"
      :title="modalTitle"
      :width="700"
      :confirm-loading="submitLoading"
      @ok="handleSave"
      @cancel="handleCancel"
    >
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label class="mb-1 block text-sm font-medium">
            职工姓名 <span class="text-red-500">*</span>
          </label>
          <Input
            v-model:value="employeeForm.employeesName"
            placeholder="请输入职工姓名"
            :maxlength="50"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium">
            工号 <span class="text-red-500">*</span>
          </label>
          <Input
            v-model:value="employeeForm.employeeNumber"
            placeholder="请输入工号"
            :maxlength="20"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium">
            所属部门 <span class="text-red-500">*</span>
          </label>
          <Select
            v-model:value="employeeForm.tDepartmentId"
            placeholder="请选择部门"
            class="w-full"
          >
            <Select.Option
              v-for="dept in departmentOptions"
              :key="dept.value"
              :value="dept.value"
            >
              {{ dept.label }}
            </Select.Option>
          </Select>
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium">
            手机号 <span class="text-red-500">*</span>
          </label>
          <Input
            v-model:value="employeeForm.phoneNumber"
            placeholder="请输入手机号"
            :maxlength="15"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium">性别</label>
          <Select
            v-model:value="employeeForm.gender"
            allow-clear
            placeholder="请选择性别"
            class="w-full"
          >
            <Select.Option value="男">男</Select.Option>
            <Select.Option value="女">女</Select.Option>
          </Select>
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium">年龄</label>
          <InputNumber
            v-model:value="employeeForm.age"
            :min="18"
            :max="80"
            class="w-full"
            placeholder="请输入年龄"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium">状态</label>
          <Select
            v-model:value="employeeForm.status"
            placeholder="请选择状态"
            class="w-full"
          >
            <Select.Option value="在职">在职</Select.Option>
            <Select.Option value="离职">离职</Select.Option>
            <Select.Option value="试用">试用</Select.Option>
          </Select>
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium">入职日期</label>
          <DatePicker
            v-model:value="employeeForm.hireDate"
            :value-format="DATE_FORMAT"
            allow-clear
            class="w-full"
            placeholder="请选择入职日期"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium">离职日期</label>
          <DatePicker
            v-model:value="employeeForm.resignationDate"
            :value-format="DATE_FORMAT"
            allow-clear
            class="w-full"
            placeholder="请选择离职日期"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium">邮箱</label>
          <Input
            v-model:value="employeeForm.email"
            placeholder="请输入邮箱"
            :maxlength="255"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium">微信号</label>
          <Input
            v-model:value="employeeForm.wechat"
            placeholder="请输入微信号"
            :maxlength="255"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium">籍贯</label>
          <Input
            v-model:value="employeeForm.nativePlace"
            placeholder="请输入籍贯"
            :maxlength="255"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium">家庭住址</label>
          <Input.TextArea
            v-model:value="employeeForm.address"
            placeholder="请输入家庭住址"
            :maxlength="255"
            :rows="2"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium">紧急联系人</label>
          <Input
            v-model:value="employeeForm.emergencyContact"
            placeholder="请输入紧急联系人"
            :maxlength="255"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium">紧急联系人电话</label>
          <Input
            v-model:value="employeeForm.emergencyContactPhone"
            placeholder="请输入紧急联系人电话"
            :maxlength="15"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium">紧急联系人关系</label>
          <Input
            v-model:value="employeeForm.emergencyContactRelation"
            placeholder="请输入关系"
            :maxlength="50"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium">角色 ID</label>
          <Input
            v-model:value="employeeForm.roleId"
            placeholder="请输入角色 ID"
            :maxlength="50"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium">银行卡号</label>
          <Input
            v-model:value="employeeForm.bankCard"
            placeholder="请输入银行卡号"
            :maxlength="50"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium">银行名称</label>
          <Input
            v-model:value="employeeForm.bankName"
            placeholder="请输入银行名称"
            :maxlength="255"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium">支行名称</label>
          <Input
            v-model:value="employeeForm.branchName"
            placeholder="请输入支行名称"
            :maxlength="255"
          />
        </div>
      </div>
    </Modal>
  </div>
</template>


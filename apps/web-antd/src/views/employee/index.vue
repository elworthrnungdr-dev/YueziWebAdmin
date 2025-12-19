<script lang="ts" setup>
import { h, onMounted, ref } from 'vue';

import {
  createEmployeeApi,
  getDepartmentListApi,
  getEmployeeListApi,
  getEmployeeDetailApi,
  updateEmployeeApi,
  deleteEmployeeApi,
  setEmployeePasswordApi,
  type CreateEmployeeParams,
  type UpdateEmployeeParams,
  type DepartmentItem,
  type EmployeeItem,
  type EmployeeListParams,
} from '#/api';

import {
  Button,
  DatePicker,
  Form,
  Input,
  message,
  Modal,
  Radio,
  Select,
  Space,
  Table,
} from 'ant-design-vue';
import type { FormInstance } from 'ant-design-vue';

const loading = ref(false);
const dataSource = ref<EmployeeItem[]>([]);
const total = ref(0);

const queryForm = ref<EmployeeListParams>({
  TEmployeesid: '',
  EmployeesName: '',
  EmployeeNumber: '',
  PageIndex: 1,
  PageSize: 10,
  OrderBy: '',
  IsAsc: true,
});

const columns = [
  {
    title: '职工姓名',
    dataIndex: 'name',
    key: 'name',
    width: 120,
  },
  {
    title: '工号',
    dataIndex: 'number',
    key: 'number',
    width: 120,
  },
  {
    title: '职位',
    dataIndex: 'position',
    key: 'position',
    width: 120,
  },
  {
    title: '联系电话',
    dataIndex: 'phoneNumber',
    key: 'phoneNumber',
    width: 130,
  },
  {
    title: '邮箱',
    dataIndex: 'email',
    key: 'email',
    width: 180,
  },
  {
    title: '入职日期',
    dataIndex: 'hireDate',
    key: 'hireDate',
    width: 120,
  },
  {
    title: '工作状态',
    dataIndex: 'workStatus',
    key: 'workStatus',
    width: 100,
  },
  {
    title: '账户状态',
    dataIndex: 'accountStatus',
    key: 'accountStatus',
    width: 100,
  },
  {
    title: '操作',
    key: 'actions',
    width: 100,
    fixed: 'right',
  },
];

async function fetchList() {
  loading.value = true;
  try {
    const { items, total: t } = await getEmployeeListApi(queryForm.value);
    dataSource.value = items;
    total.value = t;
  } catch (error: any) {
    const errMsg =
      error?.response?.data?.message || error?.message || '获取职工列表失败';
    message.error(errMsg);
  } finally {
    loading.value = false;
  }
}

function handleReset() {
  queryForm.value.TEmployeesid = '';
  queryForm.value.EmployeesName = '';
  queryForm.value.EmployeeNumber = '';
  queryForm.value.PageIndex = 1;
  queryForm.value.PageSize = 10;
  queryForm.value.OrderBy = '';
  queryForm.value.IsAsc = true;
  fetchList();
}

function handleTableChange(pagination: any) {
  queryForm.value.PageIndex = pagination.current;
  queryForm.value.PageSize = pagination.pageSize;
  fetchList();
}

// 添加/编辑员工弹窗相关
const createModalVisible = ref(false);
const isEditMode = ref(false);
const editingEmployeeId = ref<string>('');
const submitting = ref(false);
const deptOptions = ref<DepartmentItem[]>([]);
const formRef = ref<FormInstance>();
const formModel = ref<CreateEmployeeParams>({
  employeesName: '',
  employeeNumber: '',
  tDepartmentId: '',
  gender: 1,
  age: null,
  birthDate: null,
  nativePlace: null,
  address: null,
  phoneNumber: '',
  email: null,
  wechat: null,
  workStatus: 0,
  position: null,
  hireDate: null,
  resignationDate: null,
  bankCard: null,
  bankName: null,
  branchName: null,
  idCardFront: null,
  idCardBack: null,
  password: null,
  accountStatus: 1,
  emergencyContact: null,
  emergencyContactPhone: null,
  emergencyContactRelation: null,
  avatarUrl: null,
  remark: null,
});

const formRules = {
  employeesName: [{ required: true, message: '请输入职工姓名' }],
  employeeNumber: [{ required: true, message: '请输入工号' }],
  tDepartmentId: [{ required: true, message: '请选择部门' }],
  gender: [{ required: true, message: '请选择性别' }],
  phoneNumber: [{ required: true, message: '请输入电话号码' }],
  accountStatus: [{ required: true, message: '请选择账号状态' }],
};

// 设置密码相关
const setPwdModalVisible = ref(false);
const setPwdSubmitting = ref(false);
const setPwdFormRef = ref<FormInstance>();
const setPwdForm = ref<{ id: string; newPassword: string }>({
  id: '',
  newPassword: '',
});
const setPwdRules = {
  newPassword: [{ required: true, message: '请输入新密码' }],
};

async function fetchDepartments() {
  try {
    deptOptions.value = await getDepartmentListApi();
  } catch (error: any) {
    const errMsg =
      error?.response?.data?.message || error?.message || '获取部门列表失败';
    message.error(errMsg);
  }
}

function resetForm() {
  formModel.value = {
    employeesName: '',
    employeeNumber: '',
    tDepartmentId: '',
    gender: 1,
    age: null,
    birthDate: null,
    nativePlace: null,
    address: null,
    phoneNumber: '',
    email: null,
    wechat: null,
    workStatus: 0,
    position: null,
    hireDate: null,
    resignationDate: null,
    bankCard: null,
    bankName: null,
    branchName: null,
    idCardFront: null,
    idCardBack: null,
    password: null,
    accountStatus: 1,
    emergencyContact: null,
    emergencyContactPhone: null,
    emergencyContactRelation: null,
    avatarUrl: null,
    remark: null,
  };
  formRef.value?.resetFields();
}

function openSetPwdModal(record: EmployeeItem) {
  setPwdForm.value = { id: record.id, newPassword: '' };
  setPwdModalVisible.value = true;
  setPwdFormRef.value?.resetFields();
}

async function handleSetPwdSubmit() {
  try {
    const values = await setPwdFormRef.value?.validate();
    if (!values) return;
    setPwdSubmitting.value = true;
    await setEmployeePasswordApi(setPwdForm.value.id, setPwdForm.value.newPassword);
    message.success('设置新密码成功');
    setPwdModalVisible.value = false;
  } catch (error: any) {
    if (error?.errorFields) {
      return;
    }
    const errMsg =
      error?.response?.data?.message ||
      error?.data?.message ||
      error?.message ||
      '设置新密码失败';
    message.error(errMsg);
  } finally {
    setPwdSubmitting.value = false;
  }
}

function openCreateModal() {
  isEditMode.value = false;
  editingEmployeeId.value = '';
  createModalVisible.value = true;
  fetchDepartments();
  resetForm();
}

async function openEditModal(record: EmployeeItem) {
  isEditMode.value = true;
  editingEmployeeId.value = record.id;
  createModalVisible.value = true;
  fetchDepartments();
  
  try {
    loading.value = true;
    const detail = await getEmployeeDetailApi(record.id);
    
    // 填充表单数据
    formModel.value = {
      employeesName: detail.employeesName || '',
      employeeNumber: detail.employeeNumber || '',
      tDepartmentId: detail.tDepartmentId || '',
      gender: detail.gender ?? 1,
      age: detail.age ?? null,
      birthDate: detail.birthDate || null,
      nativePlace: detail.nativePlace || null,
      address: detail.address || null,
      phoneNumber: detail.phoneNumber || '',
      email: detail.email || null,
      wechat: detail.wechat || null,
      workStatus: detail.workStatus ?? 0,
      position: detail.position || null,
      hireDate: detail.hireDate || null,
      resignationDate: detail.resignationDate || null,
      bankCard: detail.bankCard || null,
      bankName: detail.bankName || null,
      branchName: detail.branchName || null,
      idCardFront: detail.idCardFront || null,
      idCardBack: detail.idCardBack || null,
      password: null, // 编辑时不传密码，为空表示不修改
      accountStatus: detail.accountStatus ?? 1,
      emergencyContact: detail.emergencyContact || null,
      emergencyContactPhone: detail.emergencyContactPhone || null,
      emergencyContactRelation: detail.emergencyContactRelation || null,
      avatarUrl: detail.avatarUrl || null,
      remark: detail.remark || null,
    };
  } catch (error: any) {
    const errMsg =
      error?.response?.data?.message || error?.message || '获取员工详情失败';
    message.error(errMsg);
    createModalVisible.value = false;
  } finally {
    loading.value = false;
  }
}

async function handleSubmit() {
  try {
    const values = await formRef.value?.validate();
    if (!values) return;
    submitting.value = true;

    if (isEditMode.value) {
      // 编辑模式：PUT 请求
      const updateData: UpdateEmployeeParams = {
        ...values,
        id: editingEmployeeId.value,
      };
      await updateEmployeeApi(updateData);
      message.success('更新员工成功');
    } else {
      // 新增模式：POST 请求
      await createEmployeeApi(values as CreateEmployeeParams);
      message.success('添加员工成功');
    }
    
    createModalVisible.value = false;
    fetchList();
  } catch (error: any) {
    if (error?.errorFields) {
      return;
    }
    const errMsg =
      error?.response?.data?.message ||
      error?.message ||
      (isEditMode.value ? '更新员工失败' : '添加员工失败');
    message.error(errMsg);
  } finally {
    submitting.value = false;
  }
}

function handleDelete(record: EmployeeItem) {
  Modal.confirm({
    title: '确认删除',
    content: h('div', { style: { fontSize: '14px', lineHeight: '1.6' } }, [
      h('p', { style: { marginBottom: '8px', color: '#ff4d4f', fontWeight: 500 } }, '⚠️ 警告'),
      h('p', { style: { margin: 0 } }, `确定要删除员工"${record.name}"（工号：${record.number}）吗？`),
      h('p', { style: { margin: '4px 0 0', color: '#8c8c8c', fontSize: '12px' } }, '此操作不可恢复，请谨慎操作。'),
    ]),
    okText: '确定删除',
    cancelText: '取消',
    okType: 'danger',
    centered: true,
    width: 420,
    onOk: async () => {
      try {
        loading.value = true;
        await deleteEmployeeApi(record.id);
        message.success('删除成功');
        fetchList();
      } catch (error: any) {
        const errMsg =
          error?.response?.data?.message || error?.message || '删除失败';
        message.error(errMsg);
        throw error; // 阻止 Modal 自动关闭
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
      <div class="flex items-center space-x-3">
        <Button
          type="primary"
          size="small"
          class="cursor-pointer"
          @click="openCreateModal"
        >
          添加员工
        </Button>
      </div>
      <Space>
        <Input
          v-model:value="queryForm.EmployeesName"
          allow-clear
          placeholder="按姓名搜索"
          style="width: 180px"
        />
        <Input
          v-model:value="queryForm.EmployeeNumber"
          allow-clear
          placeholder="按工号搜索"
          style="width: 180px"
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
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'hireDate'">
          <span v-if="record.hireDate">
            {{ new Date(record.hireDate).toLocaleDateString('zh-CN') }}
          </span>
          <span v-else>—</span>
        </template>
        <template v-else-if="column.key === 'workStatus'">
          {{
            {
              0: '在职',
              1: '离职',
              2: '停薪留职',
            }[record.workStatus ?? 0] ?? '未知'
          }}
        </template>
        <template v-else-if="column.key === 'accountStatus'">
          {{
            {
              1: '正常',
              2: '锁定',
              3: '停用',
            }[record.accountStatus ?? 1] ?? '未知'
          }}
        </template>
        <template v-else-if="column.key === 'actions'">
          <Space>
            <Button type="link" size="small" @click="openEditModal(record)">
              编辑
            </Button>
            <Button type="link" size="small" @click="openSetPwdModal(record)">
              设置新密码
            </Button>
            <Button type="link" danger size="small" @click="handleDelete(record)">
              删除
            </Button>
          </Space>
        </template>
      </template>
    </Table>

    <!-- 设置新密码弹窗 -->
    <Modal
      v-model:open="setPwdModalVisible"
      title="设置新密码"
      :confirm-loading="setPwdSubmitting"
      @ok="handleSetPwdSubmit"
      @cancel="setPwdModalVisible = false"
      destroy-on-close
    >
      <Form
        ref="setPwdFormRef"
        :model="setPwdForm"
        :rules="setPwdRules"
        layout="vertical"
      >
        <Form.Item label="新密码" name="newPassword">
          <Input.Password
            v-model:value="setPwdForm.newPassword"
            placeholder="请输入新密码"
          />
        </Form.Item>
      </Form>
    </Modal>

    <Modal
      v-model:open="createModalVisible"
      :title="isEditMode ? '编辑员工' : '添加员工'"
      width="800px"
      :confirm-loading="submitting"
      :body-style="{ maxHeight: '600px', overflowY: 'auto' }"
      @ok="handleSubmit"
      @cancel="createModalVisible = false"
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
          <Form.Item label="职工姓名" name="employeesName">
            <Input
              v-model:value="formModel.employeesName"
              placeholder="请输入职工姓名"
            />
          </Form.Item>
          <Form.Item label="工号" name="employeeNumber">
            <Input
              v-model:value="formModel.employeeNumber"
              placeholder="请输入工号"
            />
          </Form.Item>
          <Form.Item label="所属部门" name="tDepartmentId">
            <Select
              v-model:value="formModel.tDepartmentId"
              placeholder="请选择部门"
              :options="
                deptOptions.map((d) => ({
                  label: d.deptName,
                  value: d.id,
                }))
              "
            />
          </Form.Item>
          <Form.Item label="性别" name="gender">
            <Radio.Group v-model:value="formModel.gender">
              <Radio :value="1">男</Radio>
              <Radio :value="2">女</Radio>
              <Radio :value="3">未知</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item label="年龄" name="age">
            <Input
              v-model:value="formModel.age"
              type="number"
              min="0"
              placeholder="请输入年龄"
            />
          </Form.Item>
          <Form.Item label="出生日期" name="birthDate">
            <DatePicker
              v-model:value="formModel.birthDate"
              value-format="YYYY-MM-DDTHH:mm:ss"
              style="width: 100%"
            />
          </Form.Item>
          <Form.Item label="籍贯" name="nativePlace">
            <Input
              v-model:value="formModel.nativePlace"
              placeholder="请输入籍贯"
            />
          </Form.Item>
          <Form.Item label="地址" name="address">
            <Input
              v-model:value="formModel.address"
              placeholder="请输入地址"
            />
          </Form.Item>
          <Form.Item label="电话号码" name="phoneNumber">
            <Input
              v-model:value="formModel.phoneNumber"
              placeholder="请输入电话号码"
            />
          </Form.Item>
          <Form.Item label="账号状态" name="accountStatus">
            <Select
              v-model:value="formModel.accountStatus"
              :options="[
                { label: '正常', value: 1 },
                { label: '锁定', value: 2 },
                { label: '停用', value: 3 },
              ]"
              placeholder="请选择账号状态"
            />
          </Form.Item>
          <Form.Item label="在职状态" name="workStatus">
            <Select
              v-model:value="formModel.workStatus"
              :options="[
                { label: '在职', value: 0 },
                { label: '离职', value: 1 },
                { label: '停薪留职', value: 2 },
              ]"
              placeholder="请选择在职状态"
            />
          </Form.Item>
          <Form.Item label="职位" name="position">
            <Input
              v-model:value="formModel.position"
              placeholder="请输入职位"
            />
          </Form.Item>
          <Form.Item label="入职日期" name="hireDate">
            <DatePicker
              v-model:value="formModel.hireDate"
              value-format="YYYY-MM-DDTHH:mm:ss"
              style="width: 100%"
            />
          </Form.Item>
          <Form.Item label="离职日期" name="resignationDate">
            <DatePicker
              v-model:value="formModel.resignationDate"
              value-format="YYYY-MM-DDTHH:mm:ss"
              style="width: 100%"
            />
          </Form.Item>
          </div>

          <!-- 第二列 -->
          <div>
          <Form.Item label="邮箱" name="email">
            <Input v-model:value="formModel.email" placeholder="请输入邮箱" />
          </Form.Item>
          <Form.Item label="微信号" name="wechat">
            <Input v-model:value="formModel.wechat" placeholder="请输入微信号" />
          </Form.Item>
          <Form.Item label="银行卡号" name="bankCard">
            <Input
              v-model:value="formModel.bankCard"
              placeholder="请输入银行卡号"
            />
          </Form.Item>
          <Form.Item label="银行名称" name="bankName">
            <Input
              v-model:value="formModel.bankName"
              placeholder="请输入银行名称"
            />
          </Form.Item>
          <Form.Item label="支行名称" name="branchName">
            <Input
              v-model:value="formModel.branchName"
              placeholder="请输入支行名称"
            />
          </Form.Item>
          <Form.Item label="身份证正面" name="idCardFront">
            <Input
              v-model:value="formModel.idCardFront"
              placeholder="请输入身份证正面图片地址"
            />
          </Form.Item>
          <Form.Item label="身份证反面" name="idCardBack">
            <Input
              v-model:value="formModel.idCardBack"
              placeholder="请输入身份证反面图片地址"
            />
          </Form.Item>
          <Form.Item label="登录密码" name="password">
            <Input.Password
              v-model:value="formModel.password"
              placeholder="不填则默认为123456"
              allow-clear
            />
          </Form.Item>
          <Form.Item label="紧急联系人" name="emergencyContact">
            <Input
              v-model:value="formModel.emergencyContact"
              placeholder="请输入紧急联系人"
            />
          </Form.Item>
          <Form.Item label="紧急联系人电话" name="emergencyContactPhone">
            <Input
              v-model:value="formModel.emergencyContactPhone"
              placeholder="请输入紧急联系人电话"
            />
          </Form.Item>
          <Form.Item label="紧急联系人关系" name="emergencyContactRelation">
            <Input
              v-model:value="formModel.emergencyContactRelation"
              placeholder="请输入紧急联系人关系"
            />
          </Form.Item>
          <Form.Item label="头像URL" name="avatarUrl">
            <Input
              v-model:value="formModel.avatarUrl"
              placeholder="请输入头像URL"
            />
          </Form.Item>
          <Form.Item label="备注" name="remark">
            <Input.TextArea
              v-model:value="formModel.remark"
              :rows="2"
              placeholder="请输入备注"
            />
          </Form.Item>
          </div>
        </div>
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



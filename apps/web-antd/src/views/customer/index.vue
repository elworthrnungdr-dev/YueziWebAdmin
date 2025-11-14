<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';

import {
  Button,
  Input,
  message,
  Modal,
  Pagination,
  Select,
  Table,
  TableColumn,
} from 'ant-design-vue';

// 客户数据类型定义
interface Customer {
  t_customerid: string;
  customer_name: string;
  phone_number: string;
  customer_status: '已入住' | '已出所' | '意向';
  payment_status: '已付清' | '未付' | '部分付款';
  t_room_id: string;
  checkin_time: string;
}

// 模拟客户数据
const mockCustomers: Customer[] = [
  {
    t_customerid: '1',
    customer_name: '张三',
    phone_number: '13800138001',
    customer_status: '已入住',
    payment_status: '已付清',
    t_room_id: '101',
    checkin_time: '2024-11-01',
  },
  {
    t_customerid: '2',
    customer_name: '李四',
    phone_number: '13800138004',
    customer_status: '意向',
    payment_status: '未付',
    t_room_id: '',
    checkin_time: '',
  },
];

// 响应式数据
const customers = ref<Customer[]>([]);
const loading = ref(false);
const selectedRowKeys = ref<string[]>([]);

// 搜索条件
const searchForm = reactive({
  customer_name: '',
  phone_number: '',
  t_room_id: '',
  customer_status: '' as '' | '已入住' | '已出所' | '意向',
  payment_status: '' as '' | '已付清' | '未付' | '部分付款',
});

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
});

// 搜索后的客户列表
const filteredCustomers = ref<Customer[]>([]);

// 计算分页后的数据
const paginatedCustomers = computed(() => {
  const start = (pagination.current - 1) * pagination.pageSize;
  const end = start + pagination.pageSize;
  return filteredCustomers.value.slice(start, end);
});

// 执行搜索过滤
const performSearch = () => {
  let filtered = [...customers.value];

  if (searchForm.customer_name) {
    filtered = filtered.filter((customer) =>
      customer.customer_name.includes(searchForm.customer_name),
    );
  }

  if (searchForm.phone_number) {
    filtered = filtered.filter((customer) =>
      customer.phone_number.includes(searchForm.phone_number),
    );
  }

  if (searchForm.t_room_id) {
    filtered = filtered.filter((customer) =>
      customer.t_room_id.includes(searchForm.t_room_id),
    );
  }

  if (searchForm.customer_status) {
    filtered = filtered.filter(
      (customer) => customer.customer_status === searchForm.customer_status,
    );
  }

  if (searchForm.payment_status) {
    filtered = filtered.filter(
      (customer) => customer.payment_status === searchForm.payment_status,
    );
  }

  filteredCustomers.value = filtered;
  pagination.total = filtered.length;
};

// 初始化数据
const loadCustomers = () => {
  loading.value = true;
  // 直接加载模拟数据
  customers.value = [...mockCustomers];
  filteredCustomers.value = [...mockCustomers];
  pagination.total = customers.value.length;
  loading.value = false;
};

// 搜索
const handleSearch = () => {
  pagination.current = 1;
  performSearch();
};

// 重置搜索
const handleReset = () => {
  Object.assign(searchForm, {
    customer_name: '',
    phone_number: '',
    t_room_id: '',
    customer_status: '',
    payment_status: '',
  });
  pagination.current = 1;
  filteredCustomers.value = [...customers.value];
  pagination.total = filteredCustomers.value.length;
};

// 删除客户
const handleDelete = (id: string) => {
  Modal.confirm({
    title: '确认删除',
    content: '确定要删除这个客户吗？',
    okText: '确定',
    cancelText: '取消',
    onOk: () => {
      customers.value = customers.value.filter(
        (customer) => customer.t_customerid !== id,
      );
      message.success('删除成功');
      loadCustomers();
    },
  });
};

// 新增客户
const handleAdd = () => {
  message.info('新增客户功能');
};

// 编辑客户
const handleEdit = (record: Customer) => {
  message.info(`编辑客户: ${record.customer_name}`);
};

// 批量删除
const handleBatchDelete = () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请选择要删除的客户');
    return;
  }

  Modal.confirm({
    title: '确认删除',
    content: `确定要删除选中的 ${selectedRowKeys.value.length} 个客户吗？`,
    okText: '确定',
    cancelText: '取消',
    onOk: () => {
      customers.value = customers.value.filter(
        (customer) => !selectedRowKeys.value.includes(customer.t_customerid),
      );
      selectedRowKeys.value = [];
      message.success('删除成功');
      loadCustomers();
    },
  });
};

// 行选择变化
const onSelectChange = (selectedKeys: (number | string)[]) => {
  selectedRowKeys.value = selectedKeys as string[];
};

// 分页变化
const onPageChange = (page: number, pageSize: number) => {
  pagination.current = page;
  pagination.pageSize = pageSize;
};

// 初始化
onMounted(() => {
  loadCustomers();
});
</script>

<template>
  <div class="p-4">
    <h1 class="mb-4 text-2xl font-bold">客户管理</h1>

    <!-- 搜索模块 -->
    <div class="mb-4 rounded-lg bg-white p-6 shadow">
      <h2 class="mb-4 text-lg font-semibold">搜索条件</h2>
      <div class="flex flex-wrap items-end gap-4">
        <div class="w-32">
          <label class="mb-2 block text-sm font-medium">姓名</label>
          <Input
            v-model:value="searchForm.customer_name"
            placeholder="请输入姓名"
            allow-clear
          />
        </div>
        <div class="w-32">
          <label class="mb-2 block text-sm font-medium">电话</label>
          <Input
            v-model:value="searchForm.phone_number"
            placeholder="请输入电话"
            allow-clear
          />
        </div>
        <div class="w-32">
          <label class="mb-2 block text-sm font-medium">房号</label>
          <Input
            v-model:value="searchForm.t_room_id"
            placeholder="请输入房号"
            allow-clear
          />
        </div>
        <div class="w-24">
          <label class="mb-2 block text-sm font-medium">客户状态</label>
          <Select
            v-model:value="searchForm.customer_status"
            placeholder="客户状态"
            allow-clear
            style="width: 100%"
          >
            <Select.Option value="意向">意向</Select.Option>
            <Select.Option value="已入住">已入住</Select.Option>
            <Select.Option value="已出所">已出所</Select.Option>
          </Select>
        </div>
        <div class="w-32">
          <label class="mb-2 block text-sm font-medium">付款状态</label>
          <Select
            v-model:value="searchForm.payment_status"
            placeholder="付款状态"
            allow-clear
            style="width: 100%"
          >
            <Select.Option value="未付">未付</Select.Option>
            <Select.Option value="部分付款">部分付款</Select.Option>
            <Select.Option value="已付清">已付清</Select.Option>
          </Select>
        </div>
        <div class="flex gap-2">
          <Button type="primary" @click="handleSearch">搜索</Button>
          <Button @click="handleReset">重置</Button>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="mb-4 flex justify-between">
      <div class="flex gap-2">
        <Button type="primary" @click="handleAdd">新增客户</Button>
        <Button
          danger
          @click="handleBatchDelete"
          :disabled="selectedRowKeys.length === 0"
        >
          批量删除
        </Button>
      </div>
      <div>已选择 {{ selectedRowKeys.length }} 项</div>
    </div>

    <!-- 客户列表 -->
    <div class="rounded-lg bg-white p-6 shadow">
      <Table
        :data-source="paginatedCustomers"
        :loading="loading"
        :row-selection="{
          selectedRowKeys,
          onChange: onSelectChange,
          checkStrictly: false,
        }"
        :pagination="false"
        row-key="t_customerid"
      >
        <TableColumn
          title="客户ID"
          data-index="t_customerid"
          key="t_customerid"
        />
        <TableColumn
          title="姓名"
          data-index="customer_name"
          key="customer_name"
        />
        <TableColumn
          title="电话"
          data-index="phone_number"
          key="phone_number"
        />
        <TableColumn
          title="客户状态"
          data-index="customer_status"
          key="customer_status"
        />
        <TableColumn
          title="付款状态"
          data-index="payment_status"
          key="payment_status"
        />
        <TableColumn title="房号" data-index="t_room_id" key="t_room_id" />
        <TableColumn
          title="入住时间"
          data-index="checkin_time"
          key="checkin_time"
        />
        <TableColumn title="操作" key="action">
          <template #default="{ record }">
            <Button type="link" size="small" @click="handleEdit(record)">
              编辑
            </Button>
            <Button
              type="link"
              size="small"
              danger
              @click="handleDelete(record.t_customerid)"
            >
              删除
            </Button>
          </template>
        </TableColumn>
      </Table>

      <!-- 分页 -->
      <div class="mt-4 flex justify-end">
        <Pagination
          v-model:current="pagination.current"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          show-size-changer
          show-quick-jumper
          @change="onPageChange"
        />
      </div>
    </div>
  </div>
</template>

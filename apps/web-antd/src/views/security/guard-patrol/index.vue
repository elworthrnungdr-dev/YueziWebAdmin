<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import {
  getSecurityPatrolListApi,
  createSecurityPatrolApi,
  getSecurityPatrolDetailApi,
  updateSecurityPatrolApi,
  deleteSecurityPatrolApi,
  type SecurityPatrolItem,
  type SecurityPatrolListParams,
  type CreateSecurityPatrolParams,
  type UpdateSecurityPatrolParams,
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
const dataSource = ref<SecurityPatrolItem[]>([]);
const total = ref(0);

const queryForm = ref<SecurityPatrolListParams>({
  SecurityName: undefined,
  SecurityId: undefined,
  PatrolDateStart: undefined,
  PatrolDateEnd: undefined,
  CreatedAtStart: undefined,
  CreatedAtEnd: undefined,
  PageIndex: 1,
  PageSize: 10,
  OrderBy: undefined,
  IsAsc: true,
});

const shiftOptions = [
  { label: '白班', value: 1 },
  { label: '中班', value: 2 },
  { label: '夜班', value: 3 },
];

const patrolStatusOptions = [
  { label: '未开始', value: 1 },
  { label: '进行中', value: 2 },
  { label: '已完成', value: 3 },
];

const columns = [
  {
    title: '巡逻日期',
    dataIndex: 'patrolDate',
    key: 'patrolDate',
    width: 150,
  },
  {
    title: '班次',
    dataIndex: 'shiftText',
    key: 'shiftText',
    width: 100,
  },
  {
    title: '保安ID',
    dataIndex: 'securityId',
    key: 'securityId',
    width: 140,
  },
  {
    title: '保安姓名',
    dataIndex: 'securityName',
    key: 'securityName',
    width: 140,
  },
  {
    title: '巡逻线路',
    dataIndex: 'selectedRoutes',
    key: 'selectedRoutes',
    width: 220,
    ellipsis: true,
  },
  {
    title: '开始时间',
    dataIndex: 'startTime',
    key: 'startTime',
    width: 160,
  },
  {
    title: '结束时间',
    dataIndex: 'endTime',
    key: 'endTime',
    width: 160,
  },
  {
    title: '总时长(分钟)',
    dataIndex: 'totalDuration',
    key: 'totalDuration',
    width: 130,
  },
  {
    title: '状态',
    dataIndex: 'patrolStatus',
    key: 'patrolStatus',
    width: 110,
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
    width: 180,
    fixed: 'right',
    align: 'center',
  },
];

async function fetchList() {
  try {
    loading.value = true;
    const params: SecurityPatrolListParams = {
      ...queryForm.value,
      PatrolDateStart: queryForm.value.PatrolDateStart
        ? dayjs(queryForm.value.PatrolDateStart).toISOString()
        : undefined,
      PatrolDateEnd: queryForm.value.PatrolDateEnd
        ? dayjs(queryForm.value.PatrolDateEnd).toISOString()
        : undefined,
      CreatedAtStart: queryForm.value.CreatedAtStart
        ? dayjs(queryForm.value.CreatedAtStart).toISOString()
        : undefined,
      CreatedAtEnd: queryForm.value.CreatedAtEnd
        ? dayjs(queryForm.value.CreatedAtEnd).toISOString()
        : undefined,
    };
    const result = await getSecurityPatrolListApi(params);
    dataSource.value = result.items || [];
    total.value = result.total || 0;
  } catch (error: any) {
    // 错误由全局拦截器统一处理
  } finally {
    loading.value = false;
  }
}

function handleReset() {
  queryForm.value = {
    SecurityName: undefined,
    SecurityId: undefined,
    PatrolDateStart: undefined,
    PatrolDateEnd: undefined,
    CreatedAtStart: undefined,
    CreatedAtEnd: undefined,
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

// 创建 / 编辑弹窗
const createModalVisible = ref(false);
const submitting = ref(false);
const isEditMode = ref(false);
const editingId = ref<string>('');
const formRef = ref<FormInstance>();

// 巡逻线路项接口
interface RouteItem {
  route: string;
  time: any; // dayjs 对象或 undefined
}

// 使用 any 以便日期字段用 dayjs 对象
const formModel = ref<any>({
  patrolDate: dayjs(),
  shift: 1,
  securityId: '',
  routeItems: [] as RouteItem[],
  startTime: undefined as any,
  endTime: undefined as any,
  patrolStatus: 1,
  remark: '',
});

const formRules = {
  patrolDate: [{ required: true, message: '请选择巡逻日期' }],
  shift: [{ required: true, message: '请选择班次' }],
  securityId: [{ required: true, message: '请输入保安ID' }],
  patrolStatus: [{ required: true, message: '请选择状态' }],
};

function resetForm() {
  formModel.value = {
    patrolDate: dayjs(),
    shift: 1,
    securityId: '',
    routeItems: [{ route: '', time: undefined }] as RouteItem[],
    startTime: undefined,
    endTime: undefined,
    patrolStatus: 1,
    remark: '',
  };
  formRef.value?.resetFields();
}

// 添加一组巡逻线路
function addRouteItem() {
  formModel.value.routeItems.push({
    route: '',
    time: undefined,
  });
}

// 删除一组巡逻线路
function removeRouteItem(index: number) {
  if (formModel.value.routeItems.length > 1) {
    formModel.value.routeItems.splice(index, 1);
  } else {
    message.warning('至少需要保留一组巡逻线路');
  }
}

function openCreateModal() {
  isEditMode.value = false;
  editingId.value = '';
  createModalVisible.value = true;
  resetForm();
}

async function openEditModal(record: SecurityPatrolItem) {
  isEditMode.value = true;
  editingId.value = record.id;
  createModalVisible.value = true;
  resetForm();

  try {
    const detail = await getSecurityPatrolDetailApi(record.id);
    
    // 解析 selectedRoutes JSON 字符串
    let routeItems: RouteItem[] = [{ route: '', time: undefined }];
    if (detail.selectedRoutes) {
      try {
        const parsed = JSON.parse(detail.selectedRoutes);
        if (Array.isArray(parsed)) {
          // 如果解析出来是数组，假设是旧格式的字符串数组
          routeItems = parsed.map((item: any) => {
            if (typeof item === 'string') {
              return { route: item, time: undefined };
            } else if (item && typeof item === 'object') {
              return {
                route: item.route || '',
                time: item.time ? dayjs(item.time) : undefined,
              };
            }
            return { route: '', time: undefined };
          });
        } else if (parsed && typeof parsed === 'object') {
          // 如果是对象，尝试转换为数组
          routeItems = Object.keys(parsed).map((key) => ({
            route: key,
            time: parsed[key] ? dayjs(parsed[key]) : undefined,
          }));
        }
      } catch (e) {
        // 如果解析失败，使用原始字符串作为第一组的路由
        routeItems = [{ route: detail.selectedRoutes, time: undefined }];
      }
    }
    
    // 确保至少有一组
    if (routeItems.length === 0) {
      routeItems = [{ route: '', time: undefined }];
    }
    
    formModel.value = {
      patrolDate: detail.patrolDate ? dayjs(detail.patrolDate) : dayjs(),
      shift: detail.shift ?? 1,
      securityId: detail.securityId || '',
      routeItems: routeItems,
      startTime: detail.startTime ? dayjs(detail.startTime) : undefined,
      endTime: detail.endTime ? dayjs(detail.endTime) : undefined,
      patrolStatus: detail.patrolStatus ?? 1,
      remark: detail.remark || '',
    };
  } catch (error: any) {
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
    
    // 验证巡逻线路项
    const routeItems = formModel.value.routeItems || [];
    if (routeItems.length === 0 || routeItems.every((item: RouteItem) => !item.route)) {
      message.error('请至少输入一组巡逻线路');
      return;
    }
    
    submitting.value = true;

// 将路由项数组转换为 JSON 字符串
// 格式：[{ route: "线路1", time: "2025-12-18T08:00:00.000Z" }, ...]
    const routesData = routeItems
      .filter((item: RouteItem) => item.route && item.route.trim())
      .map((item: RouteItem) => ({
        route: item.route.trim(),
        time: item.time ? dayjs(item.time).toISOString() : undefined,
      }));
    
    const selectedRoutes = JSON.stringify(routesData);

    const baseData: CreateSecurityPatrolParams = {
      patrolDate: dayjs(formModel.value.patrolDate).toISOString(),
      shift: formModel.value.shift,
      securityId: formModel.value.securityId,
      selectedRoutes: selectedRoutes,
      startTime: formModel.value.startTime
        ? dayjs(formModel.value.startTime).toISOString()
        : undefined,
      endTime: formModel.value.endTime
        ? dayjs(formModel.value.endTime).toISOString()
        : undefined,
      patrolStatus: formModel.value.patrolStatus,
      remark: formModel.value.remark,
    };

    if (isEditMode.value) {
      const updateData: UpdateSecurityPatrolParams = {
        ...baseData,
        id: editingId.value,
      };
      await updateSecurityPatrolApi(updateData);
      message.success('更新保安巡更记录成功');
    } else {
      await createSecurityPatrolApi(baseData);
      message.success('创建保安巡更记录成功');
    }
    closeCreateModal();
    fetchList();
  } catch (error: any) {
    if (error?.errorFields) {
      return;
    }
    // 其它错误由全局拦截器处理
    return;
  } finally {
    submitting.value = false;
  }
}

function handleDelete(record: SecurityPatrolItem) {
  Modal.confirm({
    title: '确认删除',
    content: h('div', { style: { fontSize: '14px', lineHeight: '1.6' } }, [
      h('p', {
        style: { marginBottom: '8px', color: '#ff4d4f', fontWeight: 500 },
      }, '⚠️ 警告'),
      h('p', { style: { margin: 0 } }, '确定要删除该保安巡更记录吗？'),
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
        await deleteSecurityPatrolApi(record.id);
        message.success('删除保安巡更记录成功');
        fetchList();
      } catch (error: any) {
        throw error;
      } finally {
        loading.value = false;
      }
    },
  });
}

onMounted(() => {
  fetchList();
});
</script>

<template>
  <div class="p-4">
    <!-- 第一行：创建按钮 -->
    <div class="mb-3">
      <Button type="primary" class="cursor-pointer" @click="openCreateModal">
        创建保安巡更
      </Button>
    </div>

    <!-- 第二行：搜索条件 -->
    <div class="mb-3 flex justify-between">
      <div />
      <Space>
        <Input
          v-model:value="queryForm.SecurityName"
          placeholder="保安姓名"
          allow-clear
          style="width: 160px"
        />
        <Input
          v-model:value="queryForm.SecurityId"
          placeholder="保安ID"
          allow-clear
          style="width: 160px"
        />
        <DatePicker
          v-model:value="queryForm.PatrolDateStart"
          placeholder="巡逻日期开始"
          style="width: 160px"
        />
        <DatePicker
          v-model:value="queryForm.PatrolDateEnd"
          placeholder="巡逻日期结束"
          style="width: 160px"
        />
        <DatePicker
          v-model:value="queryForm.CreatedAtStart"
          placeholder="创建时间开始"
          style="width: 160px"
        />
        <DatePicker
          v-model:value="queryForm.CreatedAtEnd"
          placeholder="创建时间结束"
          style="width: 160px"
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
      :scroll="{ x: 1400 }"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'patrolDate'">
          <span v-if="record.patrolDate">
            {{ dayjs(record.patrolDate).format('YYYY-MM-DD') }}
          </span>
          <span v-else>—</span>
        </template>
        <template v-else-if="column.key === 'shiftText'">
          <span>
            {{
              record.shiftText ||
              (record.shift === 1
                ? '白班'
                : record.shift === 2
                ? '中班'
                : record.shift === 3
                ? '夜班'
                : '未知')
            }}
          </span>
        </template>
        <template v-else-if="column.key === 'startTime'">
          <span v-if="record.startTime">
            {{ dayjs(record.startTime).format('YYYY-MM-DD HH:mm:ss') }}
          </span>
          <span v-else>—</span>
        </template>
        <template v-else-if="column.key === 'endTime'">
          <span v-if="record.endTime">
            {{ dayjs(record.endTime).format('YYYY-MM-DD HH:mm:ss') }}
          </span>
          <span v-else>—</span>
        </template>
        <template v-else-if="column.key === 'totalDuration'">
          <span v-if="record.totalDuration !== null && record.totalDuration !== undefined">
            {{ record.totalDuration }}
          </span>
          <span v-else>—</span>
        </template>
        <template v-else-if="column.key === 'patrolStatus'">
          <span>
            {{
              record.patrolStatus === 1
                ? '未开始'
                : record.patrolStatus === 2
                ? '进行中'
                : record.patrolStatus === 3
                ? '已完成'
                : '未知'
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

    <!-- 创建 / 编辑保安巡更弹窗 -->
    <Modal
      v-model:open="createModalVisible"
      :title="isEditMode ? '更新保安巡更' : '创建保安巡更'"
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
          <Form.Item label="巡逻日期" name="patrolDate">
            <DatePicker
              v-model:value="formModel.patrolDate"
              style="width: 100%"
              placeholder="请选择巡逻日期"
            />
          </Form.Item>
          <Form.Item label="班次" name="shift">
            <Select
              v-model:value="formModel.shift"
              :options="shiftOptions"
              placeholder="请选择班次"
            />
          </Form.Item>
          <Form.Item label="保安ID" name="securityId">
            <Input
              v-model:value="formModel.securityId"
              placeholder="请输入保安ID"
            />
          </Form.Item>
          <Form.Item label="巡逻状态" name="patrolStatus">
            <Select
              v-model:value="formModel.patrolStatus"
              :options="patrolStatusOptions"
              placeholder="请选择巡逻状态"
            />
          </Form.Item>
          <Form.Item label="开始时间" name="startTime">
            <DatePicker
              v-model:value="formModel.startTime"
              show-time
              style="width: 100%"
              placeholder="请选择开始时间"
            />
          </Form.Item>
          <Form.Item label="结束时间" name="endTime">
            <DatePicker
              v-model:value="formModel.endTime"
              show-time
              style="width: 100%"
              placeholder="请选择结束时间"
            />
          </Form.Item>
        </div>
        <Form.Item label="巡逻线路">
          <div>
            <div
              v-for="(item, index) in formModel.routeItems"
              :key="index"
              class="mb-2"
              style="display: flex; align-items: center; gap: 8px"
            >
              <Input
                v-model:value="item.route"
                placeholder="请输入线路"
                style="flex: 1"
              />
              <DatePicker
                v-model:value="item.time"
                show-time
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DD HH:mm:ss"
                placeholder="请选择日期时间"
                style="width: 220px"
              />
              <Button
                v-if="formModel.routeItems.length > 1"
                type="text"
                danger
                @click="removeRouteItem(index)"
              >
                删除
              </Button>
            </div>
            <Button
              type="dashed"
              style="width: 100%"
              @click="addRouteItem"
            >
              + 添加一组
            </Button>
          </div>
        </Form.Item>
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





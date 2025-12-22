<script lang="ts" setup>
import { onMounted, ref, computed } from 'vue';

import {
  getWorkflowConditionTemplateListApi,
  createWorkflowConditionTemplateApi,
  getWorkflowConditionTemplateDetailApi,
  updateWorkflowConditionTemplateApi,
  deleteWorkflowConditionTemplateApi,
  type WorkflowConditionTemplateItem,
  type WorkflowConditionTemplateListParams,
  type CreateWorkflowConditionTemplateParams,
  type UpdateWorkflowConditionTemplateParams,
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
  Checkbox,
  Radio,
  Divider,
} from 'ant-design-vue';
import type { FormInstance } from 'ant-design-vue';
import { h } from 'vue';

// 条件项接口
interface ConditionItem {
  id: string; // 唯一ID
  templateId: string; // 条件模板ID
  templateCode: string; // 条件编码
  templateName: string; // 条件名称
  enabled: boolean; // 是否启用
  value: any; // 条件值
  templateConfig: any; // 模板配置（JSON结构）
}

// 条件模板配置接口
interface ConditionTemplateConfig {
  type: string; // 条件类型：amount（金额）、category（品类）、supplier（供应商）等
  fields: Array<{
    name: string; // 字段名
    label: string; // 字段标签
    type: string; // 字段类型：number、select、multiselect等
    options?: Array<{ label: string; value: any }>; // 选项（用于select类型）
    min?: number; // 最小值（用于number类型）
    max?: number; // 最大值（用于number类型）
    unit?: string; // 单位（如：元）
  }>;
}

const loading = ref(false);
const dataSource = ref<WorkflowConditionTemplateItem[]>([]);
const total = ref(0);

const queryForm = ref<WorkflowConditionTemplateListParams>({
  ConditionCode: undefined,
  ConditionName: undefined,
  BusinessType: undefined,
  PageIndex: 1,
  PageSize: 10,
  OrderBy: undefined,
  IsAsc: true,
});

const columns = [
  {
    title: '条件编码',
    dataIndex: 'conditionCode',
    key: 'conditionCode',
    width: 150,
  },
  {
    title: '条件名称',
    dataIndex: 'conditionName',
    key: 'conditionName',
    width: 150,
  },
  {
    title: '业务类型',
    dataIndex: 'businessType',
    key: 'businessType',
    width: 150,
  },
  {
    title: '条件模板',
    dataIndex: 'conditionTemplate',
    key: 'conditionTemplate',
    width: 200,
    ellipsis: true,
  },
  {
    title: '描述',
    dataIndex: 'description',
    key: 'description',
    width: 200,
    ellipsis: true,
  },
  {
    title: '排序',
    dataIndex: 'sortOrder',
    key: 'sortOrder',
    width: 100,
  },
  {
    title: '启用状态',
    dataIndex: 'isActive',
    key: 'isActive',
    width: 100,
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
    const params: WorkflowConditionTemplateListParams = {
      ...queryForm.value,
    };
    const res = await getWorkflowConditionTemplateListApi(params);
    dataSource.value = res.items;
    total.value = res.total;
  } finally {
    loading.value = false;
  }
}

function handleReset() {
  queryForm.value = {
    ConditionCode: undefined,
    ConditionName: undefined,
    BusinessType: undefined,
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
  fetchAvailableTemplates();
});

// 动态条件设置相关
const availableTemplates = ref<WorkflowConditionTemplateItem[]>([]);
const conditionItems = ref<ConditionItem[]>([]);
const conditionRelation = ref<'all' | 'any'>('all'); // 条件关系：all=满足所有条件，any=满足任一条件
let conditionIdCounter = 0;

// 获取可用的条件模板列表（用于选择）
async function fetchAvailableTemplates() {
  try {
    const res = await getWorkflowConditionTemplateListApi({
      PageIndex: 1,
      PageSize: 100, // 获取更多模板供选择
      IsAsc: true,
    });
    availableTemplates.value = res.items.filter((item) => item.isActive === 1); // 只显示启用的模板
  } catch (error) {
    console.error('获取条件模板列表失败', error);
  }
}

// 生成唯一ID
function generateConditionId(): string {
  return `condition_${Date.now()}_${++conditionIdCounter}`;
}

// 添加条件
function addCondition() {
  const newCondition: ConditionItem = {
    id: generateConditionId(),
    templateId: '',
    templateCode: '',
    templateName: '',
    enabled: false,
    value: {},
    templateConfig: null,
  };
  conditionItems.value.push(newCondition);
}

// 删除条件
function removeCondition(index: number) {
  conditionItems.value.splice(index, 1);
}

// 选择条件模板
function onTemplateSelect(index: number, templateId: string) {
  const template = availableTemplates.value.find((t) => t.id === templateId);
  if (!template) return;

  const condition = conditionItems.value[index];
  condition.templateId = template.id;
  condition.templateCode = template.conditionCode;
  condition.templateName = template.conditionName;
  condition.enabled = true;

  // 解析模板配置
  try {
    condition.templateConfig = JSON.parse(template.conditionTemplate);
    // 初始化值
    condition.value = initializeConditionValue(condition.templateConfig);
  } catch (error) {
    console.error('解析条件模板配置失败', error);
    message.error('条件模板配置格式错误');
  }
}

// 初始化条件值
function initializeConditionValue(config: ConditionTemplateConfig): any {
  const value: any = {};
  if (config.type === 'amount') {
    // 金额类型使用 min 和 max
    value.min = 0;
    value.max = 0;
  } else if (config.fields) {
    config.fields.forEach((field) => {
      if (field.type === 'number') {
        value[field.name] = field.min || 0;
      } else if (field.type === 'multiselect') {
        value[field.name] = [];
      } else if (field.type === 'select') {
        value[field.name] = undefined;
      }
    });
  }
  return value;
}

// 格式化条件数据为 ruleCondition 数组
function formatConditionsToRuleCondition(): string {
  const ruleConditions = conditionItems.value
    .filter((item) => item.enabled && item.templateCode)
    .map((item) => ({
      condition_code: item.templateCode,
      value: item.value,
    }));

  const result = {
    relation: conditionRelation.value, // 'all' 或 'any'
    conditions: ruleConditions,
  };

  return JSON.stringify(result);
}

// 从 ruleCondition 解析条件数据
function parseRuleConditionFromJson(jsonStr: string) {
  try {
    if (!jsonStr) {
      conditionItems.value = [];
      conditionRelation.value = 'all';
      return;
    }

    const data = JSON.parse(jsonStr);
    conditionRelation.value = data.relation || 'all';

    if (data.conditions && Array.isArray(data.conditions)) {
      conditionItems.value = data.conditions.map((cond: any) => {
        const template = availableTemplates.value.find(
          (t) => t.conditionCode === cond.condition_code,
        );
        let templateConfig = null;
        if (template) {
          try {
            templateConfig = JSON.parse(template.conditionTemplate);
          } catch (e) {
            console.error('解析模板配置失败', e);
          }
        }

        return {
          id: generateConditionId(),
          templateId: template?.id || '',
          templateCode: cond.condition_code,
          templateName: template?.conditionName || '',
          enabled: true,
          value: cond.value || {},
          templateConfig,
        };
      });
    } else {
      conditionItems.value = [];
    }
  } catch (error) {
    console.error('解析条件数据失败', error);
    conditionItems.value = [];
    conditionRelation.value = 'all';
  }
}

// 创建 / 编辑弹窗
const createModalVisible = ref(false);
const isEditMode = ref(false);
const submitting = ref(false);
const formRef = ref<FormInstance | null>(null);
const editingId = ref('');

const formModel = ref<CreateWorkflowConditionTemplateParams>({
  businessType: '',
  conditionName: '',
  conditionCode: '',
  conditionTemplate: '',
  description: '',
  sortOrder: undefined,
  isActive: undefined,
});

const formRules = {
  businessType: [{ required: true, message: '请输入业务类型' }],
  conditionName: [{ required: true, message: '请输入条件名称' }],
  conditionCode: [{ required: true, message: '请输入条件编码' }],
};

function openCreateModal() {
  isEditMode.value = false;
  editingId.value = '';
  conditionItems.value = [];
  conditionRelation.value = 'all';
  formModel.value = {
    businessType: '',
    conditionName: '',
    conditionCode: '',
    conditionTemplate: '',
    description: '',
    sortOrder: undefined,
    isActive: undefined,
  };
  createModalVisible.value = true;
}

async function openEditModal(record: WorkflowConditionTemplateItem) {
  isEditMode.value = true;
  editingId.value = record.id;
  try {
    loading.value = true;
    const detail = await getWorkflowConditionTemplateDetailApi(record.id);
    formModel.value = {
      businessType: detail.businessType || '',
      conditionName: detail.conditionName || '',
      conditionCode: detail.conditionCode || '',
      conditionTemplate: detail.conditionTemplate || '',
      description: detail.description || '',
      sortOrder: detail.sortOrder,
      isActive: detail.isActive,
    };
    // 解析条件数据
    parseRuleConditionFromJson(detail.conditionTemplate || '');
    createModalVisible.value = true;
  } catch {
    // 由全局拦截器处理错误
  } finally {
    loading.value = false;
  }
}

function closeCreateModal() {
  createModalVisible.value = false;
  formRef.value?.resetFields();
}

async function handleSubmit() {
  try {
    await formRef.value?.validate();
    
    // 验证至少有一个启用的条件
    const enabledConditions = conditionItems.value.filter((item) => item.enabled && item.templateCode);
    if (enabledConditions.length === 0) {
      message.warning('请至少添加并启用一个条件');
      return;
    }

    submitting.value = true;
    
    // 格式化条件数据
    const ruleConditionJson = formatConditionsToRuleCondition();
    
    const params: CreateWorkflowConditionTemplateParams = {
      ...formModel.value,
      conditionTemplate: ruleConditionJson,
    };

    if (isEditMode.value) {
      await updateWorkflowConditionTemplateApi({
        ...params,
        id: editingId.value,
      } as UpdateWorkflowConditionTemplateParams);
      message.success('更新条件模板成功');
    } else {
      await createWorkflowConditionTemplateApi(params);
      message.success('创建条件模板成功');
    }
    closeCreateModal();
    fetchList();
  } catch (error: any) {
    if (error?.errorFields) {
      return; // 表单验证错误
    }
    // 由全局拦截器处理其他错误
  } finally {
    submitting.value = false;
  }
}

function handleDelete(record: WorkflowConditionTemplateItem) {
  Modal.confirm({
    title: '确认删除',
    content: h('div', { style: { fontSize: '14px', lineHeight: '1.6' } }, [
      h('p', {
        style: { marginBottom: '8px', color: '#ff4d4f', fontWeight: 500 },
      }, '⚠️ 警告'),
      h('p', { style: { margin: 0 } }, '确定要删除该条件模板吗？'),
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
        await deleteWorkflowConditionTemplateApi(record.id);
        message.success('删除条件模板成功');
        fetchList();
      } catch {
        throw new Error();
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
        条件模板
      </Button>
      <Space wrap>
        <Input
          v-model:value="queryForm.ConditionCode"
          placeholder="条件编码"
          style="width: 150px"
          allow-clear
        />
        <Input
          v-model:value="queryForm.ConditionName"
          placeholder="条件名称"
          style="width: 150px"
          allow-clear
        />
        <Input
          v-model:value="queryForm.BusinessType"
          placeholder="业务类型"
          style="width: 150px"
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
      :scroll="{ x: 1200 }"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'description'">
          <span>{{ record.description || '—' }}</span>
        </template>
        <template v-else-if="column.key === 'sortOrder'">
          <span>{{ record.sortOrder ?? '—' }}</span>
        </template>
        <template v-else-if="column.key === 'isActive'">
          <span>
            {{ record.isActive === 1 ? '启用' : record.isActive === 2 ? '禁用' : '—' }}
          </span>
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

    <!-- 创建 / 编辑条件模板弹窗 -->
    <Modal
      v-model:open="createModalVisible"
      :title="isEditMode ? '更新条件模板' : '创建条件模板'"
      width="600px"
      :confirm-loading="submitting"
      @ok="handleSubmit"
      @cancel="closeCreateModal"
      destroy-on-close
    >
      <div style="max-height: 600px; overflow-y: auto">
        <Form
          ref="formRef"
          :model="formModel"
          :rules="formRules"
          layout="vertical"
        >
          <div class="grid grid-cols-3 gap-4">
            <Form.Item label="业务类型" name="businessType">
              <Input
                v-model:value="formModel.businessType"
                placeholder="请输入业务类型"
                style="width: calc(100% - 20px)"
              />
            </Form.Item>
            <Form.Item label="条件名称" name="conditionName" class="col-span-2">
              <Input
                v-model:value="formModel.conditionName"
                placeholder="请输入条件名称"
                style="width: calc(100% - 20px)"
              />
            </Form.Item>
            <Form.Item label="条件编码" name="conditionCode">
              <Input
                v-model:value="formModel.conditionCode"
                placeholder="请输入条件编码"
                style="width: calc(100% - 20px)"
              />
            </Form.Item>
            <Form.Item label="排序" name="sortOrder">
              <InputNumber
                v-model:value="formModel.sortOrder"
                :min="0"
                style="width: calc(100% - 20px)"
                placeholder="请输入排序"
              />
            </Form.Item>
            <Form.Item label="启用状态" name="isActive">
              <Select
                v-model:value="formModel.isActive"
                placeholder="请选择启用状态"
                allow-clear
                style="width: calc(100% - 20px)"
              >
                <Select.Option :value="1">启用</Select.Option>
                <Select.Option :value="2">禁用</Select.Option>
              </Select>
            </Form.Item>
          </div>
          <!-- 动态条件设置区域 -->
          <div style="border: 1px solid #d9d9d9; border-radius: 4px; padding: 16px; margin-bottom: 16px">
            <div style="margin-bottom: 16px; font-weight: 500; color: #262626">
              在另一个接口选择规则条件时：当满足以下条件时，启动此工作流
            </div>
            
            <!-- 条件列表 -->
            <div v-if="conditionItems.length > 0" style="margin-bottom: 16px">
              <div
                v-for="(condition, index) in conditionItems"
                :key="condition.id"
                style="margin-bottom: 16px; padding: 12px; background: #fafafa; border-radius: 4px"
              >
                <div style="display: flex; align-items: center; margin-bottom: 12px">
                  <Checkbox
                    v-model:checked="condition.enabled"
                    style="margin-right: 8px"
                  />
                  <Select
                    v-model:value="condition.templateId"
                    placeholder="请选择条件模板"
                    style="flex: 1; margin-right: 8px"
                    @change="onTemplateSelect(index, condition.templateId)"
                  >
                    <Select.Option
                      v-for="template in availableTemplates"
                      :key="template.id"
                      :value="template.id"
                    >
                      {{ template.conditionName }}
                    </Select.Option>
                  </Select>
                  <Button
                    type="link"
                    danger
                    size="small"
                    @click="removeCondition(index)"
                  >
                    删除
                  </Button>
                </div>
                
                <!-- 动态表单字段 -->
                <div
                  v-if="condition.enabled && condition.templateConfig"
                  style="margin-left: 24px; padding-left: 12px; border-left: 2px solid #1890ff"
                >
                  <template
                    v-for="field in condition.templateConfig.fields"
                    :key="field.name"
                  >
                    <!-- 金额类型：最小金额和最大金额 -->
                    <div
                      v-if="condition.templateConfig.type === 'amount' && field.type === 'number'"
                      style="margin-bottom: 12px"
                    >
                      <div style="margin-bottom: 8px; color: #595959">
                        {{ field.label }}
                      </div>
                      <Space>
                        <span>最小{{ field.unit || '金额' }}：</span>
                        <InputNumber
                          v-model:value="condition.value.min"
                          :min="field.min"
                          :max="field.max"
                          :precision="0"
                          style="width: 150px"
                          :placeholder="`请输入最小${field.unit || '金额'}`"
                        />
                        <span>元</span>
                        <span style="margin: 0 8px">最大{{ field.unit || '金额' }}：</span>
                        <InputNumber
                          v-model:value="condition.value.max"
                          :min="field.min"
                          :max="field.max"
                          :precision="0"
                          style="width: 150px"
                          :placeholder="`请输入最大${field.unit || '金额'}`"
                        />
                        <span>元</span>
                      </Space>
                      <div style="margin-top: 4px; color: #8c8c8c; font-size: 12px">
                        （表示：{{ condition.value.min || 0 }} ≤ {{ field.unit || '金额' }} ≤ {{ condition.value.max || 0 }}）
                      </div>
                    </div>
                    
                    <!-- 多选类型：品类等 -->
                    <div
                      v-else-if="field.type === 'multiselect'"
                      style="margin-bottom: 12px"
                    >
                      <div style="margin-bottom: 8px; color: #595959">
                        {{ field.label }}
                      </div>
                      <Select
                        v-model:value="condition.value[field.name]"
                        mode="multiple"
                        style="width: 100%"
                        :placeholder="`请选择${field.label}`"
                      >
                        <Select.Option
                          v-for="option in field.options"
                          :key="option.value"
                          :value="option.value"
                        >
                          {{ option.label }}
                        </Select.Option>
                      </Select>
                    </div>
                    
                    <!-- 单选类型：供应商类型等 -->
                    <div
                      v-else-if="field.type === 'select'"
                      style="margin-bottom: 12px"
                    >
                      <div style="margin-bottom: 8px; color: #595959">
                        {{ field.label }}
                      </div>
                      <Select
                        v-model:value="condition.value[field.name]"
                        style="width: 100%"
                        :placeholder="`请选择${field.label}`"
                      >
                        <Select.Option
                          v-for="option in field.options"
                          :key="option.value"
                          :value="option.value"
                        >
                          {{ option.label }}
                        </Select.Option>
                      </Select>
                    </div>
                  </template>
                </div>
              </div>
            </div>
            
            <!-- 添加更多条件按钮 -->
            <Button
              type="dashed"
              block
              @click="addCondition"
              style="margin-bottom: 16px"
            >
              + 添加更多条件
            </Button>
            
            <!-- 条件关系选择 -->
            <Divider style="margin: 16px 0" />
            <div>
              <div style="margin-bottom: 8px; color: #595959; font-weight: 500">
                条件关系：
              </div>
              <Radio.Group v-model:value="conditionRelation">
                <Radio value="all">满足所有条件</Radio>
                <Radio value="any">满足任一条件</Radio>
              </Radio.Group>
            </div>
          </div>
          <Form.Item label="描述" name="description">
            <Input.TextArea
              v-model:value="formModel.description"
              :rows="3"
              placeholder="请输入描述"
              style="width: calc(100% - 20px)"
            />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  </div>
</template>


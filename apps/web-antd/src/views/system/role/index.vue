<script lang="ts" setup>
import { computed, h, onMounted, ref } from 'vue';

import {
  getRoleListApi,
  createRoleApi,
  getRoleDetailApi,
  updateRoleApi,
  deleteRoleApi,
  getRolePermissionsApi,
  saveRolePermissionsApi,
  type RoleItem,
  type RoleListParams,
  type CreateRoleParams,
  type UpdateRoleParams,
} from '#/api';

import { getMenuListApi, type MenuListItem } from '#/api';

import {
  Button,
  Checkbox,
  Form,
  Input,
  message,
  Modal,
  Radio,
  Select,
  Space,
  Table,
  Tree,
} from 'ant-design-vue';
import type { FormInstance } from 'ant-design-vue';

const loading = ref(false);
const dataSource = ref<RoleItem[]>([]);
const total = ref(0);

const queryForm = ref<RoleListParams>({
  RoleName: undefined,
  Status: undefined,
  PageIndex: 1,
  PageSize: 10,
  OrderBy: undefined,
  IsAsc: true,
});

const columns = [
  {
    title: '角色名称',
    dataIndex: 'roleName',
    key: 'roleName',
    width: 150,
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
  },
  {
    title: '排序',
    dataIndex: 'sort',
    key: 'sort',
    width: 100,
  },
  {
    title: '备注',
    dataIndex: 'remark',
    key: 'remark',
    width: 200,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
    width: 180,
  },
  {
    title: '操作',
    key: 'actions',
    width: 140,
    fixed: 'right',
  },
];

async function fetchList() {
  loading.value = true;
  try {
    const { items, total: t } = await getRoleListApi(queryForm.value);
    dataSource.value = items;
    total.value = t;
  } catch (error: any) {
    const errMsg =
      error?.response?.data?.message || error?.message || '获取角色列表失败';
    message.error(errMsg);
  } finally {
    loading.value = false;
  }
}

function handleReset() {
  queryForm.value.RoleName = undefined;
  queryForm.value.Status = undefined;
  queryForm.value.PageIndex = 1;
  queryForm.value.PageSize = 10;
  queryForm.value.OrderBy = undefined;
  queryForm.value.IsAsc = true;
  fetchList();
}

function handleTableChange(pagination: any) {
  queryForm.value.PageIndex = pagination.current;
  queryForm.value.PageSize = pagination.pageSize;
  fetchList();
}

// 添加/编辑角色弹窗相关
const createModalVisible = ref(false);
const isEditMode = ref(false);
const editingRoleId = ref<string>('');
const submitting = ref(false);
const formRef = ref<FormInstance>();
const formModel = ref<CreateRoleParams>({
  roleName: '',
  status: 1,
  remark: '',
  sort: 0,
});

const formRules = {
  roleName: [{ required: true, message: '请输入角色名称' }],
  status: [{ required: true, message: '请选择状态' }],
};

function resetForm() {
  formModel.value = {
    roleName: '',
    status: 1,
    remark: '',
    sort: 0,
  };
  formRef.value?.resetFields();
}

function openCreateModal() {
  isEditMode.value = false;
  editingRoleId.value = '';
  createModalVisible.value = true;
  resetForm();
}

function closeCreateModal() {
  createModalVisible.value = false;
  resetForm();
}

async function openEditModal(record: RoleItem) {
  isEditMode.value = true;
  editingRoleId.value = record.id;
  createModalVisible.value = true;
  
  try {
    loading.value = true;
    const detail = await getRoleDetailApi(record.id);
    
    // 填充表单数据
    formModel.value = {
      roleName: detail.roleName || '',
      status: detail.status ?? 1,
      remark: detail.remark || '',
      sort: detail.sort ?? 0,
    };
  } catch (error: any) {
    const errMsg =
      error?.response?.data?.message || error?.message || '获取角色详情失败';
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
      const updateData: UpdateRoleParams = {
        ...values,
        id: editingRoleId.value,
      };
      await updateRoleApi(updateData);
      message.success('更新角色成功');
    } else {
      // 新增模式：POST 请求
      await createRoleApi(values as CreateRoleParams);
      message.success('添加角色成功');
    }
    
    closeCreateModal();
    fetchList();
  } catch (error: any) {
    if (error?.errorFields) {
      return;
    }
    const errMsg =
      error?.response?.data?.message ||
      error?.message ||
      (isEditMode.value ? '更新角色失败' : '添加角色失败');
    message.error(errMsg);
  } finally {
    submitting.value = false;
  }
}

function handleDelete(record: RoleItem) {
  Modal.confirm({
    title: '确认删除',
    content: h('div', { style: { fontSize: '14px', lineHeight: '1.6' } }, [
      h('p', { style: { marginBottom: '8px', color: '#ff4d4f', fontWeight: 500 } }, '⚠️ 警告'),
      h('p', { style: { margin: 0 } }, `确定要删除角色"${record.roleName}"吗？`),
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
        await deleteRoleApi(record.id);
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

// 权限配置弹窗相关
const permissionModalVisible = ref(false);
const permissionLoading = ref(false);
const permissionSubmitting = ref(false);
const currentRole = ref<RoleItem | null>(null);
const menuTreeData = ref<MenuListItem[]>([]);
const expandedKeys = ref<string[]>([]);
const checkedKeys = ref<string[]>([]);
const searchKeyword = ref('');
const expandAll = ref(false);
const selectAll = ref(false);
const parentChildLinkage = ref(true); // 默认启用父子联动

// 扁平化菜单数据（用于搜索）
const flatMenuList = ref<MenuListItem[]>([]);

function flattenMenuList(menus: MenuListItem[], parentId?: string): void {
  menus.forEach((menu) => {
    flatMenuList.value.push({ ...menu, parentId: parentId || '' });
    if (menu.children && menu.children.length > 0) {
      flattenMenuList(menu.children, menu.id);
    }
  });
}

function getAllMenuIds(menus: MenuListItem[]): string[] {
  const ids: string[] = [];
  menus.forEach((menu) => {
    ids.push(menu.id);
    if (menu.children && menu.children.length > 0) {
      ids.push(...getAllMenuIds(menu.children));
    }
  });
  return ids;
}

function getAllExpandedKeys(menus: MenuListItem[]): string[] {
  const keys: string[] = [];
  menus.forEach((menu) => {
    if (menu.children && menu.children.length > 0) {
      keys.push(menu.id);
      keys.push(...getAllExpandedKeys(menu.children));
    }
  });
  return keys;
}

async function openPermissionModal(record: RoleItem) {
  currentRole.value = record;
  permissionModalVisible.value = true;
  searchKeyword.value = '';
  expandAll.value = false;
  selectAll.value = false;
  parentChildLinkage.value = true; // 默认启用父子联动
  checkedKeys.value = [];
  expandedKeys.value = [];
  
  try {
    permissionLoading.value = true;
    
    // 第一步：先获取角色权限，得到已选中的菜单ID列表
    // requestClient 已经提取了 data 字段，所以返回的直接就是 data 数组
    const rolePermissions = await getRolePermissionsApi(record.id);
    const permissionMenuIds: string[] = [];
    // 如果返回的是数组，直接使用；如果是对象且有 data 字段，使用 data
    if (Array.isArray(rolePermissions)) {
      permissionMenuIds.push(...rolePermissions.map((id: any) => String(id).trim()));
    } else if (rolePermissions?.data && Array.isArray(rolePermissions.data)) {
      permissionMenuIds.push(...rolePermissions.data.map((id: any) => String(id).trim()));
    }
    
    // 第二步：获取所有菜单列表
    const menus = await getMenuListApi();
    menuTreeData.value = menus;
    flatMenuList.value = [];
    flattenMenuList(menus);
    
    // 默认展开第一层
    if (menus.length > 0) {
      expandedKeys.value = menus.map((menu) => menu.id);
    }
    
    // 第三步：匹配权限ID和菜单ID，设置选中状态
    // 遍历所有菜单（包括子菜单），收集所有菜单ID
    const getAllMenuIdsFromTree = (menuList: MenuListItem[]): string[] => {
      const ids: string[] = [];
      menuList.forEach((menu) => {
        const menuId = String(menu.id).trim();
        if (menuId) {
          ids.push(menuId);
        }
        if (menu.children && menu.children.length > 0) {
          ids.push(...getAllMenuIdsFromTree(menu.children));
        }
      });
      return ids;
    };
    
    // 获取所有菜单ID（去除空格，统一格式）
    const allMenuIds = getAllMenuIdsFromTree(menus);
    
    // 匹配：如果权限ID在菜单ID列表中，则添加到选中列表
    // 权限ID和菜单ID都转换为字符串并去除空格后比较
    const matchedIds: string[] = [];
    permissionMenuIds.forEach((permissionId) => {
      const permissionIdStr = String(permissionId).trim();
      // 在菜单ID列表中查找匹配的ID
      const found = allMenuIds.find((menuId) => {
        const menuIdStr = String(menuId).trim();
        return menuIdStr === permissionIdStr;
      });
      if (found) {
        matchedIds.push(permissionIdStr);
      }
    });
    
    // 设置选中状态
    checkedKeys.value = matchedIds;
    
    // 如果匹配失败，但权限ID列表不为空，直接使用权限ID（可能是菜单还未加载或ID格式问题）
    if (checkedKeys.value.length === 0 && permissionMenuIds.length > 0) {
      checkedKeys.value = permissionMenuIds.map((id) => String(id).trim());
    }
  } catch (error: any) {
    const errMsg =
      error?.response?.data?.message || error?.message || '获取权限信息失败';
    message.error(errMsg);
    permissionModalVisible.value = false;
  } finally {
    permissionLoading.value = false;
  }
}

function handleExpandAll() {
  if (expandAll.value) {
    expandedKeys.value = getAllExpandedKeys(menuTreeData.value);
  } else {
    expandedKeys.value = [];
  }
}

function handleSelectAll() {
  if (selectAll.value) {
    checkedKeys.value = getAllMenuIds(menuTreeData.value);
  } else {
    checkedKeys.value = [];
  }
}

function handleCheck(checked: { checked: string[]; halfChecked: string[] } | string[], info: any) {
  // Ant Design Vue Tree 的 checked 可能是对象（包含 checked 和 halfChecked）或数组
  const checkedArray = Array.isArray(checked) ? checked : checked.checked;
  checkedKeys.value = checkedArray;
  
  if (parentChildLinkage.value && info) {
    // 父子联动逻辑
    const { node, checked: isChecked } = info;
    
    if (node) {
      // 选中父节点时，自动选中所有子节点
      if (isChecked && node.children && node.children.length > 0) {
        const childIds = getAllMenuIds(node.children);
        checkedKeys.value = [...new Set([...checkedKeys.value, ...childIds])];
      }
      
      // 取消选中父节点时，自动取消选中所有子节点
      if (!isChecked && node.children && node.children.length > 0) {
        const childIds = getAllMenuIds(node.children);
        checkedKeys.value = checkedKeys.value.filter((id) => !childIds.includes(id));
      }
      
      // 如果所有子节点都被选中，自动选中父节点
      if (node.parentId) {
        const parent = findMenuById(menuTreeData.value, node.parentId);
        if (parent && parent.children && parent.children.length > 0) {
          const allChildrenChecked = parent.children.every((child) =>
            checkedKeys.value.includes(child.id),
          );
          if (allChildrenChecked && !checkedKeys.value.includes(parent.id)) {
            checkedKeys.value.push(parent.id);
          }
        }
      }
    }
  }
}

function findMenuById(menus: MenuListItem[], id: string): MenuListItem | null {
  for (const menu of menus) {
    if (menu.id === id) {
      return menu;
    }
    if (menu.children) {
      const found = findMenuById(menu.children, id);
      if (found) return found;
    }
  }
  return null;
}

// 过滤菜单树
const filteredTreeData = computed(() => {
  if (!searchKeyword.value) {
    return menuTreeData.value;
  }
  
  const filterMenu = (menus: MenuListItem[]): MenuListItem[] => {
    return menus
      .map((menu) => {
        const match = menu.menuName.toLowerCase().includes(searchKeyword.value.toLowerCase());
        const filteredChildren = menu.children ? filterMenu(menu.children) : [];
        
        if (match || filteredChildren.length > 0) {
          return {
            ...menu,
            children: filteredChildren.length > 0 ? filteredChildren : menu.children,
          };
        }
        return null;
      })
      .filter((menu): menu is MenuListItem => menu !== null);
  };
  
  return filterMenu(menuTreeData.value);
});

async function handleSavePermissions() {
  try {
    if (!currentRole.value) {
      message.warning('请先选择角色');
      return;
    }
    
    // 确保 checkedKeys 是数组格式
    const menuIds = Array.isArray(checkedKeys.value) 
      ? checkedKeys.value 
      : (checkedKeys.value as any)?.checked || [];
    
    if (menuIds.length === 0) {
      message.warning('请至少选择一个菜单权限');
      return;
    }
    
    permissionSubmitting.value = true;
    
    await saveRolePermissionsApi({
      roleId: currentRole.value.id,
      menuIds: menuIds,
    });
    
    message.success('保存权限成功');
    permissionModalVisible.value = false;
    // 刷新角色列表
    fetchList();
  } catch (error: any) {
    const errMsg =
      error?.response?.data?.message || error?.message || '保存权限失败';
    message.error(errMsg);
  } finally {
    permissionSubmitting.value = false;
  }
}

function closePermissionModal() {
  permissionModalVisible.value = false;
  currentRole.value = null;
  menuTreeData.value = [];
  checkedKeys.value = [];
  expandedKeys.value = [];
  searchKeyword.value = '';
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
          添加指定角色
        </Button>
      </div>
      <Space>
        <Input
          v-model:value="queryForm.RoleName"
          allow-clear
          placeholder="按角色名称搜索"
          style="width: 180px"
        />
        <Select
          v-model:value="queryForm.Status"
          placeholder="请选择状态"
          allow-clear
          style="width: 120px"
        >
          <Select.Option value="0">全部</Select.Option>
          <Select.Option value="1">正常</Select.Option>
          <Select.Option value="2">锁定</Select.Option>
        </Select>
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
        <template v-if="column.key === 'status'">
          {{
            {
              1: '正常',
              2: '锁定',
            }[record.status ?? 1] ?? '未知'
          }}
        </template>
        <template v-else-if="column.key === 'createTime'">
          <span v-if="record.createTime">
            {{ new Date(record.createTime).toLocaleString('zh-CN') }}
          </span>
          <span v-else>—</span>
        </template>
        <template v-else-if="column.key === 'actions'">
          <Space>
            <Button
              size="small"
              type="link"
              class="cursor-pointer"
              @click="openEditModal(record)"
            >
              更新
            </Button>
            <Button
              size="small"
              type="link"
              danger
              class="cursor-pointer"
              @click="handleDelete(record)"
            >
              删除
            </Button>
            <Button
              size="small"
              type="link"
              class="cursor-pointer"
              @click="openPermissionModal(record)"
            >
              权限
            </Button>
          </Space>
        </template>
      </template>
    </Table>

    <!-- 添加/编辑角色弹窗 -->
    <Modal
      v-model:open="createModalVisible"
      :title="isEditMode ? '更新角色' : '添加指定角色'"
      width="600px"
      :confirm-loading="submitting"
      @ok="handleSubmit"
      @cancel="closeCreateModal"
    >
      <Form
        ref="formRef"
        :model="formModel"
        :rules="formRules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 18 }"
      >
        <Form.Item label="角色名称" name="roleName">
          <Input
            v-model:value="formModel.roleName"
            placeholder="请输入角色名称"
            allow-clear
          />
        </Form.Item>

        <Form.Item label="状态" name="status">
          <Radio.Group v-model:value="formModel.status">
            <Radio :value="1">正常</Radio>
            <Radio :value="2">锁定</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item label="排序" name="sort">
          <Input
            v-model:value="formModel.sort"
            type="number"
            placeholder="请输入排序值"
            :min="0"
          />
        </Form.Item>

        <Form.Item label="备注" name="remark">
          <Input.TextArea
            v-model:value="formModel.remark"
            :rows="3"
            placeholder="请输入备注"
            allow-clear
          />
        </Form.Item>
      </Form>
    </Modal>

    <!-- 权限配置弹窗 -->
    <Modal
      v-model:open="permissionModalVisible"
      :title="`菜单权限 (${currentRole?.roleName || ''})`"
      width="600px"
      :confirm-loading="permissionSubmitting"
      ok-text="保存配置"
      cancel-text="取消"
      @cancel="closePermissionModal"
      @ok="handleSavePermissions"
    >
      <div class="permission-modal-content">
        <!-- 搜索框 -->
        <Input
          v-model:value="searchKeyword"
          placeholder="请输入菜单进行搜索"
          allow-clear
          class="mb-3"
        />
        
        <!-- 操作选项 -->
        <div class="mb-3 flex gap-4">
          <Checkbox v-model:checked="expandAll" @change="handleExpandAll">
            展开/折叠
          </Checkbox>
          <Checkbox v-model:checked="selectAll" @change="handleSelectAll">
            全选/全不选
          </Checkbox>
        </div>
        
        <!-- 菜单树 -->
        <div
          v-if="permissionLoading"
          class="flex items-center justify-center"
          style="min-height: 300px"
        >
          <span>加载中...</span>
        </div>
        <Tree
          v-else
          v-model:expanded-keys="expandedKeys"
          v-model:checked-keys="checkedKeys"
          :tree-data="filteredTreeData"
          checkable
          :check-strictly="!parentChildLinkage"
          :field-names="{ children: 'children', title: 'menuName', key: 'id' }"
          @check="handleCheck"
          class="permission-tree"
        />
      </div>
    </Modal>
  </div>
</template>

<style scoped>
.permission-modal-content {
  max-height: 500px;
  overflow-y: auto;
}

.permission-tree {
  min-height: 300px;
}

.permission-tree :deep(.ant-tree-node-content-wrapper) {
  padding: 4px 8px;
}

.permission-tree :deep(.ant-tree-child-tree) {
  margin-left: 24px;
}
</style>


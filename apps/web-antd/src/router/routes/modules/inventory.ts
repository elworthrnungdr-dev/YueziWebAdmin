import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:package',
      order: 7,
      title: $t('page.inventory.title'),
    },
    name: 'Inventory',
    path: '/inventory',
    children: [
      // {
      //   name: 'InventoryIndex',
      //   path: '/inventory',
      //   component: () => import('#/views/inventory/index.vue'),
      //   meta: {
      //     icon: 'lucide:boxes',
      //     title: $t('page.inventory.index'),
      //   },
      // },
      {
        name: 'InventoryQuarterlyPurchasePlan',
        path: '/inventory/quarterly-purchase-plan',
        component: () => import('#/views/inventory/quarterly-purchase-plan.vue'),
        meta: {
          icon: 'lucide:calendar',
          title: $t('page.inventory.quarterlyPurchasePlan'),
        },
      },
      {
        name: 'InventoryTotalPurchasePlan',
        path: '/inventory/total-purchase-plan',
        component: () => import('#/views/inventory/total-purchase-plan.vue'),
        meta: {
          icon: 'lucide:clipboard-list',
          title: $t('page.inventory.totalPurchasePlan'),
        },
      },
      {
        name: 'InventoryPurchaseContract',
        path: '/inventory/purchase-contract',
        component: () => import('#/views/inventory/purchase-contract.vue'),
        meta: {
          icon: 'lucide:file-text',
          title: $t('page.inventory.purchaseContract'),
        },
      },
      {
        name: 'InventoryPurchaseOrder',
        path: '/inventory/purchase-order',
        component: () => import('#/views/inventory/purchase-order.vue'),
        meta: {
          icon: 'lucide:shopping-cart',
          title: $t('page.inventory.purchaseOrder'),
        },
      },
      {
        name: 'InventoryPurchaseArrival',
        path: '/inventory/purchase-arrival',
        component: () => import('#/views/inventory/purchase-arrival.vue'),
        meta: {
          icon: 'lucide:truck',
          title: $t('page.inventory.purchaseArrival'),
        },
      },
      {
        name: 'InventoryPurchaseInbound',
        path: '/inventory/purchase-inbound',
        component: () => import('#/views/inventory/purchase-inbound.vue'),
        meta: {
          icon: 'lucide:arrow-down-circle',
          title: $t('page.inventory.purchaseInbound'),
        },
      },
      {
        name: 'InventoryOtherInbound',
        path: '/inventory/other-inbound',
        component: () => import('#/views/inventory/other-inbound.vue'),
        meta: {
          icon: 'lucide:arrow-down',
          title: $t('page.inventory.otherInbound'),
        },
      },
      {
        name: 'InventoryRequisitionRequest',
        path: '/inventory/requisition-request',
        component: () => import('#/views/inventory/requisition-request.vue'),
        meta: {
          icon: 'lucide:file-plus',
          title: $t('page.inventory.requisitionRequest'),
        },
      },
      {
        name: 'InventoryRequisitionOutbound',
        path: '/inventory/requisition-outbound',
        component: () => import('#/views/inventory/requisition-outbound.vue'),
        meta: {
          icon: 'lucide:arrow-up-circle',
          title: $t('page.inventory.requisitionOutbound'),
        },
      },
      {
        name: 'InventoryOtherOutbound',
        path: '/inventory/other-outbound',
        component: () => import('#/views/inventory/other-outbound.vue'),
        meta: {
          icon: 'lucide:arrow-up',
          title: $t('page.inventory.otherOutbound'),
        },
      },
      {
        name: 'InventoryDepartmentInventory',
        path: '/inventory/department-inventory',
        component: () => import('#/views/inventory/department-inventory.vue'),
        meta: {
          icon: 'lucide:package',
          title: $t('page.inventory.departmentInventory'),
        },
      },
      {
        name: 'InventoryDepartmentConsumption',
        path: '/inventory/department-consumption',
        component: () => import('#/views/inventory/department-consumption.vue'),
        meta: {
          icon: 'lucide:trending-down',
          title: $t('page.inventory.departmentConsumption'),
        },
      },
      {
        name: 'InventoryWarehouseInventory',
        path: '/inventory/warehouse-inventory',
        component: () => import('#/views/inventory/warehouse-inventory.vue'),
        meta: {
          icon: 'lucide:clipboard-check',
          title: $t('page.inventory.warehouseInventory'),
        },
      },
      {
        name: 'InventoryInventoryAdjustment',
        path: '/inventory/inventory-adjustment',
        component: () => import('#/views/inventory/inventory-adjustment.vue'),
        meta: {
          icon: 'lucide:edit',
          title: $t('page.inventory.inventoryAdjustment'),
        },
      },
    ],
  },
];

export default routes;

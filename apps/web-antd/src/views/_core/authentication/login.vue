<script lang="ts" setup>
import type { VbenFormSchema } from '@vben/common-ui';

import { computed, markRaw, onMounted, ref } from 'vue';

import { AuthenticationLogin, SliderCaptcha, z } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { getAllBranchApi } from '#/api';
import { useAuthStore } from '#/store';

defineOptions({ name: 'Login' });

const authStore = useAuthStore();

// 表单实例，用于在获取门店列表后设置默认值
const loginRef = ref<InstanceType<typeof AuthenticationLogin> | null>(null);

// 门店下拉选项
const branchOptions = ref<{ label: string; value: string }[]>([]);
const branchLoading = ref(false);
const branchLoaded = ref(false);

async function fetchBranches() {
  if (branchLoaded.value || branchLoading.value) return;
  try {
    branchLoading.value = true;
    const list = await getAllBranchApi();
    branchOptions.value = (list || []).map((item) => ({
      // 页面上展示门店名称，但传参时使用 id
      label: item.branchName || item.id,
      value: item.id,
    }));

    // 如果当前没有选择门店ID，则默认选中第一条
    if (branchOptions.value.length > 0) {
      const formApi = loginRef.value?.getFormApi?.();
      if (formApi?.getValues && formApi?.setFieldValue) {
        const values = await formApi.getValues();
        if (!values?.branchId) {
          await formApi.setFieldValue('branchId', branchOptions.value[0]!.value);
        }
      }
    }
  } catch {
    // 错误由全局拦截器处理
  } finally {
    branchLoading.value = false;
    branchLoaded.value = true;
  }
}

// 页面加载完成后立即请求门店列表（预加载数据），但不自动选中任何值
onMounted(() => {
  fetchBranches();
});

const formSchema = computed((): VbenFormSchema[] => {
  return [
    {
      // 使用 Select，保证 placeholder（提示词）正常显示
      component: 'Select',
      // 用函数形式确保 options 响应式更新（接口返回后立即生效）
      componentProps: () => ({
        placeholder: '请选择门店',
        options: branchLoaded.value ? branchOptions.value : [],
        // 不需要右侧清除(×)小图标
        allowClear: false,
        showSearch: true,
        optionFilterProp: 'label',
        style: { width: '100%' },
        loading: branchLoading.value,
        onDropdownVisibleChange: (open: boolean) => {
          if (open) fetchBranches();
        },
      }),
      fieldName: 'branchId',
      label: '门店',
      rules: z.string().min(1, { message: '请选择门店' }),
    },
    {
      component: 'VbenInput',
      componentProps: {
        placeholder: $t('authentication.usernameTip'),
        style: { width: '100%' },
      },
      fieldName: 'username',
      label: $t('authentication.username'),
      rules: z.string().min(1, { message: $t('authentication.usernameTip') }),
    },
    {
      component: 'VbenInputPassword',
      componentProps: {
        placeholder: $t('authentication.password'),
        style: { width: '100%' },
      },
      fieldName: 'password',
      label: $t('authentication.password'),
      rules: z.string().min(1, { message: $t('authentication.passwordTip') }),
    },
    {
      component: markRaw(SliderCaptcha),
      fieldName: 'captcha',
      rules: z.boolean().refine((value) => value, {
        message: $t('authentication.verifyRequiredTip'),
      }),
    },
  ];
});
</script>

<template>
  <div class="login-page">
    <AuthenticationLogin
      ref="loginRef"
      :form-schema="formSchema"
      :loading="authStore.loginLoading"
      @submit="authStore.authLogin"
    />
  </div>
</template>

<style>
/* 隐藏登录页底部“手机号登录/扫码登录/其他登录方式/创建账号/Copyright”等扩展区 */
.vben-auth__other,
.vben-auth__footer,
.vben-auth__providers,
.vben-auth__third-party,
.vben-auth__register,
.vben-auth__copyright,
.vben-auth-other,
.vben-auth-footer,
.vben-auth-providers,
.vben-auth-third-party,
.vben-auth-register,
.vben-auth-copyright,
.vben-authentication__other,
.vben-authentication__footer,
.vben-authentication__providers,
.vben-authentication__third-party,
.vben-authentication__register,
.vben-authentication__copyright,
.vben-authentication-other,
.vben-authentication-footer,
.vben-authentication-providers,
.vben-authentication-third-party,
.vben-authentication-register,
.vben-authentication-copyright,
.vben-authentication-login__other,
.vben-authentication-login__footer,
.vben-authentication-login__providers,
.vben-authentication-login__third-party,
.vben-authentication-login__register,
.vben-authentication-login__copyright {
  display: none !important;
}

/* 登录页：隐藏“手机号登录 / 扫码登录”等切换标签及其下方内容 */
.vben-authentication-login__tabs,
.vben-authentication-login .ant-tabs,
.vben-authentication-login .ant-tabs-nav,
.vben-authentication-login .ant-tabs-nav-wrap {
  display: none !important;
}

/* 兜底：直接隐藏“手机号登录 / 扫码登录”所在的这一行按钮容器 */
.login-page .mb-2.mt-4.flex.items-center.justify-between {
  display: none !important;
}

/* 第三方登录：隐藏“还没有账号？创建账号”这一行文案（仅登录页内） */
.login-page .mt-3.text-center.text-sm {
  display: none !important;
}

/* 第三方登录：隐藏外层容器（不影响上面的登录卡片） */
.login-page div[class='w-full sm:mx-auto md:max-w-md'] {
  display: none !important;
}

/* 底部版权：整体隐藏（包括“Copyright © ...”和 vben 链接），不再限制在 login-page 内 */
.text-muted-foreground.absolute.bottom-3.flex.text-center.text-xs {
  display: none !important;
}

a[href*='vben.pro'] {
  display: none !important;
}

/* 登录页：隐藏“忘记密码？”链接（保留左侧“记住账号”复选框） */
.login-page .mb-6.flex.justify-between .vben-link.text-sm.font-normal {
  display: none !important;
}

/* 门店下拉框：鼠标移上去不要高亮，只有真正聚焦（点击）时才高亮边框 */
.login-page .ant-select:not(.ant-select-disabled):not(.ant-select-focused):hover
  .ant-select-selector {
  /* 使用未聚焦时的边框颜色，避免 hover 变成高亮蓝色 */
  border-color: rgba(255, 255, 255, 0.18) !important;
  box-shadow: none !important;
}
</style>

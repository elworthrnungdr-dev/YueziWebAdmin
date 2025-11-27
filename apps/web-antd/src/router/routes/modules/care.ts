import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:heart',
      order: 5,
      title: $t('page.care.title'),
    },
    name: 'Care',
    path: '/care',
    children: [
      // {
      //   name: 'CareIndex',
      //   path: '/care',
      //   component: () => import('#/views/care/index.vue'),
      //   meta: {
      //     icon: 'lucide:heart',
      //     title: $t('page.care.index'),
      //   },
      // },
      {
        name: 'CareMotherCheckinAssessment',
        path: '/care/mother-checkin-assessment',
        component: () => import('#/views/care/mother-checkin-assessment.vue'),
        meta: {
          icon: 'lucide:clipboard-list',
          title: $t('page.care.motherCheckinAssessment'),
        },
      },
      {
        name: 'CareBabyCheckinAssessment',
        path: '/care/baby-checkin-assessment',
        component: () => import('#/views/care/baby-checkin-assessment.vue'),
        meta: {
          icon: 'lucide:clipboard-list',
          title: $t('page.care.babyCheckinAssessment'),
        },
      },
      {
        name: 'CareCheckinEducation',
        path: '/care/checkin-education',
        component: () => import('#/views/care/checkin-education.vue'),
        meta: {
          icon: 'lucide:book-open',
          title: $t('page.care.checkinEducation'),
        },
      },
      {
        name: 'CareMotherCareRecord',
        path: '/care/mother-care-record',
        component: () => import('#/views/care/mother-care-record.vue'),
        meta: {
          icon: 'lucide:file-text',
          title: $t('page.care.motherCareRecord'),
        },
      },
      {
        name: 'CareBabyCareRecord',
        path: '/care/baby-care-record',
        component: () => import('#/views/care/baby-care-record.vue'),
        meta: {
          icon: 'lucide:file-text',
          title: $t('page.care.babyCareRecord'),
        },
      },
      {
        name: 'CareMotherDailyCheck',
        path: '/care/mother-daily-check',
        component: () => import('#/views/care/mother-daily-check.vue'),
        meta: {
          icon: 'lucide:clipboard-check',
          title: $t('page.care.motherDailyCheck'),
        },
      },
      {
        name: 'CareBabyDailyCare',
        path: '/care/baby-daily-care',
        component: () => import('#/views/care/baby-daily-care.vue'),
        meta: {
          icon: 'lucide:clipboard-check',
          title: $t('page.care.babyDailyCare'),
        },
      },
      {
        name: 'CareBabyFeeding',
        path: '/care/baby-feeding',
        component: () => import('#/views/care/baby-feeding.vue'),
        meta: {
          icon: 'lucide:baby',
          title: $t('page.care.babyFeeding'),
        },
      },
      {
        name: 'CarePostpartumEducation',
        path: '/care/postpartum-education',
        component: () => import('#/views/care/postpartum-education.vue'),
        meta: {
          icon: 'lucide:graduation-cap',
          title: $t('page.care.postpartumEducation'),
        },
      },
      {
        name: 'CareMoodAssessment',
        path: '/care/mood-assessment',
        component: () => import('#/views/care/mood-assessment.vue'),
        meta: {
          icon: 'lucide:smile',
          title: $t('page.care.moodAssessment'),
        },
      },
      {
        name: 'CareNeonatalRounds',
        path: '/care/neonatal-rounds',
        component: () => import('#/views/care/neonatal-rounds.vue'),
        meta: {
          icon: 'lucide:stethoscope',
          title: $t('page.care.neonatalRounds'),
        },
      },
      {
        name: 'CareNutritionRounds',
        path: '/care/nutrition-rounds',
        component: () => import('#/views/care/nutrition-rounds.vue'),
        meta: {
          icon: 'lucide:stethoscope',
          title: $t('page.care.nutritionRounds'),
        },
      },
      {
        name: 'CareObstetricRounds',
        path: '/care/obstetric-rounds',
        component: () => import('#/views/care/obstetric-rounds.vue'),
        meta: {
          icon: 'lucide:stethoscope',
          title: $t('page.care.obstetricRounds'),
        },
      },
      {
        name: 'CareTcmRounds',
        path: '/care/tcm-rounds',
        component: () => import('#/views/care/tcm-rounds.vue'),
        meta: {
          icon: 'lucide:stethoscope',
          title: $t('page.care.tcmRounds'),
        },
      },
      {
        name: 'CareHealthNotice',
        path: '/care/health-notice',
        component: () => import('#/views/care/health-notice.vue'),
        meta: {
          icon: 'lucide:file-warning',
          title: $t('page.care.healthNotice'),
        },
      },
      {
        name: 'CareSpecialNotice',
        path: '/care/special-notice',
        component: () => import('#/views/care/special-notice.vue'),
        meta: {
          icon: 'lucide:alert-triangle',
          title: $t('page.care.specialNotice'),
        },
      },
      {
        name: 'CareOutgoingRequest',
        path: '/care/outgoing-request',
        component: () => import('#/views/care/outgoing-request.vue'),
        meta: {
          icon: 'lucide:arrow-right',
          title: $t('page.care.outgoingRequest'),
        },
      },
      {
        name: 'CareBabyMedication',
        path: '/care/baby-medication',
        component: () => import('#/views/care/baby-medication.vue'),
        meta: {
          icon: 'lucide:pill',
          title: $t('page.care.babyMedication'),
        },
      },
      {
        name: 'CareMotherCheckoutAssessment',
        path: '/care/mother-checkout-assessment',
        component: () => import('#/views/care/mother-checkout-assessment.vue'),
        meta: {
          icon: 'lucide:clipboard-list',
          title: $t('page.care.motherCheckoutAssessment'),
        },
      },
      {
        name: 'CareBabyCheckoutAssessment',
        path: '/care/baby-checkout-assessment',
        component: () => import('#/views/care/baby-checkout-assessment.vue'),
        meta: {
          icon: 'lucide:clipboard-list',
          title: $t('page.care.babyCheckoutAssessment'),
        },
      },
      {
        name: 'CareCheckoutEducation',
        path: '/care/checkout-education',
        component: () => import('#/views/care/checkout-education.vue'),
        meta: {
          icon: 'lucide:book-open',
          title: $t('page.care.checkoutEducation'),
        },
      },
    ],
  },
];

export default routes;

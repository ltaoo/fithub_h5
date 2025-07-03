import { JSXElement, lazy } from "solid-js";

import { ViewComponent } from "@/store/types";
import { HomeLayout } from "@/pages/home/layout";
import { HomeIndexPage } from "@/pages/home";
import { NotFoundPage } from "@/pages/notfound";

import { PageKeys } from "./routes";

export const pages: Omit<Record<PageKeys, ViewComponent>, "root"> = {
  "root.login": lazy(async () => ({ default: (await import("@/pages/login")).LoginPage })),
  "root.register": lazy(async () => ({ default: (await import("@/pages/register")).RegisterPage })),
  // "root.notfound": lazy(async () => ({ default: (await import("@/pages/notfound")).NotFoundPage })),
  "root.notfound": NotFoundPage,
  // "root.home_layout": lazy(async () => ({ default: (await import("@/pages/home/layout")).HomeLayout })),
  "root.home_layout": HomeLayout,
  // "root.home_layout.index": lazy(async () => ({ default: (await import("@/pages/home")).HomeIndexPage })),
  "root.home_layout.index": HomeIndexPage,
  "root.home_layout.tools": lazy(async () => ({ default: (await import("@/pages/tools")).ToolsView })),
  "root.tools_rm_calc": lazy(async () => ({ default: (await import("@/pages/tools/rm_calc")).RMCalcToolView })),
  "root.tools_max_rm_test": lazy(async () => ({
    default: (await import("@/pages/tools/max_rm_test")).MaxRMTestToolView,
  })),
  "root.tools_bmr_calc": lazy(async () => ({ default: (await import("@/pages/tools/bmr_calc")).BMRCalcToolView })),
  "root.tools_bmi_calc": lazy(async () => ({ default: (await import("@/pages/tools/bmi_calc")).BMICalcToolView })),
  "root.tools_stopwatch": lazy(async () => ({ default: (await import("@/pages/tools/stopwatch")).StopwatchToolView })),
  "root.tools_countdown": lazy(async () => ({ default: (await import("@/pages/tools/countdown")).CountdownToolView })),
  "root.tools_heart_rate": lazy(async () => ({
    default: (await import("@/pages/tools/heart_rate_calc")).HeartRateCalcToolView,
  })),
  "root.tools_metronome": lazy(async () => ({ default: (await import("@/pages/tools/metronome")).MetronomeToolView })),
  "root.settings": lazy(async () => ({ default: (await import("@/pages/settings")).ApplicationSettingsView })),
  "root.subscription": lazy(async () => ({
    default: (await import("@/pages/mine/subscription")).MineSubscriptionView,
  })),
  "root.subscription_plan_profile": lazy(async () => ({
    default: (await import("@/pages/subscription_plan/profile")).SubscriptionOrderView,
  })),
  // 训练计划
  "root.workout_plan_list": lazy(async () => ({
    default: (await import("@/pages/workout_plan/list")).WorkoutPlanListPage,
  })),
  "root.workout_plan_create": lazy(async () => ({
    default: (await import("@/pages/workout_plan/create")).WorkoutPlanCreatePage,
  })),
  "root.workout_plan_update": lazy(async () => ({
    default: (await import("@/pages/workout_plan/update")).HomeWorkoutPlanUpdatePage,
  })),
  "root.home_layout.workout_plan_layout": lazy(async () => ({
    default: (await import("@/pages/workout_plan/recommend_layout")).WorkoutPlanRecommendLayout,
  })),
  "root.home_layout.workout_plan_layout.recommend": lazy(async () => ({
    default: (await import("@/pages/workout_plan/plan_recommend")).WorkoutPlanRecommendView,
  })),
  "root.home_layout.workout_plan_layout.interval": lazy(async () => ({
    default: (await import("@/pages/workout_plan/plan_interval")).WorkoutPlanIntervalView,
  })),
  "root.home_layout.workout_plan_layout.single": lazy(async () => ({
    default: (await import("@/pages/workout_plan/plan_single")).WorkoutPlanSingleView,
  })),
  "root.home_layout.workout_plan_layout.mine": lazy(async () => ({
    default: (await import("@/pages/workout_plan/plan_mine")).WorkoutPlanMineView,
  })),
  "root.workout_plan_profile": lazy(async () => ({
    default: (await import("@/pages/workout_plan/profile")).HomeWorkoutPlanProfilePage,
  })),
  "root.workout_schedule_create": lazy(async () => ({
    default: (await import("@/pages/workout_schedule/create")).WorkoutScheduleCreateView,
  })),
  "root.workout_schedule_update": lazy(async () => ({
    default: (await import("@/pages/workout_schedule/update")).WorkoutScheduleUpdateView,
  })),
  "root.workout_schedule_create_success": lazy(async () => ({
    default: (await import("@/pages/workout_schedule/success")).WorkoutScheduleCreateSuccessView,
  })),
  "root.workout_schedule_profile": lazy(async () => ({
    default: (await import("@/pages/workout_schedule/profile")).WorkoutScheduleProfileView,
  })),
  // 学员管理
  "root.home_layout.student_list": lazy(async () => ({
    default: (await import("@/pages/student/list")).StudentListPage,
  })),
  "root.student_create": lazy(async () => ({
    default: (await import("@/pages/student/create")).HomeStudentCreatePage,
  })),
  "root.student_update": lazy(async () => ({
    default: (await import("@/pages/student/update")).HomeStudentUpdatePage,
  })),
  "root.student_profile": lazy(async () => ({
    default: (await import("@/pages/student/profile")).HomeStudentProfilePage,
  })),
  "root.student_workout_day_list": lazy(async () => ({
    default: (await import("@/pages/student/workout_day_list")).StudentWorkoutDayListView,
  })),
  "root.student_workout_day_profile": lazy(async () => ({
    default: (await import("@/pages/student/workout_day_profile")).StudentWorkoutDayProfileView,
  })),
  "root.home_layout.mine": lazy(async () => ({ default: (await import("@/pages/mine")).HomeMineView })),
  // 训练记录
  "root.workout_day": lazy(async () => ({
    default: (await import("@/pages/workout_day/multiple")).WorkoutDayMultiplePersonView,
  })),
  "root.workout_day_self": lazy(async () => ({
    default: (await import("@/pages/workout_day/record")).WorkoutDayUpdateView,
  })),
  "root.workout_day_prepare": lazy(async () => ({
    default: (await import("@/pages/workout_day/prepare")).WorkoutDayPreparingPage,
  })),
  "root.workout_day_catch_up_on": lazy(async () => ({
    default: (await import("@/pages/workout_day/catch_up_on")).WorkoutDayCatchUpView,
  })),
  "root.workout_day_cardio": lazy(async () => ({
    default: (await import("@/pages/workout_day/cardio")).CardioCreateView,
  })),
  "root.workout_day_list": lazy(async () => ({
    default: (await import("@/pages/workout_day/list")).WorkoutDayListView,
  })),
  "root.workout_day_profile": lazy(async () => ({
    default: (await import("@/pages/workout_day/profile")).WorkoutDayProfileView,
  })),
  "root.action_history_list": lazy(async () => ({
    default: (await import("@/pages/workout_action_history/list")).WorkoutActionHistoryListView,
  })),
  // 肌肉
  "root.muscle": lazy(async () => ({ default: (await import("@/pages/muscle/overview")).MuscleInPersonView })),
  // 器材、设备
  "root.equipment": lazy(async () => ({ default: (await import("@/pages/equipment/list")).EquipmentListView })),
  "root.equipment_manage": lazy(async () => ({
    default: (await import("@/pages/equipment/manage")).MyEquipmentManageView,
  })),
  // 健身动作
  "root.workout_action_list": lazy(async () => ({
    default: (await import("@/pages/workout_action/list")).WorkoutActionListView,
  })),
  // 意见反馈
  "root.report_list": lazy(async () => ({ default: (await import("@/pages/report/list")).ReportListView })),
  "root.report_create": lazy(async () => ({ default: (await import("@/pages/report/create")).ReportCreateView })),
  "root.report_profile": lazy(async () => ({ default: (await import("@/pages/report/profile")).ReportProfileView })),
  "root.workout_report_month": lazy(async () => ({
    default: (await import("@/pages/fit_report/month")).WorkoutReportMonthView,
  })),
  // 答题
  "root.paper_list": lazy(async () => ({ default: (await import("@/pages/paper/list")).PaperListView })),
  "root.exam": lazy(async () => ({ default: (await import("@/pages/paper/answer")).ExamAnswerView })),
  "root.exam_result": lazy(async () => ({ default: (await import("@/pages/paper/result")).PaperResultView })),
  "root.exam_result_list": lazy(async () => ({
    default: (await import("@/pages/paper/result_list")).PaperResultListView,
  })),
  "root.test": lazy(async () => ({ default: (await import("@/pages/test/profile")).FeaturePlaygroundView })),
  // 内容
  "root.content_create": lazy(async () => ({ default: (await import("@/pages/article/create")).ArticleCreateView })),
  "root.content_list": lazy(async () => ({ default: (await import("@/pages/article/list")).ArticleListView })),
  "root.content_profile": lazy(async () => ({ default: (await import("@/pages/article/profile")).ArticleProfileView })),
  "root.content_update": lazy(async () => ({ default: (await import("@/pages/article/update")).ArticleUpdateView })),
};

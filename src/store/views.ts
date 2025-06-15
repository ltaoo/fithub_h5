import { JSXElement } from "solid-js";

import { PageKeys } from "./routes";

import { ViewComponent } from "@/store/types";
import { LoginPage } from "@/pages/login";
import { RegisterPage } from "@/pages/register";
import { NotFoundPage } from "@/pages/notfound";
import { HomeLayout } from "@/pages/home/layout";
import { HomeIndexPage } from "@/pages/home";
import { WorkoutActionListView } from "@/pages/workout_action/list";
import { WorkoutPlanListPage } from "@/pages/workout_plan/list";
import { WorkoutPlanCreatePage } from "@/pages/workout_plan/create";
import { HomeWorkoutPlanProfilePage } from "@/pages/workout_plan/profile";
import { HomeWorkoutPlanUpdatePage } from "@/pages/workout_plan/update";
import { WorkoutPlanRecommendLayout } from "@/pages/workout_plan/recommend_layout";
import { WorkoutPlanMineView } from "@/pages/workout_plan/plan_mine";
import { WorkoutPlanSingleView } from "@/pages/workout_plan/plan_single";
import { WorkoutPlanIntervalView } from "@/pages/workout_plan/plan_interval";
import { WorkoutPlanRecommendView } from "@/pages/workout_plan/plan_recommend";
import { HomeStudentListPage } from "@/pages/student/list";
import { HomeStudentCreatePage } from "@/pages/student/create";
import { HomeStudentUpdatePage } from "@/pages/student/update";
import { HomeStudentProfilePage } from "@/pages/student/profile";
import { EquipmentListView } from "@/pages/equipment/list";
import { WorkoutDayUpdateView } from "@/pages/workout_day/update";
import { WorkoutDayPreparingPage } from "@/pages/workout_day/prepare";
import { HomeMineView } from "@/pages/mine";
import { WorkoutScheduleCreateView } from "@/pages/workout_schedule/create";
import { WorkoutScheduleUpdateView } from "@/pages/workout_schedule/update";
import { WorkoutScheduleCreateSuccessView } from "@/pages/workout_schedule/success";
import { WorkoutActionHistoryListView } from "@/pages/workout_action_history/list";
import { WorkoutDayListView } from "@/pages/workout_day/list";
import { WorkoutDayProfileView } from "@/pages/workout_day/profile";
import { ToolsView } from "@/pages/tools";
import { RMCalcToolView } from "@/pages/tools/rm_calc";
import { BMRCalcToolView } from "@/pages/tools/bmr_calc";
import { StopwatchToolView } from "@/pages/tools/stopwatch";
import { CountdownToolView } from "@/pages/tools/countdown";
import { MineSubscriptionView } from "@/pages/mine/subscription";
import { MuscleInPersonView } from "@/pages/muscle/overview";
import { MyEquipmentManageView } from "@/pages/equipment/manage";
import { BMICalcToolView } from "@/pages/tools/bmi_calc";
import { HeartRateCalcToolView } from "@/pages/tools/heart_rate_calc";
import { MetronomeToolView } from "@/pages/tools/metronome";
import { ExamAnswerView } from "@/pages/paper/answer";
import { PaperResultView } from "@/pages/paper/result";
import { PaperListView } from "@/pages/paper/list";
import { ReportListView } from "@/pages/report/list";
import { ReportCreateView } from "@/pages/report/create";
import { ReportProfileView } from "@/pages/report/profile";
import { PaperResultListView } from "@/pages/paper/result_list";
import { WorkoutScheduleProfileView } from "@/pages/workout_schedule/profile";
import { WorkoutDayMultiplePersonView } from "@/pages/workout_day/multiple";
import { MaxRMTestToolView } from "@/pages/tools/max_rm_test";
import { ApplicationSettingsView } from "@/pages/settings";
import { SubscriptionOrderView } from "@/pages/subscription_plan/profile";
import { FeaturePlaygroundView } from "@/pages/test/profile";
import { WorkoutDayCatchUpOnView } from "@/pages/workout_day/catch_up_on";
import { StudentWorkoutDayListView } from "@/pages/student/workout_day_list";

export const pages: Omit<Record<PageKeys, ViewComponent>, "root"> = {
  "root.login": LoginPage,
  "root.register": RegisterPage,
  "root.notfound": NotFoundPage,
  "root.settings": ApplicationSettingsView,
  "root.home_layout": HomeLayout,
  "root.home_layout.index": HomeIndexPage,
  "root.home_layout.tools": ToolsView,
  "root.tools_rm_calc": RMCalcToolView,
  "root.tools_max_rm_test": MaxRMTestToolView,
  "root.tools_bmr_calc": BMRCalcToolView,
  "root.tools_bmi_calc": BMICalcToolView,
  "root.tools_stopwatch": StopwatchToolView,
  "root.tools_countdown": CountdownToolView,
  "root.tools_heart_rate": HeartRateCalcToolView,
  "root.tools_metronome": MetronomeToolView,
  "root.subscription": MineSubscriptionView,
  "root.subscription_plan_profile": SubscriptionOrderView,
  // 训练计划
  "root.workout_plan_list": WorkoutPlanListPage,
  "root.workout_plan_create": WorkoutPlanCreatePage,
  "root.workout_plan_update": HomeWorkoutPlanUpdatePage,
  "root.home_layout.workout_plan_layout": WorkoutPlanRecommendLayout,
  "root.home_layout.workout_plan_layout.recommend": WorkoutPlanRecommendView,
  "root.home_layout.workout_plan_layout.interval": WorkoutPlanIntervalView,
  "root.home_layout.workout_plan_layout.single": WorkoutPlanSingleView,
  "root.home_layout.workout_plan_layout.mine": WorkoutPlanMineView,
  "root.workout_plan_profile": HomeWorkoutPlanProfilePage,
  "root.workout_schedule_create": WorkoutScheduleCreateView,
  "root.workout_schedule_update": WorkoutScheduleUpdateView,
  "root.workout_schedule_create_success": WorkoutScheduleCreateSuccessView,
  "root.workout_schedule_profile": WorkoutScheduleProfileView,
  // 学员管理
  "root.home_layout.student_list": HomeStudentListPage,
  "root.student_create": HomeStudentCreatePage,
  "root.student_update": HomeStudentUpdatePage,
  "root.student_profile": HomeStudentProfilePage,
  "root.student_workout_day_list": StudentWorkoutDayListView,
  "root.home_layout.mine": HomeMineView,
  // 训练记录
  "root.workout_day": WorkoutDayMultiplePersonView,
  "root.workout_day_self": WorkoutDayUpdateView,
  "root.workout_day_prepare": WorkoutDayPreparingPage,
  "root.workout_day_catch_up_on": WorkoutDayCatchUpOnView,
  "root.workout_day_list": WorkoutDayListView,
  "root.workout_day_profile": WorkoutDayProfileView,
  "root.action_history_list": WorkoutActionHistoryListView,
  // 肌肉
  "root.muscle": MuscleInPersonView,
  // 器材、设备
  "root.equipment": EquipmentListView,
  "root.equipment_manage": MyEquipmentManageView,
  // 健身动作
  "root.workout_action_list": WorkoutActionListView,
  // 意见反馈
  "root.report_list": ReportListView,
  "root.report_create": ReportCreateView,
  "root.report_profile": ReportProfileView,
  // 答题
  "root.paper_list": PaperListView,
  "root.exam": ExamAnswerView,
  "root.exam_result": PaperResultView,
  "root.exam_result_list": PaperResultListView,
  "root.test": FeaturePlaygroundView,
};

import { JSXElement } from "solid-js";

import { ViewComponent } from "@/store/types";
import { LoginPage } from "@/pages/login";
import { RegisterPage } from "@/pages/register";
import { NotFoundPage } from "@/pages/notfound";
import { HomeLayout } from "@/pages/home/layout";
import { HomeIndexPage } from "@/pages/home";
import { HomeActionListPage } from "@/pages/home_workout_action/list";
import { HomeActionCreatePage } from "@/pages/home_workout_action/create";
import { HomeActionUpdatePage } from "@/pages/home_workout_action/update";
import { HomeWorkoutPlanListPage } from "@/pages/home_workout_plan/list";
import { WorkoutPlanCreatePage } from "@/pages/home_workout_plan/create";
import { HomeWorkoutPlanProfilePage } from "@/pages/home_workout_plan/profile";
import { HomeWorkoutPlanUpdatePage } from "@/pages/home_workout_plan/update";
import { WorkoutPlanRecommendLayout } from "@/pages/home_workout_plan/recommend_layout";
import { WorkoutPlanMineView } from "@/pages/home_workout_plan/plan_mine";
import { WorkoutPlanSingleView } from "@/pages/home_workout_plan/plan_single";
import { WorkoutPlanIntervalView } from "@/pages/home_workout_plan/plan_interval";
import { WorkoutPlanRecommendView } from "@/pages/home_workout_plan/plan_recommend";
import { HomeStudentListPage } from "@/pages/home_student/list";
import { HomeStudentCreatePage } from "@/pages/home_student/create";
import { HomeStudentUpdatePage } from "@/pages/home_student/update";
import { HomeStudentProfilePage } from "@/pages/home_student/profile";
import { HomeMusclePage } from "@/pages/home_muscle";
import { HomeEquipmentPage } from "@/pages/home_equipment";
import { HomeWorkoutDayUpdatePage } from "@/pages/home_workout_day/update";
import { MemberListInFakeChatPage } from "@/pages/fake_chat/members";
import { ChatProfileInFakeChatPage } from "@/pages/fake_chat/profile";
import { HomeMineView } from "@/pages/home_mine";

import { PageKeys } from "./routes";

export const pages: Omit<Record<PageKeys, ViewComponent>, "root"> = {
  "root.login": LoginPage,
  "root.register": RegisterPage,
  "root.notfound": NotFoundPage,
  "root.home_layout": HomeLayout,
  "root.home_layout.index": HomeIndexPage,
  // 训练计划
  "root.workout_plan_list": HomeWorkoutPlanListPage,
  "root.workout_plan_create": WorkoutPlanCreatePage,
  "root.workout_plan_update": HomeWorkoutPlanUpdatePage,
  "root.home_layout.workout_plan_layout": WorkoutPlanRecommendLayout,
  "root.home_layout.workout_plan_layout.recommend": WorkoutPlanRecommendView,
  "root.home_layout.workout_plan_layout.interval": WorkoutPlanIntervalView,
  "root.home_layout.workout_plan_layout.single": WorkoutPlanSingleView,
  "root.home_layout.workout_plan_layout.mine": WorkoutPlanMineView,
  "root.workout_plan_profile": HomeWorkoutPlanProfilePage,
  // 学员管理
  "root.home_layout.student_list": HomeStudentListPage,
  "root.student_create": HomeStudentCreatePage,
  "root.student_update": HomeStudentUpdatePage,
  "root.student_profile": HomeStudentProfilePage,
  "root.home_layout.mine": HomeMineView,
  // 训练记录
  "root.workout_day": HomeWorkoutDayUpdatePage,
  // 假聊
  "root.fake_chat": MemberListInFakeChatPage,
  // 肌肉
  "root.muscle": HomeMusclePage,
  // 器材、设备
  "root.equipment": HomeEquipmentPage,
  // 健身动作
  "root.action_list": HomeActionListPage,
  "root.action_create": HomeActionCreatePage,
  "root.action_update": HomeActionUpdatePage,
  "root.fake_chat_profile": ChatProfileInFakeChatPage,
};

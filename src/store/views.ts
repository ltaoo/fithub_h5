import { JSXElement } from "solid-js";

import { LoginPage } from "@/pages/login";
import { RegisterPage } from "@/pages/register";
import { NotFoundPage } from "@/pages/notfound";
import { HomeLayout } from "@/pages/home/layout";
import { HomeIndexPage } from "@/pages/home";
import { HomeActionListPage } from "@/pages/home_workout_action/list";
import { HomeActionCreatePage } from "@/pages/home_workout_action/create";
import { HomeActionUpdatePage } from "@/pages/home_workout_action/update";
import { HomeWorkoutPlanListPage } from "@/pages/home_workout_plan/list";
import { HomeWorkoutPlanCreatePage } from "@/pages/home_workout_plan/create";
import { HomeWorkoutPlanProfilePage } from "@/pages/home_workout_plan/profile";
import { HomeWorkoutPlanUpdatePage } from "@/pages/home_workout_plan/update";
import { HomeStudentListPage } from "@/pages/home_student/list";
import { HomeStudentCreatePage } from "@/pages/home_student/create";
import { HomeStudentUpdatePage } from "@/pages/home_student/update";
import { HomeStudentProfilePage } from "@/pages/home_student/profile";
import { HomeMusclePage } from "@/pages/home_muscle";
import { HomeEquipmentPage } from "@/pages/home_equipment";
import { HomeWorkoutDayUpdatePage } from "@/pages/home_workout_day/create";
import { ViewComponent } from "@/store/types";

import { PageKeys } from "./routes";

export const pages: Omit<Record<PageKeys, ViewComponent>, "root"> = {
  "root.login": LoginPage,
  "root.register": RegisterPage,
  "root.notfound": NotFoundPage,
  "root.home_layout": HomeLayout,
  "root.home_layout.index": HomeIndexPage,
  "root.home_layout.muscle": HomeMusclePage,
  "root.home_layout.equipment": HomeEquipmentPage,
  "root.home_layout.action_list": HomeActionListPage,
  "root.home_layout.action_create": HomeActionCreatePage,
  "root.home_layout.action_update": HomeActionUpdatePage,
  "root.home_layout.workout_plan_list": HomeWorkoutPlanListPage,
  "root.home_layout.workout_plan_create": HomeWorkoutPlanCreatePage,
  "root.home_layout.workout_plan_update": HomeWorkoutPlanUpdatePage,
  "root.workout_plan_profile": HomeWorkoutPlanProfilePage,
  "root.workout_day": HomeWorkoutDayUpdatePage,
  "root.home_layout.student_list": HomeStudentListPage,
  "root.home_layout.student_create": HomeStudentCreatePage,
  "root.home_layout.student_update": HomeStudentUpdatePage,
  "root.home_layout.student_profile": HomeStudentProfilePage,
};

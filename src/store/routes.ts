import { PageKeysType, build } from "@/domains/route_view/utils";

/**
 * @file 路由配置
 */
const configure = {
  root: {
    title: "ROOT",
    pathname: "/",
    children: {
      home_layout: {
        title: "首页布局",
        pathname: "/home",
        children: {
          index: {
            title: "首页",
            pathname: "/home/index",
            options: {
              require: ["login"],
            },
          },
          muscle: {
            title: "肌肉列表",
            pathname: "/home/muscle",
            options: {
              require: ["login"],
            },
          },
          equipment: {
            title: "器械列表",
            pathname: "/home/equipment",
            options: {
              require: ["login"],
            },
          },
          action_list: {
            title: "动作列表",
            pathname: "/home/actions",
            options: {
              require: ["login"],
            },
          },
          action_create: {
            title: "动作创建",
            pathname: "/home/action_create",
            options: {
              require: ["login"],
            },
          },
          action_update: {
            title: "动作编辑",
            pathname: "/home/action_update",
            options: {
              require: ["login"],
            },
          },
          workout_plan_list: {
            title: "训练计划列表",
            pathname: "/home/workout_plans",
            options: {
              require: ["login"],
            },
          },
          workout_plan_create: {
            title: "训练计划创建",
            pathname: "/home/workout_plan_create",
            options: {
              require: ["login"],
            },
          },
          workout_plan_update: {
            title: "训练计划编辑",
            pathname: "/home/workout_plan_update",
            options: {
              require: ["login"],
            },
          },
          student_list: {
            title: "学员列表",
            pathname: "/home/students",
            options: {
              require: ["login"],
            },
          },
          student_create: {
            title: "学员创建",
            pathname: "/home/student_create",
            options: {
              require: ["login"],
            },
          },
          student_update: {
            title: "学员编辑",
            pathname: "/home/student_update",
            options: {
              require: ["login"],
            },
          },
          student_profile: {
            title: "学员详情",
            pathname: "/home/student_profile",
            options: {
              require: ["login"],
            },
          },
        },
      },
      workout_plan_profile: {
        title: "训练计划详情",
        pathname: "/workout_plan_profile",
        options: {
          require: ["login"],
        },
      },
      workout_day: {
        title: "训练日",
        pathname: "/workout_day",
        options: {
          require: ["login"],
        },
      },
      login: {
        title: "教练登录",
        pathname: "/login",
      },
      register: {
        title: "教练注册",
        pathname: "/register",
      },
      notfound: {
        title: "404",
        pathname: "/notfound",
      },
    },
  },
};
export type PageKeys = PageKeysType<typeof configure>;
const result = build<PageKeys>(configure);
export const routes = result.routes;
export const routesWithPathname = result.routesWithPathname;

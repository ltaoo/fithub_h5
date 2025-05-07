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
          workout_plan_layout: {
            title: "训练计划推荐",
            pathname: "/home/workout_plan",
            children: {
              recommend: {
                title: "推荐",
                pathname: "/home/workout_plan/recommend",
              },
              interval: {
                title: "周期",
                pathname: "/home/workout_plan/interval",
              },
              single: {
                title: "单次计划",
                pathname: "/home/workout_plan/exercise",
              },
              mine: {
                title: "我的",
                pathname: "/home/workout_plan/mine",
              },
            },
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
          mine: {
            title: "我的",
            pathname: "/home/mine",
            options: {
              require: ["login"],
            },
          },
        },
      },
      workout_plan_create: {
        title: "训练计划创建",
        pathname: "/home/workout_plan_create",
        options: {
          require: ["login"],
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
        pathname: "/workout_day/running",
        options: {
          require: ["login"],
        },
      },
      workout_day_prepare: {
        title: "训练日",
        pathname: "/workout_day/prepare",
        options: {
          require: ["login"],
        },
      },
      workout_day_list: {
        title: "历史训练记录",
        pathname: "/workout_day/list",
        options: {
          require: ["login"],
        },
      },
      workout_day_profile: {
        title: "训练日详情",
        pathname: "/workout_day/profile",
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
      action_history_list: {
        title: "动作记录",
        pathname: "/action_history",
        options: {
          require: ["login"],
        },
      },
      fake_chat: {
        title: "沟通",
        pathname: "/fake_chat",
        options: {
          require: [],
        },
      },
      fake_chat_profile: {
        title: "沟通详情",
        pathname: "/fake_chat_profile",
        options: {
          require: [],
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
      action_profile: {
        title: "动作详情",
        pathname: "/action_profile",
        options: {},
      },
      workout_plan_list: {
        title: "训练计划列表",
        pathname: "/workout_plan/list",
        options: {
          require: ["login"],
        },
      },
      workout_plan_update: {
        title: "训练计划编辑",
        pathname: "/workout_plan/update",
        options: {
          require: ["login"],
        },
      },
      workout_plan_collection_create: {
        title: "创建训练计划合集",
        pathname: "/workout_plan_collect/create",
        options: {
          require: ["login"],
        },
      },
      workout_plan_collection_create_success: {
        title: "操作成功",
        pathname: "/workout_plan_collect/success",
        options: {
          require: ["login"],
        },
      },
      workout_plan_collection_update: {
        title: "编辑训练计划合集",
        pathname: "/workout_plan_collect/update",
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

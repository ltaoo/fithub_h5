import { PageKeysType, build } from "@/domains/route_view/utils";

/**
 * @file 路由配置
 */
const configure = {
  root: {
    title: "ROOT",
    pathname: "/",
    options: {
      require: ["login"],
    },
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
          tools: {
            title: "工具",
            pathname: "/tools",
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
                title: "个人中心",
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
      workout_plan_update: {
        title: "训练计划修改",
        pathname: "/home/workout_plan_update",
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
      workout_day_self: {
        title: "训练日",
        pathname: "/workout_day/record",
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
      workout_day_catch_up_on: {
        title: "训练日",
        pathname: "/workout_day/catch_up_on",
        options: {
          require: ["login"],
        },
      },
      workout_day_update: {
        title: "编辑",
        pathname: "/workout_day/update",
        options: {
          require: ["login"],
        },
      },
      workout_day_cardio: {
        title: "有氧记录",
        pathname: "/workout_day/cardio",
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
      workout_day_result: {
        title: "训练日详情",
        pathname: "/workout_day/result",
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
      student_workout_day_list: {
        title: "训练记录",
        pathname: "/student/workout_day/list",
        options: {
          require: ["login"],
        },
      },
      student_workout_day_profile: {
        title: "训练记录",
        pathname: "/student/workout_day/profile",
        options: {
          require: ["login"],
        },
      },
      student_workout_day_result: {
        title: "训练结果",
        pathname: "/student/workout_day/result",
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
      tools_bmi_calc: {
        title: "BMI计算",
        pathname: "/tools_bmi_calc",
        options: {},
      },
      tools_rm_calc: {
        title: "1RM换算",
        pathname: "/tools_rm_calc",
        options: {},
      },
      tools_max_rm_test: {
        title: "1RM测试",
        pathname: "/tools_max_rm_test",
        options: {},
      },
      tools_bmr_calc: {
        title: "基础代谢计算",
        pathname: "/tools_bmr_calc",
      },
      tools_heart_rate: {
        title: "心率换算",
        pathname: "/tools_heart_rate",
      },
      tools_stopwatch: {
        title: "秒表",
        pathname: "/tools_stopwatch",
      },
      tools_countdown: {
        title: "倒计时",
        pathname: "/tools_countdown",
      },
      tools_metronome: {
        title: "节拍器",
        pathname: "/tools_metronome",
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
        pathname: "/equipment/list",
        options: {
          require: ["login"],
        },
      },
      equipment_manage: {
        title: "我的器械",
        pathname: "/equipment/mine",
        options: {
          require: ["login"],
        },
      },
      workout_plan_list: {
        title: "训练计划列表",
        pathname: "/workout_plan/list",
        options: {
          require: ["login"],
        },
      },
      workout_schedule_create: {
        title: "创建周期安排",
        pathname: "/workout_schedule/create",
        options: {
          require: ["login"],
        },
      },
      workout_schedule_create_success: {
        title: "创建成功",
        pathname: "/workout_schedule/success",
        options: {
          require: ["login"],
        },
      },
      workout_schedule_update: {
        title: "编辑周期安排",
        pathname: "/workout_schedule/update",
        options: {
          require: ["login"],
        },
      },
      workout_schedule_profile: {
        title: "周期安排详情",
        pathname: "/workout_schedule/profile",
        options: {
          require: ["login"],
        },
      },
      subscription: {
        title: "订阅",
        pathname: "/subscription",
        options: {
          require: ["login"],
        },
      },
      workout_action_list: {
        title: "动作库",
        pathname: "/workout_action/list",
        options: {
          require: ["login"],
        },
      },
      workout_report_daily: {
        title: "分享",
        pathname: "/workout_report/daily",
        options: {
          require: ["login"],
        },
      },
      workout_report_month: {
        title: "月度统计",
        pathname: "/workout_report/month",
        options: {
          require: ["login"],
        },
      },
      paper_list: {
        title: "题库",
        pathname: "/paper/list",
        options: {
          require: ["login"],
        },
      },
      exam: {
        title: "答题",
        pathname: "/exam",
        options: {
          require: ["login"],
        },
      },
      exam_result: {
        title: "答题结果",
        pathname: "/exam/result",
        options: {
          require: ["login"],
        },
      },
      exam_result_list: {
        title: "答题记录",
        pathname: "/exam/result_list",
        options: {
          require: ["login"],
        },
      },
      content_list: {
        title: "列表",
        pathname: "/content/list",
        options: {
          require: ["login"],
        },
      },
      content_create: {
        title: "创建",
        pathname: "/content/create",
        options: {
          require: ["login"],
        },
      },
      content_profile: {
        title: "详情",
        pathname: "/content/profile",
        options: {
          require: ["login"],
        },
      },
      content_update: {
        title: "更新",
        pathname: "/content/update",
        options: {
          require: ["login"],
        },
      },
      report_list: {
        title: "反馈记录",
        pathname: "/report/list",
        options: {
          require: ["login"],
        },
      },
      report_create: {
        title: "意见反馈",
        pathname: "/report/create",
        options: {
          require: ["login"],
        },
      },
      report_profile: {
        title: "反馈信息",
        pathname: "/report/profile",
        options: {
          require: ["login"],
        },
      },
      subscription_plan_profile: {
        title: "订阅计划",
        pathname: "/subscription_plan/profile",
      },
      settings: {
        title: "设置",
        pathname: "/settings",
      },
      login: {
        title: "登录",
        pathname: "/login",
      },
      register: {
        title: "注册",
        pathname: "/register",
      },
      notfound: {
        title: "404",
        pathname: "/notfound",
      },
      test: {
        title: "测试",
        pathname: "/test",
      },
    },
  },
};
export type PageKeys = PageKeysType<typeof configure>;
const result = build<PageKeys>(configure);
export const routes = result.routes;
export const routesWithPathname = result.routesWithPathname;

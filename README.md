# 健身记录工具

目前实现的功能

1. 创建训练计划
2. 创建周期训练计划
3. 开始指定的训练计划，记录该次训练的重量、次数等数据
4. 应用指定周期计划，每天给出当天应进行的训练计划
5. 训练计划关联视频内容，并支持快速跳转至视频中对应训练计划中的动作
6. 查看动作详情

## 截图

| 计划详情 | 关联视频 | 动作详情 |
|:---:|:---:|:---:|
| <img src="/docs/plan_profile.png" width="250"/> | <img src="/docs/plan_video.png" width="250"/> | <img src="/docs/action_profile.png" width="250"/> |

| 首页 | 工具页 | 训练记录 |
|:---:|:---:|:---:|
| <img src="/docs/home.png" width="250"/> | <img src="/docs/tools.png" width="250"/> | <img src="/docs/workout_day.png" width="250"/> |


## 打包体积分析

```bash
npx vite-bundle-visualizer
```
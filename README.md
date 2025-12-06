# DeepFocus项目版本记录

## 项目概述

DeepFocus是一个专注番茄钟应用，帮助用户提高工作效率和专注力。项目使用Vue 3 + TypeScript + Pinia技术栈开发，具有番茄钟计时、任务管理、统计记录、成就系统和设置管理等功能。

## 版本记录

### v0.1.0 - 初始版本 (基础番茄钟功能)

#### 核心功能实现

- **番茄钟计时功能**
  - 实现了专注时间、短休息和长休息三种模式
  - 支持开始、暂停、重置和跳过功能
  - 时间到后自动切换模式

- **任务管理系统**
  - 支持添加、编辑和删除任务
  - 任务状态管理
  - 本地数据持久化存储

- **统计记录功能**
  - 记录专注时间和任务完成情况
  - 提供今日、本周和本月的统计数据
  - 可视化图表展示专注趋势

#### 技术实现

- 使用Vue 3 Composition API构建组件
- TypeScript确保类型安全
- Pinia进行状态管理
- Vue Router实现页面路由
- localStorage实现数据持久化

### v0.2.0 - 成就系统版本

#### 新功能添加

- **成就系统**
  - 创建了成就数据存储模块(`src/stores/achievements.ts`)
  - 实现了成就界面(`src/views/AchievementsView.vue`)
  - 支持连续打卡奖励和累计番茄数奖励
  - 成就解锁通知和进度显示

- **成就类型**
  - 连续打卡成就：记录连续使用应用的天数
  - 累计番茄数成就：根据完成的番茄钟数量解锁不同等级成就
  - 成就进度实时更新

#### UI/UX优化

- 成就卡片设计与动画效果
- 成就解锁通知系统
- 成就完成度统计展示
- 响应式布局适配不同设备

### v0.3.0 - 设置界面优化版本

#### 设置功能增强

- **时间设置**
  - 快速预设方案（标准模式、短时间模式、长时间模式）
  - 数字输入框与滑块双重控制方式
  - 专注时间、短休息、长休息和长休息间隔的自定义设置

- **外观设置**
  - 浅色/深色主题切换
  - 强调色选择功能（6种颜色主题）
  - 主题实时预览与应用

- **通知设置**
  - 声音提示开关
  - 音量控制滑块
  - 桌面通知开关

#### 设置存储优化

- 完善的设置持久化机制
- 一键重置设置功能
- 新设置项：
  - `soundEnabled`: 声音开关状态
  - `volume`: 音量大小(0-100)
  - `notificationsEnabled`: 桌面通知开关
  - `accentColor`: 强调色选择

#### UI/UX改进

- 标签页式设置界面设计
- 现代化开关控件和滑块组件
- 响应式设计优化
- 交互反馈与动画效果

## 项目结构

```
src/
├── components/         # Vue组件
│   ├── DeepFocusTimer.vue  # 番茄钟组件
│   ├── NavBar.vue          # 导航栏组件
│   └── ...
├── stores/            # Pinia状态管理
│   ├── records.ts          # 记录存储
│   ├── achievements.ts     # 成就存储
│   ├── settings.ts         # 设置存储
│   └── ...
├── views/             # 页面视图
│   ├── TimerView.vue       # 番茄钟页面
│   ├── RecordsView.vue     # 统计页面
│   ├── AchievementsView.vue # 成就页面
│   ├── SettingsView.vue    # 设置页面
│   └── ...
└── router/            # 路由配置
    └── index.ts
```

## 技术栈

- **前端框架**: Vue 3
- **构建工具**: Vite
- **语言**: TypeScript
- **状态管理**: Pinia
- **路由**: Vue Router
- **样式**: CSS (响应式设计)
- **数据持久化**: localStorage

## 开发环境配置

### 推荐IDE设置

[VS Code](https://code.visualstudio.com/) + [Vue (官方插件)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (并禁用Vetur)。

### 推荐浏览器设置

- Chromium内核浏览器 (Chrome, Edge, Brave等)：
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [在Chrome开发者工具中启用自定义对象格式化器](http://bit.ly/object-formatters)
- Firefox：
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [在Firefox开发者工具中启用自定义对象格式化器](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

### TypeScript对.vue文件导入的支持

默认情况下，TypeScript无法处理.vue文件导入的类型信息，因此我们使用`vue-tsc`替代`tsc` CLI进行类型检查。在编辑器中，我们需要[Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar)来让TypeScript语言服务识别.vue类型。

### 自定义配置

查看[Vite配置参考](https://vite.dev/config/)。

## 项目启动

### 项目安装

```sh
npm install
```

### 开发环境编译与热重载

```sh
npm run dev
```

### 类型检查、编译与生产环境构建

```sh
npm run build
```

### 使用Vitest运行单元测试

```sh
npm run test:unit
```

### 使用ESLint进行代码检查

```sh
npm run lint
```

## 后续规划

- [ ] 用户账户系统（登录/注册）
- [ ] 云端数据同步
- [ ] 更多成就类型和奖励
- [ ] 自定义主题支持
- [ ] 专注数据导出功能
- [ ] 多设备同步
- [ ] 团队协作功能

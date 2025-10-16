# CLAUDE.md

此文件为Claude Code (claude.ai/code) 在此仓库中工作时提供指导。

## 项目概述

这是一个使用Vue 3 + NativeScript构建的现代移动视频应用，结合了Vue 3的开发体验和NativeScript的原生性能。应用专注于视频播放、用户分析和多语言支持。

## 开发命令

```bash
# 运行Android开发环境
npm run android

# 运行iOS开发环境（需要macOS）
npm run ios

# 构建Android APK
npm run build:android

# 构建iOS应用（需要macOS）
npm run build:ios

# 清理项目缓存和构建产物
npm run clean

# 运行测试（使用Jest配置）
npm run test
# 打包测试
npx webpack --mode=production
```

## 架构概览

### 技术栈
- **框架**: Vue 3 + NativeScript 8.6+
- **语言**: TypeScript（严格模式）
- **UI**: NativeScript XML元素配合Vue模板
- **状态管理**: Vue 3响应式系统配合组合函数
- **视频播放**: @nativescript/videoplayer
- **国际化**: @nativescript/localize
- **构建系统**: @nativescript/webpack 5.0+

### 入口文件
- `src/main.ts` - Vue 3应用入口点，初始化服务、路由和全局配置

### 核心架构模式

#### Vue 3组合式API集成
- 所有组件使用`<script setup>`语法配合TypeScript
- 通过`src/composables/`中的组合函数管理状态
- 在`src/store/state.ts`中定义响应式全局状态

#### 服务层架构
- `src/services/`包含所有业务逻辑服务：
  - `analytics.service.ts` - 用户行为跟踪
  - `video-player.service.ts` - 视频播放管理
  - `localization.service.ts` - 多语言支持
  - `file.service.ts` - 文件系统操作
  - `app-update.service.ts` - 应用更新功能

#### 组件组织结构
- `src/components/` - 可复用的Vue组件
- `src/views/` - 页面级组件
- 组件通过事件发射实现父子通信
- Props使用`src/types/`中的TypeScript接口

### 状态管理
使用Vue 3响应式系统配合全局状态模式：
- 在`src/store/state.ts`中使用`reactive()`定义全局状态
- 组合函数提供状态访问和变更方法
- 无需外部状态管理库

### TypeScript配置
- 路径别名：`@/*`映射到`src/*`
- 严格TypeScript模式，支持装饰器
- 类型定义位于`src/types/`目录
- 通过`@nativescript/types`包含NativeScript类型

### NativeScript集成
- 在`app.ts`中注册自定义元素（VideoPlayer）
- Vue组件使用NativeScript UI元素（`<StackLayout>`、`<GridLayout>`等）
- 事件处理使用NativeScript事件名称（`@tap`、`@started`等）
- Webpack配置用于Vue + NativeScript集成

### 视频功能
应用的核心功能是视频播放：
- `ShortVideoItem.vue` - 单个视频播放组件
- `ShortVideoSwiper.vue` - 可滑动的视频列表
- 通过组合函数管理视频状态
- 原生视频播放器提供最佳性能

### 国际化
- 本地化文件位于`src/locales/`
- 在应用启动时初始化服务
- Vue组件通过`$t()`函数访问翻译
- 提供语言切换组件

### 开发指南
- 遵循Vue 3组合式API模式
- 为所有数据结构使用TypeScript接口
- 为复杂业务逻辑实现服务
- 保持Vue逻辑与NativeScript平台代码的分离
- 使用路径别名（`@/`）保持导入整洁
- 组件应该是响应式的，并使用适当的事件发射

### 常见开发任务
- 添加新页面：在`src/views/`中创建并在路由中注册
- 新的可复用组件：添加到`src/components/`
- 业务逻辑：在`src/services/`中实现为服务
- 状态管理：扩展全局状态或创建新的组合函数
- 类型：在`src/types/`中定义接口
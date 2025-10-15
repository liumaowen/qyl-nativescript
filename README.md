# Vue 3 + NativeScript 版本的现代移动应用

这是使用 Vue 3 + NativeScript 重构的移动视频应用，结合了Vue 3的开发体验和NativeScript的原生性能。

## 🌟 功能特点

- 🎥 **原生视频播放**：使用 @nativescript/videoplayer 提供流畅的视频播放体验
- ⚡ **Vue 3 支持**：使用熟悉的Vue 3语法和组合式API
- 📱 **真原生UI**：使用原生组件，获得最佳性能和用户体验
- 🌍 **多语言支持**：支持中文、英文等多种语言
- 📊 **用户分析**：集成用户行为跟踪和分析
- 📁 **文件管理**：原生文件系统操作
- 🔄 **应用更新**：支持应用自动更新功能
- 🎨 **组合式API**：充分利用Vue 3的组合式API特性

## 🛠 技术架构

- **框架**：Vue 3 + NativeScript 8.6+
- **语言**：TypeScript
- **UI**：NativeScript XML + Vue 3模板
- **状态管理**：Vue 3 Reactive + Composables
- **路由**：NativeScript Vue Router
- **网络请求**：NativeScript HTTP
- **本地存储**：NativeScript ApplicationSettings
- **视频播放**：@nativescript/videoplayer

## 📁 项目结构

\`\`\`
src/
├── components/          # Vue组件
│   ├── ShortVideoItem.vue      # 短视频播放组件
│   ├── ShortVideoSwiper.vue    # 视频滑动组件
│   ├── LanguageSwitcher.vue    # 语言切换组件
│   └── LegalModal.vue          # 法律条款组件
├── views/              # 页面组件
│   ├── Tab1Page.vue           # 首页
│   ├── Tab2Page.vue           # 视频列表页
│   ├── Tab3Page.vue           # 更多页面
│   ├── ShortDramasPage.vue    # 短剧页面
│   ├── MyPage.vue             # 个人页面
│   ├── DramasDetail.vue       # 视频详情页
│   └── AnalyticsDemo.vue      # 分析演示页
├── composables/        # Vue 3 组合函数
│   ├── useVideo.ts            # 视频相关组合函数
│   └── useApp.ts              # 应用相关组合函数
├── services/           # 业务服务
│   ├── video.service.ts       # 视频API服务
│   ├── analytics.service.ts   # 分析服务
│   ├── file.service.ts        # 文件服务
│   ├── localization.service.ts # 国际化服务
│   └── video-player.service.ts # 视频播放服务
├── store/              # 状态管理
│   └── state.ts               # 响应式状态
├── router/             # 路由配置
│   └── index.ts               # Vue Router配置
├── plugins/            # Vue插件
│   └── vue-global.ts          # 全局Vue插件
├── types/              # TypeScript类型定义
├── locales/            # 国际化文件
└── styles/             # 样式文件
    └── app.css                # 全局样式
\`\`\`

## 🚀 开发命令

\`\`\`bash
# 安装依赖
npm install

# 运行Android开发环境
npm run android

# 运行iOS开发环境（需要macOS）
npm run ios

# 构建Android应用
npm run build:android

# 构建iOS应用（需要macOS）
npm run build:ios

# 清理项目
npm run clean
\`\`\`

## 📱 主要组件

### ShortVideoItem.vue
Vue 3组件，支持：
- 使用组合式API管理状态
- 视频播放/暂停控制
- 进度条交互
- 全屏模式切换
- 事件发射和监听

### ShortVideoSwiper.vue
视频滑动组件：
- 支持横向滑动切换视频
- 自动播放管理
- 进度同步
- Vue 3 reactive数据绑定

### Tab页面组件
各个Tab页面使用Vue 3语法：
- 使用\`<script setup>\`语法
- 组合式API状态管理
- 响应式数据绑定
- 生命周期钩子

## 🎯 Vue 3 特性应用

### 组合式API (Composables)
\`\`\`typescript
// useVideo.ts - 视频相关组合函数
export function useVideoPlayer() {
  const currentVideo = ref<VideoItem | null>(null);
  const isPlaying = ref(false);
  const progress = ref(0);

  const play = (video?: VideoItem) => {
    if (video) currentVideo.value = video;
    isPlaying.value = true;
  };

  return { currentVideo, isPlaying, progress, play };
}
\`\`\`

### 响应式状态管理
\`\`\`typescript
// 使用Vue 3 reactive创建全局状态
export const globalState = reactive<GlobalState>({
  videoPlayDomain: 'https://api.mgtv109.cc',
  isAnalyticsInitialized: false,
  currentVideo: null,
  isLoading: false
});
\`\`\`

### 组件通信
\`\`\`vue
<template>
  <ShortVideoItem
    :video="video"
    :isPlaying="currentPlayingIndex === index"
    @play="onVideoPlay"
    @pause="onVideoPause"
  />
</template>

<script setup lang="ts">
const emit = defineEmits<{
  play: [index: number];
  pause: [index: number];
}>();
</script>
\`\`\`

## 🔧 NativeScript集成

### Vue组件到NativeScript元素映射
- \`<StackLayout>\` - 垂直布局
- \`<GridLayout>\` - 网格布局
- \`<ScrollView>\` - 滚动视图
- \`<ListView>\` - 列表视图
- \`<VideoPlayer>\` - 视频播放器
- \`<Button>\` - 按钮
- \`<Label>\` - 文本标签

### 事件处理
\`\`\`vue
<template>
  <Button @tap="handleTap" text="点击我" />
  <VideoPlayer @started="onVideoStarted" @finished="onVideoFinished" />
</template>
\`\`\`

## 📊 性能优化

- 使用Vue 3的响应式系统优化渲染
- 组合式API减少组件实例开销
- 懒加载非关键组件
- 原生视频播放器提供最佳性能
- 图片缓存和预加载

## 🌐 国际化支持

\`\`\`vue
<template>
  <Label :text="$t('navigation.home')" />
  <Label :text="$t('video.duration', { minutes: video.duration })" />
</template>

<script setup lang="ts">
import { useI18n } from '@/composables/useApp';
const { t } = useI18n();
</script>
\`\`\`

## 🧪 开发体验

- **热重载**：支持Vue组件热重载
- **TypeScript**：完整的类型支持
- **Vue DevTools**：可以使用Vue开发工具调试
- **组合式API**：更好的逻辑复用和组织
- **单文件组件**：熟悉的.vue文件格式

## 📦 部署

1. 确保安装了 NativeScript CLI
2. 配置 Android/iOS 开发环境
3. 运行 \`npm run build:android\` 生成APK
4. 运行 \`npm run build:ios\` 生成iOS应用（需要macOS）
5. 发布到应用商店

## 🎉 总结

这个Vue 3 + NativeScript重构版本完美结合了：
- **Vue 3的开发体验** - 熟悉的语法和工具链
- **NativeScript的原生性能** - 真正的原生UI和性能
- **TypeScript的类型安全** - 更好的开发体验
- **现代化的架构** - 组合式API和响应式状态管理

现在你可以使用熟悉的Vue 3语法开发真正的原生移动应用！🚀
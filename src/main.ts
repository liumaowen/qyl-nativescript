import { createApp } from 'nativescript-vue';
import App from './App.vue';
import router from './router';
import { globalState } from './store/state';
import { globalPlugin } from './plugins/vue-global';
import { LocalizationService } from './services/localization.service';
import { UserAnalytics } from './services/analytics.service';
import '@/styles/app.css';

// 注册ExoPlayer视频播放组件和UI Pager
import { registerElement } from 'nativescript-vue';
registerElement('VideoPlayer', () => require('@nstudio/nativescript-exoplayer').Video);
registerElement('Pager', () => require('@nativescript-community/ui-pager').Pager);

// 初始化服务
LocalizationService.initialize();
UserAnalytics.initializeAnalytics();

// 创建Vue应用
const app = createApp(App);

// 使用插件
app.use(globalPlugin);
app.use(router);

// 注册全局属性
app.config.globalProperties.$globalState = globalState;
app.config.globalProperties.$t = LocalizationService.t;

// 全局错误处理
app.config.errorHandler = (err:any, instance, info) => {
  console.error('Vue错误:', err);
  console.error('错误信息:', info);

  UserAnalytics.trackEvent('vue_error', {
    error: err.toString(),
    info: info
  });
};

// 启动应用
app.start();
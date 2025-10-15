import { createCompositionAPI } from 'nativescript-vue';
import { LocalizationService } from '@/services/localization.service';

// 创建组合API支持
createCompositionAPI();

// 全局Vue插件
export const globalPlugin = {
  install(app: any) {
    // 注册全局属性
    app.config.globalProperties.$t = LocalizationService.t;

    // 注册全局指令
    app.directive('loading', {
      beforeMount(el: any, binding: any) {
        if (binding.value) {
          el.visibility = 'collapsed';
        }
      },
      updated(el: any, binding: any) {
        el.visibility = binding.value ? 'collapsed' : 'visible';
      }
    });

    // 注册全局混入
    app.mixin({
      methods: {
        $navigateTo(component: any, options: any = {}) {
          this.$navigateToModal(component, options);
        },

        $showLoading() {
          // 显示全局loading
          console.log('显示loading...');
        },

        $hideLoading() {
          // 隐藏全局loading
          console.log('隐藏loading...');
        }
      }
    });
  }
};

// Vue过滤器 (在模板中使用)
export const filters = {
  formatDuration(minutes: number): string {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}时${mins}分` : `${mins}分钟`;
  },

  formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleDateString('zh-CN');
  },

  truncate(text: string, length: number = 50): string {
    if (!text) return '';
    return text.length > length ? text.substring(0, length) + '...' : text;
  }
};
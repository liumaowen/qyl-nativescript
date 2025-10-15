import { ref, reactive, watch } from 'vue';
import { LocalizationService } from '@/services/localization.service';

// 国际化组合函数
export function useI18n() {
  const currentLanguage = ref(LocalizationService.getCurrentLanguage());
  const supportedLanguages = ref(LocalizationService.getSupportedLanguages());

  const t = (key: string, params?: any) => {
    return LocalizationService.t(key, params);
  };

  const setLanguage = async (language: string) => {
    await LocalizationService.setLanguage(language);
    currentLanguage.value = language;
  };

  return {
    currentLanguage,
    supportedLanguages,
    t,
    setLanguage
  };
}

// 主题管理组合函数
export function useTheme() {
  const currentTheme = ref<'light' | 'dark' | 'system'>('system');
  const isDarkMode = ref(false);

  const themes = [
    { value: 'light', label: '浅色模式' },
    { value: 'dark', label: '深色模式' },
    { value: 'system', label: '跟随系统' }
  ];

  const setTheme = (theme: 'light' | 'dark' | 'system') => {
    currentTheme.value = theme;

    // 这里可以实现主题切换逻辑
    if (theme === 'system') {
      // 检测系统主题
      isDarkMode.value = false; // 简化处理
    } else {
      isDarkMode.value = theme === 'dark';
    }
  };

  return {
    currentTheme,
    isDarkMode,
    themes,
    setTheme
  };
}

// 应用设置组合函数
export function useAppSettings() {
  const settings = reactive({
    autoPlay: true,
    autoNext: true,
    quality: 'auto',
    downloadOnlyWifi: true,
    notifications: true,
    analytics: true
  });

  const videoQualities = [
    { value: 'auto', label: '自动' },
    { value: '1080p', label: '1080P' },
    { value: '720p', label: '720P' },
    { value: '480p', label: '480P' }
  ];

  const updateSetting = (key: keyof typeof settings, value: any) => {
    settings[key] = value;
    // 这里可以保存到本地存储
    console.log(`设置已更新: ${key} = ${value}`);
  };

  const resetSettings = () => {
    Object.assign(settings, {
      autoPlay: true,
      autoNext: true,
      quality: 'auto',
      downloadOnlyWifi: true,
      notifications: true,
      analytics: true
    });
  };

  return {
    settings,
    videoQualities,
    updateSetting,
    resetSettings
  };
}

// 网络状态组合函数
export function useNetwork() {
  const isOnline = ref(true);
  const connectionType = ref<'wifi' | 'cellular' | 'none'>('wifi');
  const isSlowConnection = ref(false);

  // 简化的网络检测
  const checkConnection = () => {
    // 这里应该实现真实的网络检测
    isOnline.value = true;
    connectionType.value = 'wifi';
    isSlowConnection.value = false;
  };

  const isWifiConnected = () => {
    return isOnline.value && connectionType.value === 'wifi';
  };

  const isCellularConnected = () => {
    return isOnline.value && connectionType.value === 'cellular';
  };

  return {
    isOnline,
    connectionType,
    isSlowConnection,
    checkConnection,
    isWifiConnected,
    isCellularConnected
  };
}

// 权限管理组合函数
export function usePermissions() {
  const permissions = reactive({
    storage: false,
    camera: false,
    microphone: false,
    location: false
  });

  const requestPermission = async (permission: keyof typeof permissions) => {
    try {
      // 这里应该实现真实的权限请求
      permissions[permission] = true;
      return true;
    } catch (error) {
      console.error(`权限请求失败: ${permission}`, error);
      return false;
    }
  };

  const checkPermission = async (permission: keyof typeof permissions) => {
    // 这里应该检查权限状态
    return permissions[permission];
  };

  const requestAllPermissions = async () => {
    const results = await Promise.all([
      requestPermission('storage'),
      requestPermission('camera'),
      requestPermission('microphone'),
      requestPermission('location')
    ]);

    return results.every(result => result);
  };

  return {
    permissions,
    requestPermission,
    checkPermission,
    requestAllPermissions
  };
}
import { LocalizationService } from '@/services/localization.service';

/**
 * Vue 3 组合式API的国际化工具
 * 用于在 <script setup> 中替代 $t 函数
 */
export function useI18n() {
  /**
   * 翻译函数
   * @param key 翻译键
   * @param params 参数对象
   * @returns 翻译后的文本
   */
  const t = (key: string, params?: any): string => {
    return LocalizationService.t(key, params);
  };

  /**
   * 获取当前语言
   * @returns 当前语言代码
   */
  const getCurrentLanguage = (): string => {
    return LocalizationService.getCurrentLanguage();
  };

  /**
   * 设置语言
   * @param language 语言代码
   */
  const setLanguage = async (language: string): Promise<void> => {
    await LocalizationService.setLanguage(language);
  };

  /**
   * 获取支持的语言列表
   * @returns 支持的语言列表
   */
  const getSupportedLanguages = () => {
    return LocalizationService.getSupportedLanguages();
  };

  return {
    t,
    getCurrentLanguage,
    setLanguage,
    getSupportedLanguages
  };
}

/**
 * 快速翻译函数（不依赖组合式API）
 * @param key 翻译键
 * @param params 参数对象
 * @returns 翻译后的文本
 */
export const t = (key: string, params?: any): string => {
  return LocalizationService.t(key, params);
};
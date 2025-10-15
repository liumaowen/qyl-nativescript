import { localize } from '@nativescript/localize';
import { ApplicationSettings, Device } from '@nativescript/core';

export class LocalizationService {
  private static currentLanguage: string = 'zh-CN';

  static initialize() {
    // 获取设备语言或已保存的语言设置
    const savedLanguage = ApplicationSettings.getString('app_language');
    const deviceLanguage = Device.language;

    this.currentLanguage = savedLanguage || this.mapDeviceLanguage(deviceLanguage) || 'zh-CN';

    console.log('当前语言设置:', this.currentLanguage);
  }

  static getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  static async setLanguage(language: string): Promise<void> {
    this.currentLanguage = language;
    ApplicationSettings.setString('app_language', language);

    // 重新加载应用以应用语言更改
    console.log('语言已更改为:', language);

    // 这里可以发出事件通知应用重新加载
  }

  static getSupportedLanguages(): Array<{code: string, name: string}> {
    return [
      { code: 'zh-CN', name: '简体中文' },
      { code: 'en-US', name: 'English' },
      { code: 'es-ES', name: 'Español' },
      { code: 'fr-FR', name: 'Français' },
      { code: 'de-DE', name: 'Deutsch' }
    ];
  }

  private static mapDeviceLanguage(deviceLang: string): string {
    const langMap: { [key: string]: string } = {
      'zh': 'zh-CN',
      'en': 'en-US',
      'es': 'es-ES',
      'fr': 'fr-FR',
      'de': 'de-DE'
    };

    const baseLang = deviceLang.split('-')[0];
    return langMap[baseLang] || 'zh-CN';
  }

  // 翻译函数
  static t(key: string, params?: any): string {
    return localize(key, params) || key;
  }
}
import { ApplicationSettings, Device } from '@nativescript/core';
import * as CryptoJS from 'crypto-js';

export class UserAnalytics {
  private static deviceId: string;

  static async initializeAnalytics(): Promise<void> {
    try {
      // 生成或获取设备ID
      this.deviceId = ApplicationSettings.getString('deviceId') || this.generateDeviceId();
      ApplicationSettings.setString('deviceId', this.deviceId);

      // 获取设备信息
      const deviceInfo = {
        model: Device.model,
        osVersion: Device.osVersion,
        language: Device.language,
        region: Device.region
      };

      console.log('用户分析初始化完成', deviceInfo);
    } catch (error) {
      console.error('用户分析初始化失败:', error);
    }
  }

  private static generateDeviceId(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString();
    return CryptoJS.MD5(timestamp + random + Device.model).toString();
  }

  static trackEvent(eventName: string, properties?: any): void {
    const event = {
      name: eventName,
      properties: properties || {},
      timestamp: Date.now(),
      deviceId: this.deviceId
    };

    console.log('跟踪事件:', event);
    // 这里可以发送到分析服务
  }

  static trackScreenView(screenName: string): void {
    this.trackEvent('screen_view', { screen_name: screenName });
  }
}
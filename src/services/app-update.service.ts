import { Utils, isAndroid } from '@nativescript/core';

declare let android: any;

export class AppUpdateService {
  static async checkForUpdates(): Promise<boolean> {
    try {
      // 检查应用更新逻辑
      const response = await fetch('https://api.yourapp.com/version');
      const data = await response.json();

      const currentVersion = this.getCurrentVersion();
      const latestVersion = data.version;

      if (this.isNewerVersion(latestVersion, currentVersion)) {
        return true;
      }

      return false;
    } catch (error) {
      console.error('检查更新失败:', error);
      return false;
    }
  }

  static async downloadAndInstall(downloadUrl: string): Promise<void> {
    try {
      // 下载APK
      console.log('开始下载更新包:', downloadUrl);

      // 在Android上，可以使用原生方法下载并安装APK
      if (isAndroid) {
        const intent = new android.content.Intent(android.content.Intent.ACTION_VIEW);
        intent.setData(android.net.Uri.parse(downloadUrl));
        intent.setFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK);

        const context = Utils.ad.getApplicationContext();
        context.startActivity(intent);
      }
    } catch (error) {
      console.error('下载安装失败:', error);
      throw error;
    }
  }

  private static getCurrentVersion(): string {
    // 返回当前应用版本
    return '4.0.0';
  }

  private static isNewerVersion(latest: string, current: string): boolean {
    const latestParts = latest.split('.').map(Number);
    const currentParts = current.split('.').map(Number);

    for (let i = 0; i < Math.max(latestParts.length, currentParts.length); i++) {
      const latestPart = latestParts[i] || 0;
      const currentPart = currentParts[i] || 0;

      if (latestPart > currentPart) return true;
      if (latestPart < currentPart) return false;
    }

    return false;
  }
}
<template>
  <Page actionBarHidden="true">
    <ScrollView>
      <StackLayout class="page-container">

        <!-- Header -->
        <StackLayout class="header-section">
          <Label :text="$t('navigation.more')" class="section-title" />
        </StackLayout>

        <!-- Settings List -->
        <StackLayout class="settings-section">
          <StackLayout class="setting-item" @tap="openLanguageSettings">
            <Label text="🌍 语言设置" class="setting-label" />
            <Label text=">" class="setting-arrow" />
          </StackLayout>

          <StackLayout class="setting-item" @tap="checkUpdate">
            <Label text="🔄 检查更新" class="setting-label" />
            <Label text=">" class="setting-arrow" />
          </StackLayout>

          <StackLayout class="setting-item" @tap="openAbout">
            <Label text="ℹ️ 关于应用" class="setting-label" />
            <Label text=">" class="setting-arrow" />
          </StackLayout>
        </StackLayout>

      </StackLayout>
    </ScrollView>
  </Page>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { UserAnalytics } from '@/services/analytics.service';
import { AppUpdateService } from '@/services/app-update.service';
import { Dialogs } from '@nativescript/core';

// Methods
const openLanguageSettings = () => {
  UserAnalytics.trackEvent('language_settings_opened');
  // 这里可以打开语言选择对话框
};

const checkUpdate = async () => {
  try {
    const hasUpdate = await AppUpdateService.checkForUpdates();

    if (hasUpdate) {
      const result = await Dialogs.confirm({
        title: '发现新版本',
        message: '是否下载并安装更新？',
        okButtonText: '更新',
        cancelButtonText: '取消'
      });

      if (result) {
        // 这里应该有下载URL，简化处理
        await AppUpdateService.downloadAndInstall('https://example.com/update.apk');
      }
    } else {
      await Dialogs.alert({
        title: '检查更新',
        message: '当前已是最新版本',
        okButtonText: '确定'
      });
    }

    UserAnalytics.trackEvent('check_update', { hasUpdate });
  } catch (error) {
    console.error('检查更新失败:', error);
  }
};

const openAbout = () => {
  Dialogs.alert({
    title: '关于应用',
    message: 'Vue 3 + NativeScript 视频应用\n版本：4.0.0',
    okButtonText: '确定'
  });

  UserAnalytics.trackEvent('about_opened');
};

// Lifecycle
onMounted(() => {
  UserAnalytics.trackScreenView('tab3');
});
</script>
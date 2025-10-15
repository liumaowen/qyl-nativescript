<template>
  <Page actionBarHidden="true">
    <ScrollView>
      <StackLayout class="page-container">

        <!-- Header -->
        <StackLayout class="header-section">
          <Label :text="$t('navigation.my')" class="section-title" />
        </StackLayout>

        <!-- User Profile -->
        <StackLayout class="profile-section">
          <StackLayout class="avatar-container">
            <Label text="👤" class="avatar-icon" />
          </StackLayout>
          <Label text="用户" class="username" />
          <Label text="欢迎使用应用" class="user-subtitle" />
        </StackLayout>

        <!-- Menu Items -->
        <StackLayout class="menu-section">
          <StackLayout class="menu-item" @tap="openHistory">
            <Label text="📺 观看历史" class="menu-label" />
            <Label text=">" class="menu-arrow" />
          </StackLayout>

          <StackLayout class="menu-item" @tap="openFavorites">
            <Label text="❤️ 我的收藏" class="menu-label" />
            <Label text=">" class="menu-arrow" />
          </StackLayout>

          <StackLayout class="menu-item" @tap="openDownloads">
            <Label text="📥 离线下载" class="menu-label" />
            <Label text=">" class="menu-arrow" />
          </StackLayout>

          <StackLayout class="menu-item" @tap="openSettings">
            <Label text="⚙️ 设置" class="menu-label" />
            <Label text=">" class="menu-arrow" />
          </StackLayout>
        </StackLayout>

        <!-- App Info -->
        <StackLayout class="info-section">
          <Label :text="`版本：${appVersion}`" class="version-text" />
          <Label text="Vue 3 + NativeScript" class="tech-text" />
        </StackLayout>

      </StackLayout>
    </ScrollView>
  </Page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { UserAnalytics } from '@/services/analytics.service';
import { Dialogs } from '@nativescript/core';

// State
const appVersion = ref('4.0.0');

// Methods
const openHistory = () => {
  UserAnalytics.trackEvent('history_opened');
  Dialogs.alert({
    title: '观看历史',
    message: '功能开发中...',
    okButtonText: '确定'
  });
};

const openFavorites = () => {
  UserAnalytics.trackEvent('favorites_opened');
  Dialogs.alert({
    title: '我的收藏',
    message: '功能开发中...',
    okButtonText: '确定'
  });
};

const openDownloads = () => {
  UserAnalytics.trackEvent('downloads_opened');
  Dialogs.alert({
    title: '离线下载',
    message: '功能开发中...',
    okButtonText: '确定'
  });
};

const openSettings = () => {
  UserAnalytics.trackEvent('settings_opened');
  Dialogs.alert({
    title: '设置',
    message: '功能开发中...',
    okButtonText: '确定'
  });
};

// Lifecycle
onMounted(() => {
  UserAnalytics.trackScreenView('my');
});
</script>
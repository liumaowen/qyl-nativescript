<template>
  <Page action-bar-hidden="true">
    <ScrollView>
      <StackLayout class="analytics-demo">
        <!-- Header -->
        <StackLayout class="header-section">
          <Button
            text="←"
            class="back-button"
            @tap="goBack"
          />
          <Label
            text="分析演示"
            class="page-title"
          />
        </StackLayout>

        <!-- Analytics Controls -->
        <StackLayout class="demo-section">
          <Label
            text="用户分析演示"
            class="section-title"
          />

          <Button
            text="触发事件: 按钮点击"
            class="demo-button"
            @tap="trackButtonClick"
          />

          <Button
            text="触发事件: 页面浏览"
            class="demo-button"
            @tap="trackPageView"
          />

          <Button
            text="触发事件: 视频播放"
            class="demo-button"
            @tap="trackVideoPlay"
          />

          <Button
            text="显示设备信息"
            class="demo-button"
            @tap="showDeviceInfo"
          />
        </StackLayout>

        <!-- Event Log -->
        <StackLayout class="log-section">
          <Label
            text="事件日志"
            class="section-title"
          />
          <ScrollView
            height="200"
            class="log-container"
          >
            <StackLayout>
              <Label
                v-for="(log, index) in eventLogs"
                :key="index"
                :text="log"
                class="log-item"
                text-wrap="true"
              />
            </StackLayout>
          </ScrollView>
        </StackLayout>
      </StackLayout>
    </ScrollView>
  </Page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Device, Dialogs } from '@nativescript/core';
import { UserAnalytics } from '@/services/analytics.service';

// Router
const router = useRouter();

// State
const eventLogs = ref<string[]>([]);

// Methods
const addLog = (message: string) => {
  const timestamp = new Date().toLocaleTimeString();
  eventLogs.value.unshift(`[${timestamp}] ${message}`);

  // 限制日志条数
  if (eventLogs.value.length > 20) {
    eventLogs.value = eventLogs.value.slice(0, 20);
  }
};

const trackButtonClick = () => {
  UserAnalytics.trackEvent('demo_button_click', {
    buttonName: 'analytics_demo_button',
    timestamp: Date.now()
  });

  addLog('事件已触发: demo_button_click');
};

const trackPageView = () => {
  UserAnalytics.trackScreenView('analytics_demo_manual');
  addLog('页面浏览事件已触发: analytics_demo_manual');
};

const trackVideoPlay = () => {
  UserAnalytics.trackEvent('demo_video_play', {
    videoId: 'demo_video_123',
    videoTitle: '演示视频',
    source: 'analytics_demo'
  });

  addLog('视频播放事件已触发: demo_video_play');
};

const showDeviceInfo = async () => {
  const deviceInfo = {
    型号: Device.model,
    系统版本: Device.osVersion,
    语言: Device.language,
    地区: Device.region,
    设备类型: Device.deviceType
  };

  const infoText = Object.entries(deviceInfo)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');

  await Dialogs.alert({
    title: '设备信息',
    message: infoText,
    okButtonText: '确定'
  });

  UserAnalytics.trackEvent('device_info_viewed', deviceInfo);
  addLog('设备信息已显示');
};

const goBack = () => {
  router.back();
};

// Lifecycle
onMounted(() => {
  UserAnalytics.trackScreenView('analytics_demo');
  addLog('分析演示页面已加载');
});
</script>
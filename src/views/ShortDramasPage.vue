<template>
  <Page actionBarHidden="true">
    <ScrollView>
      <StackLayout class="page-container">

        <!-- Header -->
        <StackLayout class="header-section">
          <Label :text="t('navigation.shortDramas')" class="section-title" />
        </StackLayout>

        <!-- 通用视频滑动器 -->
        <UniversalVideoSwiper
          v-if="videoList.length > 0"
          :videoList="videoList"
          :containerWidth="containerWidth"
          :containerHeight="containerHeight"
          orientation="vertical"
          :autoPlay="true"
          analyticsPrefix="short_dramas"
          @update:currentIndex="onCurrentIndexUpdate"
          @update:progress="onProgressUpdate"
          @pageChange="onPageChange"
          @retry="loadShortDramas"
        />

        <!-- Loading -->
        <ActivityIndicator :busy="isLoading" class="loading-indicator" />

        <!-- Empty State -->
        <StackLayout v-if="!isLoading && videoList.length === 0" class="empty-state">
          <Label :text="t('common.noData', '暂无短剧')" class="empty-text" />
          <Button :text="t('common.retry', '重试')" @tap="loadShortDramas" class="retry-button" />
        </StackLayout>

      </StackLayout>
    </ScrollView>
  </Page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Screen } from '@nativescript/core';
import { VideoService } from '@/services/video.service';
import { UserAnalytics } from '@/services/analytics.service';
import { VideoItem } from '@/types/video';
import { useI18n } from '@/composables/useI18n';
import UniversalVideoSwiper from '@/components/UniversalVideoSwiper.vue';

// State
const videoList = ref<VideoItem[]>([]);
const isLoading = ref(false);
const containerWidth = ref(Screen.mainScreen.widthDIPs);
const containerHeight = ref(Screen.mainScreen.heightDIPs);

// I18n
const { t } = useI18n();

// Methods
const loadShortDramas = async () => {
  isLoading.value = true;

  try {
    const videos = await VideoService.getShortVideos();
    videoList.value = videos;

    UserAnalytics.trackEvent('short_dramas_loaded', { count: videos.length });
  } catch (error) {
    console.error('加载短剧失败:', error);
    UserAnalytics.trackEvent('short_dramas_load_error', { error: error.toString() });
  } finally {
    isLoading.value = false;
  }
};

const onCurrentIndexUpdate = (newIndex: number) => {
  UserAnalytics.trackEvent('short_drama_index_change', {
    newIndex,
    videoId: videoList.value[newIndex]?.id
  });
};

const onProgressUpdate = (newProgress: number[]) => {
  // 进度更新处理（如果需要）
};

const onPageChange = (index: number, video: VideoItem) => {
  UserAnalytics.trackEvent('short_drama_page_change', {
    videoId: video.id,
    videoIndex: index
  });
};

// Lifecycle
onMounted(() => {
  loadShortDramas();
  UserAnalytics.trackScreenView('short_dramas');
});
</script>
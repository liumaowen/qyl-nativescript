<template>
  <Page actionBarHidden="true">
    <ScrollView>
      <StackLayout class="tab2-container">

        <!-- Header Section -->
        <StackLayout class="header-section">
          <Label :text="t('navigation.videos')" class="section-title" />
        </StackLayout>

        <!-- 通用视频滑动器 -->
        <UniversalVideoSwiper
          :videoList="videoList"
          :containerWidth="containerWidth"
          :containerHeight="containerHeight"
          orientation="vertical"
          :autoPlay="false"
          :spacing="10"
          :peaking="20"
          analyticsPrefix="tab2_videos"
          :isLoading="isLoading"
          :loadingText="t('common.loading', '加载中...')"
          :emptyText="t('common.noData', '暂无数据')"
          :retryText="t('common.retry', '重试')"
          @pageChange="onPageChange"
          @videoPlay="onVideoPlay"
          @retry="loadVideos"
        >
          <!-- 自定义视频卡片模板 -->
          <template #video-item="{ video, index, isPlaying, progress, onPlay, onPause }">
            <StackLayout class="video-card-container">
              <!-- Video Thumbnail -->
              <Image :src="video.poster" class="video-thumbnail" />

              <!-- Video Info Overlay -->
              <StackLayout class="video-info-overlay">
                <Label :text="video.title" class="video-title" textWrap="true" />
                <Label
                  v-if="video.duration"
                  :text="`${t('video.duration')}: ${video.duration}分钟`"
                  class="video-duration"
                />
              </StackLayout>

              <!-- Play Button Overlay -->
              <StackLayout class="play-overlay" @tap="onPlay">
                <Label
                  :text="isPlaying ? '⏸️' : '▶️'"
                  class="play-icon"
                />
              </StackLayout>

              <!-- Progress Bar -->
              <StackLayout v-if="progress > 0" class="progress-overlay">
                <Progress :value="progress" :maxValue="100" class="video-progress" />
              </StackLayout>
            </StackLayout>
          </template>
        </UniversalVideoSwiper>

      </StackLayout>
    </ScrollView>
  </Page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Screen } from '@nativescript/core';
import { VideoService } from '@/services/video.service';
import { UserAnalytics } from '@/services/analytics.service';
import { VideoItem } from '@/types/video';
import { useGlobalState } from '@/store/state';
import { useI18n } from '@/composables/useI18n';
import UniversalVideoSwiper from '@/components/UniversalVideoSwiper.vue';

// Router
const router = useRouter();

// I18n
const { t } = useI18n();

// State
const { setCurrentVideo, setLoading } = useGlobalState();
const videoList = ref<VideoItem[]>([]);
const isLoading = ref(false);
const containerWidth = ref(Screen.mainScreen.widthDIPs);
const containerHeight = ref(Screen.mainScreen.heightDIPs - 100); // 减去头部高度

// Methods
const loadVideos = async () => {
  setLoading(true);
  isLoading.value = true;

  try {
    const videos = await VideoService.getShortVideos();
    videoList.value = videos;

    UserAnalytics.trackEvent('tab2_videos_loaded', { count: videos.length });
  } catch (error:any) {
    console.error('加载视频失败:', error);
    UserAnalytics.trackEvent('tab2_videos_load_error', { error: error.toString() });
  } finally {
    setLoading(false);
    isLoading.value = false;
  }
};

const onPageChange = (index: number, video: VideoItem) => {
  setCurrentVideo(video);

  UserAnalytics.trackEvent('tab2_video_page_change', {
    videoId: video.id,
    videoTitle: video.title,
    index
  });
};

const onVideoPlay = (index: number, video: VideoItem) => {
  setCurrentVideo(video);

  UserAnalytics.trackEvent('tab2_video_play_started', {
    videoId: video.id,
    videoTitle: video.title,
    index
  });
};

// Lifecycle
onMounted(() => {
  loadVideos();
  UserAnalytics.trackScreenView('tab2');
});
</script>
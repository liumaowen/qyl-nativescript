<template>
  <Page action-bar-hidden="true">
    <ScrollView>
      <StackLayout class="page-container">
        <!-- Header -->
        <StackLayout class="header-section">
          <Label
            :text="$t('navigation.home')"
            class="section-title"
          />
        </StackLayout>

        <!-- Welcome Section -->
        <StackLayout class="welcome-section">
          <Label
            text="欢迎使用视频应用"
            class="welcome-title"
          />
          <Label
            text="发现精彩视频内容"
            class="welcome-subtitle"
          />
        </StackLayout>

        <!-- Featured Videos -->
        <StackLayout class="featured-section">
          <Label
            text="推荐视频"
            class="section-label"
          />
          <ListView
            :items="featuredVideos"
            class="featured-list"
          >
            <template #default="{ item }">
              <StackLayout
                class="featured-item"
                @tap="() => openVideo(item)"
              >
                <Image
                  :src="item.poster"
                  class="featured-image"
                />
                <Label
                  :text="item.title"
                  class="featured-title"
                />
              </StackLayout>
            </template>
          </ListView>
        </StackLayout>
      </StackLayout>
    </ScrollView>
  </Page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { VideoService } from '@/services/video.service';
import { UserAnalytics } from '@/services/analytics.service';
import { VideoItem } from '@/types/video';

// Router
const router = useRouter();

// State
const featuredVideos = ref<VideoItem[]>([]);

// Methods
const loadFeaturedVideos = async () => {
  try {
    const videos = await VideoService.getShortVideos();
    featuredVideos.value = videos.slice(0, 5); // 取前5个作为推荐

    UserAnalytics.trackEvent('featured_videos_loaded', { count: featuredVideos.value.length });
  } catch (error) {
    console.error('加载推荐视频失败:', error);
  }
};

const openVideo = (video: VideoItem) => {
  router.push(`/dramas-detail/${video.id}`);

  UserAnalytics.trackEvent('featured_video_selected', {
    videoId: video.id,
    videoTitle: video.title
  });
};

// Lifecycle
onMounted(() => {
  loadFeaturedVideos();
  UserAnalytics.trackScreenView('tab1');
});
</script>
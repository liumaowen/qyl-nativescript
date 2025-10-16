<template>
  <Page action-bar-hidden="true">
    <StackLayout class="page-container">
      <!-- Header -->
      <StackLayout class="header-container">
        <Button
          text="←"
          class="back-button"
          @tap="goBack"
        />
        <Label
          :text="t('page.episode', { number: titleCount })"
          class="page-title"
        />
      </StackLayout>

      <!-- 通用视频滑动器 -->
      <UniversalVideoSwiper
        :video-list="dramaDetails"
        :container-width="containerWidth"
        :container-height="containerHeight"
        orientation="horizontal"
        :auto-play="true"
        analytics-prefix="drama_detail"
        @update:current-index="onCurrentIndexUpdate"
        @page-change="onPageChange"
      />
    </StackLayout>
  </Page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Screen } from '@nativescript/core';
import { VideoService } from '@/services/video.service';
import { UserAnalytics } from '@/services/analytics.service';
import { MovieDetail } from '@/types/video';
import { useI18n } from '@/composables/useI18n';
import UniversalVideoSwiper from '@/components/UniversalVideoSwiper.vue';

// Router
const route = useRoute();
const router = useRouter();

// I18n
const { t } = useI18n();

// State
const dramaDetails = ref<MovieDetail[]>([]);
const containerWidth = ref(Screen.mainScreen.widthDIPs);
const containerHeight = ref(Screen.mainScreen.heightDIPs - 50);
const titleCount = ref(1);

// Computed
const videoId = computed(() => route.params.id as string);

// Methods
const loadVideoDetails = async (id: string) => {
  try {
    const details = await VideoService.getShortDetail(id);
    dramaDetails.value = details;
    titleCount.value = details.length > 0 ? details[0].episode || 1 : 1;

    UserAnalytics.trackScreenView('dramas_detail');
    UserAnalytics.trackEvent('drama_detail_loaded', {
      videoId: id,
      episodeCount: details.length
    });
  } catch (error: any) {
    console.error('加载视频详情失败:', error);
    UserAnalytics.trackEvent('drama_detail_load_error', {
      videoId: id,
      error: error.toString()
    });
  }
};

const onCurrentIndexUpdate = (newIndex: number) => {
  const currentEpisode = dramaDetails.value[newIndex];
  if (currentEpisode) {
    titleCount.value = currentEpisode.episode || newIndex + 1;
  }
};

const onPageChange = (index: number, episode: MovieDetail) => {
  titleCount.value = episode.episode || index + 1;

  UserAnalytics.trackEvent('episode_change', {
    videoId: videoId.value,
    episodeIndex: index,
    episodeNumber: titleCount.value
  });
};

const goBack = () => {
  router.back();
  UserAnalytics.trackEvent('dramas_detail_back');
};

// Lifecycle
onMounted(() => {
  if (videoId.value) {
    loadVideoDetails(videoId.value);
  }
});
</script>
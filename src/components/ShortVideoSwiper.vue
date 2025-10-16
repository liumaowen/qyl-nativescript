<template>
  <StackLayout
    class="swiper-container"
    :height="containerHeight"
  >
    <ListView
      :items="videoList"
      orientation="horizontal"
      class="video-swiper"
      @item-tap="onVideoTap"
    >
      <template #default="{ item, index }">
        <ShortVideoItem
          :video="item"
          :index="index"
          :container-width="containerWidth"
          :container-height="containerHeight"
          :progress="progress[index] || 0"
          :is-playing="currentPlayingIndex === index"
          @play="onVideoPlay"
          @pause="onVideoPause"
          @progress-change="onProgressChange"
        />
      </template>
    </ListView>
  </StackLayout>
</template>

<script setup lang="ts">
import { ref, reactive, defineProps, defineEmits, watch } from 'vue';
import { VideoItem } from '@/types/video';
import { UserAnalytics } from '@/services/analytics.service';
import ShortVideoItem from './ShortVideoItem.vue';

// Props
interface Props {
  videoList: VideoItem[];
  containerWidth: number;
  containerHeight: number;
  progress: number[];
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  'update:progress': [progress: number[]];
  'update:swiperChange': [index: number];
}>();

// State
const currentPlayingIndex = ref<number>(-1);
const progress = reactive<number[]>([...props.progress]);

// Methods
const onVideoPlay = (index: number) => {
  // 暂停其他视频
  if (currentPlayingIndex.value !== -1 && currentPlayingIndex.value !== index) {
    currentPlayingIndex.value = -1;
  }
  currentPlayingIndex.value = index;

  UserAnalytics.trackEvent('swiper_video_play', {
    videoIndex: index,
    videoId: props.videoList[index]?.id
  });
};

const onVideoPause = (index: number) => {
  if (currentPlayingIndex.value === index) {
    currentPlayingIndex.value = -1;
  }
};

const onProgressChange = (index: number, newProgress: number) => {
  progress[index] = newProgress;
  emit('update:progress', [...progress]);
};

const onVideoTap = (event: any) => {
  const { index } = event;
  emit('update:swiperChange', index);

  UserAnalytics.trackEvent('swiper_change', {
    newIndex: index,
    videoId: props.videoList[index]?.id
  });
};

// Watch for progress changes
watch(() => props.progress, (newProgress) => {
  Object.assign(progress, newProgress);
}, { deep: true });
</script>
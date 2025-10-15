<template>
  <Pager
    v-if="videoList.length > 0"
    :items="videoList"
    :orientation="orientation"
    :selectedIndex="currentIndex"
    @selectedIndexChanged="onPageChanged"
    :class="containerClass"
    :height="containerHeight"
    :width="containerWidth"
    :spacing="spacing"
    :peaking="peaking"
  >
    <template #default="{ item, index }">
      <StackLayout :class="pageContainerClass">
        <slot
          name="video-item"
          :video="item"
          :index="index"
          :isPlaying="currentIndex === index && isPlaying"
          :progress="progress[index] || 0"
          :onPlay="() => handleVideoPlay(index)"
          :onPause="() => handleVideoPause(index)"
          :onProgressChange="(prog: number) => handleProgressChange(index, prog)"
        >
          <!-- 默认视频组件 -->
          <ShortVideoItem
            :video="item"
            :index="index"
            :containerWidth="containerWidth"
            :containerHeight="containerHeight"
            :progress="progress[index] || 0"
            :isPlaying="currentIndex === index && isPlaying"
            @play="handleVideoPlay"
            @pause="handleVideoPause"
            @progressChange="handleProgressChange"
          />
        </slot>
      </StackLayout>
    </template>
  </Pager>

  <!-- 加载状态 -->
  <StackLayout v-else-if="isLoading" class="loading-container">
    <ActivityIndicator :busy="true" class="loading-indicator" />
    <Label :text="loadingText" class="loading-text" />
  </StackLayout>

  <!-- 空状态 -->
  <StackLayout v-else class="empty-container">
    <Label :text="emptyText" class="empty-text" />
    <Button
      v-if="showRetryButton"
      :text="retryText"
      @tap="$emit('retry')"
      class="retry-button"
    />
  </StackLayout>
</template>

<script setup lang="ts">
import { ref, computed, defineProps, defineEmits, watch, onMounted, onUnmounted } from 'vue';
import { VideoItem, MovieDetail } from '@/types/video';
import { UserAnalytics } from '@/services/analytics.service';
import { VideoPlayerService } from '@/services/video-player.service';
import { useI18n } from '@/composables/useI18n';
import ShortVideoItem from './ShortVideoItem.vue';

// Props
interface Props {
  // 基础数据
  videoList: (VideoItem | MovieDetail)[];
  containerWidth: number;
  containerHeight: number;

  // 滑动配置
  orientation?: 'vertical' | 'horizontal';
  initialIndex?: number;
  autoPlay?: boolean;

  // UI配置
  spacing?: number;
  peaking?: number;
  containerClass?: string;
  pageContainerClass?: string;

  // 状态配置
  isLoading?: boolean;
  loadingText?: string;
  emptyText?: string;
  retryText?: string;
  showRetryButton?: boolean;

  // 高级配置
  enableVideoControl?: boolean;
  preloadCount?: number;
  analyticsPrefix?: string;
}

const props = withDefaults(defineProps<Props>(), {
  orientation: 'vertical',
  initialIndex: 0,
  autoPlay: true,
  spacing: 0,
  peaking: 0,
  containerClass: 'video-swiper-container',
  pageContainerClass: 'video-page-container',
  isLoading: false,
  loadingText: '加载中...',
  emptyText: '暂无数据',
  retryText: '重试',
  showRetryButton: true,
  enableVideoControl: true,
  preloadCount: 2,
  analyticsPrefix: 'video_swiper'
});

// Emits
const emit = defineEmits<{
  'update:currentIndex': [index: number];
  'update:progress': [progress: number[]];
  'pageChange': [index: number, video: VideoItem | MovieDetail];
  'videoPlay': [index: number, video: VideoItem | MovieDetail];
  'videoPause': [index: number, video: VideoItem | MovieDetail];
  'progressChange': [index: number, progress: number];
  'retry': [];
}>();

// I18n
const { t } = useI18n();

// State
const currentIndex = ref(props.initialIndex);
const isPlaying = ref(false);
const progress = ref<number[]>([]);

// Computed
const currentVideo = computed(() => {
  return props.videoList[currentIndex.value] || null;
});

// Methods
const onPageChanged = (args: any) => {
  const newIndex = args.value;
  const oldIndex = currentIndex.value;

  if (newIndex === oldIndex) return;

  currentIndex.value = newIndex;

  // 暂停之前的视频
  if (props.enableVideoControl && oldIndex >= 0) {
    const oldVideo = props.videoList[oldIndex];
    if (oldVideo.id) {
      VideoPlayerService.pauseVideoById(oldVideo.id);
    }
  }

  // 预加载相邻视频
  preloadAdjacentVideos(newIndex);

  // 自动播放新视频
  if (props.autoPlay && props.enableVideoControl) {
    setTimeout(() => {
      const newVideo = props.videoList[newIndex];
      if (newVideo.id) {
        isPlaying.value = true;
        VideoPlayerService.playVideoById(newVideo.id);
      }
    }, 300);
  }

  // 发送事件
  emit('update:currentIndex', newIndex);
  emit('pageChange', newIndex, props.videoList[newIndex]);

  // 分析统计
  UserAnalytics.trackEvent(`${props.analyticsPrefix}_page_change`, {
    fromIndex: oldIndex,
    toIndex: newIndex,
    videoId: currentVideo.value?.id,
    orientation: props.orientation
  });
};

const handleVideoPlay = (index: number) => {
  if (index === currentIndex.value) {
    isPlaying.value = true;
  }

  const video = props.videoList[index];
  if (video) {
    emit('videoPlay', index, video);

    UserAnalytics.trackEvent(`${props.analyticsPrefix}_video_play`, {
      videoId: video.id,
      index
    });
  }
};

const handleVideoPause = (index: number) => {
  if (index === currentIndex.value) {
    isPlaying.value = false;
  }

  const video = props.videoList[index];
  if (video) {
    emit('videoPause', index, video);

    UserAnalytics.trackEvent(`${props.analyticsPrefix}_video_pause`, {
      videoId: video.id,
      index
    });
  }
};

const handleProgressChange = (index: number, newProgress: number) => {
  progress.value[index] = newProgress;
  emit('update:progress', [...progress.value]);
  emit('progressChange', index, newProgress);
};

const preloadAdjacentVideos = (centerIndex: number) => {
  if (!props.enableVideoControl) return;

  const preloadRange = props.preloadCount;

  for (let i = centerIndex - preloadRange; i <= centerIndex + preloadRange; i++) {
    if (i >= 0 && i < props.videoList.length && i !== centerIndex) {
      const video = props.videoList[i];
      if (video.id && video.videoUrl) {
        VideoPlayerService.preloadVideo(video.id, video.videoUrl);
      }
    }
  }
};

const initializeComponent = () => {
  // 初始化进度数组
  progress.value = new Array(props.videoList.length).fill(0);

  // 预加载初始视频
  if (props.enableVideoControl && props.videoList.length > 0) {
    preloadAdjacentVideos(currentIndex.value);

    // 自动播放第一个视频
    if (props.autoPlay) {
      setTimeout(() => {
        const firstVideo = props.videoList[currentIndex.value];
        if (firstVideo.id) {
          isPlaying.value = true;
          VideoPlayerService.playVideoById(firstVideo.id);
        }
      }, 500);
    }
  }
};

// 对外暴露的方法
const goToPage = (index: number) => {
  if (index >= 0 && index < props.videoList.length) {
    currentIndex.value = index;
  }
};

const playCurrentVideo = () => {
  if (currentVideo.value.id && props.enableVideoControl) {
    isPlaying.value = true;
    VideoPlayerService.playVideoById(currentVideo.value.id);
  }
};

const pauseCurrentVideo = () => {
  if (currentVideo.value.id && props.enableVideoControl) {
    isPlaying.value = false;
    VideoPlayerService.pauseVideoById(currentVideo.value.id);
  }
};

// Watch
watch(() => props.videoList, (newList) => {
  if (newList.length > 0) {
    initializeComponent();
  }
}, { deep: true });

watch(() => props.initialIndex, (newIndex) => {
  currentIndex.value = newIndex;
});

// Lifecycle
onMounted(() => {
  if (props.videoList.length > 0) {
    initializeComponent();
  }
});

onUnmounted(() => {
  // 清理播放器资源
  if (props.enableVideoControl) {
    VideoPlayerService.pauseAllVideos();
  }
});

// 暴露方法给父组件
defineExpose({
  goToPage,
  playCurrentVideo,
  pauseCurrentVideo,
  currentIndex: computed(() => currentIndex.value),
  currentVideo,
  isPlaying: computed(() => isPlaying.value)
});
</script>

<style scoped>
.video-swiper-container {
  background-color: #000;
  width: 100%;
}

.video-page-container {
  width: 100%;
  height: 100%;
  background-color: #000;
}

.loading-container {
  width: 100%;
  height: 100%;
  text-align: center;
  vertical-align: center;
  background-color: #000;
}

.loading-indicator {
  color: #007AFF;
  margin-bottom: 15;
}

.loading-text {
  font-size: 16;
  color: white;
  text-align: center;
}

.empty-container {
  width: 100%;
  height: 100%;
  text-align: center;
  vertical-align: center;
  background-color: #000;
  padding: 50;
}

.empty-text {
  font-size: 18;
  color: #999;
  text-align: center;
  margin-bottom: 20;
}

.retry-button {
  background-color: #007AFF;
  color: white;
  border-radius: 8;
  width: 120;
  height: 44;
}
</style>
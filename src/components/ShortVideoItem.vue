<template>
  <StackLayout class="video-container">

    <!-- 视频播放器 -->
    <VideoPlayer
      ref="videoPlayerRef"
      :src="video.videoUrl"
      :autoplay="false"
      :controls="false"
      width="100%"
      :height="containerHeight"
      class="video-player"
      @finished="onVideoFinished"
      @paused="onVideoPaused"
      @started="onVideoStarted"
      @ready="onVideoReady"
    />

    <!-- 播放暂停按钮 -->
    <StackLayout
      class="center-controls"
      @tap="togglePlay"
      :visibility="isPlaying ? 'collapsed' : 'visible'"
    >
      <Label text="▶️" class="play-button" />
    </StackLayout>

    <!-- 进度条 -->
    <StackLayout class="progress-container">
      <Progress :value="progress" :maxValue="100" class="video-progress" />
    </StackLayout>

    <!-- 视频信息栏 -->
    <StackLayout class="video-info" v-if="video.title">
      <Label :text="video.title" class="video-title" textWrap="true" />

      <StackLayout
        orientation="horizontal"
        class="episode-info"
        v-if="showEpisodeInfo"
      >
        <Label :text="t('video.firstEpisode')" class="episode-text" />
        <StackLayout orientation="horizontal" class="watch-full" @tap="goToDetail">
          <Label :text="t('video.watchFullDrama', { count: video.info?.count })" class="watch-text" />
          <Label text="▶️" class="arrow-icon" />
        </StackLayout>
      </StackLayout>
    </StackLayout>

  </StackLayout>
</template>

<script setup lang="ts">
import { ref, computed, defineProps, defineEmits, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { VideoItem } from '@/types/video';
import { UserAnalytics } from '@/services/analytics.service';
import { VideoPlayerService } from '@/services/video-player.service';
import { useI18n } from '@/composables/useI18n';

// Props
interface Props {
  video: VideoItem;
  index: number;
  containerWidth: number;
  containerHeight: number;
  progress: number;
  isPlaying: boolean;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  play: [index: number];
  pause: [index: number];
  progressChange: [index: number, progress: number];
}>();

// Router
const router = useRouter();

// I18n
const { t } = useI18n();

// Local state
const videoPlayerRef = ref<any>(null);
const isVideoReady = ref(false);

// Computed
const showEpisodeInfo = computed(() => {
  return !!(props.video.info?.count && props.video.info.count > 1);
});

// Methods
const togglePlay = () => {
  if (props.isPlaying) {
    emit('pause', props.index);
  } else {
    emit('play', props.index);
  }

  UserAnalytics.trackEvent('video_play_toggle', {
    videoId: props.video.id,
    isPlaying: !props.isPlaying
  });
};

const onVideoStarted = () => {
  emit('play', props.index);
  UserAnalytics.trackEvent('video_started', { videoId: props.video.id });
};

const onVideoPaused = () => {
  emit('pause', props.index);
  UserAnalytics.trackEvent('video_paused', { videoId: props.video.id });
};

const onVideoFinished = () => {
  emit('pause', props.index);
  emit('progressChange', props.index, 0);
  UserAnalytics.trackEvent('video_finished', { videoId: props.video.id });
};

const onVideoReady = () => {
  isVideoReady.value = true;

  // 更新播放器服务中的引用
  if (videoPlayerRef.value && props.video.id) {
    VideoPlayerService.updatePlayerRef(props.video.id, videoPlayerRef.value);
  }
};

const goToDetail = () => {
  router.push(`/dramas-detail/${props.video.id}`);
  UserAnalytics.trackEvent('navigate_to_detail', { videoId: props.video.id });
};

// Lifecycle
onMounted(() => {
  // 获取播放器状态，初始化预加载
  if (props.video.id) {
    VideoPlayerService.preloadVideo(props.video.id, props.video.videoUrl);
  }

  // 预加载下一个视频
  if (props.index < 10) { // 限制预加载范围
    setTimeout(() => {
      VideoPlayerService.preloadVideo(`${props.video.id}_next`, props.video.videoUrl);
    }, 1000);
  }
});

onUnmounted(() => {
  // 组件销毁时，暂停视频
  VideoPlayerService.pauseAllVideos();
  if (props.video.id) {
    VideoPlayerService.pauseVideoById(props.video.id);
  }
});
</script>
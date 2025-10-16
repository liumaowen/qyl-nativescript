<template>
  <GridLayout
    class="vertical-swiper-container"
    :height="containerHeight"
  >
    <!-- 当前视频 -->
    <StackLayout
      row="0"
      class="video-page"
      :visibility="currentIndex >= 0 ? 'visible' : 'collapsed'"
    >
      <ShortVideoItem
        v-if="currentVideo"
        :video="currentVideo"
        :index="currentIndex"
        :container-width="containerWidth"
        :container-height="containerHeight"
        :progress="progress[currentIndex] || 0"
        :is-playing="isCurrentVideoPlaying"
        @play="onVideoPlay"
        @pause="onVideoPause"
        @progress-change="onProgressChange"
      />
    </StackLayout>

    <!-- 下一个视频 (预加载) -->
    <StackLayout
      row="0"
      class="video-page next-video"
      :visibility="nextVideo ? 'visible' : 'collapsed'"
      :translate-y="containerHeight"
    >
      <ShortVideoItem
        v-if="nextVideo"
        :video="nextVideo"
        :index="currentIndex + 1"
        :container-width="containerWidth"
        :container-height="containerHeight"
        :progress="progress[currentIndex + 1] || 0"
        :is-playing="false"
        @play="onVideoPlay"
        @pause="onVideoPause"
        @progress-change="onProgressChange"
      />
    </StackLayout>

    <!-- 上一个视频 (预加载) -->
    <StackLayout
      row="0"
      class="video-page prev-video"
      :visibility="prevVideo ? 'visible' : 'collapsed'"
      :translate-y="-containerHeight"
    >
      <ShortVideoItem
        v-if="prevVideo"
        :video="prevVideo"
        :index="currentIndex - 1"
        :container-width="containerWidth"
        :container-height="containerHeight"
        :progress="progress[currentIndex - 1] || 0"
        :is-playing="false"
        @play="onVideoPlay"
        @pause="onVideoPause"
        @progress-change="onProgressChange"
      />
    </StackLayout>

    <!-- 手势检测层 -->
    <StackLayout
      row="0"
      class="gesture-layer"
      @pan="onPan"
      @touch="onTouch"
    />

    <!-- 侧边栏 (点赞、分享等) -->
    <StackLayout
      v-if="currentVideo"
      row="0"
      class="side-actions"
      horizontal-alignment="right"
      vertical-alignment="bottom"
    >
      <StackLayout
        class="action-item"
        @tap="onLike"
      >
        <Label
          :text="isLiked ? '❤️' : '🤍'"
          class="action-icon"
        />
        <Label
          :text="formatCount(currentVideo.likeCount || 0)"
          class="action-count"
        />
      </StackLayout>

      <StackLayout
        class="action-item"
        @tap="onComment"
      >
        <Label
          text="💬"
          class="action-icon"
        />
        <Label
          :text="formatCount(currentVideo.commentCount || 0)"
          class="action-count"
        />
      </StackLayout>

      <StackLayout
        class="action-item"
        @tap="onShare"
      >
        <Label
          text="📤"
          class="action-icon"
        />
        <Label
          text="分享"
          class="action-text"
        />
      </StackLayout>
    </StackLayout>
  </GridLayout>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
// defineProps and defineEmits are compiler macros, no import needed
import {
  GestureEventData,
  PanGestureEventData,
  TouchGestureEventData,
  Animation,
  View,
  AnimationDefinition
} from '@nativescript/core';
import { VideoItem } from '@/types/video';
import { UserAnalytics } from '@/services/analytics.service';
import { VideoPlayerService } from '@/services/video-player.service';
import { VideoMemoryManager } from '@/services/video-memory.service';
import ShortVideoItem from './ShortVideoItem.vue';

// Props
interface Props {
  videoList: VideoItem[];
  containerWidth: number;
  containerHeight: number;
  progress: number[];
  initialIndex?: number;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  'update:progress': [progress: number[]];
  'update:currentIndex': [index: number];
  'videoChange': [index: number];
}>();

// State
const currentIndex = ref(props.initialIndex || 0);
const isCurrentVideoPlaying = ref(false);
const isLiked = ref(false);
const progress = ref([...props.progress]);
const isTransitioning = ref(false);
const panStartY = ref(0);
const currentTranslateY = ref(0);

// Computed
const currentVideo = computed(() => {
  return props.videoList[currentIndex.value] || null;
});

const nextVideo = computed(() => {
  return props.videoList[currentIndex.value + 1] || null;
});

const prevVideo = computed(() => {
  return props.videoList[currentIndex.value - 1] || null;
});

// Methods
const formatCount = (count: number): string => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
};

const onVideoPlay = (index: number) => {
  if (index === currentIndex.value) {
    isCurrentVideoPlaying.value = true;
  }

  UserAnalytics.trackEvent('vertical_swiper_video_play', {
    videoIndex: index,
    videoId: props.videoList[index]?.id
  });
};

const onVideoPause = (index: number) => {
  if (index === currentIndex.value) {
    isCurrentVideoPlaying.value = false;
  }
};

const onProgressChange = (index: number, newProgress: number) => {
  progress.value[index] = newProgress;
  emit('update:progress', [...progress.value]);
};

// 手势处理
const onPan = (args: PanGestureEventData) => {
  if (isTransitioning.value) return;

  const deltaY = args.deltaY;
  const startTime = Date.now();

  switch (args.state) {
    case 1: // began
      panStartY.value = deltaY;
      // 暂停当前视频以提升滑动性能
      VideoPlayerService.pauseVideoById(currentVideo.value?.id || '');
      isCurrentVideoPlaying.value = false;
      break;

    case 2: // changed
      currentTranslateY.value = deltaY;
      // 限制滑动范围以提供阻尼效果
      const maxDelta = props.containerHeight * 0.6;
      const clampedDelta = Math.max(-maxDelta, Math.min(maxDelta, deltaY));

      // 实时更新视频位置（这里需要实际的 View 引用）
      // TODO: 实现实际的视图位置更新
      break;

    case 3: // ended
      const endTime = Date.now();
      const latency = endTime - startTime;
      VideoMemoryManager.recordSwipeLatency(latency);

      handlePanEnd(deltaY);
      break;
  }
};

const handlePanEnd = (deltaY: number) => {
  const threshold = props.containerHeight * 0.25; // 25% 的阈值
  const velocity = Math.abs(deltaY); // 简化的速度计算

  if (Math.abs(deltaY) > threshold || velocity > 200) {
    if (deltaY > 0 && currentIndex.value > 0) {
      // 向下滑动 - 上一个视频
      switchToPrevious();
    } else if (deltaY < 0 && currentIndex.value < props.videoList.length - 1) {
      // 向上滑动 - 下一个视频
      switchToNext();
    } else {
      // 已到边界，回弹
      animateToPosition(0);
    }
  } else {
    // 滑动距离不足，回弹
    animateToPosition(0);
  }
};

const switchToNext = () => {
  if (currentIndex.value >= props.videoList.length - 1) return;

  isTransitioning.value = true;

  // 记录切换开始时间
  const switchStartTime = Date.now();

  // 预加载下下个视频
  const nextNextVideo = props.videoList[currentIndex.value + 2];
  if (nextNextVideo) {
    VideoPlayerService.preloadVideo(nextNextVideo.id, nextNextVideo.videoUrl);
  }

  // 动画切换到下一个视频
  animateToPosition(-props.containerHeight, () => {
    currentIndex.value++;
    resetPositions();
    emit('update:currentIndex', currentIndex.value);
    emit('videoChange', currentIndex.value);

    // 记录切换完成时间
    const switchEndTime = Date.now();
    VideoMemoryManager.recordSwipeLatency(switchEndTime - switchStartTime);

    UserAnalytics.trackEvent('vertical_swiper_next', {
      currentIndex: currentIndex.value,
      videoId: currentVideo.value?.id,
      switchTime: switchEndTime - switchStartTime
    });
  });
};

const switchToPrevious = () => {
  if (currentIndex.value <= 0) return;

  isTransitioning.value = true;
  const switchStartTime = Date.now();

  // 动画切换到上一个视频
  animateToPosition(props.containerHeight, () => {
    currentIndex.value--;
    resetPositions();
    emit('update:currentIndex', currentIndex.value);
    emit('videoChange', currentIndex.value);

    const switchEndTime = Date.now();
    VideoMemoryManager.recordSwipeLatency(switchEndTime - switchStartTime);

    UserAnalytics.trackEvent('vertical_swiper_previous', {
      currentIndex: currentIndex.value,
      videoId: currentVideo.value?.id,
      switchTime: switchEndTime - switchStartTime
    });
  });
};

const animateToPosition = (targetY: number, callback?: () => void) => {
  // 使用更流畅的动画配置
  const animationDefinition: AnimationDefinition = {
    translate: { x: 0, y: targetY },
    duration: 300,
    curve: 'easeInOut'
  };

  // 这里需要实际的 View 引用来执行动画
  // 在实际实现中，需要获取到视频页面的 View 对象
  setTimeout(() => {
    currentTranslateY.value = targetY;
    if (callback) callback();
    isTransitioning.value = false;
  }, 300);
};

const resetPositions = () => {
  currentTranslateY.value = 0;
  // 重置所有视频页面的位置
  // TODO: 实现实际的位置重置逻辑
};

const onTouch = (args: TouchGestureEventData) => {
  // 处理点击事件 - 播放/暂停
  if (args.action === 'up' && !isTransitioning.value) {
    isCurrentVideoPlaying.value = !isCurrentVideoPlaying.value;
  }
};

// 侧边栏动作
const onLike = () => {
  isLiked.value = !isLiked.value;
  UserAnalytics.trackEvent('video_like', {
    videoId: currentVideo.value?.id,
    isLiked: isLiked.value
  });
};

const onComment = () => {
  UserAnalytics.trackEvent('video_comment_tap', {
    videoId: currentVideo.value?.id
  });
  // TODO: 打开评论弹窗
};

const onShare = () => {
  UserAnalytics.trackEvent('video_share_tap', {
    videoId: currentVideo.value?.id
  });
  // TODO: 打开分享弹窗
};

// Watch
watch(() => props.progress, (newProgress) => {
  progress.value = [...newProgress];
}, { deep: true });

watch(currentIndex, (newIndex) => {
  // 当索引改变时，自动播放当前视频
  setTimeout(() => {
    isCurrentVideoPlaying.value = true;
  }, 300);
});

// Lifecycle
onMounted(() => {
  // 初始化时自动播放第一个视频
  if (props.videoList.length > 0) {
    // 预加载前几个视频
    props.videoList.slice(0, 3).forEach((video, index) => {
      VideoPlayerService.preloadVideo(video.id, video.videoUrl);
    });

    // 延迟启动第一个视频
    setTimeout(() => {
      isCurrentVideoPlaying.value = true;
      if (currentVideo.value) {
        VideoPlayerService.playVideoById(currentVideo.value.id);
      }
    }, 500);
  }

  // 启动性能监控
  VideoMemoryManager.startMemoryMonitoring();
});

onUnmounted(() => {
  // 清理所有播放器
  VideoPlayerService.clearAllPlayers();

  // 停止性能监控
  VideoMemoryManager.stopMemoryMonitoring();
});
</script>

<style scoped>
.vertical-swiper-container {
  background-color: #000;
  overflow: hidden;
}

.video-page {
  width: 100%;
  height: 100%;
  background-color: #000;
}

.gesture-layer {
  width: 100%;
  height: 100%;
  background-color: transparent;
  z-index: 1;
}

.side-actions {
  width: 80;
  margin-right: 15;
  margin-bottom: 100;
  z-index: 10;
}

.action-item {
  width: 60;
  height: 70;
  text-align: center;
  margin-bottom: 20;
}

.action-icon {
  font-size: 28;
  text-align: center;
  margin-bottom: 5;
}

.action-count, .action-text {
  font-size: 12;
  color: white;
  text-align: center;
  text-shadow: 1 1 2 rgba(0, 0, 0, 0.8);
}

.next-video, .prev-video {
  z-index: -1;
}
</style>
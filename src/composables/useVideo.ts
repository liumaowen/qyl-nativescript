import { ref, reactive, computed } from 'vue';
import { VideoItem } from '@/types/video';
import { VideoService } from '@/services/video.service';
import { UserAnalytics } from '@/services/analytics.service';

// 视频播放器组合函数
export function useVideoPlayer() {
  const currentVideo = ref<VideoItem | null>(null);
  const isPlaying = ref(false);
  const progress = ref(0);
  const duration = ref(0);
  const volume = ref(100);
  const isFullscreen = ref(false);

  const formattedProgress = computed(() => {
    const mins = Math.floor(progress.value / 60);
    const secs = Math.floor(progress.value % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  });

  const formattedDuration = computed(() => {
    const mins = Math.floor(duration.value / 60);
    const secs = Math.floor(duration.value % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  });

  const play = (video?: VideoItem) => {
    if (video) {
      currentVideo.value = video;
    }
    isPlaying.value = true;

    UserAnalytics.trackEvent('video_play', {
      videoId: currentVideo.value?.id,
      videoTitle: currentVideo.value?.title
    });
  };

  const pause = () => {
    isPlaying.value = false;

    UserAnalytics.trackEvent('video_pause', {
      videoId: currentVideo.value?.id,
      progress: progress.value
    });
  };

  const togglePlay = () => {
    if (isPlaying.value) {
      pause();
    } else {
      play();
    }
  };

  const seekTo = (time: number) => {
    progress.value = time;

    UserAnalytics.trackEvent('video_seek', {
      videoId: currentVideo.value?.id,
      seekTime: time
    });
  };

  const setVolume = (vol: number) => {
    volume.value = Math.max(0, Math.min(100, vol));
  };

  const enterFullscreen = () => {
    isFullscreen.value = true;
    UserAnalytics.trackEvent('video_fullscreen_enter');
  };

  const exitFullscreen = () => {
    isFullscreen.value = false;
    UserAnalytics.trackEvent('video_fullscreen_exit');
  };

  const toggleFullscreen = () => {
    if (isFullscreen.value) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  };

  return {
    // State
    currentVideo,
    isPlaying,
    progress,
    duration,
    volume,
    isFullscreen,
    // Computed
    formattedProgress,
    formattedDuration,
    // Methods
    play,
    pause,
    togglePlay,
    seekTo,
    setVolume,
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen
  };
}

// 视频列表管理组合函数
export function useVideoList() {
  const videos = ref<VideoItem[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const currentIndex = ref(0);

  const currentVideo = computed(() => {
    return videos.value[currentIndex.value] || null;
  });

  const hasNext = computed(() => {
    return currentIndex.value < videos.value.length - 1;
  });

  const hasPrev = computed(() => {
    return currentIndex.value > 0;
  });

  const loadVideos = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      const data = await VideoService.getShortVideos();
      videos.value = data;

      UserAnalytics.trackEvent('video_list_loaded', {
        count: data.length
      });
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载失败';
      console.error('加载视频列表失败:', err);
    } finally {
      isLoading.value = false;
    }
  };

  const goToNext = () => {
    if (hasNext.value) {
      currentIndex.value++;

      UserAnalytics.trackEvent('video_next', {
        newIndex: currentIndex.value,
        videoId: currentVideo.value?.id
      });
    }
  };

  const goToPrev = () => {
    if (hasPrev.value) {
      currentIndex.value--;

      UserAnalytics.trackEvent('video_prev', {
        newIndex: currentIndex.value,
        videoId: currentVideo.value?.id
      });
    }
  };

  const goToIndex = (index: number) => {
    if (index >= 0 && index < videos.value.length) {
      currentIndex.value = index;

      UserAnalytics.trackEvent('video_jump', {
        newIndex: index,
        videoId: videos.value[index]?.id
      });
    }
  };

  const addVideo = (video: VideoItem) => {
    videos.value.push(video);
  };

  const removeVideo = (index: number) => {
    if (index >= 0 && index < videos.value.length) {
      videos.value.splice(index, 1);
      if (currentIndex.value >= videos.value.length) {
        currentIndex.value = Math.max(0, videos.value.length - 1);
      }
    }
  };

  return {
    // State
    videos,
    isLoading,
    error,
    currentIndex,
    // Computed
    currentVideo,
    hasNext,
    hasPrev,
    // Methods
    loadVideos,
    goToNext,
    goToPrev,
    goToIndex,
    addVideo,
    removeVideo
  };
}

// 搜索功能组合函数
export function useVideoSearch() {
  const searchQuery = ref('');
  const searchResults = ref<VideoItem[]>([]);
  const isSearching = ref(false);
  const searchHistory = reactive<string[]>([]);

  const hasResults = computed(() => {
    return searchResults.value.length > 0;
  });

  const search = async (query?: string) => {
    const searchTerm = query || searchQuery.value;
    if (!searchTerm.trim()) return;

    isSearching.value = true;

    try {
      const results = await VideoService.searchVideos(searchTerm);
      searchResults.value = results;

      // 添加到搜索历史
      if (!searchHistory.includes(searchTerm)) {
        searchHistory.unshift(searchTerm);
        if (searchHistory.length > 10) {
          searchHistory.pop();
        }
      }

      UserAnalytics.trackEvent('video_search', {
        query: searchTerm,
        resultCount: results.length
      });
    } catch (error) {
      console.error('搜索失败:', error);
      searchResults.value = [];
    } finally {
      isSearching.value = false;
    }
  };

  const clearSearch = () => {
    searchQuery.value = '';
    searchResults.value = [];
  };

  const clearHistory = () => {
    searchHistory.splice(0);
  };

  return {
    // State
    searchQuery,
    searchResults,
    isSearching,
    searchHistory,
    // Computed
    hasResults,
    // Methods
    search,
    clearSearch,
    clearHistory
  };
}
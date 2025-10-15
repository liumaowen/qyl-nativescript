import { reactive } from 'vue';
import { VideoItem } from '@/types/video';

interface GlobalState {
  videoPlayDomain: string;
  isAnalyticsInitialized: boolean;
  shortVideoConfig: any;
  isAdLook: boolean;
  currentVideo: VideoItem | null;
  isLoading: boolean;
}

export const globalState = reactive<GlobalState>({
  videoPlayDomain: 'https://api.mgtv109.cc',
  isAnalyticsInitialized: false,
  shortVideoConfig: {},
  isAdLook: false,
  currentVideo: null,
  isLoading: false
});

// 状态管理函数
export const useGlobalState = () => {
  const setVideoPlayDomain = (domain: string) => {
    globalState.videoPlayDomain = domain;
  };

  const setAnalyticsInitialized = (initialized: boolean) => {
    globalState.isAnalyticsInitialized = initialized;
  };

  const setCurrentVideo = (video: VideoItem | null) => {
    globalState.currentVideo = video;
  };

  const setLoading = (loading: boolean) => {
    globalState.isLoading = loading;
  };

  return {
    globalState,
    setVideoPlayDomain,
    setAnalyticsInitialized,
    setCurrentVideo,
    setLoading
  };
};
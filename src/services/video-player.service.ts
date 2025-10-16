import { Application, isAndroid } from '@nativescript/core';

interface VideoPlayerState {
  player: any;
  isLoaded: boolean;
  isPlaying: boolean;
  progress: number;
  duration: number;
  videoUrl: string;
}

export class VideoPlayerService {
  private static currentPlayer: any;
  private static playerPool = new Map<string, VideoPlayerState>();
  private static maxPoolSize = 3; // 最大缓存3个视频播放器
  private static preloadQueue: string[] = [];

  static async enterFullscreen(): Promise<void> {
    try {
      // 锁定横屏 - Screen没有orientation属性，需要使用不同的API
      // await Screen.orientation.lock('landscape');

      // 隐藏状态栏
      if (isAndroid) {
        const activity = Application.android.foregroundActivity;
        const view = activity.getWindow().getDecorView();
        const flags = (android as any).view.View.SYSTEM_UI_FLAG_FULLSCREEN |
                     (android as any).view.View.SYSTEM_UI_FLAG_HIDE_NAVIGATION |
                     (android as any).view.View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY;
        view.setSystemUiVisibility(flags);
      }

      console.log('进入全屏模式');
    } catch (error) {
      console.error('进入全屏失败:', error);
    }
  }

  static async exitFullscreen(): Promise<void> {
    try {
      // 恢复竖屏 - Screen没有orientation属性，需要使用不同的API
      // await Screen.orientation.lock('portrait');

      // 显示状态栏
      if (isAndroid) {
        const activity = Application.android.foregroundActivity;
        const view = activity.getWindow().getDecorView();
        view.setSystemUiVisibility((android as any).view.View.SYSTEM_UI_FLAG_VISIBLE);
      }

      console.log('退出全屏模式');
    } catch (error) {
      console.error('退出全屏失败:', error);
    }
  }

  static setCurrentPlayer(player: any) {
    this.currentPlayer = player;
  }

  static getCurrentPlayer() {
    return this.currentPlayer;
  }

  static async playVideo(url: string): Promise<void> {
    if (this.currentPlayer) {
      try {
        this.currentPlayer.src = url;
        this.currentPlayer.play();
      } catch (error) {
        console.error('播放视频失败:', error);
      }
    }
  }

  static async pauseVideo(): Promise<void> {
    if (this.currentPlayer) {
      try {
        this.currentPlayer.pause();
      } catch (error) {
        console.error('暂停视频失败:', error);
      }
    }
  }

  // ===== 新增的视频池管理方法 =====

  /**
   * 获取或创建视频播放器状态
   */
  static getPlayerState(videoId: string, videoUrl: string): VideoPlayerState {
    if (!this.playerPool.has(videoId)) {
      // 如果池满了，清理最旧的播放器
      if (this.playerPool.size >= this.maxPoolSize) {
        this.clearOldestPlayer();
      }

      // 创建新的播放器状态
      const playerState: VideoPlayerState = {
        player: null,
        isLoaded: false,
        isPlaying: false,
        progress: 0,
        duration: 0,
        videoUrl
      };

      this.playerPool.set(videoId, playerState);
    }

    return this.playerPool.get(videoId)!;
  }

  /**
   * 预加载视频
   */
  static preloadVideo(videoId: string, videoUrl: string): void {
    if (!this.playerPool.has(videoId) && !this.preloadQueue.includes(videoId)) {
      this.preloadQueue.push(videoId);

      // 异步预加载
      setTimeout(() => {
        this.getPlayerState(videoId, videoUrl);
        this.preloadQueue = this.preloadQueue.filter(id => id !== videoId);
      }, 100);
    }
  }

  /**
   * 通过ID播放视频
   */
  static async playVideoById(videoId: string): Promise<boolean> {
    const playerState = this.playerPool.get(videoId);
    if (!playerState) return false;

    try {
      if (playerState.player) {
        await playerState.player.play();
        playerState.isPlaying = true;
        this.currentPlayer = playerState.player;
        return true;
      }
      return false;
    } catch (error) {
      console.error(`播放视频失败 ${videoId}:`, error);
      return false;
    }
  }

  /**
   * 通过ID暂停视频
   */
  static async pauseVideoById(videoId: string): Promise<boolean> {
    const playerState = this.playerPool.get(videoId);
    if (!playerState?.player) return false;

    try {
      await playerState.player.pause();
      playerState.isPlaying = false;
      return true;
    } catch (error) {
      console.error(`暂停视频失败 ${videoId}:`, error);
      return false;
    }
  }

  /**
   * 暂停所有视频
   */
  static async pauseAllVideos(): Promise<void> {
    const pausePromises = Array.from(this.playerPool.keys()).map(videoId =>
      this.pauseVideoById(videoId)
    );
    await Promise.all(pausePromises);
  }

  /**
   * 设置视频进度
   */
  static setVideoProgress(videoId: string, progress: number): void {
    const playerState = this.playerPool.get(videoId);
    if (playerState?.player && playerState.duration > 0) {
      const seekTime = (progress / 100) * playerState.duration;
      try {
        playerState.player.seekToTime(seekTime);
        playerState.progress = progress;
      } catch (error) {
        console.error(`设置视频进度失败 ${videoId}:`, error);
      }
    }
  }

  /**
   * 获取视频进度
   */
  static getVideoProgress(videoId: string): number {
    const playerState = this.playerPool.get(videoId);
    return playerState?.progress || 0;
  }

  /**
   * 释放视频播放器
   */
  static releasePlayer(videoId: string): void {
    const playerState = this.playerPool.get(videoId);
    if (playerState?.player) {
      try {
        playerState.player.pause();
        // 清理播放器资源
        if (this.currentPlayer === playerState.player) {
          this.currentPlayer = null;
        }
      } catch (error) {
        console.error(`释放播放器失败 ${videoId}:`, error);
      }
    }
    this.playerPool.delete(videoId);
  }

  /**
   * 更新播放器引用
   */
  static updatePlayerRef(videoId: string, player: any): void {
    const playerState = this.playerPool.get(videoId);
    if (playerState) {
      playerState.player = player;
      playerState.isLoaded = true;
    }
  }

  /**
   * 清理最旧的播放器
   */
  private static clearOldestPlayer(): void {
    const oldestKey = this.playerPool.keys().next().value;
    if (oldestKey) {
      this.releasePlayer(oldestKey);
    }
  }

  /**
   * 清理所有播放器
   */
  static clearAllPlayers(): void {
    Array.from(this.playerPool.keys()).forEach(videoId => {
      this.releasePlayer(videoId);
    });
    this.preloadQueue.length = 0;
  }

  /**
   * 获取播放器统计信息
   */
  static getStats(): {
    activePlayersCount: number;
    preloadQueueLength: number;
    playingCount: number;
  } {
    const playingCount = Array.from(this.playerPool.values())
      .filter(state => state.isPlaying).length;

    return {
      activePlayersCount: this.playerPool.size,
      preloadQueueLength: this.preloadQueue.length,
      playingCount
    };
  }
}
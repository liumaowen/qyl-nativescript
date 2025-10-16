import { VideoPlayerService } from './video-player.service';
import { UserAnalytics } from './analytics.service';

export class VideoMemoryManager {
  private static memoryCheckInterval: number | null = null;
  private static performanceMonitor = {
    swipeLatency: [] as number[],
    videoLoadTime: [] as number[],
    memoryUsage: [] as number[]
  };

  /**
   * 启动内存监控
   */
  static startMemoryMonitoring(): void {
    if (this.memoryCheckInterval) return;

    this.memoryCheckInterval = setInterval(() => {
      this.checkMemoryUsage();
      this.collectPerformanceMetrics();
    }, 15000) as any; // 每15秒检查一次

    console.log('📊 视频内存监控已启动');
  }

  /**
   * 停止内存监控
   */
  static stopMemoryMonitoring(): void {
    if (this.memoryCheckInterval) {
      clearInterval(this.memoryCheckInterval);
      this.memoryCheckInterval = null;
      console.log('📊 视频内存监控已停止');
    }
  }

  /**
   * 检查内存使用情况
   */
  static checkMemoryUsage(): void {
    const stats = VideoPlayerService.getStats();

    // 记录性能指标
    this.performanceMonitor.memoryUsage.push(stats.activePlayersCount);

    // 保持历史记录在合理范围内
    if (this.performanceMonitor.memoryUsage.length > 20) {
      this.performanceMonitor.memoryUsage = this.performanceMonitor.memoryUsage.slice(-20);
    }

    // 检查是否需要清理
    if (stats.activePlayersCount > 2 && stats.playingCount === 0) {
      console.warn('🧹 检测到过多非活跃播放器，开始清理...');
      this.cleanup();

      UserAnalytics.trackEvent('memory_cleanup_triggered', {
        activePlayersCount: stats.activePlayersCount,
        playingCount: stats.playingCount
      });
    }

    // 输出统计信息
    if (stats.activePlayersCount > 0) {
      console.log(`📈 播放器状态: ${stats.activePlayersCount}个活跃, ${stats.playingCount}个播放中`);
    }
  }

  /**
   * 清理内存
   */
  static cleanup(): void {
    try {
      const statsBefore = VideoPlayerService.getStats();

      // 清理非活跃的播放器
      if (statsBefore.playingCount === 0) {
        VideoPlayerService.clearAllPlayers();
      }

      const statsAfter = VideoPlayerService.getStats();

      console.log(`✅ 内存清理完成: ${statsBefore.activePlayersCount} → ${statsAfter.activePlayersCount}`);

      UserAnalytics.trackEvent('memory_cleanup_completed', {
        beforeCount: statsBefore.activePlayersCount,
        afterCount: statsAfter.activePlayersCount
      });
    } catch (error) {
      console.error('❌ 内存清理失败:', error);
    }
  }

  /**
   * 记录滑动延迟
   */
  static recordSwipeLatency(latency: number): void {
    this.performanceMonitor.swipeLatency.push(latency);

    // 保持历史记录在合理范围内
    if (this.performanceMonitor.swipeLatency.length > 10) {
      this.performanceMonitor.swipeLatency = this.performanceMonitor.swipeLatency.slice(-10);
    }

    // 如果延迟过高，记录问题
    if (latency > 500) {
      UserAnalytics.trackEvent('high_swipe_latency', { latency });
      console.warn(`⚠️ 滑动延迟过高: ${latency}ms`);
    }
  }

  /**
   * 记录视频加载时间
   */
  static recordVideoLoadTime(loadTime: number): void {
    this.performanceMonitor.videoLoadTime.push(loadTime);

    if (this.performanceMonitor.videoLoadTime.length > 10) {
      this.performanceMonitor.videoLoadTime = this.performanceMonitor.videoLoadTime.slice(-10);
    }

    if (loadTime > 3000) {
      UserAnalytics.trackEvent('slow_video_load', { loadTime });
      console.warn(`⚠️ 视频加载缓慢: ${loadTime}ms`);
    }
  }

  /**
   * 收集性能指标
   */
  static collectPerformanceMetrics(): void {
    const metrics = {
      avgSwipeLatency: this.calculateAverage(this.performanceMonitor.swipeLatency),
      avgVideoLoadTime: this.calculateAverage(this.performanceMonitor.videoLoadTime),
      avgMemoryUsage: this.calculateAverage(this.performanceMonitor.memoryUsage),
      playerStats: VideoPlayerService.getStats()
    };

    // 每5分钟上报一次性能数据
    const now = Date.now();
    const lastReport = this.getLastReportTime();

    if (now - lastReport > 5 * 60 * 1000) { // 5分钟
      UserAnalytics.trackEvent('performance_metrics', metrics);
      this.setLastReportTime(now);

      console.log('📊 性能指标:', metrics);
    }
  }

  /**
   * 获取性能报告
   */
  static getPerformanceReport(): {
    swipeLatency: { avg: number; max: number; min: number };
    videoLoadTime: { avg: number; max: number; min: number };
    memoryUsage: { avg: number; current: number };
    recommendations: string[];
  } {
    const swipeLatencies = this.performanceMonitor.swipeLatency;
    const loadTimes = this.performanceMonitor.videoLoadTime;
    const memoryUsages = this.performanceMonitor.memoryUsage;

    const report = {
      swipeLatency: {
        avg: this.calculateAverage(swipeLatencies),
        max: Math.max(...swipeLatencies, 0),
        min: Math.min(...swipeLatencies, 0)
      },
      videoLoadTime: {
        avg: this.calculateAverage(loadTimes),
        max: Math.max(...loadTimes, 0),
        min: Math.min(...loadTimes, 0)
      },
      memoryUsage: {
        avg: this.calculateAverage(memoryUsages),
        current: VideoPlayerService.getStats().activePlayersCount
      },
      recommendations: this.generateRecommendations()
    };

    return report;
  }

  /**
   * 生成优化建议
   */
  private static generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const stats = VideoPlayerService.getStats();
    const avgSwipeLatency = this.calculateAverage(this.performanceMonitor.swipeLatency);
    const avgLoadTime = this.calculateAverage(this.performanceMonitor.videoLoadTime);

    if (avgSwipeLatency > 300) {
      recommendations.push('考虑优化滑动动画性能');
    }

    if (avgLoadTime > 2000) {
      recommendations.push('建议增加视频预加载或优化视频格式');
    }

    if (stats.activePlayersCount > 3) {
      recommendations.push('播放器实例过多，建议及时释放资源');
    }

    if (recommendations.length === 0) {
      recommendations.push('性能表现良好 👍');
    }

    return recommendations;
  }

  /**
   * 计算平均值
   */
  private static calculateAverage(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return Math.round(numbers.reduce((sum, num) => sum + num, 0) / numbers.length);
  }

  /**
   * 获取上次报告时间
   */
  private static getLastReportTime(): number {
    try {
      const stored = global.localStorage?.getItem('video_last_report_time');
      return stored ? parseInt(stored, 10) : 0;
    } catch {
      return 0;
    }
  }

  /**
   * 设置上次报告时间
   */
  private static setLastReportTime(time: number): void {
    try {
      global.localStorage?.setItem('video_last_report_time', time.toString());
    } catch {
      // 静默失败
    }
  }

  /**
   * 重置性能监控数据
   */
  static resetPerformanceData(): void {
    this.performanceMonitor = {
      swipeLatency: [],
      videoLoadTime: [],
      memoryUsage: []
    };
    console.log('🔄 性能监控数据已重置');
  }
}

// 应用启动时自动开始监控
setTimeout(() => {
  VideoMemoryManager.startMemoryMonitoring();
}, 2000);
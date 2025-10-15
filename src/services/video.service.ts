import { Http } from '@nativescript/core';
import { VideoItem, MovieDetail, AdItem } from '@/types/video';

const BASE_URL = 'https://www.qylapi.top';

export class VideoService {
  static async request<T>(url: string, options: any = {}): Promise<T> {
    try {
      const response = await Http.request({
        url: `${BASE_URL}${url}`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        ...options
      });

      if (response.statusCode === 200) {
        const data = JSON.parse(response.content?.toString() || '{}');
        return data as T;
      }

      throw new Error(`HTTP ${response.statusCode}: ${response.content}`);
    } catch (error) {
      console.error('API请求失败:', error);
      throw error;
    }
  }

  static async getShortVideos(): Promise<VideoItem[]> {
    try {
      const data = await this.request<VideoItem[]>('/api/ksvideo');
          return (data || []).map((item: any) => ({
            videoUrl: item.link,
          }));
    } catch (error) {
      console.error('获取短视频失败:', error);
      return [];
    }
  }

  static async getShortDetail(id: string): Promise<MovieDetail[]> {
    try {
      const data = await this.request<MovieDetail[]>(`/api/videos/${id}`);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('获取视频详情失败:', error);
      return [];
    }
  }

  static async getAds(): Promise<AdItem[]> {
    try {
      const data = await this.request<AdItem[]>('/api/ads');
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('获取广告失败:', error);
      return [];
    }
  }

  static async searchVideos(query: string): Promise<VideoItem[]> {
    try {
      const data = await this.request<VideoItem[]>(`/api/search?q=${encodeURIComponent(query)}`);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('搜索视频失败:', error);
      return [];
    }
  }
}
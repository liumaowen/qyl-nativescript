export interface VideoItem {
  id?: string;
  title?: string;
  poster?: string;
  videoUrl: string;
  duration?: number;
  info?: {
    count?: number;
  };
}

export interface MovieDetail {
  id?: string;
  title?: string;
  poster?: string;
  videoUrl: string;
  duration?: number;
  episode?: number;
}

export interface AdItem {
  id: string;
  title: string;
  imageUrl: string;
  targetUrl: string;
}
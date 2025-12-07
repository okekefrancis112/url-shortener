// types/url.ts
export interface ShortenedUrl {
  _id: string;
  originalUrl: string;
  shortId: string;
  shortUrl?: string;
  userId: string;
  clicks: number;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  qrCode?: string;
}

export interface UserUrlsResponse {
  data: ShortenedUrl[];
}

export interface AnalyticsData {
  totalUrls: number;
  totalClicks: number;
  clicksLast7Days: number;
  popularUrls: ShortenedUrl[];
}
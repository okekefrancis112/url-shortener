// services/urlService.ts
import { UserUrlsResponse } from '@/types/url';

const API_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:8080';

export const urlService = {
  // Get all user's shortened URLs
  async getUserUrls(userId: string): Promise<UserUrlsResponse> {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_URL}/api/v1/user/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user URLs');
    }

    return response.json();
  },

  // Delete a shortened URL
  async deleteUrl(urlId: string): Promise<void> {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_URL}/api/v1/user/${urlId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete URL');
    }
  },

  async createShortUrl(originalUrl: string): Promise<any> {
    const token = localStorage.getItem('token');

    // Determine which endpoint to use
    let endpoint = "/"; // Default to public
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      endpoint = "/create"; // Use authenticated endpoint
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      console.log("Using public endpoint: /");
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ originalUrl }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response:", errorText);
      throw new Error(`Failed to create short URL: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  },

  // Get URL analytics
  getAnalytics(urls: any[]): any {
    const totalUrls = urls.length;
    const totalClicks = urls.reduce((sum, url) => sum + (url.clicks || 0), 0);

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const clicksLast7Days = urls.reduce((sum, url) => {
      const urlDate = new Date(url.createdAt);
      return urlDate >= weekAgo ? sum + (url.clicks || 0) : sum;
    }, 0);

    const popularUrls = [...urls]
      .sort((a, b) => (b.clicks || 0) - (a.clicks || 0))
      .slice(0, 5);

    return {
      totalUrls,
      totalClicks,
      clicksLast7Days,
      popularUrls,
    };
  },
};
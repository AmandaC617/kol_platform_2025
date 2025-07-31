// Enhanced Analytics Service
// 提供進階的網紅數據分析功能

// API Keys configuration - ONLY use environment variables for security
const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_SEARCH_API_KEY || '';
const GOOGLE_CLOUD_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_SEARCH_API_KEY;
const GOOGLE_SEARCH_ENGINE_ID = process.env.NEXT_PUBLIC_GOOGLE_SEARCH_ENGINE_ID;

interface YouTubeChannelData {
  title: string;
  subscriberCount: string;
  viewCount: string;
  videoCount: string;
  description: string;
  thumbnails: {
    default?: { url: string };
    medium?: { url: string };
    high?: { url: string };
  };
  customUrl?: string;
  publishedAt: string;
}

interface GoogleSearchResult {
  title: string;
  link: string;
  snippet: string;
  displayLink: string;
}

class EnhancedAnalyticsService {
  private static instance: EnhancedAnalyticsService;

  public static getInstance(): EnhancedAnalyticsService {
    if (!EnhancedAnalyticsService.instance) {
      EnhancedAnalyticsService.instance = new EnhancedAnalyticsService();
    }
    return EnhancedAnalyticsService.instance;
  }

  /**
   * 從 YouTube URL 提取頻道 ID 或用戶名
   */
  private extractChannelInfo(url: string): { type: 'channel' | 'user' | 'c', value: string } | null {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;

      // 匹配不同的 YouTube URL 格式
      const channelMatch = pathname.match(/^\/channel\/([a-zA-Z0-9_-]+)/);
      const userMatch = pathname.match(/^\/user\/([a-zA-Z0-9_-]+)/);
      const cMatch = pathname.match(/^\/c\/([a-zA-Z0-9_-]+)/);
      const atMatch = pathname.match(/^\/@([a-zA-Z0-9_.-]+)/);

      if (channelMatch) {
        return { type: 'channel', value: channelMatch[1] };
      } else if (userMatch) {
        return { type: 'user', value: userMatch[1] };
      } else if (cMatch) {
        return { type: 'c', value: cMatch[1] };
      } else if (atMatch) {
        return { type: 'c', value: atMatch[1] };
      }

      return null;
    } catch (error) {
      console.error('Error extracting channel info:', error);
      return null;
    }
  }

  /**
   * 使用 YouTube Data API 獲取頻道詳細信息
   */
  async getYouTubeChannelData(url: string): Promise<YouTubeChannelData | null> {
    if (!YOUTUBE_API_KEY) {
      console.warn('YouTube API key not configured');
      return null;
    }

    try {
      const channelInfo = this.extractChannelInfo(url);
      if (!channelInfo) {
        console.error('Could not extract channel info from URL');
        return null;
      }

      let apiUrl: string;
      
      if (channelInfo.type === 'channel') {
        // 直接使用頻道 ID
        apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelInfo.value}&key=${YOUTUBE_API_KEY}`;
      } else {
        // 對於用戶名或自定義 URL，先搜索頻道
        const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(channelInfo.value)}&type=channel&key=${YOUTUBE_API_KEY}`;
        
        console.log('🔍 請求 YouTube API:', searchUrl);
        const searchResponse = await fetch(searchUrl);
        
        if (!searchResponse.ok) {
          throw new Error(`YouTube API 請求失敗: ${searchResponse.status} ${searchResponse.statusText}`);
        }

        const searchData = await searchResponse.json();
        
        if (!searchData.items || searchData.items.length === 0) {
          console.error('No channels found for:', channelInfo.value);
          return null;
        }

        const channelId = searchData.items[0].id.channelId;
        apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${YOUTUBE_API_KEY}`;
      }

      console.log('🔍 請求 YouTube Channel API:', apiUrl);
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`YouTube API 請求失敗: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.items || data.items.length === 0) {
        console.error('No channel data found');
        return null;
      }

      const channel = data.items[0];
      const snippet = channel.snippet;
      const statistics = channel.statistics;

      return {
        title: snippet.title,
        subscriberCount: statistics.subscriberCount || '0',
        viewCount: statistics.viewCount || '0',
        videoCount: statistics.videoCount || '0',
        description: snippet.description || '',
        thumbnails: snippet.thumbnails || {},
        customUrl: snippet.customUrl,
        publishedAt: snippet.publishedAt
      };

    } catch (error) {
      console.error('YouTube API 請求失敗:', error);
      return null;
    }
  }

  /**
   * 使用 Google Custom Search 獲取額外信息
   */
  async getGoogleSearchData(query: string): Promise<GoogleSearchResult[]> {
    if (!GOOGLE_CLOUD_API_KEY || !GOOGLE_SEARCH_ENGINE_ID) {
      console.warn('Google Search API not configured');
        return [];
      }

    try {
      const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_CLOUD_API_KEY}&cx=${GOOGLE_SEARCH_ENGINE_ID}&q=${encodeURIComponent(query)}&num=5`;
      
      console.log('🔍 Google Search API:', searchUrl);
      const response = await fetch(searchUrl);

      if (!response.ok) {
        throw new Error(`Google Search API 請求失敗: ${response.status}`);
      }

      const data = await response.json();

      if (!data.items) {
        return [];
      }

      return data.items.map((item: any) => ({
        title: item.title,
        link: item.link,
        snippet: item.snippet,
        displayLink: item.displayLink
      }));

    } catch (error) {
      console.error('Google Search API 請求失敗:', error);
      return [];
    }
  }

  /**
   * 綜合分析網紅數據
   */
  async analyzeInfluencer(url: string, influencerName: string): Promise<{
    youtubeData?: YouTubeChannelData;
    searchData: GoogleSearchResult[];
    analysis: {
      estimatedFollowers: number;
      engagementRate: string;
      contentCategory: string;
      marketValue: string;
    };
  }> {
    console.log('🔍 開始增強分析:', { url, influencerName });

    try {
      // 並行獲取 YouTube 和搜索數據
      const [youtubeData, searchData] = await Promise.all([
        this.getYouTubeChannelData(url),
        this.getGoogleSearchData(`${influencerName} 網紅 followers subscribers`)
      ]);

      // 分析數據
      let estimatedFollowers = 0;
      let engagementRate = 'N/A';
      let contentCategory = '未知';
      let marketValue = 'N/A';

      if (youtubeData) {
        estimatedFollowers = parseInt(youtubeData.subscriberCount) || 0;
        
        // 計算簡單的參與率 (影片數量 vs 訂閱者)
        const videoCount = parseInt(youtubeData.videoCount) || 0;
        const viewCount = parseInt(youtubeData.viewCount) || 0;
        
        if (estimatedFollowers > 0 && videoCount > 0) {
          const avgViewsPerVideo = viewCount / videoCount;
          const rate = (avgViewsPerVideo / estimatedFollowers * 100).toFixed(2);
          engagementRate = `${rate}%`;
        }

        // 簡單的內容分類
        const description = youtubeData.description.toLowerCase();
        if (description.includes('gaming') || description.includes('遊戲')) {
          contentCategory = '遊戲';
        } else if (description.includes('music') || description.includes('音樂')) {
          contentCategory = '音樂';
        } else if (description.includes('tech') || description.includes('科技')) {
          contentCategory = '科技';
        } else if (description.includes('lifestyle') || description.includes('生活')) {
          contentCategory = '生活風格';
        }

        // 簡單的市場價值估算
        if (estimatedFollowers > 1000000) {
          marketValue = '高價值 (>100萬訂閱)';
        } else if (estimatedFollowers > 100000) {
          marketValue = '中等價值 (10萬-100萬)';
        } else if (estimatedFollowers > 10000) {
          marketValue = '新興網紅 (1萬-10萬)';
        } else {
          marketValue = '微型網紅 (<1萬)';
        }
      }

      return {
        youtubeData: youtubeData || undefined,
        searchData,
        analysis: {
          estimatedFollowers,
          engagementRate,
          contentCategory,
          marketValue
        }
      };

    } catch (error) {
      console.error('增強分析失敗:', error);
      return {
        searchData: [],
        analysis: {
          estimatedFollowers: 0,
          engagementRate: 'N/A',
          contentCategory: '未知',
          marketValue: 'N/A'
        }
      };
    }
  }
}

export default EnhancedAnalyticsService; 
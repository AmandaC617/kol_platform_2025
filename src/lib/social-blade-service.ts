// Social Blade API 整合服務

// API 回應型別定義
export interface SocialBladeResponse<T> {
  status: {
    success: boolean;
    status: number;
    error?: string;
  };
  info: {
    access: {
      seconds_to_expire: number;
    };
    credits: {
      available: number;
    };
  };
  data: T;
}

// YouTube 數據結構
export interface YouTubeData {
  id: {
    id: string;
    username?: string;
    display_name: string;
    cusername?: string;
    handle?: string;
  };
  general: {
    created_at: string;
    channel_type: string;
    geo: {
      country_code: string;
      country: string;
    };
    branding: {
      avatar: string;
      banner?: string;
      website: string;
      social: {
        facebook: string;
        twitter: string;
        twitch: string;
        instagram: string;
        linkedin: string;
        discord: string;
        tiktok: string;
      };
    };
  };
  statistics: {
    total: {
      uploads: number;
      subscribers: number;
      views: number;
    };
    growth: {
      subs: Record<string, number>;
      vidviews: Record<string, number>;
    };
  };
  misc: {
    grade: {
      color: string;
      grade: string;
    };
    sb_verified: boolean;
    made_for_kids: boolean;
  };
  ranks: {
    sbrank: number;
    subscribers: number;
    views: number;
    country: number;
    channel_type: number;
  };
  daily: Array<{
    date: string;
    subs: number;
    views: number;
  }>;
}

// Instagram 數據結構
export interface InstagramData {
  id: {
    id: string;
    username?: string;
    display_name: string;
  };
  general: {
    branding: {
      avatar: string;
      website: string;
    };
    media: {
      recent: Record<string, any>;
    };
  };
  statistics: {
    total: {
      followers: number;
      following: number;
      media: number;
      engagement_rate: number;
    };
    growth: {
      followers: Record<string, number>;
      media: Record<string, number>;
    };
  };
  misc: {
    grade: {
      color: string;
      grade: string;
    };
    sb_verified: boolean;
  };
  ranks: {
    sbrank: number;
    followers: number;
    following: number;
    media: number;
    engagement_rate: number;
  };
  daily: Array<{
    date: string;
    followers: number;
    following: number;
    media: number;
    avg_likes: number;
    avg_comments: number;
  }>;
}

// Facebook 數據結構
export interface FacebookData {
  id: {
    id: string;
    username?: string;
    display_name: string;
  };
  general: {
    branding: {
      avatar: string;
      banner: string;
    };
  };
  statistics: {
    total: {
      likes: number;
      talking_about: number;
    };
    growth: {
      likes: Record<string, number>;
      talking_about: Record<string, number>;
    };
  };
  misc: {
    grade: {
      color: string;
      grade: string;
    };
    sb_verified: boolean;
  };
  ranks: {
    sbrank: number;
    likes: number;
    talking_about: number;
  };
  daily: Array<{
    date: string;
    likes: number;
    talking_about: number;
  }>;
}

// 統一的網紅數據結構
export interface InfluencerData {
  source: 'social-blade';
  platform: 'youtube' | 'instagram' | 'facebook';
  id: string;
  username?: string;
  display_name: string;
  avatar: string;
  followers: number;
  engagement_rate?: number;
  verified: boolean;
  grade: {
    color: string;
    grade: string;
  };
  growth: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  location?: {
    country_code: string;
    country: string;
  };
  ranks: {
    global: number;
    platform: number;
    country?: number;
  };
  raw_data: YouTubeData | InstagramData | FacebookData;
}

export class SocialBladeService {
  private static readonly BASE_URL = 'https://matrix.sbapis.com/b';
  private static readonly CLIENT_ID = process.env.NEXT_PUBLIC_SOCIAL_BLADE_CLIENT_ID;
  private static readonly TOKEN = process.env.NEXT_PUBLIC_SOCIAL_BLADE_TOKEN;
  
  // 檢查配置
  private static checkConfig(): boolean {
    if (!this.CLIENT_ID || !this.TOKEN) {
      console.warn('Social Blade API credentials not configured');
      return false;
    }
    return true;
  }
  
  // 通用 API 請求方法
  private static async makeRequest<T>(
    platform: string, 
    query: string, 
    history: string = 'default'
  ): Promise<SocialBladeResponse<T> | null> {
    if (!this.checkConfig()) return null;
    
    try {
      const url = `${this.BASE_URL}/${platform}/statistics?query=${encodeURIComponent(query)}&history=${history}&allow-stale=false`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'clientid': this.CLIENT_ID!,
          'token': this.TOKEN!,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Social Blade API error: ${response.status}`);
      }
      
      const data: SocialBladeResponse<T> = await response.json();
      
      if (!data.status.success) {
        throw new Error(`API Error: ${data.status.error || 'Unknown error'}`);
      }
      
      return data;
    } catch (error) {
      console.error(`Social Blade ${platform} API error:`, error);
      return null;
    }
  }
  
  // YouTube 數據獲取
  static async getYouTubeData(query: string): Promise<InfluencerData | null> {
    const response = await this.makeRequest<YouTubeData>('youtube', query);
    if (!response) return null;
    
    const data = response.data;
    return {
      source: 'social-blade',
      platform: 'youtube',
      id: data.id.id,
      username: data.id.username || data.id.handle,
      display_name: data.id.display_name,
      avatar: data.general.branding.avatar,
      followers: data.statistics.total.subscribers,
      verified: data.misc.sb_verified,
      grade: data.misc.grade,
      growth: {
        daily: data.statistics.growth.subs['1'] || 0,
        weekly: data.statistics.growth.subs['7'] || 0,
        monthly: data.statistics.growth.subs['30'] || 0,
      },
      location: {
        country_code: data.general.geo.country_code,
        country: data.general.geo.country,
      },
      ranks: {
        global: data.ranks.sbrank,
        platform: data.ranks.subscribers,
        country: data.ranks.country,
      },
      raw_data: data,
    };
  }
  
  // Instagram 數據獲取
  static async getInstagramData(query: string): Promise<InfluencerData | null> {
    const response = await this.makeRequest<InstagramData>('instagram', query);
    if (!response) return null;
    
    const data = response.data;
    return {
      source: 'social-blade',
      platform: 'instagram',
      id: data.id.id,
      username: data.id.username,
      display_name: data.id.display_name,
      avatar: data.general.branding.avatar,
      followers: data.statistics.total.followers,
      engagement_rate: data.statistics.total.engagement_rate,
      verified: data.misc.sb_verified,
      grade: data.misc.grade,
      growth: {
        daily: data.statistics.growth.followers['1'] || 0,
        weekly: data.statistics.growth.followers['7'] || 0,
        monthly: data.statistics.growth.followers['30'] || 0,
      },
      ranks: {
        global: data.ranks.sbrank,
        platform: data.ranks.followers,
      },
      raw_data: data,
    };
  }
  
  // Facebook 數據獲取
  static async getFacebookData(query: string): Promise<InfluencerData | null> {
    const response = await this.makeRequest<FacebookData>('facebook', query);
    if (!response) return null;
    
    const data = response.data;
    return {
      source: 'social-blade',
      platform: 'facebook',
      id: data.id.id,
      username: data.id.username,
      display_name: data.id.display_name,
      avatar: data.general.branding.avatar,
      followers: data.statistics.total.likes,
      verified: data.misc.sb_verified,
      grade: data.misc.grade,
      growth: {
        daily: data.statistics.growth.likes['1'] || 0,
        weekly: data.statistics.growth.likes['7'] || 0,
        monthly: data.statistics.growth.likes['30'] || 0,
      },
      ranks: {
        global: data.ranks.sbrank,
        platform: data.ranks.likes,
      },
      raw_data: data,
    };
  }
  
  // 從 URL 提取用戶名
  private static extractUsernameFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname;
      
      // YouTube
      if (url.includes('youtube.com')) {
        // 處理不同的 YouTube URL 格式
        const patterns = [
          /\/@([^\/\?]+)/,           // @username 格式
          /\/c\/([^\/\?]+)/,         // /c/channelname 格式  
          /\/channel\/([^\/\?]+)/,   // /channel/ID 格式
          /\/user\/([^\/\?]+)/,      // /user/username 格式
          /\/([^\/\?]+)$/            // 直接用戶名格式
        ];
        
        for (const pattern of patterns) {
          const match = path.match(pattern);
          if (match) {
            return match[1];
          }
        }
      }
      
      // Instagram
      if (url.includes('instagram.com')) {
        const match = path.match(/\/([^\/\?]+)/);
        return match ? match[1] : null;
      }
      
      // Facebook
      if (url.includes('facebook.com')) {
        const match = path.match(/\/([^\/\?]+)/);
        return match ? match[1] : null;
      }
      
      return null;
    } catch (error) {
      console.error('URL 解析錯誤:', error);
      return null;
    }
  }
  
  // 🎯 新增：智慧用戶名解析 - 嘗試多種可能的用戶名格式
  private static async tryMultipleUsernames(platform: string, originalUsername: string): Promise<InfluencerData | null> {
    // 生成可能的用戶名變體
    const variations = this.generateUsernameVariations(originalUsername);
    
    console.log(`🔍 嘗試 ${variations.length} 種用戶名變體:`, variations);
    
    for (const username of variations) {
      try {
        console.log(`🔍 測試用戶名: ${username}`);
        
        let result = null;
        if (platform === 'youtube') {
          result = await this.getYouTubeData(username);
        } else if (platform === 'instagram') {
          result = await this.getInstagramData(username);
        } else if (platform === 'facebook') {
          result = await this.getFacebookData(username);
        }
        
        if (result) {
          console.log(`✅ 成功找到數據: ${username} -> ${result.display_name}`);
          return result;
        }
      } catch (error) {
        console.log(`❌ ${username} 失敗:`, error instanceof Error ? error.message : 'Unknown error');
        continue;
      }
    }
    
    console.log(`⚠️ 所有用戶名變體都失敗了`);
    return null;
  }
  
  // 🎯 新增：生成用戶名變體
  private static generateUsernameVariations(originalUsername: string): string[] {
    const variations = [originalUsername];
    const lower = originalUsername.toLowerCase();
    
    // 已知的網紅映射
    const knownMappings: Record<string, string[]> = {
      'mrbeast': ['mrbeast6000', 'mrbeast', 'jimmydonaldson'],
      'pewdiepie': ['pewdiepie', 'pewdie'],
      'markiplier': ['markiplier', 'markipliergame'],
      'jacksepticeye': ['jacksepticeye', 'jack'],
      'dantdm': ['dantdm', 'thediamondminecart']
    };
    
    // 檢查已知映射
    if (knownMappings[lower]) {
      variations.push(...knownMappings[lower]);
    }
    
    // 添加常見變體
    if (lower !== originalUsername) {
      variations.push(lower);
    }
    
    // 添加數字後綴變體（常見模式）
    const commonSuffixes = ['6000', '2000', 'official', 'real', 'tv', 'yt'];
    for (const suffix of commonSuffixes) {
      variations.push(lower + suffix);
      variations.push(originalUsername + suffix);
    }
    
    // 移除重複項並保持順序
    return [...new Set(variations)];
  }

  // 智慧分析：根據 URL 自動選擇平台
  static async analyzeInfluencer(url: string): Promise<InfluencerData | null> {
    const username = this.extractUsernameFromUrl(url);
    if (!username) {
      console.error('無法從 URL 提取用戶名:', url);
      return null;
    }
    
    console.log(`🔍 從 URL 提取的用戶名: ${username}`);
    
    // 根據 URL 判斷平台並使用智慧重試
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return await this.tryMultipleUsernames('youtube', username);
    } else if (url.includes('instagram.com')) {
      return await this.tryMultipleUsernames('instagram', username);
    } else if (url.includes('facebook.com')) {
      return await this.tryMultipleUsernames('facebook', username);
    }
    
    console.error('不支援的平台 URL:', url);
    return null;
  }
  
  // 獲取剩餘額度
  static async getCreditsInfo(): Promise<{ available: number; expires_in: number } | null> {
    const response = await this.makeRequest<any>('youtube', 'test');
    if (!response) return null;
    
    return {
      available: response.info.credits.available,
      expires_in: response.info.access.seconds_to_expire,
    };
  }
  
  // 批次分析多個網紅
  static async batchAnalyze(urls: string[]): Promise<(InfluencerData | null)[]> {
    const results = await Promise.allSettled(
      urls.map(url => this.analyzeInfluencer(url))
    );
    
    return results.map(result => 
      result.status === 'fulfilled' ? result.value : null
    );
  }
} 
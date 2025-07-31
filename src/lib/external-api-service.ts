// 外部API整合服務
"use client";

export interface ExternalInfluencerData {
  source: 'kolr' | 'social-blade' | 'hypeauditor';
  username: string;
  platform: string;
  followers: number;
  engagement_rate: number;
  audience_location: string;
  growth_trend: number;
  estimated_earnings?: {
    monthly_min: number;
    monthly_max: number;
  };
  taiwan_focused?: boolean;
}

export class ExternalAPIService {
  private static readonly KOLR_API_KEY = process.env.NEXT_PUBLIC_KOLR_API_KEY;
  private static readonly APIFY_API_KEY = process.env.NEXT_PUBLIC_APIFY_API_KEY;
  
  // Kolr API 整合 (台灣專精)
  static async getKolrData(url: string): Promise<ExternalInfluencerData | null> {
    if (!this.KOLR_API_KEY) {
      console.warn("Kolr API key not configured");
      return null;
    }

    try {
      const response = await fetch('https://api.kolr.ai/v1/influencers/analyze', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.KOLR_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url })
      });

      if (!response.ok) {
        throw new Error(`Kolr API error: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        source: 'kolr',
        username: data.username,
        platform: data.platform,
        followers: data.follower_count,
        engagement_rate: data.engagement_rate,
        audience_location: data.audience_location,
        growth_trend: data.growth_trend,
        taiwan_focused: true
      };
    } catch (error) {
      console.error('Kolr API error:', error);
      return null;
    }
  }

  // Social Blade API 整合 (通過 Apify)
  static async getSocialBladeData(username: string, platform: string): Promise<ExternalInfluencerData | null> {
    if (!this.APIFY_API_KEY) {
      console.warn("Apify API key not configured");
      return null;
    }

    try {
      const response = await fetch('https://api.apify.com/v2/acts/radeance~socialblade-api/run-sync-get-dataset-items', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.APIFY_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          creators: [username],
          platform: platform,
          earnings: true
        })
      });

      if (!response.ok) {
        throw new Error(`Social Blade API error: ${response.status}`);
      }

      const data = await response.json();
      const creatorData = data[0];

      return {
        source: 'social-blade',
        username: creatorData.creator_handle,
        platform: creatorData.platform,
        followers: creatorData.subscribers || creatorData.followers,
        engagement_rate: this.calculateEngagementRate(creatorData),
        audience_location: creatorData.country || 'Unknown',
        growth_trend: creatorData.subscribers_last_30d || 0,
        estimated_earnings: creatorData.estimated_earnings?.monthly ? {
          monthly_min: creatorData.estimated_earnings.monthly.min,
          monthly_max: creatorData.estimated_earnings.monthly.max
        } : undefined
      };
    } catch (error) {
      console.error('Social Blade API error:', error);
      return null;
    }
  }

  // 智能數據源選擇
  static async getBestInfluencerData(url: string): Promise<ExternalInfluencerData | null> {
    const platform = this.detectPlatform(url);
    const username = this.extractUsername(url);
    
    // 針對台灣用戶優先使用 Kolr
    if (this.isTaiwanRelated(url) || this.KOLR_API_KEY) {
      console.log("🇹🇼 使用 Kolr API 獲取台灣網紅數據");
      const kolrData = await this.getKolrData(url);
      if (kolrData) return kolrData;
    }

    // 備用方案：使用 Social Blade
    console.log("📊 使用 Social Blade API 獲取基礎數據");
    return await this.getSocialBladeData(username, platform);
  }

  // 輔助函數
  private static detectPlatform(url: string): string {
    if (url.includes('instagram.com')) return 'instagram';
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('tiktok.com')) return 'tiktok';
    if (url.includes('facebook.com')) return 'facebook';
    if (url.includes('twitter.com') || url.includes('x.com')) return 'twitter';
    return 'unknown';
  }

  private static extractUsername(url: string): string {
    // 簡化的用戶名提取邏輯
    const match = url.match(/(?:@|\/)([\w.-]+)(?:\/|$|\?)/);
    return match ? match[1] : '';
  }

  private static isTaiwanRelated(url: string): boolean {
    // 檢測是否為台灣相關網紅
    return url.toLowerCase().includes('taiwan') || 
           url.toLowerCase().includes('tw') ||
           url.includes('台灣') ||
           url.includes('臺灣');
  }

  private static calculateEngagementRate(data: any): number {
    // 簡化的互動率計算
    if (data.engagement_rate) return data.engagement_rate;
    
    const followers = data.subscribers || data.followers || 1;
    const avgViews = data.views_last_30d || data.average_views || 0;
    
    return (avgViews / followers) * 100;
  }
}

// 環境變數檢查函數
export function checkExternalAPIConfig(): { [key: string]: boolean } {
  return {
    kolr: !!process.env.NEXT_PUBLIC_KOLR_API_KEY,
    apify: !!process.env.NEXT_PUBLIC_APIFY_API_KEY,
    hypeauditor: !!process.env.NEXT_PUBLIC_HYPEAUDITOR_API_KEY
  };
} 
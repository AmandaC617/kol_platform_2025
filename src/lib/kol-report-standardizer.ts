// KOL 報表標準化服務 - 統一所有平台數據格式

export interface StandardizedKOLReport {
  // 基本資訊
  id: string;
  name: string;
  platform: StandardizedPlatform;
  url: string;
  
  // 核心指標（統一格式）
  metrics: StandardizedMetrics;
  
  // 評估維度（標準化）
  evaluation: StandardizedEvaluation;
  
  // 受眾分析（標準化）
  audience: StandardizedAudience;
  
  // 內容分析（標準化）
  content: StandardizedContent;
  
  // 商業價值（標準化）
  business: StandardizedBusiness;
  
  // 風險評估（標準化）
  risk: StandardizedRisk;
  
  // 元數據
  metadata: ReportMetadata;
}

export type StandardizedPlatform = 
  | 'YouTube' 
  | 'Instagram' 
  | 'Facebook' 
  | 'TikTok' 
  | 'Twitter';

export interface StandardizedMetrics {
  // 粉絲數（統一為數字）
  followers: number;
  followersDisplay: string; // 顯示格式如 "1.9M"
  
  // 互動指標（統一格式）
  engagementRate: number; // 0-100 百分比
  avgLikes: number;
  avgComments: number;
  avgShares: number;
  avgViews: number;
  
  // 成長趨勢（統一時間段）
  growth: {
    daily: number;
    weekly: number;
    monthly: number;
    quarterly: number;
    yearly: number;
  };
  
  // 活躍度
  postFrequency: {
    postsPerWeek: number;
    consistency: number; // 0-100 一致性分數
  };
}

export interface StandardizedEvaluation {
  // 總分（0-100 標準化）
  overallScore: number;
  
  // 八大評估維度（統一標準）
  dimensions: {
    brandFit: number;        // 品牌契合度 (0-100)
    contentQuality: number;  // 內容品質 (0-100)
    engagementRate: number;  // 互動率 (0-100)
    audienceProfile: number; // 受眾輪廓 (0-100)
    professionalism: number; // 專業度 (0-100)
    businessAbility: number; // 商業能力 (0-100)
    brandSafety: number;     // 品牌安全 (0-100)
    stability: number;       // 穩定性 (0-100)
  };
  
  // 加權計算的綜合分數
  weightedScore: number;
  
  // 評估等級
  grade: 'S' | 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D';
  
  // 推薦程度
  recommendation: 'strongly_recommended' | 'recommended' | 'conditional' | 'not_recommended';
}

export interface StandardizedAudience {
  // 地區分布（重點：亞洲市場）
  geography: {
    primary: string; // 主要地區
    asian_markets: Record<string, number>; // 亞洲市場分布
    global_reach: Record<string, number>; // 全球觸達
  };
  
  // 年齡分布（標準化年齡段）
  demographics: {
    age_13_17: number;
    age_18_24: number;
    age_25_34: number;
    age_35_44: number;
    age_45_54: number;
    age_55_plus: number;
  };
  
  // 性別分布
  gender: {
    male: number;
    female: number;
    other: number;
  };
  
  // 興趣標籤（標準化分類）
  interests: string[];
  
  // 購買力
  purchasingPower: 'high' | 'medium' | 'low';
  
  // 受眾質量分數
  qualityScore: number; // 0-100
}

export interface StandardizedContent {
  // 內容分類（標準化）
  categories: string[];
  
  // 內容風格（標準化）
  styles: string[];
  
  // 內容質量指標
  quality: {
    creativity: number;     // 創意性 (0-100)
    production: number;     // 製作水準 (0-100)
    storytelling: number;   // 故事性 (0-100)
    authenticity: number;   // 真實性 (0-100)
  };
  
  // 最近內容分析
  recent: {
    mainTopics: string[];
    trendingHashtags: string[];
    averageEngagement: number;
    contentFrequency: string;
  };
  
  // 品牌安全評估
  brandSafety: {
    riskLevel: 'low' | 'medium' | 'high';
    concerns: string[];
    safetyScore: number; // 0-100
  };
}

export interface StandardizedBusiness {
  // 商業價值評估
  marketValue: {
    estimated_cpm: number;    // 每千次曝光成本
    estimated_cpv: number;    // 每次觀看成本
    estimated_cpe: number;    // 每次互動成本
    roi_potential: number;    // ROI 潛力 (0-100)
  };
  
  // 合作能力
  collaboration: {
    professionalism: number;  // 專業度 (0-100)
    reliability: number;      // 可靠性 (0-100)
    creativity: number;       // 創意能力 (0-100)
    flexibility: number;      // 靈活性 (0-100)
  };
  
  // 轉換能力
  conversion: {
    sales_potential: number;  // 銷售潛力 (0-100)
    traffic_driving: number;  // 流量驅動 (0-100)
    brand_building: number;   // 品牌建設 (0-100)
  };
  
  // 合作建議
  recommendation: {
    suitable_campaigns: string[];
    budget_range: string;
    cooperation_notes: string;
  };
}

export interface StandardizedRisk {
  // 整體風險等級
  overall: 'low' | 'medium' | 'high';
  
  // 具體風險項目
  factors: {
    content_risk: number;     // 內容風險 (0-100)
    reputation_risk: number;  // 聲譽風險 (0-100)
    legal_risk: number;       // 法律風險 (0-100)
    brand_fit_risk: number;   // 品牌契合風險 (0-100)
  };
  
  // 風險描述
  concerns: string[];
  
  // 風險緩解建議
  mitigation: string[];
  
  // 風險監控建議
  monitoring: string[];
}

export interface ReportMetadata {
  // 數據來源
  dataSource: 'social_blade' | 'google_ai' | 'manual' | 'hybrid';
  
  // 數據時間戳
  generatedAt: Date;
  lastUpdated: Date;
  
  // 數據質量
  quality: {
    completeness: number;     // 完整性 (0-100)
    accuracy: number;         // 準確性 (0-100)
    freshness: number;        // 新鮮度 (0-100)
    reliability: number;      // 可靠性 (0-100)
  };
  
  // 分析師信息
  analyst: {
    type: 'ai' | 'human' | 'hybrid';
    confidence: number; // 0-100
  };
  
  // 報告版本
  version: string;
}

export class KOLReportStandardizer {
  /**
   * 標準化 Social Blade 數據
   */
  static standardizeSocialBladeData(data: any, platform: string): StandardizedKOLReport {
    const platformMap: Record<string, StandardizedPlatform> = {
      'youtube': 'YouTube',
      'instagram': 'Instagram',
      'facebook': 'Facebook',
      'tiktok': 'TikTok',
      'twitter': 'Twitter'
    };

    return {
      id: data.id?.id || data.id || '',
      name: data.id?.display_name || data.display_name || data.name || '',
      platform: platformMap[platform.toLowerCase()] || platform as StandardizedPlatform,
      url: data.url || '',
      
      metrics: this.standardizeMetrics(data, platform),
      evaluation: this.calculateStandardizedEvaluation(data, platform),
      audience: this.standardizeAudience(data, platform),
      content: this.standardizeContent(data, platform),
      business: this.calculateBusinessValue(data, platform),
      risk: this.assessRisk(data, platform),
      metadata: this.generateMetadata('social_blade', data)
    };
  }

  /**
   * 標準化 Google AI 數據
   */
  static standardizeGoogleAIData(data: any): StandardizedKOLReport {
    return {
      id: Date.now().toString(),
      name: data.name || '',
      platform: data.platform as StandardizedPlatform,
      url: data.url || '',
      
      metrics: this.standardizeAIMetrics(data),
      evaluation: this.calculateAIEvaluation(data),
      audience: this.standardizeAIAudience(data),
      content: this.standardizeAIContent(data),
      business: this.calculateAIBusinessValue(data),
      risk: this.assessAIRisk(data),
      metadata: this.generateMetadata('google_ai', data)
    };
  }

  /**
   * 標準化指標
   */
  private static standardizeMetrics(data: any, platform: string): StandardizedMetrics {
    const followers = this.extractFollowers(data, platform);
    
    return {
      followers,
      followersDisplay: this.formatFollowers(followers),
      engagementRate: this.calculateEngagementRate(data, platform),
      avgLikes: data.statistics?.engagement?.avg_likes || 0,
      avgComments: data.statistics?.engagement?.avg_comments || 0,
      avgShares: 0, // 平台相關
      avgViews: data.statistics?.total?.views || 0,
      growth: {
        daily: data.statistics?.growth?.daily || 0,
        weekly: data.statistics?.growth?.weekly || 0,
        monthly: data.statistics?.growth?.monthly || 0,
        quarterly: 0, // 計算得出
        yearly: data.statistics?.growth?.yearly || 0
      },
      postFrequency: {
        postsPerWeek: this.calculatePostFrequency(data),
        consistency: this.calculateConsistency(data)
      }
    };
  }

  /**
   * 計算標準化評估
   */
  private static calculateStandardizedEvaluation(data: any, platform: string): StandardizedEvaluation {
    const dimensions = {
      brandFit: this.calculateBrandFit(data, platform),
      contentQuality: this.calculateContentQuality(data, platform),
      engagementRate: this.calculateEngagementScore(data, platform),
      audienceProfile: this.calculateAudienceScore(data, platform),
      professionalism: this.calculateProfessionalism(data, platform),
      businessAbility: this.calculateBusinessAbility(data, platform),
      brandSafety: this.calculateBrandSafety(data, platform),
      stability: this.calculateStability(data, platform)
    };

    const weightedScore = this.calculateWeightedScore(dimensions);
    
    return {
      overallScore: Math.round(Object.values(dimensions).reduce((a, b) => a + b) / 8),
      dimensions,
      weightedScore,
      grade: this.calculateGrade(weightedScore),
      recommendation: this.calculateRecommendation(weightedScore, data)
    };
  }

  /**
   * 提取粉絲數（統一處理不同平台）
   */
  private static extractFollowers(data: any, platform: string): number {
    switch (platform.toLowerCase()) {
      case 'youtube':
        return data.statistics?.total?.subscribers || 0;
      case 'instagram':
        return data.statistics?.total?.followers || 0;
      case 'facebook':
        return data.statistics?.total?.likes || 0;
      case 'tiktok':
        return data.statistics?.total?.followers || 0;
      case 'twitter':
        return data.statistics?.total?.followers || 0;
      default:
        return 0;
    }
  }

  /**
   * 格式化粉絲數顯示
   */
  private static formatFollowers(followers: number): string {
    if (followers >= 1000000) {
      return `${(followers / 1000000).toFixed(1)}M`;
    } else if (followers >= 1000) {
      return `${(followers / 1000).toFixed(1)}K`;
    } else {
      return followers.toString();
    }
  }

  /**
   * 計算加權分數
   */
  private static calculateWeightedScore(dimensions: any): number {
    const weights = {
      brandFit: 0.15,
      contentQuality: 0.2,
      engagementRate: 0.15,
      audienceProfile: 0.1,
      professionalism: 0.15,
      businessAbility: 0.1,
      brandSafety: 0.1,
      stability: 0.05
    };

    return Math.round(
      Object.entries(dimensions).reduce((total, [key, value]) => {
        return total + (value as number) * weights[key as keyof typeof weights];
      }, 0)
    );
  }

  /**
   * 計算等級
   */
  private static calculateGrade(score: number): StandardizedEvaluation['grade'] {
    if (score >= 95) return 'S';
    if (score >= 90) return 'A+';
    if (score >= 85) return 'A';
    if (score >= 80) return 'A-';
    if (score >= 75) return 'B+';
    if (score >= 70) return 'B';
    if (score >= 65) return 'B-';
    if (score >= 60) return 'C+';
    if (score >= 55) return 'C';
    if (score >= 50) return 'C-';
    return 'D';
  }

  /**
   * 計算推薦程度
   */
  private static calculateRecommendation(score: number, data: any): StandardizedEvaluation['recommendation'] {
    if (score >= 85) return 'strongly_recommended';
    if (score >= 75) return 'recommended';
    if (score >= 60) return 'conditional';
    return 'not_recommended';
  }

  // 實現其他計算方法...
  private static calculateEngagementRate(data: any, platform: string): number {
    // 實現互動率計算邏輯
    return data.statistics?.total?.engagement_rate || 0;
  }

  private static calculateBrandFit(data: any, platform: string): number {
    // 實現品牌契合度計算邏輯
    return 75; // 預設值
  }

  private static calculateContentQuality(data: any, platform: string): number {
    // 實現內容品質計算邏輯
    return 80; // 預設值
  }

  private static calculateEngagementScore(data: any, platform: string): number {
    // 實現互動評分計算邏輯
    return 70; // 預設值
  }

  private static calculateAudienceScore(data: any, platform: string): number {
    // 實現受眾評分計算邏輯
    return 75; // 預設值
  }

  private static calculateProfessionalism(data: any, platform: string): number {
    // 實現專業度計算邏輯
    return 80; // 預設值
  }

  private static calculateBusinessAbility(data: any, platform: string): number {
    // 實現商業能力計算邏輯
    return 70; // 預設值
  }

  private static calculateBrandSafety(data: any, platform: string): number {
    // 實現品牌安全計算邏輯
    const grade = data.misc?.grade?.grade;
    if (grade === 'A+' || grade === 'A' || grade === 'A-') return 90;
    if (grade === 'B+' || grade === 'B' || grade === 'B-') return 75;
    if (grade === 'C+' || grade === 'C' || grade === 'C-') return 60;
    return 40;
  }

  private static calculateStability(data: any, platform: string): number {
    // 實現穩定性計算邏輯
    return 85; // 預設值
  }

  private static calculatePostFrequency(data: any): number {
    // 實現發文頻率計算邏輯
    return 7; // 每週預設值
  }

  private static calculateConsistency(data: any): number {
    // 實現一致性計算邏輯
    return 80; // 預設值
  }

  private static standardizeAudience(data: any, platform: string): StandardizedAudience {
    // 實現受眾標準化邏輯
    return {
      geography: {
        primary: '台灣',
        asian_markets: { '台灣': 70, '香港': 15, '新加坡': 10, '馬來西亞': 5 },
        global_reach: { '台灣': 70, '美國': 10, '其他': 20 }
      },
      demographics: {
        age_13_17: 10,
        age_18_24: 30,
        age_25_34: 35,
        age_35_44: 15,
        age_45_54: 8,
        age_55_plus: 2
      },
      gender: { male: 45, female: 53, other: 2 },
      interests: ['生活', '科技', '娛樂'],
      purchasingPower: 'medium',
      qualityScore: 80
    };
  }

  private static standardizeContent(data: any, platform: string): StandardizedContent {
    // 實現內容標準化邏輯
    return {
      categories: ['生活', '娛樂'],
      styles: ['幽默', '真實'],
      quality: {
        creativity: 80,
        production: 75,
        storytelling: 85,
        authenticity: 90
      },
      recent: {
        mainTopics: ['日常生活', '產品開箱'],
        trendingHashtags: ['#生活', '#分享'],
        averageEngagement: 5.2,
        contentFrequency: '每週 3-4 則'
      },
      brandSafety: {
        riskLevel: 'low',
        concerns: [],
        safetyScore: 90
      }
    };
  }

  private static calculateBusinessValue(data: any, platform: string): StandardizedBusiness {
    // 實現商業價值計算邏輯
    return {
      marketValue: {
        estimated_cpm: 50,
        estimated_cpv: 0.1,
        estimated_cpe: 2,
        roi_potential: 75
      },
      collaboration: {
        professionalism: 80,
        reliability: 85,
        creativity: 75,
        flexibility: 80
      },
      conversion: {
        sales_potential: 70,
        traffic_driving: 75,
        brand_building: 80
      },
      recommendation: {
        suitable_campaigns: ['品牌推廣', '產品開箱'],
        budget_range: 'NT$ 50,000 - 100,000',
        cooperation_notes: '適合長期合作'
      }
    };
  }

  private static assessRisk(data: any, platform: string): StandardizedRisk {
    // 實現風險評估邏輯
    return {
      overall: 'low',
      factors: {
        content_risk: 20,
        reputation_risk: 15,
        legal_risk: 10,
        brand_fit_risk: 25
      },
      concerns: [],
      mitigation: ['定期監控內容', '建立清晰合作條款'],
      monitoring: ['每月內容審核', '輿情監控']
    };
  }

  private static generateMetadata(source: string, data: any): ReportMetadata {
    return {
      dataSource: source as any,
      generatedAt: new Date(),
      lastUpdated: new Date(),
      quality: {
        completeness: 85,
        accuracy: 80,
        freshness: 95,
        reliability: 85
      },
      analyst: {
        type: source === 'social_blade' ? 'hybrid' : 'ai',
        confidence: 85
      },
      version: '1.0'
    };
  }

  // 添加 AI 數據處理方法的存根實現
  private static standardizeAIMetrics(data: any): StandardizedMetrics {
    // AI 數據的指標標準化
    return this.standardizeMetrics(data, data.platform);
  }

  private static calculateAIEvaluation(data: any): StandardizedEvaluation {
    // AI 數據的評估標準化
    return this.calculateStandardizedEvaluation(data, data.platform);
  }

  private static standardizeAIAudience(data: any): StandardizedAudience {
    return this.standardizeAudience(data, data.platform);
  }

  private static standardizeAIContent(data: any): StandardizedContent {
    return this.standardizeContent(data, data.platform);
  }

  private static calculateAIBusinessValue(data: any): StandardizedBusiness {
    return this.calculateBusinessValue(data, data.platform);
  }

  private static assessAIRisk(data: any): StandardizedRisk {
    return this.assessRisk(data, data.platform);
  }
}

/**
 * 匯出報告統一格式
 */
export interface UnifiedKOLReportExport {
  // 基本資訊
  基本資訊: {
    姓名: string;
    平台: string;
    網址: string;
    粉絲數: string;
    互動率: string;
    整體評分: number;
    等級: string;
  };
  
  // 評估維度
  評估維度: {
    品牌契合度: number;
    內容品質: number;
    互動率評分: number;
    受眾輪廓: number;
    專業度: number;
    商業能力: number;
    品牌安全: number;
    穩定性: number;
  };
  
  // 商業價值
  商業價值: {
    市場價值: string;
    合作建議: string;
    預算範圍: string;
    ROI潛力: number;
  };
  
  // 風險評估
  風險評估: {
    整體風險: string;
    風險因素: string[];
    緩解建議: string[];
  };
  
  // 元數據
  報告資訊: {
    生成時間: string;
    數據來源: string;
    數據品質: number;
    版本: string;
  };
} 
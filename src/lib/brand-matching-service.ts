import { BrandProfile, InfluencerMatchScore } from '@/types/brand-matching';
import { Influencer } from '@/types';

/**
 * 計算網紅與品牌的匹配分數
 */
export const calculateBrandMatchScore = (
  influencer: Influencer,
  brandProfile: BrandProfile
): InfluencerMatchScore => {
  // 基礎分數計算
  const brandToneScore = calculateBrandToneMatch(influencer, brandProfile);
  const audienceScore = calculateAudienceMatch(influencer, brandProfile);
  const contentScore = calculateContentMatch(influencer, brandProfile);
  const marketScore = calculateMarketMatch(influencer, brandProfile);
  const engagementScore = calculateEngagementMatch(influencer, brandProfile);

  // 加權平均分數
  const overallScore = (
    brandToneScore * 0.25 +
    audienceScore * 0.25 +
    contentScore * 0.2 +
    marketScore * 0.15 +
    engagementScore * 0.15
  );

  return {
    influencerId: influencer.id,
    brandId: brandProfile.id,
    overallScore: Math.round(overallScore * 100) / 100,
    categoryScores: {
      brandToneMatch: Math.round(brandToneScore * 100) / 100,
      audienceMatch: Math.round(audienceScore * 100) / 100,
      contentTypeMatch: Math.round(contentScore * 100) / 100,
      marketReach: Math.round(marketScore * 100) / 100,
      engagementPotential: Math.round(engagementScore * 100) / 100,
    },
    detailedAnalysis: {
      brandToneAnalysis: {
        personalityMatch: calculatePersonalityMatch(influencer, brandProfile),
        communicationStyleMatch: calculateCommunicationMatch(influencer, brandProfile),
        visualStyleMatch: calculateVisualMatch(influencer, brandProfile),
        keywordOverlap: calculateKeywordOverlap(influencer, brandProfile),
        contentSentiment: analyzeContentSentiment(influencer),
        brandSafetyScore: calculateBrandSafetyScore(influencer),
      },
      audienceAnalysis: {
        ageMatch: calculateAgeMatch(influencer, brandProfile),
        genderMatch: calculateGenderMatch(influencer, brandProfile),
        locationMatch: calculateLocationMatch(influencer, brandProfile),
        interestOverlap: calculateInterestOverlap(influencer, brandProfile),
        audienceQuality: calculateAudienceQuality(influencer),
        audienceEngagement: calculateAudienceEngagement(influencer),
      },
      contentAnalysis: {
        contentTypePreference: calculateContentTypePreference(influencer, brandProfile),
        contentQuality: calculateContentQuality(influencer),
        contentConsistency: calculateContentConsistency(influencer),
        productIntegrationAbility: calculateProductIntegrationAbility(influencer),
        storytellingAbility: calculateStorytellingAbility(influencer),
      },
      marketAnalysis: {
        marketPresence: calculateMarketPresence(influencer),
        localInfluence: calculateLocalInfluence(influencer),
        culturalRelevance: calculateCulturalRelevance(influencer, brandProfile),
        marketTrendAlignment: calculateMarketTrendAlignment(influencer),
      },
      engagementAnalysis: {
        reachPotential: calculateReachPotential(influencer),
        engagementRate: calculateEngagementRate(influencer),
        audienceRetention: calculateAudienceRetention(influencer),
        conversionPotential: calculateConversionPotential(influencer),
      },
    },
    recommendations: generateRecommendations(influencer, brandProfile),
    riskFactors: identifyRiskFactors(influencer, brandProfile),
  };
};

// 品牌調性匹配計算
const calculateBrandToneMatch = (influencer: Influencer, brandProfile: BrandProfile): number => {
  const personalityMatch = calculatePersonalityMatch(influencer, brandProfile);
  const communicationMatch = calculateCommunicationMatch(influencer, brandProfile);
  const visualMatch = calculateVisualMatch(influencer, brandProfile);
  const keywordOverlap = calculateKeywordOverlap(influencer, brandProfile);

  return (personalityMatch + communicationMatch + visualMatch + keywordOverlap) / 4;
};

const calculatePersonalityMatch = (influencer: Influencer, brandProfile: BrandProfile): number => {
  // 基於網紅的內容風格和品牌個性進行匹配
  const influencerStyle = influencer.profile?.contentStyle || [];
  const brandPersonality = brandProfile.brandTone.personality;

  // 簡化的匹配邏輯
  const personalityMatches = {
    professional: ['professional', 'sophisticated'],
    friendly: ['friendly', 'casual', 'playful'],
    luxury: ['luxury', 'sophisticated', 'elegant'],
    casual: ['casual', 'friendly', 'playful'],
    innovative: ['innovative', 'creative', 'modern'],
    traditional: ['traditional', 'elegant'],
    playful: ['playful', 'friendly', 'casual'],
    sophisticated: ['sophisticated', 'elegant', 'professional']
  };

  const matches = personalityMatches[brandPersonality as keyof typeof personalityMatches] || [];
  const hasMatch = influencerStyle.some(style => matches.includes(style));
  
  return hasMatch ? 0.8 : 0.3;
};

const calculateCommunicationMatch = (influencer: Influencer, brandProfile: BrandProfile): number => {
  // 基於網紅的溝通風格和品牌溝通風格進行匹配
  const brandStyle = brandProfile.brandTone.communicationStyle;
  
  // 簡化的匹配邏輯
  return 0.7; // 預設中等匹配度
};

const calculateVisualMatch = (influencer: Influencer, brandProfile: BrandProfile): number => {
  // 基於網紅的視覺風格和品牌視覺風格進行匹配
  const brandVisual = brandProfile.brandTone.visualStyle;
  
  // 簡化的匹配邏輯
  return 0.6; // 預設中等匹配度
};

const calculateKeywordOverlap = (influencer: Influencer, brandProfile: BrandProfile): number => {
  const brandKeywords = brandProfile.brandTone.keywords;
  const influencerTopics = influencer.profile?.contentTopics || [];
  
  if (brandKeywords.length === 0) return 0.5;
  
  const overlap = brandKeywords.filter(keyword => 
    influencerTopics.some(topic => topic.toLowerCase().includes(keyword.toLowerCase()))
  ).length;
  
  return Math.min(overlap / brandKeywords.length, 1);
};

// 受眾匹配計算
const calculateAudienceMatch = (influencer: Influencer, brandProfile: BrandProfile): number => {
  const ageMatch = calculateAgeMatch(influencer, brandProfile);
  const genderMatch = calculateGenderMatch(influencer, brandProfile);
  const locationMatch = calculateLocationMatch(influencer, brandProfile);
  const interestOverlap = calculateInterestOverlap(influencer, brandProfile);

  return (ageMatch + genderMatch + locationMatch + interestOverlap) / 4;
};

const calculateAgeMatch = (influencer: Influencer, brandProfile: BrandProfile): number => {
  const targetAgeRanges = brandProfile.targetAudience.ageRanges;
  const influencerLocation = influencer.profile?.audienceLocation || '';
  
  // 簡化的年齡匹配邏輯
  return 0.7; // 預設中等匹配度
};

const calculateGenderMatch = (influencer: Influencer, brandProfile: BrandProfile): number => {
  const targetGender = brandProfile.targetAudience.gender;
  
  // 簡化的性別匹配邏輯
  return 0.8; // 預設高匹配度
};

const calculateLocationMatch = (influencer: Influencer, brandProfile: BrandProfile): number => {
  const targetLocations = brandProfile.targetAudience.locations;
  const influencerLocation = influencer.profile?.audienceLocation || '';
  
  if (targetLocations.length === 0) return 0.5;
  
  const hasMatch = targetLocations.some(location => 
    influencerLocation.toLowerCase().includes(location.toLowerCase())
  );
  
  return hasMatch ? 0.9 : 0.3;
};

const calculateInterestOverlap = (influencer: Influencer, brandProfile: BrandProfile): number => {
  const targetInterests = brandProfile.targetAudience.interests;
  const influencerTopics = influencer.profile?.contentTopics || [];
  
  if (targetInterests.length === 0) return 0.5;
  
  const overlap = targetInterests.filter(interest => 
    influencerTopics.some(topic => topic.toLowerCase().includes(interest.toLowerCase()))
  ).length;
  
  return Math.min(overlap / targetInterests.length, 1);
};

// 內容匹配計算
const calculateContentMatch = (influencer: Influencer, brandProfile: BrandProfile): number => {
  const contentTypePreference = calculateContentTypePreference(influencer, brandProfile);
  const contentQuality = calculateContentQuality(influencer);
  const contentConsistency = calculateContentConsistency(influencer);

  return (contentTypePreference + contentQuality + contentConsistency) / 3;
};

const calculateContentTypePreference = (influencer: Influencer, brandProfile: BrandProfile): number => {
  const preferredTypes = brandProfile.preferredContentTypes;
  const influencerPlatform = influencer.platform;
  
  if (preferredTypes.length === 0) return 0.5;
  
  // 簡化的內容類型匹配邏輯
  const platformContentMap = {
    'Instagram': ['image', 'story', 'reel'],
    'YouTube': ['video'],
    'TikTok': ['video', 'reel'],
    'Facebook': ['video', 'image', 'text'],
    'Twitter': ['text', 'image']
  };
  
  const influencerContentTypes = platformContentMap[influencerPlatform as keyof typeof platformContentMap] || [];
  const hasMatch = preferredTypes.some(type => influencerContentTypes.includes(type));
  
  return hasMatch ? 0.8 : 0.4;
};

const calculateContentQuality = (influencer: Influencer): number => {
  // 基於網紅的粉絲數、互動率等指標評估內容品質
  const followers = influencer.profile?.followers || 0;
  const engagementRate = parseFloat(String(influencer.profile?.engagementRate || '0'));
  
  // 簡化的品質評估邏輯
  let quality = 0.5;
  if (followers > 100000) quality += 0.2;
  if (engagementRate > 3) quality += 0.3;
  
  return Math.min(quality, 1);
};

const calculateContentConsistency = (influencer: Influencer): number => {
  // 基於網紅的內容一致性評估
  return 0.7; // 預設中等一致性
};

// 市場匹配計算
const calculateMarketMatch = (influencer: Influencer, brandProfile: BrandProfile): number => {
  const marketPresence = calculateMarketPresence(influencer);
  const localInfluence = calculateLocalInfluence(influencer);
  const culturalRelevance = calculateCulturalRelevance(influencer, brandProfile);

  return (marketPresence + localInfluence + culturalRelevance) / 3;
};

const calculateMarketPresence = (influencer: Influencer): number => {
  const followers = influencer.profile?.followers || 0;
  
  // 基於粉絲數評估市場影響力
  if (followers > 1000000) return 0.9;
  if (followers > 500000) return 0.8;
  if (followers > 100000) return 0.7;
  if (followers > 50000) return 0.6;
  return 0.4;
};

const calculateLocalInfluence = (influencer: Influencer): number => {
  const location = influencer.profile?.audienceLocation || '';
  
  // 簡化的本地影響力評估
  if (location.includes('Taiwan') || location.includes('台灣')) return 0.8;
  if (location.includes('Asia') || location.includes('亞洲')) return 0.7;
  return 0.5;
};

const calculateCulturalRelevance = (influencer: Influencer, brandProfile: BrandProfile): number => {
  // 基於文化相關性評估
  return 0.7; // 預設中等相關性
};

// 互動匹配計算
const calculateEngagementMatch = (influencer: Influencer, brandProfile: BrandProfile): number => {
  const reachPotential = calculateReachPotential(influencer);
  const engagementRate = calculateEngagementRate(influencer);
  const audienceRetention = calculateAudienceRetention(influencer);

  return (reachPotential + engagementRate + audienceRetention) / 3;
};

const calculateReachPotential = (influencer: Influencer): number => {
  const followers = influencer.profile?.followers || 0;
  
  // 基於粉絲數評估觸及潛力
  if (followers > 1000000) return 0.9;
  if (followers > 500000) return 0.8;
  if (followers > 100000) return 0.7;
  if (followers > 50000) return 0.6;
  return 0.4;
};

const calculateEngagementRate = (influencer: Influencer): number => {
  const engagementRate = parseFloat(String(influencer.profile?.engagementRate || '0'));
  
  // 基於互動率評估
  if (engagementRate > 5) return 0.9;
  if (engagementRate > 3) return 0.8;
  if (engagementRate > 1) return 0.6;
  return 0.4;
};

const calculateAudienceRetention = (influencer: Influencer): number => {
  // 基於受眾留存率評估
  return 0.7; // 預設中等留存率
};

// 輔助計算函數
const calculateProductIntegrationAbility = (influencer: Influencer): number => {
  // 評估產品整合能力
  return 0.6; // 預設中等能力
};

const calculateStorytellingAbility = (influencer: Influencer): number => {
  // 評估說故事能力
  return 0.7; // 預設中等能力
};

const calculateMarketTrendAlignment = (influencer: Influencer): number => {
  // 評估市場趨勢對齊度
  return 0.6; // 預設中等對齊度
};

const calculateConversionPotential = (influencer: Influencer): number => {
  // 評估轉換潛力
  return 0.6; // 預設中等潛力
};

const analyzeContentSentiment = (influencer: Influencer): 'positive' | 'neutral' | 'negative' => {
  // 分析內容情感傾向
  return 'positive'; // 預設正面
};

const calculateBrandSafetyScore = (influencer: Influencer): number => {
  // 計算品牌安全分數
  return 0.8; // 預設高安全分數
};

const calculateAudienceQuality = (influencer: Influencer): number => {
  // 評估受眾品質
  return 0.7; // 預設中等品質
};

const calculateAudienceEngagement = (influencer: Influencer): number => {
  // 評估受眾互動度
  return 0.7; // 預設中等互動度
};

// 生成建議
const generateRecommendations = (influencer: Influencer, brandProfile: BrandProfile): string[] => {
  const recommendations: string[] = [];
  
  // 基於匹配分析生成建議
  if (influencer.profile?.followers && influencer.profile.followers > 500000) {
    recommendations.push('高影響力網紅，適合品牌知名度推廣');
  }
  
  if (influencer.profile?.engagementRate && parseFloat(String(influencer.profile.engagementRate)) > 3) {
    recommendations.push('高互動率，適合深度品牌互動');
  }
  
  if (influencer.profile?.audienceLocation?.includes('Taiwan')) {
    recommendations.push('台灣本地影響力強，適合在地化推廣');
  }
  
  return recommendations;
};

// 識別風險因素
const identifyRiskFactors = (influencer: Influencer, brandProfile: BrandProfile): string[] => {
  const riskFactors: string[] = [];
  
  // 基於風險分析識別潛在問題
  if (influencer.profile?.followers && influencer.profile.followers < 10000) {
    riskFactors.push('影響力較小，觸及範圍有限');
  }
  
  if (influencer.profile?.engagementRate && parseFloat(String(influencer.profile.engagementRate)) < 1) {
    riskFactors.push('互動率偏低，可能影響推廣效果');
  }
  
  return riskFactors;
}; 
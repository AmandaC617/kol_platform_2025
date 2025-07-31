// 品牌匹配評分系統類型定義

export interface BrandProfile {
  id: string;
  name: string;
  industry: string;
  brandTone: BrandTone;
  targetAudience: TargetAudience;
  campaignGoals: CampaignGoal[];
  preferredContentTypes: ContentType[];
  targetMarkets: string[];
  budgetRange: BudgetRange;
  productComplexity: ProductComplexity;
}

export interface BrandTone {
  personality: BrandPersonality;
  communicationStyle: CommunicationStyle;
  visualStyle: VisualStyle;
  keywords: string[];
}

export interface TargetAudience {
  ageRanges: AgeRange[];
  gender: GenderDistribution;
  locations: string[];
  interests: string[];
  incomeLevel: IncomeLevel;
  lifestyle: string[];
}

export interface CampaignGoal {
  type: GoalType;
  priority: 'high' | 'medium' | 'low';
  targetMetrics: string[];
  description: string;
}

export interface InfluencerMatchScore {
  influencerId: string;
  brandId: string;
  overallScore: number;
  categoryScores: {
    brandToneMatch: number;
    audienceMatch: number;
    contentTypeMatch: number;
    marketReach: number;
    engagementPotential: number;
  };
  detailedAnalysis: {
    brandToneAnalysis: BrandToneAnalysis;
    audienceAnalysis: AudienceAnalysis;
    contentAnalysis: ContentAnalysis;
    marketAnalysis: MarketAnalysis;
    engagementAnalysis: EngagementAnalysis;
  };
  recommendations: string[];
  riskFactors: string[];
}

// 詳細分析類型
export interface BrandToneAnalysis {
  personalityMatch: number;
  communicationStyleMatch: number;
  visualStyleMatch: number;
  keywordOverlap: number;
  contentSentiment: 'positive' | 'neutral' | 'negative';
  brandSafetyScore: number;
}

export interface AudienceAnalysis {
  ageMatch: number;
  genderMatch: number;
  locationMatch: number;
  interestOverlap: number;
  audienceQuality: number;
  audienceEngagement: number;
}

export interface ContentAnalysis {
  contentTypePreference: number;
  contentQuality: number;
  contentConsistency: number;
  productIntegrationAbility: number;
  storytellingAbility: number;
}

export interface MarketAnalysis {
  marketPresence: number;
  localInfluence: number;
  culturalRelevance: number;
  marketTrendAlignment: number;
}

export interface EngagementAnalysis {
  reachPotential: number;
  engagementRate: number;
  audienceRetention: number;
  conversionPotential: number;
}

// 枚舉類型
export enum BrandPersonality {
  PROFESSIONAL = 'professional',
  FRIENDLY = 'friendly',
  LUXURIOUS = 'luxurious',
  PLAYFUL = 'playful',
  AUTHORITATIVE = 'authoritative',
  INNOVATIVE = 'innovative',
  TRADITIONAL = 'traditional',
  YOUTHFUL = 'youthful'
}

export enum CommunicationStyle {
  FORMAL = 'formal',
  CASUAL = 'casual',
  HUMOROUS = 'humorous',
  EDUCATIONAL = 'educational',
  INSPIRATIONAL = 'inspirational',
  CONVERSATIONAL = 'conversational'
}

export enum VisualStyle {
  MINIMALIST = 'minimalist',
  BOLD = 'bold',
  ELEGANT = 'elegant',
  PLAYFUL = 'playful',
  PROFESSIONAL = 'professional',
  CREATIVE = 'creative'
}

export enum GoalType {
  AWARENESS = 'awareness',
  ENGAGEMENT = 'engagement',
  CONVERSION = 'conversion',
  BRAND_LOVE = 'brand_love',
  SALES = 'sales',
  EDUCATION = 'education'
}

export enum ContentType {
  VIDEO = 'video',
  IMAGE = 'image',
  TEXT = 'text',
  STORY = 'story',
  LIVE = 'live',
  REEL = 'reel'
}

export enum AgeRange {
  TEENS = '13-17',
  YOUNG_ADULTS = '18-24',
  ADULTS = '25-34',
  MIDDLE_ADULTS = '35-44',
  OLDER_ADULTS = '45-54',
  SENIORS = '55+'
}

export enum GenderDistribution {
  MALE_DOMINANT = 'male_dominant',
  FEMALE_DOMINANT = 'female_dominant',
  BALANCED = 'balanced',
  OTHER = 'other'
}

export enum IncomeLevel {
  LOW = 'low',
  MIDDLE = 'middle',
  HIGH = 'high',
  LUXURY = 'luxury'
}

export enum BudgetRange {
  MICRO = 'micro', // $100-$500
  SMALL = 'small', // $500-$2000
  MEDIUM = 'medium', // $2000-$10000
  LARGE = 'large', // $10000-$50000
  PREMIUM = 'premium' // $50000+
}

export enum ProductComplexity {
  SIMPLE = 'simple',
  MODERATE = 'moderate',
  COMPLEX = 'complex',
  TECHNICAL = 'technical'
}

// KOL 基本資訊維護
export interface InfluencerProfile {
  id: string;
  name: string;
  platform: string;
  categories: string[];
  collaborationFees: CollaborationFees;
  contactInfo: ContactInfo;
  availability: Availability;
  pastCollaborations: PastCollaboration[];
  preferences: CollaborationPreferences;
}

export interface CollaborationFees {
  baseRate: number;
  currency: string;
  rateType: 'per_post' | 'per_campaign' | 'monthly' | 'negotiable';
  additionalServices: {
    service: string;
    price: number;
  }[];
  minimumBudget: number;
  paymentTerms: string;
}

export interface ContactInfo {
  email: string;
  phone?: string;
  manager?: string;
  preferredContact: 'email' | 'phone' | 'manager';
  responseTime: string;
}

export interface Availability {
  currentStatus: 'available' | 'busy' | 'unavailable';
  nextAvailableDate?: Date;
  preferredTimeline: string;
  flexibility: 'high' | 'medium' | 'low';
}

export interface PastCollaboration {
  brandName: string;
  campaignType: string;
  performance: string;
  feedback: string;
  date: Date;
}

export interface CollaborationPreferences {
  preferredBrands: string[];
  avoidCategories: string[];
  contentGuidelines: string[];
  creativeFreedom: 'high' | 'medium' | 'low';
  exclusivity: boolean;
} 
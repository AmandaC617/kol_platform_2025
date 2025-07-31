import { Timestamp } from "firebase/firestore";
import { BrandProfile } from "./brand-matching";

// ============================================================================
// 統一 ID 類型系統
// ============================================================================

/**
 * 統一的 ID 類型 - 所有 ID 都使用 string 類型
 */
export type EntityId = string;

/**
 * 類型守衛：檢查是否為有效的 EntityId
 */
export const isValidEntityId = (id: unknown): id is EntityId => {
  return typeof id === 'string' && id.length > 0;
};

/**
 * 安全的 ID 轉換函數
 */
export const toEntityId = (id: unknown): EntityId => {
  if (typeof id === 'number') {
    return id.toString();
  }
  if (typeof id === 'string' && id.length > 0) {
    return id;
  }
  throw new Error(`無效的 ID 格式: ${id}`);
};

/**
 * 類型守衛：檢查是否為 DemoInfluencer
 */
export const isDemoInfluencer = (entity: unknown): entity is DemoInfluencer => {
  return (
    typeof entity === 'object' &&
    entity !== null &&
    'id' in entity &&
    typeof (entity as any).id === 'number' &&
    'name' in entity &&
    typeof (entity as any).name === 'string'
  );
};

/**
 * 類型守衛：檢查是否為 Influencer
 */
export const isInfluencer = (entity: unknown): entity is Influencer => {
  return (
    typeof entity === 'object' &&
    entity !== null &&
    'id' in entity &&
    typeof (entity as any).id === 'string' &&
    'profile' in entity
  );
};

/**
 * 獲取實體的統一 ID
 */
export const getEntityId = (entity: Influencer | DemoInfluencer): EntityId => {
  if (isDemoInfluencer(entity)) {
    return entity.id.toString();
  }
  if (isInfluencer(entity)) {
    return entity.id;
  }
  throw new Error('未知的實體類型');
};

// ============================================================================
// 錯誤處理類型
// ============================================================================

/**
 * 應用程式錯誤類型
 */
export interface AppError {
  code: string;
  message: string;
  details?: string;
  timestamp: Date;
  context?: Record<string, unknown>;
}

/**
 * 錯誤代碼枚舉
 */
export enum ErrorCode {
  // 認證相關
  AUTH_FAILED = 'AUTH_FAILED',
  AUTH_EXPIRED = 'AUTH_EXPIRED',
  AUTH_INSUFFICIENT_PERMISSIONS = 'AUTH_INSUFFICIENT_PERMISSIONS',
  
  // 數據相關
  DATA_NOT_FOUND = 'DATA_NOT_FOUND',
  DATA_INVALID = 'DATA_INVALID',
  DATA_CONFLICT = 'DATA_CONFLICT',
  
  // 網路相關
  NETWORK_ERROR = 'NETWORK_ERROR',
  API_ERROR = 'API_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  
  // 業務邏輯相關
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION',
  
  // 系統相關
  SYSTEM_ERROR = 'SYSTEM_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * 創建應用程式錯誤
 */
export const createAppError = (
  code: ErrorCode,
  message: string,
  details?: string,
  context?: Record<string, unknown>
): AppError => ({
  code,
  message,
  details,
  timestamp: new Date(),
  context
});

// ============================================================================
// 日誌系統類型
// ============================================================================

/**
 * 日誌級別
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

/**
 * 日誌條目
 */
export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: Record<string, unknown>;
  error?: Error;
}

/**
 * 日誌記錄器接口
 */
export interface Logger {
  debug(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, error?: Error, context?: Record<string, unknown>): void;
}

// Legacy Types for Backward Compatibility
export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Timestamp | Date;
  lastLoginAt: Timestamp | Date;
  teams: string[];
}

export interface Team {
  id: string;
  name: string;
  description: string;
  createdAt: Timestamp | Date;
  createdBy: string;
  members: TeamMember[];
  settings: TeamSettings;
}

export interface TeamMember {
  userId: string;
  email: string;
  displayName: string;
  role: UserRole;
  joinedAt: Timestamp | Date;
  invitedBy: string;
  status: 'active' | 'invited' | 'suspended';
}

export interface TeamSettings {
  allowGuestEvaluations: boolean;
  requireEvaluationApproval: boolean;
  allowExternalSharing: boolean;
  defaultProjectPermissions: UserRole;
}

export type UserRole = 'owner' | 'admin' | 'evaluator' | 'viewer';

export interface Permission {
  canView: boolean;
  canEdit: boolean;
  canEvaluate: boolean;
  canManageMembers: boolean;
  canManageProjects: boolean;
  canExport: boolean;
  canDelete: boolean;
}

export interface TeamInvitation {
  id: string;
  teamId: string;
  teamName: string;
  invitedEmail: string;
  invitedBy: string;
  inviterName: string;
  role: UserRole;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  createdAt: Timestamp | Date;
  expiresAt: Timestamp | Date;
  message?: string;
}

// Activity Log Types
export interface ActivityLog {
  id: string;
  teamId?: string;
  projectId?: string;
  influencerId?: string;
  userId: string;
  userName: string;
  action: ActivityAction;
  details: string;
  metadata?: Record<string, string | number | boolean | null>;
  createdAt: Timestamp | Date;
}

export type ActivityAction =
  | 'project_created'
  | 'project_updated'
  | 'project_deleted'
  | 'project_shared'
  | 'influencer_added'
  | 'influencer_updated'
  | 'influencer_deleted'
  | 'evaluation_created'
  | 'evaluation_updated'
  | 'evaluation_deleted'
  | 'member_invited'
  | 'member_joined'
  | 'member_removed'
  | 'role_changed'
  | 'team_created'
  | 'team_updated'
  | 'export_generated';

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, string | number | boolean | null>;
  read: boolean;
  createdAt: Timestamp | Date;
  expiresAt?: Timestamp | Date;
}

export type NotificationType =
  | 'team_invitation'
  | 'evaluation_request'
  | 'evaluation_approved'
  | 'evaluation_rejected'
  | 'project_shared'
  | 'member_joined'
  | 'role_changed'
  | 'system_update';

// Influencer and Evaluation Legacy Types
export interface Influencer {
  id: string;
  url: string;
  platform: string;
  profile: InfluencerProfile;
  createdAt: Timestamp | Date;
  createdBy: string;
  latestScore: number | null;
  tags: string[];
  notes: string;
}

export interface EvaluationCriterion {
  id: string;
  name: string;
  weight: number;
  description: string;
}

export interface EvaluationScores {
  brandFit: number;
  contentQuality: number;
  engagementRate: number;
  audienceProfile: number;
  professionalism: number;
  businessAbility: number;
  brandSafety: number;
  stability: number;
}

export interface Evaluation {
  id: string;
  scores: EvaluationScores;
  totalScore: number;
  notes: string;
  evaluatedBy: string;
  evaluatorName: string;
  createdAt: Timestamp | Date;
}

export interface InfluencerFilters {
  searchQuery: string;
  platforms: string[];
  followerRange: {
    min: number;
    max: number;
  };
  scoreRange: {
    min: number;
    max: number;
  };
  tags: string[];
  hasEvaluation?: boolean;
  createdBy?: string[];
  evaluatedBy?: string[];
}

// Enhanced Analytics Types
export interface AudienceDemographics {
  ageGroups: {
    "13-17": number;
    "18-24": number;
    "25-34": number;
    "35-44": number;
    "45-54": number;
    "55-64": number;
    "65+": number;
  };
  gender: {
    male: number;
    female: number;
    other: number;
  };
  topCountries: Array<{
    country: string;
    percentage: number;
  }>;
  topCities: Array<{
    city: string;
    percentage: number;
  }>;
}

export interface ContentAnalysis {
  contentTypes: Array<{
    type: string; // video, image, text, story
    percentage: number;
  }>;
  topics: Array<{
    topic: string;
    confidence: number;
    frequency: number;
  }>;
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
    overall: 'positive' | 'neutral' | 'negative';
  };
  brandSafety: {
    score: number; // 0-100
    flags: string[];
    riskLevel: 'low' | 'medium' | 'high';
  };
  postFrequency: {
    daily: number;
    weekly: number;
    monthly: number;
    avgPostsPerWeek: number;
  };
}

export interface EngagementMetrics {
  avgLikes: number;
  avgComments: number;
  avgShares: number;
  avgViews: number;
  engagementRate: number;
  engagementQuality: {
    genuineComments: number;
    spamComments: number;
    qualityScore: number;
  };
  peakEngagementTimes: Array<{
    hour: number;
    day: string;
    engagementRate: number;
  }>;
}

export interface TrendAnalysis {
  trendingTopics: Array<{
    topic: string;
    growth: number; // percentage
    peakDate: string;
  }>;
  hashtags: Array<{
    tag: string;
    frequency: number;
    reach: number;
  }>;
  competitorComparison: Array<{
    competitor: string;
    similarity: number;
    strengths: string[];
    weaknesses: string[];
  }>;
}

export interface EnhancedInfluencerProfile {
  basic: InfluencerProfile;
  demographics: AudienceDemographics;
  content: ContentAnalysis;
  engagement: EngagementMetrics;
  trends: TrendAnalysis;
  lastUpdated: Date;
  dataQuality: {
    completeness: number; // 0-100
    freshness: number; // days since last update
    accuracy: number; // 0-100
  };
}

export const EVALUATION_CRITERIA: EvaluationCriterion[] = [
  {
    id: 'brandFit',
    name: '品牌契合度',
    weight: 0.15,
    description: '網紅與品牌形象的匹配程度'
  },
  {
    id: 'contentQuality',
    name: '內容品質',
    weight: 0.2,
    description: '內容的創意性、專業度和吸引力'
  },
  {
    id: 'engagementRate',
    name: '互動率',
    weight: 0.15,
    description: '粉絲的參與度和互動質量'
  },
  {
    id: 'audienceProfile',
    name: '受眾輪廓',
    weight: 0.1,
    description: '目標受眾與品牌受眾的重疊度'
  },
  {
    id: 'professionalism',
    name: '專業度',
    weight: 0.15,
    description: '合作態度和專業表現'
  },
  {
    id: 'businessAbility',
    name: '商業能力',
    weight: 0.1,
    description: '商業轉化和銷售能力'
  },
  {
    id: 'brandSafety',
    name: '品牌安全',
    weight: 0.1,
    description: '品牌風險和聲譽安全'
  },
  {
    id: 'stability',
    name: '穩定性',
    weight: 0.05,
    description: '長期合作的可靠性'
  }
];

// Permission Helper Functions
export const ROLE_PERMISSIONS: Record<UserRole, Permission> = {
  owner: {
    canView: true,
    canEdit: true,
    canEvaluate: true,
    canManageMembers: true,
    canManageProjects: true,
    canExport: true,
    canDelete: true
  },
  admin: {
    canView: true,
    canEdit: true,
    canEvaluate: true,
    canManageMembers: true,
    canManageProjects: true,
    canExport: true,
    canDelete: false
  },
  evaluator: {
    canView: true,
    canEdit: true,
    canEvaluate: true,
    canManageMembers: false,
    canManageProjects: false,
    canExport: true,
    canDelete: false
  },
  viewer: {
    canView: true,
    canEdit: false,
    canEvaluate: false,
    canManageMembers: false,
    canManageProjects: false,
    canExport: true,
    canDelete: false
  }
};

export const getUserPermissions = (role: UserRole): Permission => {
  return ROLE_PERMISSIONS[role];
};

export const canUserPerformAction = (userRole: UserRole, action: keyof Permission): boolean => {
  return getUserPermissions(userRole)[action];
};

// Project Management Types
export interface ProjectEditData {
  name: string;
  description: string;
  budget: string;
  startDate: string;
  endDate: string;
}

export interface ProjectInfo {
  id: string;
  name: string;
  description: string;
  status: '籌備中' | '進行中' | '已完成' | '暫停';
  budget: string;
  startDate: string;
  endDate: string;
  influencers?: number[]; // Array of influencer IDs
  createdAt?: Date;
  createdBy?: string;
}

// Demo Influencer Types
export interface FollowerUpdateHistory {
  followers: number;
  updatedAt: Date;
  updatedBy: string;
  updateReason?: string;
  dataSource: 'ai_estimated' | 'manual_verified' | 'api_fetched';
  previousFollowers?: number;
}

export interface AIAnalysisData {
  targetAudience?: string;
  audienceInterests?: string[];
  audiencePurchasingPower?: string;
  audienceLocation?: string;
  contentCategory?: string;
  contentStyle?: string[];
  contentQuality?: number;
  postFrequency?: string;
  recommendedBrands?: string[];
  brandAlignment?: number;
  riskAssessment?: string;
  brandSafety?: number;
  potentialConcerns?: string[];
  riskMitigation?: string;
  overallAnalysis?: string;
  collaborationRecommendation?: string;
}

export interface DemoInfluencer {
  id: number;
  name: string;
  platform: string;
  followers: string;
  url: string;
  avatar: string;
  score: number;
  tags: string[];
  lastUpdated: string;
  category: string;
  engagementRate: string;
  dataSource: "simulated" | "real_api" | "unknown" | "google_ai";
  isVerified?: boolean;
  contentCategory?: string;
  marketValue?: number;
  brandSafety?: string;
  overallAnalysis?: string;
  collaborationRecommendation?: string;
  followersHistory?: FollowerUpdateHistory[];
  lastManualUpdate?: Date;
  profile?: Record<string, unknown>;
  aiAnalysis?: AIAnalysisData;
  latestScore?: number | null; // Add for compatibility

  // Enhanced Asian Market Analysis Fields
  audienceLocation?: string;
  contentTopics?: string[];
  contentStyle?: string[];
  recentContentAnalysis?: RecentContentAnalysis;
  recentPosts?: EnhancedPostData[];
}

// Social Media Profile Types for Analysis
export interface SocialMediaProfile {
  followers: number;
  bio?: string;
  platform: string;
  recentPosts?: PostData[];
  isVerified?: boolean;
}

// Enhanced Post Data for Recent Content Analysis
export interface EnhancedPostData extends PostData {
  topic: string;
  publishDate: string;
}

// Recent Content Analysis Structure
export interface RecentContentAnalysis {
  mainTopics: string;
  engagementTrend: string;
  contentFrequency: string;
  popularContentType: string;
}

// Enhanced Influencer Profile for Gemini AI Analysis
export interface InfluencerProfile {
  name: string;
  platform: 'Instagram' | 'YouTube' | 'TikTok' | 'Facebook' | 'Twitter' | string;
  followers: number;
  bio: string;
  avatar: string;
  recentPosts: EnhancedPostData[];

  // Asian Market Focus
  audienceLocation: string; // Focus on Asian regions
  contentTopics: string[];
  contentStyle: string[];
  recentContentAnalysis: RecentContentAnalysis;

  // Additional properties for compatibility
  isVerified?: boolean;
  [key: string]: unknown;
}

// Enhanced Analytics Types for Asian Market
export interface AsianMarketAnalytics {
  primaryMarkets: string[]; // Taiwan, Hong Kong, Singapore, etc.
  languagePreference: string[]; // Traditional Chinese, Simplified Chinese, etc.
  culturalRelevance: number; // 0-100 score
  localTrends: string[];
  crossBorderAppeal: boolean;
}

export interface PostData {
  engagement: string;
  title?: string;
  content?: string;
  date?: string;
}

export interface InfluencerAnalysisProfile extends SocialMediaProfile {
  name: string;
  username?: string;
  avatar?: string;
  url: string;
  [key: string]: unknown; // For additional platform-specific data
}

// Video and Content Analysis Types
export interface VideoContentData {
  id: string;
  title: string;
  description?: string;
  publishedAt: string;
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
  duration?: string;
}

export interface ChannelStatsData {
  subscriberCount: number;
  viewCount: number;
  videoCount: number;
  customUrl?: string;
  country?: string;
  publishedAt: string;
}

// Content Analysis API Response Types
export interface SentimentAnalysisData {
  sentiment: 'positive' | 'neutral' | 'negative';
  score: number;
  magnitude: number;
}

export interface EntityAnalysisData {
  entities: Array<{
    name: string;
    type: string;
    salience: number;
    mentions: Array<{
      text: {
        content: string;
        beginOffset: number;
      };
    }>;
  }>;
}

export interface EngagementQualityMetrics {
  viewCount: number;
  likeCount: number;
  commentCount: number;
  shareCount?: number;
  timestamp: string;
}

export interface RecommendationInputData {
  demographics: Partial<AudienceDemographics>;
  engagement: Partial<EngagementMetrics>;
  content: Partial<ContentAnalysis>;
  trends: Partial<TrendAnalysis>;
}

// YouTube API Response Types
export interface YouTubePlaylistItem {
  snippet: {
    resourceId: {
      videoId: string;
    };
    title: string;
    description?: string;
    publishedAt: string;
  };
}

export interface YouTubePlaylistResponse {
  items?: YouTubePlaylistItem[];
  nextPageToken?: string;
  pageInfo?: {
    totalResults: number;
    resultsPerPage: number;
  };
}

export interface YouTubeVideoStatistics {
  viewCount?: string;
  likeCount?: string;
  commentCount?: string;
  favoriteCount?: string;
  dislikeCount?: string;
}

export interface YouTubeVideoItem {
  id: string;
  snippet: {
    title: string;
    description?: string;
    publishedAt: string;
    channelId: string;
    categoryId?: string;
  };
  statistics?: YouTubeVideoStatistics;
  contentDetails?: {
    duration: string;
  };
}

export interface YouTubeVideoResponse {
  items?: YouTubeVideoItem[];
  nextPageToken?: string;
}

// Batch Upload Types
export interface BatchUploadResult {
  url: string;
  status: 'success' | 'error' | 'pending';
  influencer?: DemoInfluencer;
  error?: string;
}

export interface BatchProcessingResult {
  status: 'success' | 'error' | 'pending';
  displayName: string;
  platform: string;
  followers: string;
  url: string;
  score: number;
  tags: string[];
  category: string;
  engagementRate: string;
  dataSource: "simulated" | "real_api" | "unknown" | "google_ai";
  isVerified?: boolean;
  avatar?: string;
  lastUpdated?: string;
  error?: string;
}

export interface AnalysisModalData {
  show: boolean;
  influencer?: DemoInfluencer;
  isLoading: boolean;
}

// Filter and Search Types
export interface FilterState {
  searchTerm: string;
  selectedPlatform: string;
  selectedCategory: string;
  minScore: number;
  maxScore: number;
}

// Comparison Types
export interface ComparisonState {
  selectedInfluencers: DemoInfluencer[];
  showComparison: boolean;
}

// UI State Types
export interface EditingState {
  editingFollowers: boolean;
  editFollowersValue: string;
  editReason: string;
  editingProject: boolean;
}

export interface ModalState {
  showCreateProject: boolean;
  showBatchUpload: boolean;
  selectedProject: ProjectInfo | null;
  selectedInfluencer: DemoInfluencer | null;
}

// API Response Types
export interface GeminiAnalysisResponse {
  analysis?: AIAnalysisData;
  profile?: {
    name: string;
    platform: string;
    followerCount: number;
    isVerified: boolean;
    bio?: string;
  };
  error?: string;
}

export interface BatchAnalysisResult {
  successful: number;
  failed: number;
  results: BatchUploadResult[];
  summary: {
    realData: number;
    simulatedData: number;
    totalProcessed: number;
  };
}

// Form Event Types
export type InputChangeEvent = React.ChangeEvent<HTMLInputElement>;
export type TextAreaChangeEvent = React.ChangeEvent<HTMLTextAreaElement>;
export type SelectChangeEvent = React.ChangeEvent<HTMLSelectElement>;
export type FormSubmitEvent = React.FormEvent<HTMLFormElement>;

// Export existing types...
export interface Project {
  id: string;
  name: string;
  description: string;
  brandProfile?: BrandProfile; // 專案專屬的品牌資訊
  budget: string;
  startDate: string;
  endDate: string;
  status: 'planning' | 'active' | 'completed' | 'cancelled';
  createdAt: Timestamp | Date;
  createdBy: string;
  teamId?: string;
  permissions: {
    [userId: string]: UserRole;
  };
  isPublic: boolean;
  targetAudience?: {
    ageRanges: string[];
    gender: string;
    interests: string[];
    locations: string[];
  };
  campaignGoals?: string[];
  preferredContentTypes?: string[];
}

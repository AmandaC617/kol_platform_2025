import { NextRequest, NextResponse } from 'next/server';
import { GeminiService } from '@/lib/gemini-service';
import { SocialBladeService } from '@/lib/social-blade-service';
import { FirebaseService } from '@/lib/firebase-service';
import { DemoService } from '@/lib/demo-service';
import EnhancedAnalyticsService from '@/lib/enhanced-analytics-service';
import { InfluencerProfile, DemoInfluencer } from '@/types';

interface PlatformData {
  displayName: string;
  platform: string;
  followers: string;
  engagement?: string;
  category?: string;
  verified?: boolean;
  description?: string;
  avatar?: string;
  metrics?: {
    views?: string;
    posts?: string;
    avgEngagement?: string;
    growth?: string;
  };
}

interface AnalysisInfluencerData {
  name: string;
  platform: string;
  url: string;
  followers: string;
  engagement: string;
  category: string;
  verified: boolean;
  description: string;
  avatar: string;
  location: string;
  tags: string[];
  metrics: {
    views: string;
    posts: string;
    avgEngagement: string;
    growth: string;
  };
  analysis: {
    score: number;
    summary: string;
    strengths: string[];
    weaknesses: string[];
    recommendation: string;
  };
  lastUpdated: string;
}

interface AnalysisResult {
  success: boolean;
  data?: AnalysisInfluencerData;
  error?: string;
  source: 'social-blade' | 'youtube-api' | 'gemini' | 'enhanced' | 'demo';
  debug?: any;
}

// 偵測社交媒體平台
function detectPlatform(url: string): { platform: string; username: string } | null {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    const pathname = urlObj.pathname;

    console.log('🔍 檢測平台:', url);

    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
      console.log('✅ 檢測到 YouTube:', url);
      return { platform: 'YouTube', username: extractUsernameFromPath(pathname, 'youtube') };
    } else if (hostname.includes('instagram.com')) {
      console.log('✅ 檢測到 Instagram:', url);
      return { platform: 'Instagram', username: extractUsernameFromPath(pathname, 'instagram') };
    } else if (hostname.includes('facebook.com')) {
      console.log('✅ 檢測到 Facebook:', url);
      return { platform: 'Facebook', username: extractUsernameFromPath(pathname, 'facebook') };
    } else if (hostname.includes('tiktok.com')) {
      console.log('✅ 檢測到 TikTok:', url);
      return { platform: 'TikTok', username: extractUsernameFromPath(pathname, 'tiktok') };
    } else if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
      console.log('✅ 檢測到 Twitter/X:', url);
      return { platform: 'Twitter', username: extractUsernameFromPath(pathname, 'twitter') };
    }

    console.log('❌ 未識別的平台:', hostname);
    return null;
  } catch (error) {
    console.error('平台檢測錯誤:', error);
    return null;
  }
}

function extractUsernameFromPath(pathname: string, platform: string): string {
  // 移除開頭和結尾的斜線
  const cleanPath = pathname.replace(/^\/+|\/+$/g, '');
  
  if (platform === 'youtube') {
    // YouTube 特殊處理
    if (cleanPath.startsWith('channel/')) {
      return cleanPath.replace('channel/', '');
    } else if (cleanPath.startsWith('user/')) {
      return cleanPath.replace('user/', '');
    } else if (cleanPath.startsWith('c/')) {
      return cleanPath.replace('c/', '');
    } else if (cleanPath.startsWith('@')) {
      return cleanPath.substring(1);
    }
  }
  
  // 其他平台，取第一個路徑段作為用戶名
  const segments = cleanPath.split('/');
  return segments[0] || cleanPath;
}

// Social Blade API 數據獲取
async function getSocialBladeRealData(url: string): Promise<AnalysisResult> {
  try {
    console.log('🔍 嘗試使用 Social Blade API 獲取真實數據:', url);
    
    const socialBladeData = await SocialBladeService.analyzeInfluencer(url);
    
    if (!socialBladeData) {
      console.log('⚠️ Social Blade API 返回 null');
      return {
        success: false,
        error: 'Social Blade API returned null',
        source: 'social-blade'
      };
    }

    console.log('📊 Social Blade API 響應成功:', socialBladeData.displayName);
    console.log('✅ Social Blade API 獲取真實數據:', socialBladeData.displayName);

    // 轉換為標準格式
    const influencerData: AnalysisInfluencerData = {
      name: socialBladeData.displayName || socialBladeData.name || 'Unknown',
      platform: socialBladeData.platform,
      url: url,
      followers: socialBladeData.followers,
      engagement: socialBladeData.engagement || 'N/A',
      category: socialBladeData.category || '未分類',
      verified: socialBladeData.verified || false,
      description: socialBladeData.description || '',
      avatar: socialBladeData.avatar || '',
      location: socialBladeData.location || '',
      tags: socialBladeData.tags || [],
      metrics: {
        views: socialBladeData.metrics?.views || 'N/A',
        posts: socialBladeData.metrics?.posts || 'N/A',
        avgEngagement: socialBladeData.metrics?.avgEngagement || 'N/A',
        growth: socialBladeData.metrics?.growth || 'N/A'
      },
      analysis: {
        score: calculateInfluencerScore(socialBladeData),
        summary: generateAnalysisSummary(socialBladeData),
        strengths: [
          socialBladeData.verified ? '已驗證帳號' : '真實數據來源',
          '詳細統計資料',
          '即時更新數據'
        ],
        weaknesses: [],
        recommendation: generateRecommendation(socialBladeData)
      },
      lastUpdated: new Date().toISOString()
    };

    return {
      success: true,
      data: influencerData,
      source: 'social-blade'
    };

  } catch (error) {
    console.error('Social Blade API 錯誤:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown Social Blade error',
      source: 'social-blade'
    };
  }
}

// YouTube API 直接數據獲取
async function getYouTubeRealData(url: string): Promise<AnalysisResult> {
  try {
    const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || '';
    
    if (!YOUTUBE_API_KEY) {
      console.log('⚠️ YouTube API Key 未配置');
      return {
        success: false,
        error: 'YouTube API Key not configured',
        source: 'youtube-api'
      };
    }

    console.log('🔍 嘗試使用 YouTube API 獲取真實數據:', url);
    
    // 提取頻道 ID 或用戶名
    const platformInfo = detectPlatform(url);
    if (!platformInfo || platformInfo.platform !== 'YouTube') {
      return {
        success: false,
        error: 'Not a valid YouTube URL',
        source: 'youtube-api'
      };
    }

    // 使用增強分析服務
    const enhancedService = EnhancedAnalyticsService.getInstance();
    const youtubeData = await enhancedService.getYouTubeChannelData(url);
    
    if (!youtubeData) {
      console.log('⚠️ YouTube API 無法獲取數據');
      return {
        success: false,
        error: 'YouTube API returned no data',
        source: 'youtube-api'
      };
    }

    console.log('✅ YouTube API 獲取成功:', youtubeData.title);

    // 轉換為標準格式
    const influencerData: InfluencerData = {
      name: youtubeData.title,
      platform: 'YouTube',
      url: url,
      followers: parseInt(youtubeData.subscriberCount).toLocaleString(),
      engagement: 'N/A',
      category: '未分類',
      verified: false,
      description: youtubeData.description.substring(0, 200) + '...',
      avatar: youtubeData.thumbnails.high?.url || youtubeData.thumbnails.medium?.url || '',
      location: '',
      tags: [],
      metrics: {
        views: parseInt(youtubeData.viewCount).toLocaleString(),
        posts: youtubeData.videoCount,
        avgEngagement: 'N/A',
        growth: 'N/A'
      },
      analysis: {
        score: Math.min(95, Math.floor(parseInt(youtubeData.subscriberCount) / 10000)),
        summary: `${youtubeData.title} 是一個擁有 ${parseInt(youtubeData.subscriberCount).toLocaleString()} 訂閱者的 YouTube 頻道，共發布了 ${youtubeData.videoCount} 個影片，累計觀看次數達 ${parseInt(youtubeData.viewCount).toLocaleString()} 次。`,
        strengths: ['真實 YouTube 數據', '詳細統計資料'],
        weaknesses: ['需要更多分析'],
        recommendation: '建議進一步分析內容品質和觀眾互動率。'
      },
      lastUpdated: new Date().toISOString()
    };

    return {
      success: true,
      data: influencerData,
      source: 'youtube-api'
    };

  } catch (error) {
    console.error('YouTube API 錯誤:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown YouTube API error',
      source: 'youtube-api'
    };
  }
}

// Gemini AI 分析
async function getGeminiAnalysis(url: string, platformInfo: { platform: string; username: string }): Promise<AnalysisResult> {
  try {
    console.log('🔍 搜索網紅信息:', `"${platformInfo.username}" ${platformInfo.platform} 網紅 粉絲 followers subscribers`);
    
    const analysisResult = await GeminiService.getEnhancedAnalysis(
      url,
      `${platformInfo.username} ${platformInfo.platform} 網紅分析`
    );

    if (!analysisResult) {
      return {
        success: false,
        error: 'Gemini analysis failed',
        source: 'gemini'
      };
    }

    console.log('✅ Gemini 分析成功:', analysisResult.name);

    return {
      success: true,
      data: analysisResult,
      source: 'gemini'
    };

  } catch (error) {
    console.error('Gemini 分析錯誤:', error);
  return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown Gemini error',
      source: 'gemini'
    };
  }
}

// 計算網紅評分
function calculateInfluencerScore(data: any): number {
  let score = 50; // 基礎分數

  // 根據粉絲數量調整分數
  const followersStr = data.followers?.toString() || '0';
  const followersNum = parseFloat(followersStr.replace(/[^0-9.]/g, ''));
  const followersUnit = followersStr.toLowerCase();

  if (followersUnit.includes('m') || followersNum > 1000000) {
    score += 40; // 百萬級別
  } else if (followersUnit.includes('k') || followersNum > 100000) {
    score += 30; // 十萬級別
  } else if (followersNum > 10000) {
    score += 20; // 萬級別
  }

  // 驗證帳號加分
  if (data.verified) {
    score += 10;
  }

  // 確保分數在合理範圍內
  return Math.min(100, Math.max(10, score));
}

// 生成分析摘要
function generateAnalysisSummary(data: any): string {
  const name = data.displayName || data.name || '此網紅';
  const platform = data.platform || '社交媒體';
  const followers = data.followers || '未知數量';
  
  return `${name} 是 ${platform} 平台上的網紅，擁有 ${followers} 粉絲。${data.verified ? '已通過平台驗證，' : ''}具有一定的影響力和傳播能力。`;
}

// 生成建議
function generateRecommendation(data: any): string {
  const followersStr = data.followers?.toString() || '0';
  const followersNum = parseFloat(followersStr.replace(/[^0-9.]/g, ''));
  
  if (followersNum > 1000000) {
    return '這是一位頂級網紅，具有極高的商業價值和廣泛的影響力，適合大型品牌合作。';
  } else if (followersNum > 100000) {
    return '這是一位知名網紅，具有良好的影響力，適合中等規模的品牌合作和產品推廣。';
  } else if (followersNum > 10000) {
    return '這是一位新興網紅，具有發展潛力，適合小型品牌合作和細分市場推廣。';
  } else {
    return '這是一位微型網紅，適合小眾產品推廣和社群互動。';
  }
}

// 主要分析函數
async function analyzeInfluencerData(url: string): Promise<AnalysisResult> {
  // 1. 偵測平台
  const platformInfo = detectPlatform(url);
  if (!platformInfo) {
      return {
      success: false,
      error: '無法識別社交媒體平台',
      source: 'demo'
    };
  }

  console.log('🤖 開始分析', platformInfo.platform, '網紅:', platformInfo.username, `(${url})`);

  // 2. 優先嘗試 Social Blade API
  const socialBladeResult = await getSocialBladeRealData(url);
  if (socialBladeResult.success) {
    return socialBladeResult;
  }
  console.log('⚠️ Social Blade API 獲取數據失敗，使用備用分析');

  // 3. 如果是 YouTube，嘗試 YouTube API
  if (platformInfo.platform === 'YouTube') {
    const youtubeResult = await getYouTubeRealData(url);
    if (youtubeResult.success) {
      return youtubeResult;
    }
    console.log('⚠️ YouTube API 獲取數據失敗，使用備用分析');
  }

  // 4. 使用 Gemini AI 分析
  const geminiResult = await getGeminiAnalysis(url, platformInfo);
  if (geminiResult.success) {
    console.log('✅ AI 分析完成:', geminiResult.data?.name);
    return geminiResult;
  }

  // 5. 最後的備用方案
  console.log('⚠️ 所有分析方法都失敗，使用基礎分析');
  const basicData: InfluencerData = {
    name: platformInfo.username,
    platform: platformInfo.platform,
    url: url,
    followers: '數據獲取失敗',
    engagement: 'N/A',
    category: '未分類',
    verified: false,
    description: '由於 API 限制，無法獲取詳細資訊',
    avatar: '',
    location: '',
    tags: [],
    metrics: {
      views: 'N/A',
      posts: 'N/A',
      avgEngagement: 'N/A',
      growth: 'N/A'
    },
    analysis: {
      score: 50,
      summary: `${platformInfo.username} 是 ${platformInfo.platform} 平台上的用戶。由於 API 限制，無法獲取詳細統計資料。`,
      strengths: ['平台存在性確認'],
      weaknesses: ['缺乏詳細數據'],
      recommendation: '建議手動查看該帳號以獲取更多資訊。'
    },
    lastUpdated: new Date().toISOString()
  };

  return {
    success: true,
    data: basicData,
    source: 'demo'
  };
}

// API 路由處理函數
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { urls, projectId } = body;

    console.log('📊 收到分析請求:', { urls: urls?.length || 0, projectId });

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: '請提供有效的網紅 URL 列表' },
        { status: 400 }
      );
    }

    if (!projectId) {
      return NextResponse.json(
        { error: '請提供專案 ID' },
        { status: 400 }
      );
    }

    // 批量處理 URLs
    const results: any[] = [];
    const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || !FirebaseService.isAvailable();

    if (urls.length > 1) {
      console.log('🔄 開始批次分析', urls.length, '個 URL');
    }

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i].trim();
      
      if (urls.length > 1) {
        console.log(`📊 處理 URL [${i + 1}/${urls.length}]:`, url);
      }

      try {
        // 分析網紅數據
    const analysisResult = await analyzeInfluencerData(url);

        if (!analysisResult.success || !analysisResult.data) {
          console.error(`❌ 分析失敗 [${i + 1}/${urls.length}]:`, analysisResult.error);
          results.push({
            url,
            success: false,
            error: analysisResult.error || '分析失敗'
          });
          continue;
        }

        const influencerData = analysisResult.data;

        console.log('🔍 準備保存分析結果:', {
          displayName: influencerData.name,
          platform: influencerData.platform,
          followers: influencerData.followers,
          score: influencerData.analysis.score
        });

        // 準備儲存的數據
        const influencerToSave = {
          name: influencerData.name,
          platform: influencerData.platform.toLowerCase(),
          followers: parseFollowersCount(influencerData.followers),
          score: influencerData.analysis.score,
          url: url,
          profile: influencerData,
          analysis: influencerData.analysis
        };

        console.log('🔍 準備保存的網紅資料:', influencerToSave);

        // 儲存到資料庫
        let savedInfluencer;
        if (isDemo) {
          console.log('🔧 DemoService: 服務器端初始化');
          savedInfluencer = await DemoService.createInfluencer(projectId, influencerToSave);
        } else {
          // TODO: 在非 demo 模式下需要用戶 ID，目前暫時回退到 demo 模式
          console.warn('⚠️ Firebase 模式需要用戶 ID，回退到 demo 模式');
          savedInfluencer = await DemoService.createInfluencer(projectId, influencerToSave);
        }

        console.log('[INFO] 創建網紅成功', {
          projectId,
          influencerId: savedInfluencer.id,
          influencerName: influencerData.name
        });

        console.log('[INFO] AI 分析結果已保存到資料庫', {
          influencerName: influencerData.name,
          platform: influencerData.platform,
          projectId
        });

        results.push({
          url,
          success: true,
          influencer: savedInfluencer,
          data: influencerData
        });

        if (urls.length > 1) {
          console.log(`✅ 成功分析: ${influencerData.name}`);
        }

      } catch (error) {
        console.error(`❌ 處理 URL 時發生錯誤 [${i + 1}/${urls.length}]:`, error);
        results.push({
          url,
          success: false,
          error: error instanceof Error ? error.message : '未知錯誤'
        });
      }
    }

    // 統計結果
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;

    console.log('📊 批量分析完成:', {
      總數: results.length,
      成功: successCount,
      失敗: failureCount
    });

    return NextResponse.json({
      success: true,
      results,
      summary: {
        total: results.length,
        successful: successCount,
        failed: failureCount
      }
    });

  } catch (error) {
    console.error('API 路由錯誤:', error);
    return NextResponse.json(
      { 
        error: '服務器內部錯誤', 
        details: error instanceof Error ? error.message : '未知錯誤' 
      },
      { status: 500 }
    );
  }
}

// 輔助函數：解析粉絲數量
function parseFollowersCount(followersStr: string): number {
  if (!followersStr || typeof followersStr !== 'string') return 0;
  
  const cleaned = followersStr.toLowerCase().replace(/[^0-9.km]/g, '');
  const number = parseFloat(cleaned);
  
  if (isNaN(number)) return 0;
  
  if (cleaned.includes('m')) {
    return Math.floor(number * 1000000);
  } else if (cleaned.includes('k')) {
    return Math.floor(number * 1000);
  } else {
    return Math.floor(number);
  }
} 
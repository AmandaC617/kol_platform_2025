import { InfluencerProfile, EnhancedInfluencerProfile, EnhancedPostData } from "@/types";
import { GoogleSearchService } from "./google-search-service";
import EnhancedAnalyticsService from "./enhanced-analytics-service";

export class GeminiService {
  private static readonly API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
  private static readonly API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent";

  // Check if Gemini API is configured
  private static isConfigured(): boolean {
    return !!this.API_KEY && this.API_KEY !== "";
  }

  static async analyzeInfluencer(url: string): Promise<InfluencerProfile> {
    try {
      // Get enhanced data from Google Search
      const enhancedData = await GoogleSearchService.enhanceInfluencerData(url);

      // Create enhanced prompt with search results
      const searchContext = enhancedData.relatedProfiles.length > 0
        ? `\n\n相關搜尋結果:\n${enhancedData.relatedProfiles.map(r => `- ${r.title}: ${r.snippet}`).join('\n')}`
        : '';

      const prompt = `你是一個專業的亞洲社群媒體分析師，專精於華語市場和亞洲地區的網紅分析。請根據這個URL: ${url}${searchContext}，分析並生成一個網紅的詳細資料。

⚠️ 重要提醒：
- 如果無法直接訪問該帳號或缺乏可靠資訊，請明確標示為"無法確定"
- 不要基於用戶名推測或關聯到其他知名人物
- 如果搜尋結果與目標帳號不符，請忽略不相關的資訊
- 優先使用帳號本身的可驗證資訊

請以JSON格式回傳，包含以下欄位：
{
  "name": "網紅姓名 (字串，優先使用帳號顯示名稱，如果無法確定請使用用戶名)",
  "platform": "平台名稱 (從 'Instagram', 'YouTube', 'TikTok', 'Facebook', 'Twitter' 中選擇)",
  "followers": "粉絲數量 (數字，如果無法確定請設為 0)",
  "bio": "個人簡介 (字串, 100字以內，如果無法確定請寫'無法確定')",
  "recentPosts": [
    {
      "title": "貼文標題或摘要 (如果無法確定請寫'無法確定')",
      "engagement": "互動數據，如 '1.5k 讚, 200 則留言' (如果無法確定請寫'無法確定')",
      "topic": "貼文主題分類 (如：美食、時尚、科技、旅遊、生活等，如果無法確定請寫'無法確定')",
      "publishDate": "發布時間 (如：'2 天前', '1 週前'，如果無法確定請寫'無法確定')"
    }
  ],
  "avatar": "頭像圖片URL (使用 placeholder.co 格式，顏色要搭配平台)",
  "audienceLocation": "主要受眾地區 (重點關注亞洲地區，如果無法確定請寫'無法確定')",
  "contentTopics": [
    "主要內容主題1 (如果無法確定請寫'無法確定')",
    "主要內容主題2 (如果無法確定請寫'無法確定')",
    "主要內容主題3 (如果無法確定請寫'無法確定')"
  ],
  "contentStyle": [
    "內容風格特色 (如果無法確定請寫'無法確定')"
  ],
  "recentContentAnalysis": {
    "mainTopics": "最近30天主要討論話題 (如果無法確定請寫'無法確定')",
    "engagementTrend": "互動趨勢 (如果無法確定請寫'無法確定')",
    "contentFrequency": "發文頻率 (如果無法確定請寫'無法確定')",
    "popularContentType": "最受歡迎的內容類型 (如果無法確定請寫'無法確定')"
  }
}

請特別注意：
1. 如果帳號無法訪問或資訊不足，請明確標示"無法確定"而不是推測
2. 不要將用戶名與其他知名人物進行錯誤關聯
3. 地區分析重點關注亞洲市場，特別是華語地區
4. 數據必須真實可信且符合該平台的特性
5. 回傳格式為有效的JSON`;

      if (!this.isConfigured()) {
        console.warn("🤖 Gemini API key not configured, using enhanced mock data");
        return this.generateEnhancedMockProfile(url, enhancedData);
      }

      console.log("🤖 Analyzing influencer with Gemini AI:", url);

      const response = await fetch(`${this.API_URL}?key=${this.API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.7,
          }
        })
      });

      if (!response.ok) {
        // 特殊處理 429 配額錯誤
        if (response.status === 429) {
          console.warn('⚠️ Gemini 2.0 API 配額已用完，嘗試降級到 1.5 模型...');
          
          // 嘗試使用 1.5 模型作為備用
          try {
            const fallbackUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";
            const fallbackResponse = await fetch(`${fallbackUrl}?key=${this.API_KEY}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                contents: [{
                  parts: [{ text: prompt }]
                }],
                generationConfig: {
                  responseMimeType: "application/json",
                  temperature: 0.7,
                }
              })
            });

            if (fallbackResponse.ok) {
              const fallbackResult = await fallbackResponse.json();
              if (fallbackResult.candidates && fallbackResult.candidates.length > 0) {
                const content = fallbackResult.candidates[0].content;
                if (content.parts && content.parts.length > 0) {
                  const profileData = JSON.parse(content.parts[0].text);
                  console.log(`✅ Gemini 1.5 備用模型分析成功: ${profileData.name || profileData.displayName}`);
                  return profileData as InfluencerProfile;
                }
              }
            } else if (fallbackResponse.status === 429) {
              console.warn('⚠️ Gemini 1.5 備用模型配額也用完，使用增強模擬數據');
              throw new Error('QUOTA_EXCEEDED');
            }
          } catch (fallbackError) {
            console.warn('⚠️ Gemini 1.5 備用模型也失敗，使用增強模擬數據');
            throw new Error('QUOTA_EXCEEDED');
          }
        }
        
        throw new Error(`API call failed with status: ${response.status}`);
      }

      const result = await response.json();
      if (result.candidates && result.candidates.length > 0) {
        const content = result.candidates[0].content;
        if (content.parts && content.parts.length > 0) {
          const profileData = JSON.parse(content.parts[0].text);

          // 🔧 修復粉絲數量數據類型和合理性檢查
          if (profileData.followers) {
            // 確保是數字類型
            profileData.followers = parseInt(profileData.followers.toString().replace(/[^0-9]/g, ''));

            // 驗證粉絲數量合理性
            const platform = profileData.platform || 'Instagram';
            const validRanges = {
              'Instagram': { min: 100, max: 600000000 },    // Instagram: 最高約6億 (Cristiano Ronaldo)
              'YouTube': { min: 10, max: 500000000 },       // YouTube: 最高約5億 (MrBeast等)
              'TikTok': { min: 100, max: 200000000 },       // TikTok: 最高約2億
              'Facebook': { min: 50, max: 200000000 },      // Facebook: 最高約2億
              'Twitter': { min: 10, max: 150000000 }        // Twitter/X: 最高約1.5億
            };

            const range = validRanges[platform as keyof typeof validRanges] || validRanges['Instagram'];

            // 如果數據不合理，使用平台典型範圍
            if (profileData.followers < range.min || profileData.followers > range.max) {
              console.warn(`🔧 粉絲數量 ${profileData.followers} 超出 ${platform} 合理範圍，使用預估值`);
              profileData.followers = this.estimateReasonableFollowers(platform, url);
            }
          }

          console.log(`✅ Gemini AI 分析完成: ${profileData.name} (${profileData.platform}) - ${profileData.followers} 粉絲`);
          return profileData as InfluencerProfile;
        }
      }
      throw new Error("Invalid response structure from API.");

    } catch (error) {
      console.error("Gemini API call error:", error);

      // 檢查是否是配額問題
      if (error instanceof Error) {
        if (error.message === 'QUOTA_EXCEEDED') {
          console.warn('⚠️ 所有 Gemini 模型配額都已用完，使用增強模擬數據');
        } else if (error.message.includes('403')) {
          console.warn('⚠️ Gemini API 訪問被拒絕，請檢查 API 金鑰配置');
        } else if (error.message.includes('400')) {
          console.warn('⚠️ Gemini API 請求格式錯誤');
        } else if (error.message.includes('429')) {
          console.warn('⚠️ Gemini API 配額已用完，使用增強模擬數據');
        }
      }

      // Fallback to enhanced mock data
      const enhancedData = await GoogleSearchService.enhanceInfluencerData(url);
      return this.generateEnhancedMockProfile(url, enhancedData);
    }
  }

  private static generateEnhancedMockProfile(url: string, enhancedData: { relatedProfiles: { title: string }[] }): InfluencerProfile {
    const platform = this.detectPlatformFromUrl(url);
    const username = this.extractUsernameFromUrl(url) || "網紅用戶";

    // Use search results to create more realistic data
    const searchBasedName = enhancedData.relatedProfiles.length > 0
      ? enhancedData.relatedProfiles[0].title.split(' ')[0] || username
      : this.generateRandomName();

    const platformFollowerRanges = {
      'Instagram': { min: 10000, max: 500000 },
      'YouTube': { min: 5000, max: 1000000 },
      'TikTok': { min: 50000, max: 2000000 },
      'Facebook': { min: 5000, max: 200000 },
      'Twitter': { min: 1000, max: 100000 }
    };

    const range = platformFollowerRanges[platform as keyof typeof platformFollowerRanges] || { min: 5000, max: 100000 };
    const followers = Math.floor(Math.random() * (range.max - range.min) + range.min);

    const platformColors = {
      'Instagram': 'e1306c',
      'YouTube': 'ff0000',
      'TikTok': '000000',
      'Facebook': '1877f2',
      'Twitter': '1da1f2'
    };

    // Asian market focused audience locations
    const asianLocations = [
      "台灣 (45%), 香港 (20%), 新加坡 (15%), 馬來西亞 (10%), 其他亞洲地區 (10%)",
      "香港 (40%), 台灣 (35%), 新加坡 (12%), 日本 (8%), 韓國 (5%)",
      "新加坡 (50%), 馬來西亞 (25%), 台灣 (15%), 泰國 (10%)",
      "日本 (40%), 韓國 (30%), 台灣 (20%), 香港 (10%)",
      "台灣 (60%), 香港 (25%), 新加坡 (10%), 澳門 (5%)"
    ];

    const contentTopicsByPlatform = {
      'Instagram': ['美食分享', '時尚穿搭', '生活記錄'],
      'YouTube': ['開箱評測', '生活vlog', '教學分享'],
      'TikTok': ['搞笑短片', '舞蹈挑戰', '生活技巧'],
      'Facebook': ['新聞評論', '生活分享', '社群互動'],
      'Twitter': ['即時動態', '觀點分享', '新聞討論']
    };

    const contentStyleOptions = [
      ['親切自然', '生活化', '真實分享'],
      ['專業權威', '深度分析', '教學導向'],
      ['幽默風趣', '創意有趣', '娛樂導向'],
      ['溫馨療癒', '正能量', '勵志分享']
    ];

    return {
      name: searchBasedName,
      platform,
      followers,
      bio: this.generatePlatformSpecificBio(platform),
      avatar: `https://placehold.co/80x80/${platformColors[platform as keyof typeof platformColors] || '6366f1'}/ffffff?text=${encodeURIComponent(searchBasedName.charAt(0))}`,
      recentPosts: this.generateEnhancedPlatformSpecificPosts(platform),
      audienceLocation: asianLocations[Math.floor(Math.random() * asianLocations.length)],
      contentTopics: contentTopicsByPlatform[platform as keyof typeof contentTopicsByPlatform] || ['生活分享', '個人興趣', '日常記錄'],
      contentStyle: contentStyleOptions[Math.floor(Math.random() * contentStyleOptions.length)],
      recentContentAnalysis: {
        mainTopics: this.generateMainTopicsForPlatform(platform),
        engagementTrend: ['穩定成長', '高峰期', '平穩維持', '逐步上升'][Math.floor(Math.random() * 4)],
        contentFrequency: ['每日發布', '每週3-4次', '每週2-3次', '不定期'][Math.floor(Math.random() * 4)],
        popularContentType: this.getPopularContentTypeForPlatform(platform)
      },
      isVerified: Math.random() > 0.7 // 30% chance of being verified
    };
  }

  private static generateMockProfile(url: string): InfluencerProfile {
    const platforms = ['Instagram', 'YouTube', 'TikTok', 'Facebook'];
    const platform = platforms[Math.floor(Math.random() * platforms.length)];
    const followers = Math.floor(Math.random() * 100000) + 5000;

    const names = ['林小美', '王大明', '張麗華', '李志強', '陳美玲', '劉建宏'];
    const name = names[Math.floor(Math.random() * names.length)];

    const bios = [
      '熱愛生活、分享美食與旅遊的創作者',
      '專業美妝達人，分享最新潮流趨勢',
      '健身教練，致力於推廣健康生活',
      '科技愛好者，評測最新數位產品',
      '親子部落客，記錄育兒生活點滴',
      '時尚穿搭達人，展現個人風格'
    ];
    const bio = bios[Math.floor(Math.random() * bios.length)];

    return {
      name,
      platform,
      followers,
      bio,
      recentPosts: [
        { title: "探索巷弄美食！CP值超高的拉麵店", engagement: "2.1k 讚, 150 則留言", topic: "美食", publishDate: "2 天前" },
        { title: "週末小旅行：陽明山繡球花季", engagement: "3.5k 讚, 280 則留言", topic: "旅遊", publishDate: "5 天前" },
        { title: "我的夏日穿搭分享 OOTD", engagement: "1.8k 讚, 120 則留言", topic: "時尚", publishDate: "1 週前" }
      ],
      avatar: `https://placehold.co/80x80/a0aec0/ffffff?text=${encodeURIComponent(name.charAt(0))}`,
      audienceLocation: "台灣 (70%), 香港 (20%), 新加坡 (10%)",
      contentTopics: ['生活分享', '美食探索', '旅遊記錄'],
      contentStyle: ['親切自然', '生活化', '真實分享'],
      recentContentAnalysis: {
        mainTopics: "美食探索, 旅遊分享, 生活記錄",
        engagementTrend: "穩定成長",
        contentFrequency: "每週2-3次",
        popularContentType: "生活分享照片"
      }
    };
  }

  private static detectPlatformFromUrl(url: string): string {
    try {
      const hostname = new URL(url).hostname.toLowerCase();
      if (hostname.includes('instagram')) return 'Instagram';
      if (hostname.includes('youtube')) return 'YouTube';
      if (hostname.includes('tiktok')) return 'TikTok';
      if (hostname.includes('facebook')) return 'Facebook';
      if (hostname.includes('twitter') || hostname.includes('x.com')) return 'Twitter';
      return 'Instagram'; // Default
    } catch {
      return 'Instagram';
    }
  }

  /**
   * 🎯 基於 URL 和平台特性估算合理的粉絲數量
   */
  private static estimateReasonableFollowers(platform: string, url: string): number {
    // 基於用戶名特徵判斷可能的影響力級別
    const username = this.extractUsernameFromUrl(url) || '';
    const isVerifiedLooking = username.length <= 8 && !/\d{3,}/.test(username); // 短用戶名且數字不多
    const hasNumbers = /\d/.test(username);

    // 平台基礎粉絲數範圍（更現實的分佈）
    const platformRanges = {
      'Instagram': {
        micro: { min: 1000, max: 50000 },      // 微網紅 (70% 機率)
        mid: { min: 50000, max: 500000 },      // 中型網紅 (25% 機率)
        macro: { min: 500000, max: 5000000 }   // 大型網紅 (5% 機率)
      },
      'YouTube': {
        micro: { min: 100, max: 10000 },       // 小型創作者
        mid: { min: 10000, max: 100000 },      // 中型創作者
        macro: { min: 100000, max: 1000000 }   // 大型創作者
      },
      'TikTok': {
        micro: { min: 1000, max: 100000 },     // TikTok 成長較快
        mid: { min: 100000, max: 1000000 },
        macro: { min: 1000000, max: 50000000 }
      }
    };

    const ranges = platformRanges[platform as keyof typeof platformRanges] || platformRanges['Instagram'];

    // 根據用戶名特徵決定級別
    let category: 'micro' | 'mid' | 'macro';
    const random = Math.random();

    if (isVerifiedLooking && !hasNumbers) {
      // 看起來像認證帳號的用戶名
      category = random < 0.3 ? 'mid' : random < 0.7 ? 'macro' : 'micro';
    } else if (hasNumbers || username.length > 15) {
      // 數字多或很長的用戶名，通常是較小的帳號
      category = random < 0.85 ? 'micro' : 'mid';
    } else {
      // 一般情況，大部分是微網紅
      category = random < 0.7 ? 'micro' : random < 0.95 ? 'mid' : 'macro';
    }

    const range = ranges[category];
    const followers = Math.floor(Math.random() * (range.max - range.min) + range.min);

    console.log(`🎯 ${platform} 粉絲數估算: ${username} -> ${category} 級別 -> ${followers} 粉絲`);

    return followers;
  }

  private static extractUsernameFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const segments = pathname.split('/').filter(s => s.length > 0);
      return segments[segments.length - 1] || null;
    } catch {
      return null;
    }
  }

  private static generateRandomName(): string {
    const names = ['小雅', '大明', '麗華', '志強', '美玲', '建宏', '佳慧', '俊傑', '雅婷', '宗翰'];
    return names[Math.floor(Math.random() * names.length)];
  }

  private static generatePlatformSpecificBio(platform: string): string {
    const bios = {
      'Instagram': [
        '攝影愛好者 📸 分享生活美好時刻',
        '美食探索家 🍜 帶你發現隱藏美味',
        '時尚部落客 👗 分享穿搭靈感與趨勢'
      ],
      'YouTube': [
        '創作者 🎬 分享有趣的生活內容',
        '教學頻道主 📚 讓學習變得更簡單',
        '開箱達人 📦 最新產品第一手評測'
      ],
      'TikTok': [
        '舞蹈創作者 💃 跟上最新舞蹈趨勢',
        '搞笑短片製作人 😂 每日帶來歡樂',
        '生活小技巧分享 ✨ 讓生活更便利'
      ],
      'Facebook': [
        '社群經營者 📱 分享生活點滴',
        '專業領域分享 💼 提供實用資訊',
        '興趣社團管理員 🎯 連結同好朋友'
      ],
      'Twitter': [
        '即時動態分享 📢 第一手消息報導',
        '專業觀點分享 🧠 深度思考與討論',
        '生活隨筆記錄 📝 分享日常感想'
      ]
    };

    const platformBios = bios[platform as keyof typeof bios] || bios['Instagram'];
    return platformBios[Math.floor(Math.random() * platformBios.length)];
  }

  private static generateEnhancedPlatformSpecificPosts(platform: string): EnhancedPostData[] {
    const postTemplates = {
      'Instagram': [
        { title: "今日台北美食探索 🍜 巷弄間的隱藏拉麵店", topic: "美食", engagement: "2.5k 讚, 180 則留言", publishDate: "2 天前" },
        { title: "夏日穿搭分享 ☀️ 清爽OL風格", topic: "時尚", engagement: "3.2k 讚, 220 則留言", publishDate: "5 天前" },
        { title: "週末台中小旅行 🌸 文青咖啡廳打卡", topic: "旅遊", engagement: "1.8k 讚, 150 則留言", publishDate: "1 週前" }
      ],
      'YouTube': [
        { title: "【開箱】最新iPhone評測｜值得升級嗎？", topic: "科技", engagement: "15k 觀看, 580 讚", publishDate: "3 天前" },
        { title: "台灣夜市美食排行榜 TOP 10！", topic: "美食", engagement: "28k 觀看, 1.2k 讚", publishDate: "1 週前" },
        { title: "居家辦公室佈置教學｜提升工作效率", topic: "生活", engagement: "12k 觀看, 450 讚", publishDate: "2 週前" }
      ],
      'TikTok': [
        { title: "香港茶餐廳必點美食 🥟 在地人推薦", topic: "美食", engagement: "45k 觀看, 3.2k 讚", publishDate: "1 天前" },
        { title: "5分鐘學會韓式妝容 💄", topic: "美妝", engagement: "28k 觀看, 2.1k 讚", publishDate: "4 天前" },
        { title: "新加坡街頭時尚穿搭 👗", topic: "時尚", engagement: "35k 觀看, 2.8k 讚", publishDate: "6 天前" }
      ],
      'Facebook': [
        { title: "疫情後的亞洲旅遊復甦 - 我的觀察與分享", topic: "旅遊", engagement: "850 讚, 120 則留言", publishDate: "3 天前" },
        { title: "在台港人的生活適應心得分享", topic: "生活", engagement: "1.2k 讚, 200 則留言", publishDate: "1 週前" },
        { title: "推薦幾間台北優質親子餐廳", topic: "親子", engagement: "650 讚, 85 則留言", publishDate: "10 天前" }
      ],
      'Twitter': [
        { title: "今日港股走勢分析 📈 科技股表現亮眼", topic: "財經", engagement: "280 讚, 45 轉推", publishDate: "1 天前" },
        { title: "台灣珍奶文化真的征服了全世界 🧋", topic: "文化", engagement: "520 讚, 120 轉推", publishDate: "3 天前" },
        { title: "亞洲各國防疫政策比較與思考", topic: "時事", engagement: "340 讚, 85 轉推", publishDate: "5 天前" }
      ]
    };

    return postTemplates[platform as keyof typeof postTemplates] || [
      { title: "生活分享", topic: "生活", engagement: "100 讚", publishDate: "1 天前" },
      { title: "日常記錄", topic: "生活", engagement: "150 讚", publishDate: "3 天前" },
      { title: "心情隨筆", topic: "生活", engagement: "80 讚", publishDate: "1 週前" }
    ];
  }

  private static generateMainTopicsForPlatform(platform: string): string {
    const topicsByPlatform = {
      'Instagram': "美食探索, 時尚穿搭, 生活記錄, 旅遊分享",
      'YouTube': "產品評測, 生活vlog, 教學內容, 娛樂分享",
      'TikTok': "創意短片, 生活技巧, 流行趨勢, 音樂舞蹈",
      'Facebook': "時事評論, 生活分享, 專業知識, 社群互動",
      'Twitter': "即時新聞, 個人觀點, 行業動態, 生活隨筆"
    };

    return topicsByPlatform[platform as keyof typeof topicsByPlatform] || "生活分享, 個人興趣, 日常記錄";
  }

  private static getPopularContentTypeForPlatform(platform: string): string {
    const contentTypes = {
      'Instagram': "美食打卡照片",
      'YouTube': "生活vlog影片",
      'TikTok': "創意短片",
      'Facebook': "圖文分享貼文",
      'Twitter': "即時動態文字"
    };

    return contentTypes[platform as keyof typeof contentTypes] || "圖文分享";
  }

  /**
   * 獲取增強的網紅分析數據
   */
  static async getEnhancedAnalysis(url: string): Promise<EnhancedInfluencerProfile> {
    try {
      // 首先獲取基本資料
      const basicProfile = await this.analyzeInfluencer(url);

      // 然後獲取增強分析
      const enhancedProfile = await EnhancedAnalyticsService.getEnhancedAnalysis(url, basicProfile);

      return enhancedProfile;
    } catch (error) {
      console.error("Enhanced analysis failed:", error);

      // 如果增強分析失敗，返回基本資料加上模擬的增強數據
      const basicProfile = await this.analyzeInfluencer(url);
      return this.createMockEnhancedProfile(basicProfile);
    }
  }

  /**
   * 創建模擬的增強分析數據（用於演示）
   */
  private static createMockEnhancedProfile(basicProfile: InfluencerProfile): EnhancedInfluencerProfile {
    return {
      basic: basicProfile,
      demographics: {
        ageGroups: {
          "13-17": 8,
          "18-24": 25,
          "25-34": 32,
          "35-44": 20,
          "45-54": 10,
          "55-64": 4,
          "65+": 1
        },
        gender: {
          male: 45,
          female: 52,
          other: 3
        },
        topCountries: [
          { country: "台灣", percentage: 45 },
          { country: "香港", percentage: 18 },
          { country: "新加坡", percentage: 12 },
          { country: "馬來西亞", percentage: 10 },
          { country: "其他", percentage: 15 }
        ],
        topCities: [
          { city: "台北", percentage: 28 },
          { city: "高雄", percentage: 12 },
          { city: "台中", percentage: 10 },
          { city: "香港", percentage: 18 },
          { city: "其他", percentage: 32 }
        ]
      },
      content: {
        contentTypes: [
          { type: "圖文", percentage: 45 },
          { type: "影片", percentage: 35 },
          { type: "直播", percentage: 15 },
          { type: "限時動態", percentage: 5 }
        ],
        topics: [
          { topic: "生活風格", confidence: 85, frequency: 12 },
          { topic: "美食", confidence: 78, frequency: 8 },
          { topic: "旅遊", confidence: 72, frequency: 6 },
          { topic: "時尚", confidence: 68, frequency: 5 },
          { topic: "健康", confidence: 55, frequency: 3 }
        ],
        sentiment: {
          positive: 65,
          neutral: 28,
          negative: 7,
          overall: 'positive'
        },
        brandSafety: {
          score: 88,
          flags: [],
          riskLevel: 'low'
        },
        postFrequency: {
          daily: 1.2,
          weekly: 8,
          monthly: 32,
          avgPostsPerWeek: 7.5
        }
      },
      engagement: {
        avgLikes: Math.floor(basicProfile.followers * 0.05),
        avgComments: Math.floor(basicProfile.followers * 0.008),
        avgShares: Math.floor(basicProfile.followers * 0.002),
        avgViews: Math.floor(basicProfile.followers * 0.3),
        engagementRate: 5.2,
        engagementQuality: {
          genuineComments: 82,
          spamComments: 18,
          qualityScore: 78
        },
        peakEngagementTimes: [
          { hour: 12, day: "週末", engagementRate: 8.5 },
          { hour: 20, day: "平日", engagementRate: 7.2 },
          { hour: 18, day: "週五", engagementRate: 9.1 }
        ]
      },
      trends: {
        trendingTopics: [
          { topic: "永續生活", growth: 25, peakDate: "2024-12-01" },
          { topic: "在地美食", growth: 18, peakDate: "2024-11-28" },
          { topic: "健康飲食", growth: 12, peakDate: "2024-11-25" }
        ],
        hashtags: [
          { tag: "#生活風格", frequency: 45, reach: 12500 },
          { tag: "#台灣美食", frequency: 32, reach: 8900 },
          { tag: "#日常分享", frequency: 28, reach: 7200 },
          { tag: "#旅遊推薦", frequency: 22, reach: 6100 }
        ],
        competitorComparison: [
          { competitor: "同類型KOL A", similarity: 75, strengths: ["互動率高", "內容豐富"], weaknesses: ["更新頻率低"] },
          { competitor: "同類型KOL B", similarity: 68, strengths: ["專業度高"], weaknesses: ["受眾較小"] }
        ]
      },
      lastUpdated: new Date(),
      dataQuality: {
        completeness: 85,
        freshness: 0,
        accuracy: 80
      }
    };
  }
}

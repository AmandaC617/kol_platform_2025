import { Project, Influencer, Evaluation } from "@/types";

// Demo projects
export const DEMO_PROJECTS: Project[] = [
  {
    id: "demo-project-1",
    name: "美妝新品上市",
    description: "針對春季美妝新品的KOL推廣專案",
    budget: "500,000 元",
    startDate: "2024-01-15",
    endDate: "2024-06-15",
    status: "active" as const,
    createdAt: new Date('2024-01-15T10:00:00Z'),
    createdBy: "demo-user-1",
    permissions: { "demo-user-1": "owner" },
    isPublic: false
  },
  {
    id: "demo-project-2",
    name: "夏季服飾推廣",
    description: "夏季時尚服飾推廣活動",
    budget: "300,000 元", 
    startDate: "2024-06-01",
    endDate: "2024-08-31",
    status: "active" as const,
    createdAt: new Date('2024-01-10T14:30:00Z'),
    createdBy: "demo-user-1",
    permissions: { "demo-user-1": "owner" },
    isPublic: false
  }
];

// Demo influencers
export const DEMO_INFLUENCERS: Influencer[] = [
  {
    id: "demo-influencer-1",
    url: "https://instagram.com/beautyguru_tw",
    platform: "Instagram",
    profile: {
      name: "美妝達人小雅",
      platform: "Instagram",
      followers: 85000,
      bio: "專業美妝師，分享最新美妝趨勢與產品評測。合作邀約請私訊💄",
      avatar: "https://placehold.co/80x80/ff6b9d/ffffff?text=雅",
      recentPosts: [
        { title: "2024春季新品開箱｜YSL全新唇膏系列", engagement: "3.2k 讚, 245 則留言", topic: "美妝", publishDate: "2 天前" },
        { title: "平價vs專櫃粉底大比拼！CP值最高是？", engagement: "2.8k 讚, 189 則留言", topic: "美妝", publishDate: "5 天前" },
        { title: "五分鐘快速妝容分享✨上班族必學", engagement: "4.1k 讚, 312 則留言", topic: "美妝", publishDate: "1 週前" }
      ],
      audienceLocation: "台灣 (65%), 香港 (20%), 新加坡 (10%), 其他 (5%)",
      contentTopics: ["美妝保養", "彩妝教學", "產品評測"],
      contentStyle: ["專業教學", "親切分享", "詳細評比"],
      recentContentAnalysis: {
        mainTopics: "春季彩妝, 保養趨勢, 平價美妝",
        engagementTrend: "穩定成長",
        contentFrequency: "每週3-4次",
        popularContentType: "產品開箱評測"
      }
    },
    createdAt: new Date('2024-01-16T09:00:00Z'),
    createdBy: "demo-user-1",
    latestScore: 87.5,
    tags: ["美妝", "生活"],
    notes: ""
  },
  {
    id: "demo-influencer-2",
    url: "https://youtube.com/c/fashionista_taiwan",
    platform: "YouTube",
    profile: {
      name: "時尚菁英 Chloe",
      platform: "YouTube",
      followers: 156000,
      bio: "時尚部落客 x 穿搭顧問，帶你走在流行最前線 🌟 商業合作歡迎洽詢",
      avatar: "https://placehold.co/80x80/4ecdc4/ffffff?text=C",
      recentPosts: [
        { title: "2024春夏流行趨勢預測！這些單品必須擁有", engagement: "5.7k 讚, 423 則留言", topic: "時尚", publishDate: "1 天前" },
        { title: "小資女也能穿出高質感！平價品牌推薦", engagement: "4.2k 讚, 301 則留言", topic: "時尚", publishDate: "4 天前" },
        { title: "職場穿搭指南：一週五套優雅LOOK", engagement: "6.1k 讚, 287 則留言", topic: "時尚", publishDate: "1 週前" }
      ],
      audienceLocation: "香港 (40%), 台灣 (35%), 新加坡 (15%), 日本 (10%)",
      contentTopics: ["時尚穿搭", "流行趨勢", "品牌推薦"],
      contentStyle: ["時尚前衛", "專業分析", "實用指南"],
      recentContentAnalysis: {
        mainTopics: "春夏時尚, 平價穿搭, 職場風格",
        engagementTrend: "高峰期",
        contentFrequency: "每週2-3次",
        popularContentType: "穿搭教學影片"
      }
    },
    createdAt: new Date('2024-01-14T16:20:00Z'),
    createdBy: "demo-user-1",
    latestScore: 92.3,
    tags: ["時尚", "穿搭"],
    notes: ""
  }
];

// Demo evaluations
export const DEMO_EVALUATIONS: { [influencerId: string]: Evaluation[] } = {
  "demo-influencer-1": [
    {
      id: "demo-eval-1",
      scores: {
        brandFit: 85,
        contentQuality: 90,
        engagementRate: 88,
        audienceProfile: 82,
        professionalism: 95,
        businessAbility: 80,
        brandSafety: 92,
        stability: 87
      },
      totalScore: 87.5,
      notes: "整體表現優秀，內容品質很高，與美妝品牌契合度佳。建議可加強商業合作經驗。",
      evaluatedBy: "demo-user",
      evaluatorName: "李經理",
      createdAt: new Date('2024-01-16T10:30:00Z')
    },
    {
      id: "demo-eval-2",
      scores: {
        brandFit: 88,
        contentQuality: 85,
        engagementRate: 90,
        audienceProfile: 85,
        professionalism: 92,
        businessAbility: 78,
        brandSafety: 95,
        stability: 89
      },
      totalScore: 86.8,
      notes: "粉絲互動率提升，內容穩定性良好。",
      evaluatedBy: "demo-user",
      evaluatorName: "李經理",
      createdAt: new Date('2024-01-12T14:15:00Z')
    }
  ],
  "demo-influencer-2": [
    {
      id: "demo-eval-3",
      scores: {
        brandFit: 95,
        contentQuality: 92,
        engagementRate: 91,
        audienceProfile: 90,
        professionalism: 98,
        businessAbility: 85,
        brandSafety: 96,
        stability: 93
      },
      totalScore: 92.3,
      notes: "頂級時尚網紅，專業度極高，品牌形象優秀，非常適合高端品牌合作。",
      evaluatedBy: "demo-user",
      evaluatorName: "李經理",
      createdAt: new Date('2024-01-15T11:45:00Z')
    }
  ]
};

export const isDemoMode = () => {
  // Check if running in demo mode based on environment variable
  const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  // Also check if Firebase is properly configured
  const hasFirebaseConfig = !!(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
  );

  // Use demo mode if explicitly set or if Firebase is not configured
  return demoMode || !hasFirebaseConfig;
};

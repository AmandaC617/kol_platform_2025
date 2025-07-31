"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  Target, 
  Star,
  X,
  Plus,
  Award,
  Trophy,
  Medal,
  Crown
} from 'lucide-react';

interface InfluencerComparisonProps {
  influencers: any[];
  onClose: () => void;
}

interface ComparisonData {
  id: string;
  name: string;
  platform: string;
  followers: number;
  engagementRate: number;
  contentQuality: number;
  audienceMatch: number;
  brandSafety: number;
  overallScore: number;
  recentPosts: number;
  avgLikes: number;
  avgComments: number;
  avgShares: number;
}

export const InfluencerComparison: React.FC<InfluencerComparisonProps> = ({
  influencers,
  onClose
}) => {
  const [selectedInfluencers, setSelectedInfluencers] = useState<string[]>([]);
  const [comparisonData, setComparisonData] = useState<ComparisonData[]>([]);
  const [sortBy, setSortBy] = useState<string>('overallScore');

  // 處理選中的 KOL
  useEffect(() => {
    const data = influencers
      .filter(inf => selectedInfluencers.includes(inf.id))
      .map(inf => ({
        id: inf.id,
        name: inf.profile?.name || '未知',
        platform: inf.platform,
        followers: parseInt(inf.profile?.followers) || 0,
        engagementRate: calculateEngagementRate(inf),
        contentQuality: calculateContentQuality(inf),
        audienceMatch: calculateAudienceMatch(inf),
        brandSafety: calculateBrandSafety(inf),
        overallScore: calculateOverallScore(inf),
        recentPosts: inf.recentPosts?.length || 0,
        avgLikes: calculateAvgLikes(inf),
        avgComments: calculateAvgComments(inf),
        avgShares: calculateAvgShares(inf)
      }));
    
    setComparisonData(data);
  }, [selectedInfluencers, influencers]);

  // 處理 KOL 選擇
  const handleInfluencerToggle = (influencerId: string) => {
    setSelectedInfluencers(prev => {
      if (prev.includes(influencerId)) {
        return prev.filter(id => id !== influencerId);
      } else if (prev.length < 5) {
        return [...prev, influencerId];
      }
      return prev;
    });
  };

  // 清空選擇
  const clearSelection = () => {
    setSelectedInfluencers([]);
  };

  // 計算函數
  const calculateEngagementRate = (influencer: any): number => {
    const followers = parseInt(influencer.profile?.followers) || 1;
    const recentPosts = influencer.recentPosts || [];
    if (recentPosts.length === 0) return 0;
    
    const totalEngagement = recentPosts.reduce((sum: number, post: any) => {
      const engagement = parseEngagement(post.engagement);
      return sum + engagement.likes + engagement.comments + engagement.shares;
    }, 0);
    
    return (totalEngagement / recentPosts.length / followers) * 100;
  };

  const parseEngagement = (engagement: string) => {
    const likes = parseInt(engagement.match(/(\d+(?:\.\d+)?)k?\s*讚/)?.[1] || '0') * 1000;
    const comments = parseInt(engagement.match(/(\d+(?:\.\d+)?)k?\s*留言/)?.[1] || '0') * 1000;
    const shares = parseInt(engagement.match(/(\d+(?:\.\d+)?)k?\s*分享/)?.[1] || '0') * 1000;
    return { likes, comments, shares };
  };

  const calculateContentQuality = (influencer: any): number => {
    // 基於內容分析計算品質分數
    const recentContent = influencer.recentContentAnalysis;
    if (!recentContent) return 70;
    
    let score = 70;
    if (recentContent.contentQuality) score += 10;
    if (recentContent.consistency) score += 10;
    if (recentContent.creativity) score += 10;
    
    return Math.min(score, 100);
  };

  const calculateAudienceMatch = (influencer: any): number => {
    // 基於受眾分析計算匹配度
    const audience = influencer.audienceProfile;
    if (!audience) return 75;
    
    let score = 75;
    if (audience.engagement) score += 10;
    if (audience.quality) score += 10;
    if (audience.demographics) score += 5;
    
    return Math.min(score, 100);
  };

  const calculateBrandSafety = (influencer: any): number => {
    // 基於品牌安全評估
    const recentContent = influencer.recentContentAnalysis;
    if (!recentContent) return 85;
    
    let score = 85;
    if (recentContent.riskLevel === 'low') score += 10;
    if (recentContent.riskLevel === 'high') score -= 20;
    
    return Math.max(Math.min(score, 100), 0);
  };

  const calculateOverallScore = (influencer: any): number => {
    const engagement = calculateEngagementRate(influencer);
    const contentQuality = calculateContentQuality(influencer);
    const audienceMatch = calculateAudienceMatch(influencer);
    const brandSafety = calculateBrandSafety(influencer);
    
    return Math.round((engagement * 0.3 + contentQuality * 0.25 + audienceMatch * 0.25 + brandSafety * 0.2));
  };

  const calculateAvgLikes = (influencer: any): number => {
    const recentPosts = influencer.recentPosts || [];
    if (recentPosts.length === 0) return 0;
    
    const totalLikes = recentPosts.reduce((sum: number, post: any) => {
      const engagement = parseEngagement(post.engagement);
      return sum + engagement.likes;
    }, 0);
    
    return Math.round(totalLikes / recentPosts.length);
  };

  const calculateAvgComments = (influencer: any): number => {
    const recentPosts = influencer.recentPosts || [];
    if (recentPosts.length === 0) return 0;
    
    const totalComments = recentPosts.reduce((sum: number, post: any) => {
      const engagement = parseEngagement(post.engagement);
      return sum + engagement.comments;
    }, 0);
    
    return Math.round(totalComments / recentPosts.length);
  };

  const calculateAvgShares = (influencer: any): number => {
    const recentPosts = influencer.recentPosts || [];
    if (recentPosts.length === 0) return 0;
    
    const totalShares = recentPosts.reduce((sum: number, post: any) => {
      const engagement = parseEngagement(post.engagement);
      return sum + engagement.shares;
    }, 0);
    
    return Math.round(totalShares / recentPosts.length);
  };

  // 排序數據
  const sortedData = [...comparisonData].sort((a, b) => {
    switch (sortBy) {
      case 'overallScore':
        return b.overallScore - a.overallScore;
      case 'followers':
        return b.followers - a.followers;
      case 'engagementRate':
        return b.engagementRate - a.engagementRate;
      case 'contentQuality':
        return b.contentQuality - a.contentQuality;
      default:
        return b.overallScore - a.overallScore;
    }
  });

  // 獲取排名圖標
  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 1:
        return <Trophy className="w-5 h-5 text-gray-400" />;
      case 2:
        return <Medal className="w-5 h-5 text-amber-600" />;
      default:
        return <Award className="w-4 h-4 text-gray-400" />;
    }
  };

  // 格式化數字
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-7xl max-h-[90vh] overflow-hidden">
        {/* 標題欄 */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold">KOL 評比分析</h2>
            <Badge variant="secondary">
              {selectedInfluencers.length}/5 已選擇
            </Badge>
          </div>
          <Button onClick={onClose} variant="ghost" size="sm">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex h-[calc(90vh-80px)]">
          {/* 左側選擇面板 */}
          <div className="w-80 border-r p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">選擇 KOL</h3>
              <Button onClick={clearSelection} variant="outline" size="sm">
                清空
              </Button>
            </div>
            
            <div className="space-y-2">
              {influencers.map((influencer) => (
                <div
                  key={influencer.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedInfluencers.includes(influencer.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleInfluencerToggle(influencer.id)}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedInfluencers.includes(influencer.id)}
                      onChange={() => {}}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {influencer.profile?.name || '未知'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {influencer.platform} • {formatNumber(parseInt(influencer.profile?.followers) || 0)} 粉絲
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 右側比較內容 */}
          <div className="flex-1 p-4 overflow-y-auto">
            {selectedInfluencers.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <Plus className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>請從左側選擇要比較的 KOL（最多5位）</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* 排序選項 */}
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">排序方式：</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border rounded px-3 py-1 text-sm"
                  >
                    <option value="overallScore">綜合評分</option>
                    <option value="followers">粉絲數量</option>
                    <option value="engagementRate">互動率</option>
                    <option value="contentQuality">內容品質</option>
                  </select>
                </div>

                {/* 排名展示 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                  {sortedData.map((data, index) => (
                    <Card key={data.id} className="relative">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getRankIcon(index)}
                            <span className="text-sm font-medium">#{index + 1}</span>
                          </div>
                          <Badge variant="outline">{data.platform}</Badge>
                        </div>
                        <CardTitle className="text-lg truncate">{data.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* 綜合評分 */}
                        <div className="text-center">
                          <div className="text-3xl font-bold text-blue-600">
                            {data.overallScore}
                          </div>
                          <div className="text-sm text-gray-600">綜合評分</div>
                        </div>

                        {/* 關鍵指標 */}
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>互動率</span>
                              <span>{data.engagementRate.toFixed(2)}%</span>
                            </div>
                            <Progress value={data.engagementRate} className="h-2" />
                          </div>
                          
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>內容品質</span>
                              <span>{data.contentQuality}%</span>
                            </div>
                            <Progress value={data.contentQuality} className="h-2" />
                          </div>
                          
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>受眾匹配</span>
                              <span>{data.audienceMatch}%</span>
                            </div>
                            <Progress value={data.audienceMatch} className="h-2" />
                          </div>
                          
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>品牌安全</span>
                              <span>{data.brandSafety}%</span>
                            </div>
                            <Progress value={data.brandSafety} className="h-2" />
                          </div>
                        </div>

                        {/* 詳細數據 */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <div className="font-medium">{formatNumber(data.followers)}</div>
                            <div className="text-gray-500">粉絲</div>
                          </div>
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <div className="font-medium">{data.recentPosts}</div>
                            <div className="text-gray-500">近期貼文</div>
                          </div>
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <div className="font-medium">{formatNumber(data.avgLikes)}</div>
                            <div className="text-gray-500">平均讚數</div>
                          </div>
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <div className="font-medium">{formatNumber(data.avgComments)}</div>
                            <div className="text-gray-500">平均留言</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* 詳細比較表格 */}
                <Tabs defaultValue="metrics" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="metrics">關鍵指標</TabsTrigger>
                    <TabsTrigger value="engagement">互動數據</TabsTrigger>
                    <TabsTrigger value="analysis">深度分析</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="metrics" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>關鍵指標比較</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left p-2">KOL</th>
                                <th className="text-center p-2">綜合評分</th>
                                <th className="text-center p-2">互動率</th>
                                <th className="text-center p-2">內容品質</th>
                                <th className="text-center p-2">受眾匹配</th>
                                <th className="text-center p-2">品牌安全</th>
                              </tr>
                            </thead>
                            <tbody>
                              {sortedData.map((data, index) => (
                                <tr key={data.id} className="border-b">
                                  <td className="p-2">
                                    <div className="flex items-center gap-2">
                                      {getRankIcon(index)}
                                      <span className="font-medium">{data.name}</span>
                                    </div>
                                  </td>
                                  <td className="text-center p-2 font-bold text-blue-600">
                                    {data.overallScore}
                                  </td>
                                  <td className="text-center p-2">{data.engagementRate.toFixed(2)}%</td>
                                  <td className="text-center p-2">{data.contentQuality}%</td>
                                  <td className="text-center p-2">{data.audienceMatch}%</td>
                                  <td className="text-center p-2">{data.brandSafety}%</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="engagement" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>互動數據比較</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left p-2">KOL</th>
                                <th className="text-center p-2">粉絲數量</th>
                                <th className="text-center p-2">近期貼文</th>
                                <th className="text-center p-2">平均讚數</th>
                                <th className="text-center p-2">平均留言</th>
                                <th className="text-center p-2">平均分享</th>
                              </tr>
                            </thead>
                            <tbody>
                              {sortedData.map((data, index) => (
                                <tr key={data.id} className="border-b">
                                  <td className="p-2">
                                    <div className="flex items-center gap-2">
                                      {getRankIcon(index)}
                                      <span className="font-medium">{data.name}</span>
                                    </div>
                                  </td>
                                  <td className="text-center p-2">{formatNumber(data.followers)}</td>
                                  <td className="text-center p-2">{data.recentPosts}</td>
                                  <td className="text-center p-2">{formatNumber(data.avgLikes)}</td>
                                  <td className="text-center p-2">{formatNumber(data.avgComments)}</td>
                                  <td className="text-center p-2">{formatNumber(data.avgShares)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="analysis" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Target className="w-5 h-5" />
                            推薦建議
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {sortedData.slice(0, 3).map((data, index) => (
                              <div key={data.id} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                                {getRankIcon(index)}
                                <div>
                                  <div className="font-medium">{data.name}</div>
                                  <div className="text-sm text-gray-600">
                                    綜合評分 {data.overallScore} 分，適合優先考慮合作
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" />
                            表現分析
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-sm">最高互動率</span>
                              <span className="text-sm font-medium">
                                {sortedData[0]?.name} ({sortedData[0]?.engagementRate.toFixed(2)}%)
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">最佳內容品質</span>
                              <span className="text-sm font-medium">
                                {sortedData.find(d => d.contentQuality === Math.max(...sortedData.map(s => s.contentQuality)))?.name} ({Math.max(...sortedData.map(s => s.contentQuality))}%)
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">最安全品牌</span>
                              <span className="text-sm font-medium">
                                {sortedData.find(d => d.brandSafety === Math.max(...sortedData.map(s => s.brandSafety)))?.name} ({Math.max(...sortedData.map(s => s.brandSafety))}%)
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 
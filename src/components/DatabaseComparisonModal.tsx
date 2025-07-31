"use client";

import { useState, useCallback, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExportButton } from "@/components/ExportButton";
import { InfluencerDatabaseService } from "@/lib/influencer-database-service";
import { useAuth } from "@/contexts/AuthContext";
import { Influencer } from "@/types";
import { Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { ErrorService, ErrorCode } from "@/lib/error-service";
import { LoggerService } from "@/lib/logger-service";
import { Search, Filter, TrendingUp, Users, Star } from "lucide-react";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const logger = LoggerService.getInstance();

interface DatabaseComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DatabaseComparisonData {
  influencer: Influencer;
  averageScore: number;
  evaluationCount: number;
  platforms: string[];
  totalFollowers: number;
  lastActive: Date;
  scores: {
    brandFit: number;
    contentQuality: number;
    engagementRate: number;
    audienceProfile: number;
    professionalism: number;
    businessAbility: number;
    brandSafety: number;
    stability: number;
  };
}

const DatabaseComparisonModal = ({ isOpen, onClose }: DatabaseComparisonModalProps) => {
  const { user } = useAuth();
  const [comparisonData, setComparisonData] = useState<DatabaseComparisonData[]>([]);
  const [filteredData, setFilteredData] = useState<DatabaseComparisonData[]>([]);
  const [loading, setLoading] = useState(false);
  
  // 篩選器狀態
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('score');
  const [minFollowers, setMinFollowers] = useState<string>('');
  const [maxFollowers, setMaxFollowers] = useState<string>('');

  const loadDatabaseComparison = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      logger.info('開始載入資料庫比較數據', { userId: user.uid });

      // 搜尋全域網紅資料庫
      const globalInfluencers = await InfluencerDatabaseService.searchGlobalInfluencers(
        user.uid,
        searchQuery,
        {
          platforms: platformFilter !== 'all' ? [platformFilter] : undefined,
          minFollowers: minFollowers ? parseInt(minFollowers) : undefined,
          maxFollowers: maxFollowers ? parseInt(maxFollowers) : undefined,
        }
      );

      // 處理每個網紅的統計數據
      const dataPromises = globalInfluencers.map(async (influencer) => {
        // 這裡需要從各專案中收集該網紅的評估數據
        // 暫時使用模擬數據
        const mockScores = {
          brandFit: Math.random() * 100,
          contentQuality: Math.random() * 100,
          engagementRate: Math.random() * 100,
          audienceProfile: Math.random() * 100,
          professionalism: Math.random() * 100,
          businessAbility: Math.random() * 100,
          brandSafety: Math.random() * 100,
          stability: Math.random() * 100,
        };

        const averageScore = Object.values(mockScores).reduce((a, b) => a + b, 0) / 8;

        return {
          influencer,
          averageScore,
          evaluationCount: Math.floor(Math.random() * 10) + 1,
          platforms: [influencer.platform],
          totalFollowers: influencer.profile?.followers || 0,
          lastActive: new Date(),
          scores: mockScores
        };
      });

      const results = await Promise.all(dataPromises);
      setComparisonData(results);
      setFilteredData(results);

      logger.info('資料庫比較數據載入完成', { 
        influencerCount: results.length,
        searchQuery,
        platformFilter
      });
    } catch (error) {
      const appError = ErrorService.handleError(error as Error, ErrorCode.DATA_FETCH, {
        operation: 'loadDatabaseComparison',
        userId: user.uid
      });
      console.error('載入資料庫比較數據失敗:', appError);
    } finally {
      setLoading(false);
    }
  }, [user, searchQuery, platformFilter, minFollowers, maxFollowers]);

  // 應用篩選器和排序
  useEffect(() => {
    let filtered = [...comparisonData];

    // 搜尋篩選
    if (searchQuery) {
      filtered = filtered.filter(data => 
        data.influencer.profile?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        data.influencer.platform.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 平台篩選
    if (platformFilter !== 'all') {
      filtered = filtered.filter(data => 
        data.influencer.platform.toLowerCase() === platformFilter.toLowerCase()
      );
    }

    // 粉絲數篩選
    if (minFollowers) {
      const min = parseInt(minFollowers);
      filtered = filtered.filter(data => data.totalFollowers >= min);
    }
    if (maxFollowers) {
      const max = parseInt(maxFollowers);
      filtered = filtered.filter(data => data.totalFollowers <= max);
    }

    // 排序
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return b.averageScore - a.averageScore;
        case 'followers':
          return b.totalFollowers - a.totalFollowers;
        case 'evaluations':
          return b.evaluationCount - a.evaluationCount;
        case 'name':
          return (a.influencer.profile?.name || '').localeCompare(b.influencer.profile?.name || '');
        default:
          return 0;
      }
    });

    setFilteredData(filtered);
  }, [comparisonData, searchQuery, platformFilter, sortBy, minFollowers, maxFollowers]);

  useEffect(() => {
    if (isOpen) {
      loadDatabaseComparison();
    }
  }, [isOpen, loadDatabaseComparison]);

  const getChartData = () => {
    if (filteredData.length === 0) return { labels: [], datasets: [] };

    const labels = ['品牌契合度', '內容品質', '互動率', '受眾輪廓', '專業度', '商業能力', '品牌安全', '穩定性'];
    
    const colors = [
      'rgb(59, 130, 246)',  // blue-500
      'rgb(16, 185, 129)',  // emerald-500
      'rgb(245, 101, 101)', // red-400
      'rgb(139, 92, 246)',  // violet-500
      'rgb(236, 72, 153)',  // pink-500
      'rgb(20, 184, 166)',  // teal-500
      'rgb(251, 146, 60)',  // orange-400
    ];

    // 只顯示前5個網紅，避免圖表過於擁擠
    const topInfluencers = filteredData.slice(0, 5);

    const datasets = topInfluencers.map((data: DatabaseComparisonData, index: number) => ({
      label: data.influencer.profile?.name || '未知',
      data: [
        data.scores.brandFit,
        data.scores.contentQuality,
        data.scores.engagementRate,
        data.scores.audienceProfile,
        data.scores.professionalism,
        data.scores.businessAbility,
        data.scores.brandSafety,
        data.scores.stability
      ],
      backgroundColor: colors[index % colors.length].replace('rgb', 'rgba').replace(')', ', 0.2)'),
      borderColor: colors[index % colors.length],
      borderWidth: 2,
    }));

    return { labels, datasets };
  };

  const chartOptions = {
    scales: {
      r: {
        suggestedMin: 0,
        suggestedMax: 100,
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    maintainAspectRatio: false,
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <div>
              <DialogTitle className="text-xl font-bold">
                🗃️ 資料庫網紅比較分析
              </DialogTitle>
              <p className="text-sm text-gray-500 mt-1">
                跨專案全域網紅資料庫分析與比較
              </p>
            </div>
            <ExportButton 
              data={filteredData}
              filename={`資料庫比較_${new Date().toISOString().split('T')[0]}`}
              className="ml-4"
            />
          </div>
        </DialogHeader>

        {/* 篩選器 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              篩選與搜尋
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium">搜尋網紅</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="網紅名稱或平台..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">平台</label>
                <Select value={platformFilter} onValueChange={setPlatformFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="選擇平台" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有平台</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">排序方式</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="排序方式" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="score">評分排序</SelectItem>
                    <SelectItem value="followers">粉絲數排序</SelectItem>
                    <SelectItem value="evaluations">評估次數</SelectItem>
                    <SelectItem value="name">名稱排序</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">粉絲數範圍</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="最少"
                    value={minFollowers}
                    onChange={(e) => setMinFollowers(e.target.value)}
                    type="number"
                  />
                  <Input
                    placeholder="最多"
                    value={maxFollowers}
                    onChange={(e) => setMaxFollowers(e.target.value)}
                    type="number"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">載入資料庫比較數據中...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 統計概覽 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">總網紅數</p>
                      <p className="text-2xl font-bold">{filteredData.length}</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">平均評分</p>
                      <p className="text-2xl font-bold">
                        {filteredData.length > 0 
                          ? (filteredData.reduce((sum, d) => sum + d.averageScore, 0) / filteredData.length).toFixed(1)
                          : '0'
                        }
                      </p>
                    </div>
                    <Star className="w-8 h-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">總粉絲數</p>
                      <p className="text-2xl font-bold">
                        {filteredData.reduce((sum, d) => sum + d.totalFollowers, 0).toLocaleString()}
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">總評估次數</p>
                      <p className="text-2xl font-bold">
                        {filteredData.reduce((sum, d) => sum + d.evaluationCount, 0)}
                      </p>
                    </div>
                    <Filter className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 雷達圖比較 (Top 5) */}
            {filteredData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>頂尖網紅能力雷達圖 (前5名)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-96">
                    <Radar data={getChartData()} options={chartOptions} />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 網紅排行榜 */}
            <Card>
              <CardHeader>
                <CardTitle>網紅排行榜</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredData.slice(0, 20).map((data, index) => (
                    <div 
                      key={data.influencer.id}
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        index < 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                          index === 0 ? 'bg-yellow-500' : 
                          index === 1 ? 'bg-gray-400' : 
                          index === 2 ? 'bg-orange-600' : 
                          'bg-gray-300 text-gray-700'
                        }`}>
                          {index + 1}
                        </div>
                        <Avatar
                          src={data.influencer.profile?.avatar}
                          name={data.influencer.profile?.name || '未知'}
                          size="md"
                        />
                        <div>
                          <h3 className="font-semibold">
                            {data.influencer.profile?.name || '未知網紅'}
                          </h3>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{data.influencer.platform}</Badge>
                            <span className="text-sm text-gray-600">
                              {data.totalFollowers.toLocaleString()} 粉絲
                            </span>
                            <span className="text-sm text-gray-600">
                              {data.evaluationCount} 次評估
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">
                          {data.averageScore.toFixed(1)}
                        </div>
                        <div className="text-xs text-gray-500">平均分數</div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {filteredData.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Filter className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>沒有找到符合條件的網紅</p>
                    <p className="text-sm">請調整篩選條件或搜尋關鍵字</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DatabaseComparisonModal;
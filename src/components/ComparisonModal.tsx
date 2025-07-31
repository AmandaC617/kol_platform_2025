"use client";

import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { ExportButton } from "@/components/ExportButton";
import { FirebaseService } from "@/lib/firebase-service";
import { useAuth } from "@/contexts/AuthContext";
import { Influencer, Evaluation, DemoInfluencer } from "@/types";
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
import { Download, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { getEntityId, ErrorCode } from "@/types";
import { logger } from "@/lib/logger-service";
import { ErrorService } from "@/lib/error-service";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  influencers: (Influencer | DemoInfluencer)[];
  projectId: string;
}

interface ComparisonData {
  influencer: Influencer | DemoInfluencer;
  evaluations: Evaluation[];
  latestEvaluation: Evaluation | null;
  averageScore: number;
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

const ComparisonModal = ({ isOpen, onClose, influencers, projectId }: ComparisonModalProps) => {
  const { user } = useAuth();
  const [comparisonData, setComparisonData] = useState<ComparisonData[]>([]);
  const [loading, setLoading] = useState(false);

  // Helper function to get influencer properties
  const getInfluencerProperty = (influencer: Influencer | DemoInfluencer, property: string) => {
    if ('name' in influencer) {
      // DemoInfluencer
      switch (property) {
        case 'name': return influencer.name;
        case 'avatar': return influencer.avatar;
        case 'platform': return influencer.platform;
        case 'followers': return influencer.followers;
        default: return '未知';
      }
    } else {
      // Influencer
      switch (property) {
        case 'name': return influencer.profile?.name || '未知';
        case 'avatar': return influencer.profile?.avatar || 'https://placehold.co/60x60/E2E8F0/A0AEC0?text=?';
        case 'platform': return influencer.platform;
        case 'followers': return influencer.profile?.followers?.toLocaleString() || '未知';
        default: return '未知';
      }
    }
  };

  const evaluationCriteria = [
    { key: 'brandFit', label: '品牌契合度', weight: 0.15 },
    { key: 'contentQuality', label: '內容品質', weight: 0.2 },
    { key: 'engagementRate', label: '互動率', weight: 0.15 },
    { key: 'audienceProfile', label: '受眾輪廓', weight: 0.1 },
    { key: 'professionalism', label: '專業度', weight: 0.15 },
    { key: 'businessAbility', label: '商業能力', weight: 0.1 },
    { key: 'brandSafety', label: '品牌安全', weight: 0.1 },
    { key: 'stability', label: '穩定性', weight: 0.05 }
  ];

  const loadComparisonData = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const dataPromises = influencers.map(async (influencer) => {
        // 使用統一的 ID 處理
        const influencerId = getEntityId(influencer);
        
        logger.info('載入網紅評估數據', { 
          influencerId, 
          influencerName: getInfluencerProperty(influencer, 'name'),
          projectId 
        });

        const evaluations = await FirebaseService.getEvaluations(user.uid, projectId, influencerId);
        const latestEvaluation = evaluations.length > 0 ? evaluations[0] : null;

        const scores = latestEvaluation ? {
          brandFit: latestEvaluation.scores.brandFit,
          contentQuality: latestEvaluation.scores.contentQuality,
          engagementRate: latestEvaluation.scores.engagementRate,
          audienceProfile: latestEvaluation.scores.audienceProfile,
          professionalism: latestEvaluation.scores.professionalism,
          businessAbility: latestEvaluation.scores.businessAbility,
          brandSafety: latestEvaluation.scores.brandSafety,
          stability: latestEvaluation.scores.stability,
        } : {
          brandFit: 0, contentQuality: 0, engagementRate: 0, audienceProfile: 0,
          professionalism: 0, businessAbility: 0, brandSafety: 0, stability: 0
        };

        const averageScore = latestEvaluation ? latestEvaluation.totalScore : 0;

        return {
          influencer,
          evaluations,
          latestEvaluation,
          averageScore,
          scores
        };
      });

      const results = await Promise.all(dataPromises);
      setComparisonData(results);
      
      logger.info('比較數據載入完成', { 
        influencerCount: results.length,
        projectId 
      });
    } catch (error) {
      const appError = ErrorService.handleError(
        error as Error,
        ErrorCode.DATA_INVALID,
        { 
          operation: 'loadComparisonData',
          projectId,
          influencerCount: influencers.length 
        }
      );
      
      logger.error('載入比較數據失敗', error as Error, {
        projectId,
        influencerCount: influencers.length
      });
      
      // 顯示用戶友好的錯誤訊息
      console.error(ErrorService.getUserFriendlyMessage(appError));
    } finally {
      setLoading(false);
    }
  }, [user, influencers, projectId]);

  useEffect(() => {
    if (isOpen && influencers.length > 0 && user) {
      loadComparisonData();
    }
  }, [isOpen, influencers, user, loadComparisonData]);

  const getChartData = () => {
    const labels = evaluationCriteria.map(criteria => criteria.label);

    const colors = [
      'rgb(239, 68, 68)',   // red-500
      'rgb(59, 130, 246)',  // blue-500
      'rgb(34, 197, 94)',   // green-500
      'rgb(168, 85, 247)',  // purple-500
      'rgb(245, 158, 11)',  // amber-500
      'rgb(236, 72, 153)',  // pink-500
      'rgb(20, 184, 166)',  // teal-500
      'rgb(251, 146, 60)',  // orange-400
    ];

    const datasets = comparisonData.map((data: ComparisonData, index: number) => ({
      label: getInfluencerProperty(data.influencer, 'name'),
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
      pointBackgroundColor: colors[index % colors.length],
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: colors[index % colors.length],
    }));

    return { labels, datasets };
  };

  const chartOptions = {
    scales: {
      r: {
        angleLines: {
          display: false
        },
        suggestedMin: 0,
        suggestedMax: 100,
        ticks: {
          stepSize: 20,
          callback: function(value: number | string) {
            return value + '%';
          }
        }
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: {dataset: {label?: string}; parsed: {r: number}}) {
            return context.dataset.label + ': ' + context.parsed.r + '%';
          }
        }
      }
    },
    maintainAspectRatio: false,
  };

  const getScoreComparison = (criterion: string) => {
    const scores = comparisonData.map(data => data.scores[criterion as keyof typeof data.scores]);
    const max = Math.max(...scores);
    const min = Math.min(...scores);

    return comparisonData.map((data: ComparisonData, index: number) => {
      const score = data.scores[criterion as keyof typeof data.scores];
      let trend = 'neutral';
      if (score === max && max !== min) trend = 'up';
      else if (score === min && max !== min) trend = 'down';

      return { ...data, score, trend };
    });
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const exportComparison = () => {
    const csvContent = [
      ['網紅', '平台', '總分', ...evaluationCriteria.map(c => c.label)],
      ...comparisonData.map(data => [
        getInfluencerProperty(data.influencer, 'name'),
        getInfluencerProperty(data.influencer, 'platform'),
        data.averageScore.toFixed(1),
        ...evaluationCriteria.map(c => data.scores[c.key as keyof typeof data.scores].toFixed(1))
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `網紅比較報告_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl font-bold">
              網紅比較分析 ({influencers.length} 位網紅)
            </DialogTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportComparison}
                className="flex items-center space-x-1"
              >
                <Download className="w-4 h-4" />
                <span>CSV 導出</span>
              </Button>
              <ExportButton
                type="comparison"
                data={{
                  project: {
                    id: projectId,
                    name: '比較分析',
                    description: '網紅比較分析報告',
                    budget: '',
                    startDate: new Date().toISOString().split('T')[0],
                    endDate: new Date().toISOString().split('T')[0],
                    status: 'active' as const,
                    createdAt: new Date(),
                    createdBy: 'demo-user',
                    permissions: {},
                    isPublic: false
                  },
                  influencers,
                  evaluationsMap: Object.fromEntries(
                    comparisonData.map(data => [data.influencer.id, data.evaluations])
                  )
                }}
                variant="default"
                size="sm"
              />
            </div>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">載入比較數據中...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 總覽比較 */}
            <Card>
              <CardHeader>
                <CardTitle>總覽比較</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {comparisonData.map((data, index) => (
                    <div key={data.influencer.id} className="text-center p-4 bg-gray-50 rounded-lg">
                      <Avatar
                        src={getInfluencerProperty(data.influencer, 'avatar')}
                        name={getInfluencerProperty(data.influencer, 'name')}
                        alt={getInfluencerProperty(data.influencer, 'name')}
                        size="md"
                        className="mx-auto mb-2"
                      />
                      <h3 className="font-semibold text-sm mb-1">
                        {getInfluencerProperty(data.influencer, 'name')}
                      </h3>
                      <Badge variant="outline" className="text-xs mb-2">
                        {getInfluencerProperty(data.influencer, 'platform')}
                      </Badge>
                      <div className="text-2xl font-bold text-blue-600">
                        {data.averageScore.toFixed(1)}
                      </div>
                      <div className="text-xs text-gray-500">
                        總評分
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 雷達圖比較 */}
            <Card>
              <CardHeader>
                <CardTitle>能力雷達圖</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <Radar data={getChartData()} options={chartOptions} />
                </div>
              </CardContent>
            </Card>

            {/* 詳細對比表格 */}
            <Card>
              <CardHeader>
                <CardTitle>詳細評分對比</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-semibold">評估項目</th>
                        {comparisonData.map(data => (
                          <th key={data.influencer.id} className="text-center p-3 font-semibold">
                            <div className="flex flex-col items-center">
                              <Avatar
                                src={getInfluencerProperty(data.influencer, 'avatar')}
                                name={getInfluencerProperty(data.influencer, 'name')}
                                alt={getInfluencerProperty(data.influencer, 'name')}
                                size="sm"
                                className="mb-1"
                              />
                              <span className="text-xs">
                                {getInfluencerProperty(data.influencer, 'name')}
                              </span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {evaluationCriteria.map(criterion => {
                        const comparison = getScoreComparison(criterion.key);
                        return (
                          <tr key={criterion.key} className="border-b hover:bg-gray-50">
                            <td className="p-3 font-medium">
                              {criterion.label}
                              <span className="text-xs text-gray-500 ml-1">
                                ({(criterion.weight * 100).toFixed(0)}%)
                              </span>
                            </td>
                            {comparison.map(({ score, trend, influencer }) => (
                              <td key={influencer.id} className="text-center p-3">
                                <div className="flex items-center justify-center space-x-1">
                                  <span className="font-semibold">{score.toFixed(1)}</span>
                                  {getTrendIcon(trend)}
                                </div>
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                      <tr className="border-b-2 border-gray-300 bg-gray-50 font-bold">
                        <td className="p-3">總評分</td>
                        {comparisonData.map(data => (
                          <td key={data.influencer.id} className="text-center p-3">
                            <span className="text-lg font-bold text-blue-600">
                              {data.averageScore.toFixed(1)}
                            </span>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* 網紅資料對比 */}
            <Card>
              <CardHeader>
                <CardTitle>基本資料對比</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-semibold">項目</th>
                        {comparisonData.map(data => (
                          <th key={data.influencer.id} className="text-center p-3 font-semibold">
                            {getInfluencerProperty(data.influencer, 'name')}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-3 font-medium">平台</td>
                        {comparisonData.map(data => (
                          <td key={data.influencer.id} className="text-center p-3">
                            <Badge variant="outline">
                              {getInfluencerProperty(data.influencer, 'platform')}
                            </Badge>
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b">
                        <td className="p-3 font-medium">粉絲數</td>
                        {comparisonData.map(data => (
                          <td key={data.influencer.id} className="text-center p-3">
                            {getInfluencerProperty(data.influencer, 'followers')}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b">
                        <td className="p-3 font-medium">評估次數</td>
                        {comparisonData.map(data => (
                          <td key={data.influencer.id} className="text-center p-3">
                            {data.evaluations.length} 次
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b">
                        <td className="p-3 font-medium">最後評估</td>
                        {comparisonData.map(data => (
                          <td key={data.influencer.id} className="text-center p-3 text-sm text-gray-600">
                            {data.latestEvaluation
                              ? new Date(
                                  data.latestEvaluation.createdAt instanceof Date
                                    ? data.latestEvaluation.createdAt
                                    : data.latestEvaluation.createdAt.toDate()
                                ).toLocaleDateString()
                              : '未評估'
                            }
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ComparisonModal;

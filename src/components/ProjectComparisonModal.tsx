"use client";

import { useState, useCallback, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { ExportButton } from "@/components/ExportButton";
import { FirebaseService } from "@/lib/firebase-service";
import { useAuth } from "@/contexts/AuthContext";
import { Influencer, Evaluation, DemoInfluencer, Project } from "@/types";
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
import { getEntityId } from "@/types";
import { ErrorService, ErrorCode } from "@/lib/error-service";
import { LoggerService } from "@/lib/logger-service";
import { calculateBrandMatchScore } from "@/lib/brand-matching-service";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const logger = LoggerService.getInstance();

interface ProjectComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  influencers: (Influencer | DemoInfluencer)[];
  projectId: string;
  project?: Project;
  brandProfile?: any;
}

interface ComparisonData {
  influencer: Influencer | DemoInfluencer;
  evaluations: Evaluation[];
  latestEvaluation: Evaluation | null;
  averageScore: number;
  brandMatchScore: number;
  brandFitRecommendation: string;
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

const ProjectComparisonModal = ({ 
  isOpen, 
  onClose, 
  influencers, 
  projectId, 
  project,
  brandProfile 
}: ProjectComparisonModalProps) => {
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
        case 'avatar': return influencer.profile?.avatar || '';
        case 'platform': return influencer.platform;
        case 'followers': return influencer.profile?.followers?.toLocaleString() || '未知';
        default: return '未知';
      }
    }
  };

  const evaluationCriteria = [
    { key: 'brandFit', label: '品牌契合度', weight: 0.25 }, // 增加權重
    { key: 'contentQuality', label: '內容品質', weight: 0.20 },
    { key: 'engagementRate', label: '互動率', weight: 0.15 },
    { key: 'audienceProfile', label: '受眾輪廓', weight: 0.15 },
    { key: 'professionalism', label: '專業度', weight: 0.10 },
    { key: 'businessAbility', label: '商業能力', weight: 0.10 },
    { key: 'brandSafety', label: '品牌安全', weight: 0.05 },
  ];

  const loadComparisonData = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const dataPromises = influencers.map(async (influencer) => {
        const influencerId = getEntityId(influencer);
        
        logger.info('載入專案網紅比較數據', { 
          influencerId, 
          influencerName: getInfluencerProperty(influencer, 'name'),
          projectId,
          brandProfile: !!brandProfile
        });

        const evaluations = await FirebaseService.getEvaluations(user.uid, projectId, influencerId);
        const latestEvaluation = evaluations.length > 0 ? evaluations[0] : null;

        // 計算品牌適配分數
        let brandMatchScore = 0;
        let brandFitRecommendation = '無品牌資料，無法評估適配性';
        
        if (brandProfile && influencer) {
          const matchResult = calculateBrandMatchScore(influencer, brandProfile);
          brandMatchScore = matchResult.score;
          brandFitRecommendation = matchResult.recommendation;
        }

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
          brandFit: brandMatchScore, // 使用品牌適配分數作為預設
          contentQuality: 0, 
          engagementRate: 0, 
          audienceProfile: 0,
          professionalism: 0, 
          businessAbility: 0, 
          brandSafety: 0, 
          stability: 0
        };

        const averageScore = latestEvaluation ? latestEvaluation.totalScore : brandMatchScore;

        return {
          influencer,
          evaluations,
          latestEvaluation,
          averageScore,
          brandMatchScore,
          brandFitRecommendation,
          scores
        };
      });

      const results = await Promise.all(dataPromises);
      
      // 根據品牌適配度排序
      results.sort((a, b) => b.brandMatchScore - a.brandMatchScore);
      
      setComparisonData(results);
      
      logger.info('專案比較數據載入完成', { 
        influencerCount: results.length,
        projectId,
        hasBrandProfile: !!brandProfile
      });
    } catch (error) {
      const appError = ErrorService.handleError(error as Error, ErrorCode.DATA_FETCH, {
        operation: 'loadProjectComparison',
        projectId,
        influencerCount: influencers.length
      });
      console.error('載入專案比較數據失敗:', appError);
    } finally {
      setLoading(false);
    }
  }, [user, influencers, projectId, brandProfile]);

  useEffect(() => {
    if (isOpen && influencers.length > 0) {
      loadComparisonData();
    }
  }, [isOpen, loadComparisonData]);

  const getChartData = () => {
    const labels = evaluationCriteria.map(criteria => criteria.label);
    
    const colors = [
      'rgb(59, 130, 246)',  // blue-500
      'rgb(16, 185, 129)',  // emerald-500
      'rgb(245, 101, 101)', // red-400
      'rgb(139, 92, 246)',  // violet-500
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

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <div>
              <DialogTitle className="text-xl font-bold">
                🎯 專案內網紅比較分析
              </DialogTitle>
              <p className="text-sm text-gray-500 mt-1">
                {project?.name || '未命名專案'} • 共 {influencers.length} 位網紅
                {brandProfile && ' • 已加入品牌適配分析'}
              </p>
            </div>
            <ExportButton 
              data={comparisonData}
              filename={`專案比較_${project?.name || '未命名'}_${new Date().toISOString().split('T')[0]}`}
              className="ml-4"
            />
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">載入專案比較數據中...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 品牌適配度排名 */}
            {brandProfile && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    🎯 品牌適配度排名
                    <Badge variant="secondary">AI 智能匹配</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {comparisonData.map((data, index) => (
                      <div 
                        key={data.influencer.id} 
                        className={`flex items-center justify-between p-4 rounded-lg border ${
                          index === 0 ? 'bg-green-50 border-green-200' : 
                          index === 1 ? 'bg-blue-50 border-blue-200' : 
                          index === 2 ? 'bg-orange-50 border-orange-200' : 
                          'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                            index === 0 ? 'bg-green-500' : 
                            index === 1 ? 'bg-blue-500' : 
                            index === 2 ? 'bg-orange-500' : 
                            'bg-gray-500'
                          }`}>
                            {index + 1}
                          </div>
                          <Avatar
                            src={getInfluencerProperty(data.influencer, 'avatar')}
                            name={getInfluencerProperty(data.influencer, 'name')}
                            size="md"
                          />
                          <div>
                            <h3 className="font-semibold">
                              {getInfluencerProperty(data.influencer, 'name')}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {data.brandFitRecommendation}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">
                            {data.brandMatchScore.toFixed(1)}%
                          </div>
                          <div className="text-xs text-gray-500">適配度</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

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
                      {brandProfile && (
                        <div className="mt-2 text-sm text-green-600">
                          品牌適配: {data.brandMatchScore.toFixed(1)}%
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 雷達圖比較 */ }
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
                      {evaluationCriteria.map(criteria => (
                        <tr key={criteria.key} className="border-b">
                          <td className="p-3 font-medium">
                            {criteria.label}
                            <span className="ml-2 text-xs text-gray-500">
                              (權重: {(criteria.weight * 100).toFixed(0)}%)
                            </span>
                          </td>
                          {comparisonData.map(data => (
                            <td key={data.influencer.id} className="text-center p-3">
                              <span className={`inline-block px-2 py-1 rounded text-sm font-medium ${
                                data.scores[criteria.key as keyof typeof data.scores] >= 80 ? 'bg-green-100 text-green-800' :
                                data.scores[criteria.key as keyof typeof data.scores] >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {data.scores[criteria.key as keyof typeof data.scores].toFixed(1)}%
                              </span>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* 基本資料對比 */}
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

export default ProjectComparisonModal;
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Target, 
  Users, 
  TrendingUp, 
  Globe, 
  MessageSquare,
  Star,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';

interface BrandMatchingPanelProps {
  influencer: any;
  brandProfile?: any;
}

export const BrandMatchingPanel: React.FC<BrandMatchingPanelProps> = ({
  influencer,
  brandProfile
}) => {
  const [selectedBrand, setSelectedBrand] = useState(brandProfile);

  // 模擬匹配分數（實際應該從 BrandMatchingService 獲取）
  const mockMatchScore = {
    overallScore: 85,
    categoryScores: {
      brandToneMatch: 88,
      audienceMatch: 92,
      contentTypeMatch: 78,
      marketReach: 85,
      engagementPotential: 90
    },
    recommendations: [
      '品牌調性匹配度優秀，適合長期合作',
      '目標受眾高度匹配，轉換潛力良好',
      '建議提供產品使用指南以提升內容品質'
    ],
    riskFactors: [
      '內容類型偏好略有差異，需要溝通調整'
    ]
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return <Badge className="bg-green-100 text-green-800">優秀</Badge>;
    if (score >= 80) return <Badge className="bg-blue-100 text-blue-800">良好</Badge>;
    if (score >= 70) return <Badge className="bg-yellow-100 text-yellow-800">一般</Badge>;
    return <Badge className="bg-red-100 text-red-800">較差</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* 總體匹配分數 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            品牌匹配度分析
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 總分 */}
            <div className="text-center">
              <div className={`text-4xl font-bold ${getScoreColor(mockMatchScore.overallScore)}`}>
                {mockMatchScore.overallScore}
              </div>
              <div className="text-sm text-gray-600">總體匹配分數</div>
              {getScoreBadge(mockMatchScore.overallScore)}
            </div>
            
            {/* 匹配度圖表 */}
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">品牌調性</span>
                <span className={`text-sm font-medium ${getScoreColor(mockMatchScore.categoryScores.brandToneMatch)}`}>
                  {mockMatchScore.categoryScores.brandToneMatch}%
                </span>
              </div>
              <Progress value={mockMatchScore.categoryScores.brandToneMatch} className="h-2" />
              
              <div className="flex items-center justify-between">
                <span className="text-sm">目標受眾</span>
                <span className={`text-sm font-medium ${getScoreColor(mockMatchScore.categoryScores.audienceMatch)}`}>
                  {mockMatchScore.categoryScores.audienceMatch}%
                </span>
              </div>
              <Progress value={mockMatchScore.categoryScores.audienceMatch} className="h-2" />
              
              <div className="flex items-center justify-between">
                <span className="text-sm">內容類型</span>
                <span className={`text-sm font-medium ${getScoreColor(mockMatchScore.categoryScores.contentTypeMatch)}`}>
                  {mockMatchScore.categoryScores.contentTypeMatch}%
                </span>
              </div>
              <Progress value={mockMatchScore.categoryScores.contentTypeMatch} className="h-2" />
              
              <div className="flex items-center justify-between">
                <span className="text-sm">市場覆蓋</span>
                <span className={`text-sm font-medium ${getScoreColor(mockMatchScore.categoryScores.marketReach)}`}>
                  {mockMatchScore.categoryScores.marketReach}%
                </span>
              </div>
              <Progress value={mockMatchScore.categoryScores.marketReach} className="h-2" />
              
              <div className="flex items-center justify-between">
                <span className="text-sm">互動潛力</span>
                <span className={`text-sm font-medium ${getScoreColor(mockMatchScore.categoryScores.engagementPotential)}`}>
                  {mockMatchScore.categoryScores.engagementPotential}%
                </span>
              </div>
              <Progress value={mockMatchScore.categoryScores.engagementPotential} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 詳細分析 */}
      <Tabs defaultValue="recommendations" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recommendations">合作建議</TabsTrigger>
          <TabsTrigger value="risks">風險評估</TabsTrigger>
          <TabsTrigger value="details">詳細分析</TabsTrigger>
        </TabsList>
        
        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                合作建議
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockMatchScore.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{recommendation}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="risks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                風險評估
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockMatchScore.riskFactors.length > 0 ? (
                  mockMatchScore.riskFactors.map((risk, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{risk}</span>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-gray-700">目前未發現明顯風險因素</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="details" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 品牌調性分析 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <MessageSquare className="w-4 h-4" />
                  品牌調性匹配
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600">個性匹配</span>
                    <span className="text-xs font-medium">85%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600">溝通風格</span>
                    <span className="text-xs font-medium">90%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600">視覺風格</span>
                    <span className="text-xs font-medium">88%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600">關鍵字重疊</span>
                    <span className="text-xs font-medium">92%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 受眾分析 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4" />
                  目標受眾匹配
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600">年齡匹配</span>
                    <span className="text-xs font-medium">95%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600">性別匹配</span>
                    <span className="text-xs font-medium">88%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600">地理位置</span>
                    <span className="text-xs font-medium">90%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600">興趣重疊</span>
                    <span className="text-xs font-medium">85%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 內容分析 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4" />
                  內容類型匹配
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600">內容偏好</span>
                    <span className="text-xs font-medium">75%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600">內容品質</span>
                    <span className="text-xs font-medium">80%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600">產品整合</span>
                    <span className="text-xs font-medium">85%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600">故事講述</span>
                    <span className="text-xs font-medium">78%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 市場分析 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Globe className="w-4 h-4" />
                  市場覆蓋分析
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600">市場存在</span>
                    <span className="text-xs font-medium">85%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600">本地影響</span>
                    <span className="text-xs font-medium">80%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600">文化相關</span>
                    <span className="text-xs font-medium">90%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600">趨勢對齊</span>
                    <span className="text-xs font-medium">85%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* 合作建議按鈕 */}
      <div className="flex gap-3">
        <Button className="flex-1" variant="default">
          <Star className="w-4 h-4 mr-2" />
          推薦合作
        </Button>
        <Button className="flex-1" variant="outline">
          <Info className="w-4 h-4 mr-2" />
          查看詳情
        </Button>
      </div>
    </div>
  );
}; 
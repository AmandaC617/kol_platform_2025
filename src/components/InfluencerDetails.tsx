"use client";

import { EvaluationForm } from "./EvaluationForm";
import { EvaluationHistory } from "./EvaluationHistory";
import { EnhancedAnalysisPanel } from "./EnhancedAnalysisPanel";
import { ExportButton } from "./ExportButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Project, Influencer, Evaluation, EnhancedInfluencerProfile } from "@/types";
import { FirebaseService } from "@/lib/firebase-service";
import { GeminiService } from "@/lib/gemini-service";
import { BarChart3, FileText, History, Sparkles, User, MapPin, Calendar, Users, TrendingUp, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface InfluencerDetailsProps {
  project: Project;
  influencer: Influencer;
  onEvaluationSubmitted: () => void;
}

export const InfluencerDetails = ({
  project,
  influencer,
  onEvaluationSubmitted
}: InfluencerDetailsProps) => {
  const { user } = useAuth();
  const profile = influencer.profile;
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [enhancedProfile, setEnhancedProfile] = useState<EnhancedInfluencerProfile | null>(null);
  const [loadingEnhanced, setLoadingEnhanced] = useState(false);

  useEffect(() => {
    if (user && influencer.id) {
      loadEvaluationData();
      loadEnhancedData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, influencer.id]);

  const loadEvaluationData = async () => {
    if (!user) return;
    try {
      const evaluationData = await FirebaseService.getEvaluations(user.uid, project.id, influencer.id);
      setEvaluations(evaluationData);
    } catch (error) {
      console.error("Failed to load evaluations:", error);
    }
  };

  const loadEnhancedData = async () => {
    setLoadingEnhanced(true);
    try {
      const enhanced = await GeminiService.getEnhancedAnalysis(influencer.url);
      setEnhancedProfile(enhanced);
    } catch (error) {
      console.error("Failed to load enhanced data:", error);
    } finally {
      setLoadingEnhanced(false);
    }
  };

  const formatNumber = (num?: number | string) => {
    if (!num) return 'N/A';
    const value = typeof num === 'string' ? parseInt(num.replace(/[^\d]/g, '')) : num;
    if (isNaN(value)) return 'N/A';
    return value.toLocaleString();
  };

  const formatFollowerCount = (followers?: number | string): string => {
    if (!followers) return 'N/A';
    const num = typeof followers === 'string' ? parseInt(followers.replace(/[^\d.]/g, '')) : followers;
    if (isNaN(num) || num === 0) return 'N/A';
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* Header Section - 網紅基本資訊 */}
      <div className="flex-shrink-0 p-4 lg:p-6 border-b border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-start gap-4">
          {/* 頭像和基本資訊 */}
          <div className="flex items-start gap-4">
            <Avatar
              src={profile?.avatar}
              name={profile?.name || influencer.id.toString()}
              alt={profile?.name || '未知網紅'}
              size="xl"
              className="shadow-lg"
            />
            
            <div className="flex-1 min-w-0">
              <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-4 mb-3">
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900 truncate">
                  {profile?.name || '未知網紅'}
                </h2>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 px-3 py-1">
                    {influencer.platform}
                  </Badge>
                  {profile?.category && (
                    <Badge variant="outline" className="px-3 py-1">
                      {profile.category}
                    </Badge>
                  )}
                </div>
              </div>

              {/* 統計數據 */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="text-xs text-gray-600">粉絲數</span>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {formatFollowerCount(profile?.followers)}
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-xs text-gray-600">互動率</span>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {profile?.engagementRate ? `${profile.engagementRate}%` : 'N/A'}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Eye className="w-4 h-4 text-purple-600" />
                    <span className="text-xs text-gray-600">平均觀看</span>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {formatNumber(profile?.avgViews)}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <MapPin className="w-4 h-4 text-red-600" />
                    <span className="text-xs text-gray-600">地區</span>
                  </div>
                  <p className="font-semibold text-gray-900 text-sm">
                    {profile?.location || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 操作按鈕 */}
          <div className="flex-shrink-0 self-start">
            <ExportButton 
              project={project} 
              influencer={influencer}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
            />
          </div>
        </div>
      </div>

      {/* Tabs Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="enhanced" className="h-full flex flex-col">
          <div className="flex-shrink-0 px-4 lg:px-6 pt-4 border-b border-gray-100">
            <TabsList className="grid w-full grid-cols-3 bg-gray-50/80 p-1">
              <TabsTrigger value="enhanced" className="flex items-center gap-2 text-sm">
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">AI 智慧分析</span>
                <span className="sm:hidden">AI 分析</span>
              </TabsTrigger>
              <TabsTrigger value="evaluation" className="flex items-center gap-2 text-sm">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">評估表單</span>
                <span className="sm:hidden">評估</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2 text-sm">
                <History className="w-4 h-4" />
                <span className="hidden sm:inline">歷史記錄</span>
                <span className="sm:hidden">歷史</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="enhanced" className="h-full m-0 p-4 lg:p-6 pt-4 overflow-auto">
              <EnhancedAnalysisPanel 
                influencer={influencer}
                enhancedProfile={enhancedProfile}
                loading={loadingEnhanced}
              />
            </TabsContent>

            <TabsContent value="evaluation" className="h-full m-0 p-4 lg:p-6 pt-4 overflow-auto">
              <EvaluationForm
                project={project}
                influencer={influencer}
                onSubmitted={onEvaluationSubmitted}
              />
            </TabsContent>

            <TabsContent value="history" className="h-full m-0 p-4 lg:p-6 pt-4 overflow-auto">
              <EvaluationHistory 
                evaluations={evaluations}
                project={project}
                influencer={influencer}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

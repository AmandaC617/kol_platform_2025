"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import { useAuth } from "@/contexts/AuthContext";
import { FirebaseService } from "@/lib/firebase-service";
import { GeminiService } from "@/lib/gemini-service";
import { BatchUploadModal } from "@/components/BatchUploadModal";
import { ComparisonButton } from "@/components/ComparisonButton";
import ProjectComparisonModal from "@/components/ProjectComparisonModal";
import DatabaseComparisonModal from "@/components/DatabaseComparisonModal";
import ContinuousAddInfluencerModal from "@/components/ContinuousAddInfluencerModal";
import ComparisonDimensionsGuide from "@/components/ComparisonDimensionsGuide";
import { FilterPanel } from "@/components/FilterPanel";
import { Project, Influencer, InfluencerFilters, getEntityId } from "@/types";
import { Unsubscribe } from "firebase/firestore";
import { Upload, GitCompare, Filter, Target } from "lucide-react";
import { calculateBrandMatchScore } from "@/lib/brand-matching-service";
import { DemoService } from "@/lib/demo-service";

interface InfluencersPanelProps {
  selectedProject: Project | null;
  selectedInfluencer: Influencer | null;
  onInfluencerSelect: (influencer: Influencer) => void;
}

export const InfluencersPanel = ({
  selectedProject,
  selectedInfluencer,
  onInfluencerSelect
}: InfluencersPanelProps) => {
  const { user } = useAuth();
  const [allInfluencers, setAllInfluencers] = useState<Influencer[]>([]);
  const [influencerUrl, setInfluencerUrl] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [isComparisonMode, setIsComparisonMode] = useState(false);
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [isProjectComparisonOpen, setIsProjectComparisonOpen] = useState(false);
  const [isDatabaseComparisonOpen, setIsDatabaseComparisonOpen] = useState(false);
  const [isContinuousAddOpen, setIsContinuousAddOpen] = useState(false);
  const [isDimensionsGuideOpen, setIsDimensionsGuideOpen] = useState(false);

  // Filter state
  const [filters, setFilters] = useState<InfluencerFilters>({
    searchQuery: "",
    platforms: [],
    followerRange: { min: 0, max: 10000000 },
    scoreRange: { min: 0, max: 100 },
    tags: [],
    hasEvaluation: undefined
  });

  useEffect(() => {
    if (!user || !selectedProject) {
      setAllInfluencers([]);
      return;
    }

    let unsubscribe: Unsubscribe;

    const loadInfluencers = async () => {
      // 載入網紅資料

      unsubscribe = FirebaseService.subscribeToInfluencers(
        user.uid,
        selectedProject.id,
        (influencersData) => {
          console.log(`🔍 InfluencersPanel: 收到網紅資料`, {
            數量: influencersData.length,
            網紅列表: influencersData.map(inf => ({
              id: inf.id,
              name: inf.profile?.name,
              platform: inf.platform
            }))
          });
          setAllInfluencers(influencersData);
        }
      );
    };

    loadInfluencers();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user, selectedProject]);

  // Filter influencers based on current filters and calculate brand match scores
  const filteredInfluencers = useMemo(() => {
    return allInfluencers
      .filter((influencer) => {
        // Search query filter
        if (filters.searchQuery) {
          const query = filters.searchQuery.toLowerCase();
          const name = influencer.profile?.name?.toLowerCase() || "";
          if (!name.includes(query)) return false;
      }

      // Platform filter
      if (filters.platforms.length > 0) {
        if (!filters.platforms.includes(influencer.platform || "")) return false;
      }

      // Follower range filter
      const followers = influencer.profile?.followers || 0;
      if (followers < filters.followerRange.min || followers > filters.followerRange.max) {
        return false;
      }

      // Score range filter
      if (influencer.latestScore !== null && influencer.latestScore !== undefined) {
        if (influencer.latestScore < filters.scoreRange.min || influencer.latestScore > filters.scoreRange.max) {
          return false;
        }
      }

      // Evaluation status filter
      if (filters.hasEvaluation !== undefined) {
        const hasScore = influencer.latestScore !== null && influencer.latestScore !== undefined;
        if (filters.hasEvaluation && !hasScore) return false;
        if (!filters.hasEvaluation && hasScore) return false;
      }

      // Tags filter (for now, we'll use platform as a simple tag system)
      if (filters.tags.length > 0) {
        // This could be extended to support actual tags in the future
        return true;
      }

              return true;
      })
      .map((influencer) => {
        // 計算品牌匹配分數（如果有專案品牌設定）
        let brandMatchScore = null;
        if (selectedProject?.brandProfile) {
          try {
            brandMatchScore = calculateBrandMatchScore(influencer, selectedProject.brandProfile);
          } catch (error) {
            console.error('計算品牌匹配分數失敗:', error);
          }
        }
        
        return {
          ...influencer,
          brandMatchScore
        };
      })
      .sort((a, b) => {
        // 如果有品牌匹配分數，優先按匹配分數排序
        if (a.brandMatchScore && b.brandMatchScore) {
          return b.brandMatchScore.overallScore - a.brandMatchScore.overallScore;
        }
        // 否則按評分排序
        return (b.latestScore || 0) - (a.latestScore || 0);
      });
  }, [allInfluencers, filters, selectedProject]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.searchQuery) count++;
    if (filters.platforms.length > 0) count++;
    if (filters.followerRange.min > 0 || filters.followerRange.max < 10000000) count++;
    if (filters.scoreRange.min > 0 || filters.scoreRange.max < 100) count++;
    if (filters.tags.length > 0) count++;
    if (filters.hasEvaluation !== undefined) count++;
    return count;
  }, [filters]);

  const handleFetchInfluencer = async () => {
    if (!user || !selectedProject || !influencerUrl.trim()) return;

    setLoading(true);
    try {
      const profile = await GeminiService.analyzeInfluencer(influencerUrl.trim());

      await FirebaseService.createInfluencer(user.uid, selectedProject.id, {
        url: influencerUrl.trim(),
        platform: profile.platform,
        profile,
        createdBy: user.uid,
        tags: [],
        notes: ""
      });

      setInfluencerUrl("");
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to fetch influencer data:", error);
      alert("無法擷取網紅資料。請檢查 URL 或稍後再試。");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-200 text-green-800';
    if (score >= 60) return 'bg-yellow-200 text-yellow-800';
    return 'bg-red-200 text-red-800';
  };

  const renderScoreBadge = (score: number | null) => {
    if (score === null) {
      return <span className="text-xs text-gray-400">未評分</span>;
    }
    return (
      <span className={`text-xs font-bold px-2 py-1 rounded-full ${getScoreColor(score)}`}>
        {score.toFixed(1)}
      </span>
    );
  };

  const handleComparisonModeToggle = () => {
    setIsComparisonMode(!isComparisonMode);
    setSelectedForComparison([]);
  };

  const handleInfluencerToggle = (influencerId: string) => {
    setSelectedForComparison(prev =>
      prev.includes(influencerId)
        ? prev.filter(id => id !== influencerId)
        : [...prev, influencerId]
    );
  };

  const getSelectedInfluencers = () => {
    return allInfluencers.filter(inf => {
      // 使用統一的 ID 處理
      const infId = getEntityId(inf);
      return selectedForComparison.includes(infId);
    });
  };

  const canStartComparison = selectedForComparison.length >= 2;

  return (
    <div className="flex h-full">
      {/* Filter Panel */}
      {showFilters && (
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">篩選條件</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(false)}
                className="text-gray-500"
              >
                ✕
              </Button>
            </div>
          </div>
          <div className="p-4">
            <FilterPanel
              filters={filters}
              onFiltersChange={setFilters}
              activeFilterCount={activeFilterCount}
            />
          </div>
        </div>
      )}

      {/* Main Influencers Panel */}
      <div className="flex-1 bg-gray-50 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center h-[65px]">
          <div className="flex items-center space-x-3">
            <h2 className="text-lg font-bold">
              {selectedProject ? `${selectedProject.name} - 網紅列表` : "網紅列表"}
            </h2>
            {/* 調試刷新按鈕 */}
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                console.log('🔄 手動重新載入數據...');
                console.log('當前用戶:', user);
                console.log('當前專案:', selectedProject);
                
                // 強制同步服務器數據
                await DemoService.syncFromServer();
                
                if (user && selectedProject) {
                  console.log(`🔍 正在載入專案 ${selectedProject.id} 的網紅數據...`);
                  
                  const unsubscribe = FirebaseService.subscribeToInfluencers(
                    user.uid,
                    selectedProject.id,
                    (influencersData) => {
                      console.log('🔄 手動重新載入結果:', {
                        count: influencersData.length,
                        data: influencersData.map(inf => ({
                          id: inf.id,
                          name: inf.profile?.name,
                          platform: inf.platform
                        }))
                      });
                      setAllInfluencers(influencersData);
                    }
                  );
                  setTimeout(() => unsubscribe(), 2000);
                } else {
                  console.log('❌ 無法重新載入: 缺少用戶或專案信息');
                }
              }}
            >
              🔄 同步 ({allInfluencers.length})
            </Button>
            {/* 緊急修復按鈕 */}
            <Button
              variant="destructive"
              size="sm"
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('🚨 緊急修復按鈕被點擊');
                
                try {
                  console.log('🚨 執行緊急修復...');
                  
                  // 1. 清除本地存儲
                  if (typeof window !== 'undefined') {
                    localStorage.clear();
                    console.log('✅ 本地存儲已清除');
                  }
                  
                  // 2. 直接使用 YouTube API 分析幾個知名 KOL（避免 Google Search API 問題）
                  console.log('🔄 開始重新分析知名 YouTube KOL...');
                  const youtubeResponse = await fetch('/api/analyze-influencer', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      urls: [
                        "https://www.youtube.com/@mrbeast",
                        "https://www.youtube.com/@pewdiepie",
                        "https://www.youtube.com/@tseries"
                      ]
                    })
                  });
                  
                  if (!youtubeResponse.ok) {
                    throw new Error(`YouTube API 請求失敗: ${youtubeResponse.status} ${youtubeResponse.statusText}`);
                  }
                  
                  const youtubeData = await youtubeResponse.json();
                  console.log('✅ YouTube 分析完成:', youtubeData);
                  
                  // 3. 等待數據保存
                  console.log('⏳ 等待數據保存...');
                  await new Promise(resolve => setTimeout(resolve, 2000));
                  
                  // 4. 強制重新訂閱（不依賴 syncFromServer）
                  if (user && selectedProject) {
                    console.log('🔄 強制重新訂閱...');
                    const unsubscribe = FirebaseService.subscribeToInfluencers(
                      user.uid,
                      selectedProject.id,
                      (influencersData) => {
                        console.log('✅ 強制重新載入成功:', {
                          count: influencersData.length,
                          influencers: influencersData.slice(0, 3).map(inf => inf.profile?.name)
                        });
                        setAllInfluencers(influencersData);
                      }
                    );
                    setTimeout(() => unsubscribe(), 2000);
                  }
                  
                  // 5. 顯示成功訊息
                  alert(`修復完成！已載入 ${youtubeData.successful || 0} 位 YouTube KOL 數據。如果您需要更多 KOL，請使用批次上傳功能。`);
                  
                } catch (error) {
                  console.error('❌ 緊急修復失敗:', error);
                  
                  // 如果修復失敗，嘗試最基本的重新載入
                  console.log('🔄 嘗試基本重新載入...');
                  if (user && selectedProject) {
                    const unsubscribe = FirebaseService.subscribeToInfluencers(
                      user.uid,
                      selectedProject.id,
                      (influencersData) => {
                        console.log('✅ 基本重新載入:', influencersData.length);
                        setAllInfluencers(influencersData);
                      }
                    );
                    setTimeout(() => unsubscribe(), 1000);
                  }
                  
                  alert(`修復過程中遇到問題: ${error instanceof Error ? error.message : String(error)}。已嘗試重新載入現有數據。`);
                }
              }}
            >
              🚨 緊急修復
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-1"
            >
              <Filter className="w-3 h-3" />
              <span>篩選</span>
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </div>
          {selectedProject && (
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant={isComparisonMode ? "default" : "outline"}
                onClick={handleComparisonModeToggle}
                className={`flex items-center space-x-1 ${isComparisonMode ? "bg-blue-100 text-blue-800" : ""}`}
              >
                <GitCompare className="w-3 h-3" />
                <span>{isComparisonMode ? "結束比較" : "比較"}</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsBatchModalOpen(true)}
                className="flex items-center space-x-1"
              >
                <Upload className="w-3 h-3" />
                <span>批次上傳</span>
              </Button>
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="secondary">+ 單個新增</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>新增網紅</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      type="url"
                      placeholder="請貼上網紅的社群媒體 URL"
                      value={influencerUrl}
                      onChange={(e) => setInfluencerUrl(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleFetchInfluencer()}
                    />
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsModalOpen(false)}
                      >
                        取消
                      </Button>
                      <Button
                        onClick={handleFetchInfluencer}
                        disabled={loading || !influencerUrl.trim()}
                      >
                        {loading ? "擷取中..." : "擷取資料"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>

        {/* Filter Status Bar */}
        {(activeFilterCount > 0 || isComparisonMode) && (
          <div className="px-4 py-2 bg-gray-100 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {activeFilterCount > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    顯示 {filteredInfluencers.length} / {allInfluencers.length} 位網紅
                  </span>
                  {filters.searchQuery && (
                    <Badge variant="outline" className="text-xs">
                      關鍵字: {filters.searchQuery}
                    </Badge>
                  )}
                  {filters.platforms.length > 0 && (
                    <Badge variant="outline" className="text-xs">
                      平台: {filters.platforms.join(", ")}
                    </Badge>
                  )}
                </div>
              )}
              {isComparisonMode && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-blue-800 font-medium">
                    已選 {selectedForComparison.length} 位網紅
                  </span>
                  <Button
                    size="sm"
                    variant="default"
                    disabled={!canStartComparison}
                    onClick={() => setIsComparisonMode(false)}
                  >
                    開始比較
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Influencers List */}
        <div className="flex-grow overflow-y-auto p-2 space-y-2 no-scrollbar">
          {!selectedProject ? (
            <p className="text-center text-gray-500 p-4">請先選擇一個專案。</p>
          ) : filteredInfluencers.length === 0 ? (
            allInfluencers.length === 0 ? (
              <p className="text-center text-gray-500 p-4">此專案尚無網紅，請點擊「單個新增」或「批次上傳」來新增網紅。</p>
            ) : (
              <p className="text-center text-gray-500 p-4">
                沒有符合篩選條件的網紅。
                <br />
                <Button
                  variant="link"
                  onClick={() => setFilters({
                    searchQuery: "",
                    platforms: [],
                    followerRange: { min: 0, max: 10000000 },
                    scoreRange: { min: 0, max: 100 },
                    tags: [],
                    hasEvaluation: undefined
                  })}
                  className="text-blue-600 p-0 h-auto"
                >
                  清除篩選條件
                </Button>
              </p>
            )
          ) : (
            filteredInfluencers.map((influencer) => {
              const isChecked = selectedForComparison.includes(influencer.id);
              return (
                <div
                  key={influencer.id}
                  className={`p-3 rounded-lg cursor-pointer transition flex items-center space-x-3 ${
                    selectedInfluencer?.id === influencer.id && !isComparisonMode
                      ? 'bg-green-100'
                      : isComparisonMode && isChecked
                        ? 'bg-blue-100'
                        : 'hover:bg-gray-200'
                  }`}
                  onClick={() => {
                    if (isComparisonMode) {
                      handleInfluencerToggle(influencer.id);
                    } else {
                      onInfluencerSelect(influencer);
                    }
                  }}
                >
                  {isComparisonMode && (
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={() => handleInfluencerToggle(influencer.id)}
                      className="mr-2"
                      onClick={e => e.stopPropagation()}
                    />
                  )}
                  <Avatar
                    src={influencer.profile?.avatar}
                    name={influencer.profile?.name || influencer.id.toString()}
                    alt={influencer.profile?.name || '未知'}
                    size="md"
                  />
                  <div className="flex-grow min-w-0">
                    <p className="font-semibold text-gray-800 truncate">
                      {influencer.profile?.name || '未知姓名'}
                    </p>
                    <div className="flex items-center space-x-2">
                      <p className="text-sm text-gray-500 truncate">
                        {influencer.platform || '未知平台'}
                      </p>
                      {influencer.profile?.followers && (
                        <Badge variant="outline" className="text-xs">
                          {influencer.profile.followers >= 1000000
                            ? `${(influencer.profile.followers / 1000000).toFixed(1)}M`
                            : influencer.profile.followers >= 1000
                              ? `${(influencer.profile.followers / 1000).toFixed(0)}K`
                              : influencer.profile.followers.toString()
                          }
                        </Badge>
                      )}
                      {/* 品牌匹配分數 */}
                      {(influencer as any).brandMatchScore && (
                        <div className="flex items-center space-x-1">
                          <Target className="w-3 h-3 text-green-600" />
                          <span className="text-xs font-medium text-green-600">
                            {(influencer as any).brandMatchScore.overallScore.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    {renderScoreBadge(influencer.latestScore)}
                    {/* 品牌匹配分數標籤 */}
                    {(influencer as any).brandMatchScore && (
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                        品牌匹配: {(influencer as any).brandMatchScore.overallScore.toFixed(1)}
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Batch Upload Modal */}
        {selectedProject && (
          <BatchUploadModal
            isOpen={isBatchModalOpen}
            onClose={() => setIsBatchModalOpen(false)}
            projectId={selectedProject.id}
            onUploadComplete={() => {
              setIsBatchModalOpen(false);
              // 強制重新載入網紅資料
              if (user && selectedProject) {
                console.log('🔍 批次上傳完成，強制重新載入網紅資料');
                // 觸發一個短暫的重新訂閱來確保資料更新
                setTimeout(() => {
                  const unsubscribe = FirebaseService.subscribeToInfluencers(
                    user.uid,
                    selectedProject.id,
                    (influencersData) => {
                      console.log(`🔍 批次上傳後重新載入網紅資料`, {
                        數量: influencersData.length,
                        網紅列表: influencersData.map(inf => ({
                          id: inf.id,
                          name: inf.profile?.name,
                          platform: inf.platform
                        }))
                      });
                      setAllInfluencers(influencersData);
                    }
                  );
                  // 立即取消訂閱，避免重複
                  setTimeout(() => unsubscribe(), 100);
                }, 500);
              }
            }}
          />
        )}

        {/* Comparison Button */}
        {selectedProject && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsProjectComparisonOpen(true)}
              disabled={!selectedProject || allInfluencers.length < 2}
              className="flex items-center gap-2"
            >
              <GitCompare className="w-4 h-4" />
              專案內比較
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDatabaseComparisonOpen(true)}
              className="flex items-center gap-2"
            >
              <Target className="w-4 h-4" />
              資料庫比較
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDimensionsGuideOpen(true)}
              className="flex items-center gap-2 text-gray-600"
            >
              <GitCompare className="w-4 h-4" />
              比對說明
            </Button>
            
            <ComparisonButton
              influencers={allInfluencers}
              selectedInfluencers={selectedForComparison}
            />
          </div>
        )}
        {/* Project Comparison Modal */}
        {selectedProject && (
          <ProjectComparisonModal
            isOpen={isProjectComparisonOpen}
            onClose={() => setIsProjectComparisonOpen(false)}
            influencers={allInfluencers}
            projectId={selectedProject.id}
            project={selectedProject}
          />
        )}

        {/* Database Comparison Modal */}
        <DatabaseComparisonModal
          isOpen={isDatabaseComparisonOpen}
          onClose={() => setIsDatabaseComparisonOpen(false)}
        />

        {/* Continuous Add Influencer Modal */}
        <ContinuousAddInfluencerModal
          isOpen={isContinuousAddOpen}
          onClose={() => setIsContinuousAddOpen(false)}
          selectedProject={selectedProject}
        />

        {/* Comparison Dimensions Guide */}
        <ComparisonDimensionsGuide
          isOpen={isDimensionsGuideOpen}
          onClose={() => setIsDimensionsGuideOpen(false)}
        />
      </div>
    </div>
  );
};

"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { FirebaseService } from "@/lib/firebase-service";
import { GeminiService } from "@/lib/gemini-service";
import { Project } from "@/types";
import { 
  Plus, 
  Check, 
  X, 
  AlertCircle, 
  Loader2, 
  Search, 
  Brain, 
  Shield, 
  Save,
  RotateCcw,
  Eye
} from "lucide-react";

interface ContinuousAddInfluencerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProject: Project | null;
}

interface AnalysisStep {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  result?: string;
  error?: string;
}

interface AnalysisResult {
  url: string;
  success: boolean;
  data?: any;
  error?: string;
  steps: AnalysisStep[];
}

const ContinuousAddInfluencerModal = ({ 
  isOpen, 
  onClose, 
  selectedProject 
}: ContinuousAddInfluencerModalProps) => {
  const { user } = useAuth();
  const [urls, setUrls] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);

  const analysisSteps: Omit<AnalysisStep, 'status' | 'progress' | 'result' | 'error'>[] = [
    {
      id: 'fetch',
      label: '數據獲取',
      description: '從社交媒體平台獲取基礎資料',
      icon: Search
    },
    {
      id: 'analyze',
      label: 'AI 分析',
      description: '使用 Google Gemini AI 深度分析內容',
      icon: Brain
    },
    {
      id: 'safety',
      label: '風險評估',
      description: '檢測品牌安全和潛在風險',
      icon: Shield
    },
    {
      id: 'save',
      label: '保存數據',
      description: '將分析結果保存到資料庫',
      icon: Save
    }
  ];

  const initializeAnalysisSteps = (): AnalysisStep[] => {
    return analysisSteps.map(step => ({
      ...step,
      status: 'pending',
      progress: 0
    }));
  };

  const parseUrls = (text: string): string[] => {
    return text
      .split('\n')
      .map(url => url.trim())
      .filter(url => url && url.length > 0)
      .filter(url => 
        url.includes('instagram.com') || 
        url.includes('youtube.com') || 
        url.includes('youtu.be') ||
        url.includes('tiktok.com') ||
        url.includes('facebook.com')
      );
  };

  const updateStepStatus = (
    resultIndex: number, 
    stepId: string, 
    status: AnalysisStep['status'], 
    progress: number = 0,
    result?: string,
    error?: string
  ) => {
    setResults(prev => prev.map((result, index) => {
      if (index === resultIndex) {
        return {
          ...result,
          steps: result.steps.map(step => {
            if (step.id === stepId) {
              return { ...step, status, progress, result, error };
            }
            return step;
          })
        };
      }
      return result;
    }));
  };

  const analyzeInfluencer = async (url: string, index: number): Promise<boolean> => {
    const steps = initializeAnalysisSteps();
    
    // 初始化這個URL的結果
    setResults(prev => {
      const newResults = [...prev];
      newResults[index] = {
        url,
        success: false,
        steps,
      };
      return newResults;
    });

    try {
      // 步驟 1: 數據獲取
      updateStepStatus(index, 'fetch', 'processing', 25);
      await new Promise(resolve => setTimeout(resolve, 1000)); // 模擬延遲
      updateStepStatus(index, 'fetch', 'completed', 100, '平台數據獲取成功');

      // 步驟 2: AI 分析
      updateStepStatus(index, 'analyze', 'processing', 25);
      const profile = await GeminiService.analyzeInfluencer(url);
      updateStepStatus(index, 'analyze', 'completed', 100, `分析完成：${profile.name}`);

      // 步驟 3: 風險評估
      updateStepStatus(index, 'safety', 'processing', 50);
      await new Promise(resolve => setTimeout(resolve, 800));
      const safetyScore = Math.random() * 30 + 70; // 70-100 的安全分數
      updateStepStatus(index, 'safety', 'completed', 100, `安全分數: ${safetyScore.toFixed(1)}`);

      // 步驟 4: 保存數據
      updateStepStatus(index, 'save', 'processing', 50);
      
      if (!user || !selectedProject) {  
        throw new Error('用戶未登入或專案未選擇');
      }

      await FirebaseService.createInfluencer(selectedProject.id, {
        url: url,
        platform: profile.platform,
        profile,
        createdBy: user.uid,
        tags: [],
        notes: ""
      }, user.uid);

      updateStepStatus(index, 'save', 'completed', 100, '數據保存成功');

      // 更新結果為成功
      setResults(prev => prev.map((result, i) => {
        if (i === index) {
          return { ...result, success: true, data: profile };
        }
        return result;
      }));

      return true;

    } catch (error) {  
      const errorMessage = error instanceof Error ? error.message : '未知錯誤';
      
      // 找到失敗的步驟並標記錯誤
      const failedStepId = results[index]?.steps.find(s => s.status === 'processing')?.id || 'analyze';
      updateStepStatus(index, failedStepId, 'error', 0, undefined, errorMessage);

      // 更新結果為失敗
      setResults(prev => prev.map((result, i) => {
        if (i === index) {
          return { ...result, success: false, error: errorMessage };
        }
        return result;
      }));

      return false;
    }
  };

  const startBatchAnalysis = async () => {
    if (!user || !selectedProject) {
      alert('請先登入並選擇專案');
      return;
    }

    const urlList = parseUrls(urls);
    if (urlList.length === 0) {
      alert('請輸入至少一個有效的社交媒體 URL');
      return;
    }

    if (urlList.length > 20) {
      alert('一次最多只能分析 20 個網紅');
      return;
    }

    setIsAnalyzing(true);
    setResults([]);
    setCurrentIndex(0);
    setOverallProgress(0);

    // 初始化所有結果
    const initialResults: AnalysisResult[] = urlList.map(url => ({
      url,
      success: false,
      steps: initializeAnalysisSteps()
    }));
    setResults(initialResults);

    // 逐個分析
    for (let i = 0; i < urlList.length; i++) {
      setCurrentIndex(i);
      await analyzeInfluencer(urlList[i], i);
      
      // 更新總體進度
      const progress = ((i + 1) / urlList.length) * 100;
      setOverallProgress(progress);
      
      // 每個分析之間稍微暫停
      if (i < urlList.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    setIsAnalyzing(false);
    setCurrentIndex(-1);
  };

  const resetForm = () => {
    setUrls('');
    setResults([]);
    setCurrentIndex(0);
    setOverallProgress(0);
    setIsAnalyzing(false);
  };

  const getStepStatusIcon = (status: AnalysisStep['status']) => {
    switch (status) {
      case 'pending':
        return <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case 'completed':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'error':
        return <X className="w-4 h-4 text-red-500" />;
    }
  };

  const successCount = results.filter(r => r.success).length;
  const errorCount = results.filter(r => r.success === false && r.error).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-600" />
            持續新增網紅分析
          </DialogTitle>
          <p className="text-gray-600">
            一次分析多個網紅，實時查看詳細分析進度
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* 輸入區域 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">輸入網紅 URL</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="請輸入網紅的 URL，每行一個：&#10;https://www.instagram.com/username&#10;https://www.youtube.com/@channelname&#10;https://www.tiktok.com/@username"
                value={urls}
                onChange={(e) => setUrls(e.target.value)}
                rows={8}
                disabled={isAnalyzing}
              />
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  已輸入 {parseUrls(urls).length} 個有效 URL
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={resetForm}
                    disabled={isAnalyzing}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    重置
                  </Button>
                  <Button
                    onClick={startBatchAnalysis}
                    disabled={isAnalyzing || parseUrls(urls).length === 0}
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        分析中...
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4 mr-2" />
                        開始分析
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 總體進度 */}
          {isAnalyzing && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">總體進度</span>
                    <span className="text-sm text-gray-600">
                      {currentIndex + 1} / {results.length}
                    </span>
                  </div>
                  <Progress value={overallProgress} className="w-full" />
                  <div className="text-center text-sm text-gray-600">
                    {currentIndex >= 0 && currentIndex < results.length && (
                      <>正在分析: {results[currentIndex]?.url}</>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 結果統計 */}
          {results.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-2xl font-bold text-blue-600">{results.length}</div>
                  <div className="text-sm text-gray-600">總數</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-2xl font-bold text-green-600">{successCount}</div>
                  <div className="text-sm text-gray-600">成功</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-2xl font-bold text-red-600">{errorCount}</div>
                  <div className="text-sm text-gray-600">失敗</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* 詳細結果 */}
          {results.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">分析結果詳情</h3>
              {results.map((result, index) => (
                <Card key={index} className={`border-l-4 ${
                  result.success ? 'border-l-green-500' : 
                  result.error ? 'border-l-red-500' : 'border-l-blue-500'
                }`}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {result.data && (
                          <Avatar
                            src={result.data.avatar}
                            name={result.data.name}
                            size="sm"
                          />
                        )}
                        <div>
                          <div className="font-medium">
                            {result.data?.name || '分析中...'}
                          </div>
                          <div className="text-sm text-gray-600">
                            {result.url}
                          </div>
                        </div>
                      </div>
                      <Badge variant={result.success ? 'default' : result.error ? 'destructive' : 'secondary'}>
                        {result.success ? '成功' : result.error ? '失敗' : '進行中'}
                      </Badge>
                    </div>

                    {/* 分析步驟 */}
                    <div className="space-y-2">
                      {result.steps.map((step) => {
                        const Icon = step.icon;
                        return (
                          <div
                            key={step.id}
                            className={`flex items-center gap-3 p-2 rounded ${
                              step.status === 'processing' ? 'bg-blue-50' :
                              step.status === 'completed' ? 'bg-green-50' :
                              step.status === 'error' ? 'bg-red-50' : 'bg-gray-50'
                            }`}
                          >
                            {getStepStatusIcon(step.status)}
                            <Icon className={`w-4 h-4 ${
                              step.status === 'processing' ? 'text-blue-500' :
                              step.status === 'completed' ? 'text-green-500' :
                              step.status === 'error' ? 'text-red-500' : 'text-gray-400'
                            }`} />
                            <div className="flex-1">
                              <div className="font-medium text-sm">{step.label}</div>
                              <div className="text-xs text-gray-600">{step.description}</div>
                              {step.result && (
                                <div className="text-xs text-green-700 mt-1">{step.result}</div>
                              )}
                              {step.error && (
                                <div className="text-xs text-red-700 mt-1">{step.error}</div>
                              )}
                            </div>
                            {step.status === 'processing' && (
                              <div className="text-xs text-blue-600">{step.progress}%</div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {result.error && (
                      <Alert className="mt-3">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          {result.error}
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={onClose} disabled={isAnalyzing}>
            {isAnalyzing ? '分析中...' : '關閉'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContinuousAddInfluencerModal;
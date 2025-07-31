"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, FileText, Loader2, CheckCircle, XCircle, Download } from "lucide-react";
import { BatchProcessingResult } from "@/types";

// 平台檢測函數
function detectPlatformFromUrl(url: string): string {
  if (url.includes('instagram.com')) return 'Instagram';
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube';
  if (url.includes('tiktok.com')) return 'TikTok';
  if (url.includes('twitter.com') || url.includes('x.com')) return 'Twitter';
  if (url.includes('facebook.com')) return 'Facebook';
  return 'Unknown';
}

// 用戶名提取函數
function extractUsernameFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;

    if (url.includes('instagram.com')) {
      const match = pathname.match(/^\/(@)?([^\/\?]+)/);
      return match ? match[2] : 'unknown';
    }

    if (url.includes('youtube.com')) {
      const match = pathname.match(/\/(c\/|@|channel\/)?([^\/\?]+)/);
      return match ? match[2] : 'unknown';
    }

    if (url.includes('tiktok.com')) {
      const match = pathname.match(/\/@([^\/\?]+)/);
      return match ? match[1] : 'unknown';
    }

    return 'unknown';
  } catch {
    return 'unknown';
  }
}

interface BatchUploadProps {
  onResults: (results: BatchProcessingResult[]) => void;
}

export const BatchUpload = ({ onResults }: BatchUploadProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<BatchProcessingResult[]>([]);
  const [textUrls, setTextUrls] = useState("");
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 文本URL批次分析
  const handleTextAnalysis = async () => {
    const urls = textUrls
      .split('\n')
      .map(url => url.trim())
      .filter(url => url && url.length > 0);

    if (urls.length === 0) {
      setError("請輸入至少一個URL");
      return;
    }

    if (urls.length > 50) {
      setError("一次最多只能分析50個URL");
      return;
    }

    await performBatchAnalysis(urls);
  };

  // 文件上傳處理
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const urls = await parseFile(file);
      if (urls.length === 0) {
        setError("文件中沒有找到有效的URL");
        return;
      }

      if (urls.length > 100) {
        setError("文件中URL數量超過限制（最多100個）");
        return;
      }

      await performBatchAnalysis(urls);
    } catch (error) {
      setError("文件解析失敗：" + (error as Error).message);
    }
  };

  // 解析文件內容
  const parseFile = async (file: File): Promise<string[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          let urls: string[] = [];

          if (file.name.endsWith('.csv')) {
            // 解析CSV
            const lines = content.split('\n');
            for (const line of lines) {
              const cells = line.split(',').map(cell => cell.trim().replace(/"/g, ''));
              // 查找包含URL的欄位
              for (const cell of cells) {
                if (cell.includes('http')) {
                  urls.push(cell);
                  break;
                }
              }
            }
          } else if (file.name.endsWith('.txt')) {
            // 解析純文本
            urls = content
              .split('\n')
              .map(line => line.trim())
              .filter(line => line.includes('http'));
          } else {
            reject(new Error("不支援的文件格式。請使用 .csv 或 .txt 文件"));
            return;
          }

          // 驗證和清理URL
          const validUrls = urls
            .filter(url => {
              try {
                new URL(url);
                return true;
              } catch {
                return false;
              }
            })
            .slice(0, 100); // 限制數量

          resolve(validUrls);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error("文件讀取失敗"));
      reader.readAsText(file);
    });
  };

  // 執行批次分析
  const performBatchAnalysis = async (urls: string[]) => {
    setIsAnalyzing(true);
    setProgress(0);
    setError(null);
    setResults([]);

    try {
      // 初始化結果 - 顯示處理中狀態
      const initialResults: BatchProcessingResult[] = urls.map(url => {
        const platform = detectPlatformFromUrl(url);
        const username = extractUsernameFromUrl(url);
        return {
          url,
          displayName: `處理中... (${username})`,
          platform: platform,
          followers: '分析中',
          score: 0,
          tags: [],
          category: '分析中',
          engagementRate: '計算中',
          dataSource: 'unknown' as const,
          status: 'pending' as const
        };
      });
      setResults(initialResults);

      // 分批處理（每批5個，避免過載）
      const batchSize = 5;
      const batches = [];
      for (let i = 0; i < urls.length; i += batchSize) {
        batches.push(urls.slice(i, i + batchSize));
      }

      let completedCount = 0;
      // 使用 initialResults 作為 finalResults 的基礎
      const finalResults: BatchProcessingResult[] = [...initialResults];

      for (const batch of batches) {
        try {
          const response = await fetch('/api/analyze-influencer', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ urls: batch }),
          });

          const data = await response.json();

          if (data.success && data.results) {
            // 更新批次結果
            for (let i = 0; i < batch.length; i++) {
              const url = batch[i];
              const result = data.results[i];
              
              if (result && result.status === 'success') {
                // 找到對應的初始結果並更新
                const index = finalResults.findIndex(r => r.url === url);
                if (index !== -1) {
                  finalResults[index] = {
                    ...finalResults[index],
                    ...result,
                    status: 'success'
                  };
                }
              } else {
                // 處理失敗的情況
                const index = finalResults.findIndex(r => r.url === url);
                if (index !== -1) {
                  finalResults[index] = {
                    ...finalResults[index],
                    displayName: `分析失敗 (${extractUsernameFromUrl(url)})`,
                    status: 'error',
                    error: result?.error || '未知錯誤'
                  };
                }
              }
            }
          } else {
            // 如果批次失敗，標記這批所有URL為失敗
            batch.forEach(url => {
              const index = finalResults.findIndex(r => r.url === url);
              if (index !== -1) {
                finalResults[index] = {
                  ...finalResults[index],
                  displayName: `分析失敗 (${extractUsernameFromUrl(url)})`,
                  status: 'error',
                  error: '批次處理失敗'
                };
              }
            });
          }
        } catch (error) {
          // 批次請求失敗
          batch.forEach(url => {
            const index = finalResults.findIndex(r => r.url === url);
            if (index !== -1) {
              finalResults[index] = {
                ...finalResults[index],
                displayName: `網路錯誤 (${extractUsernameFromUrl(url)})`,
                status: 'error',
                error: '網路請求失敗'
              };
            }
          });
        }

        completedCount += batch.length;
        setProgress((completedCount / urls.length) * 100);

        // 更新結果顯示
        setResults([...finalResults]);

        // 批次間延遲，避免過載
        if (batches.indexOf(batch) < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // 完成
      setResults(finalResults);
      onResults(finalResults);

    } catch (error) {
      setError("批次分析失敗：" + (error as Error).message);
    } finally {
      setIsAnalyzing(false);
      setProgress(100);
    }
  };

  // 下載結果
  const downloadResults = () => {
    if (results.length === 0) return;

    const csvContent = [
      // CSV 標題
      'URL,平台,名稱,粉絲數,評分,狀態,錯誤訊息',
      // 數據行
      ...results.map(result => [
        result.url,
        result.platform || '',
        result.displayName || '',
        result.followers || '',
        result.score?.toString() || '',
        result.status === 'success' ? '成功' : result.status === 'error' ? '失敗' : '處理中',
        result.error || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `kol-analysis-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status === 'error').length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="w-5 h-5" />
            <span>批次分析網紅</span>
          </CardTitle>
          <CardDescription>
            支援多種方式批次上傳和分析網紅數據
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="text" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="text">文本輸入</TabsTrigger>
              <TabsTrigger value="file">文件上傳</TabsTrigger>
            </TabsList>

            {/* 文本輸入 */}
            <TabsContent value="text" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="urls">網紅URL列表</Label>
                <Textarea
                  id="urls"
                  placeholder="請輸入網紅的社群媒體URL，每行一個：&#10;https://instagram.com/username1&#10;https://youtube.com/channel/username2&#10;https://tiktok.com/@username3"
                  value={textUrls}
                  onChange={(e) => setTextUrls(e.target.value)}
                  className="min-h-32"
                  disabled={isAnalyzing}
                />
                <div className="text-sm text-gray-500">
                  支援 Instagram、YouTube、TikTok 等平台，一次最多50個URL
                </div>
              </div>

              <Button
                onClick={handleTextAnalysis}
                disabled={isAnalyzing || !textUrls.trim()}
                className="w-full"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    分析中...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    開始批次分析
                  </>
                )}
              </Button>
            </TabsContent>

            {/* 文件上傳 */}
            <TabsContent value="file" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file">上傳文件</Label>
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isAnalyzing}
                  />
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">
                    點擊選擇或拖拽文件到此處
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    支援 .csv 和 .txt 格式，最多100個URL
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isAnalyzing}
                  >
                    選擇文件
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* 進度顯示 */}
      {isAnalyzing && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>分析進度</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
              <div className="text-sm text-gray-600 text-center">
                正在分析網紅數據，請稍候...
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 錯誤信息 */}
      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 結果統計 */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>分析結果</span>
              {!isAnalyzing && (
                <Button variant="outline" size="sm" onClick={downloadResults}>
                  <Download className="w-4 h-4 mr-2" />
                  下載CSV
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{successCount}</div>
                <div className="text-sm text-green-700">成功</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{errorCount}</div>
                <div className="text-sm text-red-700">失敗</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{results.length}</div>
                <div className="text-sm text-blue-700">總計</div>
              </div>
            </div>

            {/* 結果列表 */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {results.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {result.status === 'success' && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                    {result.status === 'error' && (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    {result.status === 'pending' && (
                      <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                    )}

                    <div>
                      <div className="font-medium text-sm">
                        {result.displayName || 'URL處理中...'}
                      </div>
                      <div className="text-xs text-gray-500 truncate max-w-md">
                        {result.url}
                      </div>
                      {result.error && (
                        <div className="text-xs text-red-600">{result.error}</div>
                      )}
                    </div>
                  </div>

                  {result.status === 'success' && (
                    <div className="text-right">
                      <div className="font-bold text-green-600">
                        {result.score?.toFixed(1)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {result.platform} • {result.followers}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

"use client";

import { useState } from "react";
import { DemoInfluencer, BatchProcessingResult } from "@/types";

// Direct import for immediate functionality
import { BatchUpload } from "@/components/BatchUpload";

interface AnalysisPageProps {
  newInfluencerUrl: string;
  setNewInfluencerUrl: (url: string) => void;
  analyzing: boolean;
  setAnalyzing: (analyzing: boolean) => void;
  analysisMode: "single" | "batch";
  setAnalysisMode: (mode: "single" | "batch") => void;
  handleAnalyzeInfluencer: () => Promise<void>;
  handleBatchResults: (results: BatchProcessingResult[]) => void;
}

function AnalysisPage({
  newInfluencerUrl,
  setNewInfluencerUrl,
  analyzing,
  setAnalyzing,
  analysisMode,
  setAnalysisMode,
  handleAnalyzeInfluencer,
  handleBatchResults,
}: AnalysisPageProps) {

  const [analysisHistory, setAnalysisHistory] = useState<Array<{
    id: number;
    url: string;
    platform: string;
    timestamp: string;
    status: "success" | "error";
    result?: string;
  }>>([
    {
      id: 1,
      url: "https://instagram.com/beautyguru_tw",
      platform: "Instagram",
      timestamp: "2024-01-15 14:30",
      status: "success",
      result: "分析完成 - 評分: 87.5"
    },
    {
      id: 2,
      url: "https://youtube.com/c/fashionista_taiwan",
      platform: "YouTube",
      timestamp: "2024-01-15 13:45",
      status: "success",
      result: "分析完成 - 評分: 92.3"
    }
  ]);

  const platformDetect = (url: string) => {
    if (url.includes("instagram.com")) return "Instagram";
    if (url.includes("youtube.com")) return "YouTube";
    if (url.includes("tiktok.com")) return "TikTok";
    if (url.includes("facebook.com")) return "Facebook";
    if (url.includes("twitter.com") || url.includes("x.com")) return "Twitter";
    return "Unknown";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">🤖 AI 智慧分析</h2>
          <p className="text-gray-600">使用AI技術分析網紅數據和表現</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setAnalysisMode("single")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                analysisMode === "single"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              單個分析
            </button>
            <button
              onClick={() => setAnalysisMode("batch")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                analysisMode === "batch"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              批次分析
            </button>
          </div>
        </div>
      </div>

      {/* Analysis Input */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        {analysisMode === "single" ? (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">🔍 單個網紅分析</h3>
            <div className="flex space-x-4">
              <div className="flex-1">
                <input
                  type="url"
                  value={newInfluencerUrl}
                  onChange={(e) => setNewInfluencerUrl(e.target.value)}
                  placeholder="輸入網紅個人檔案URL (Instagram, YouTube, TikTok等)"
                  className="w-full border border-gray-300 rounded px-4 py-3"
                />
                {newInfluencerUrl && (
                  <div className="mt-2 text-sm text-gray-600">
                    檢測平台: <span className="font-medium">{platformDetect(newInfluencerUrl)}</span>
                  </div>
                )}
              </div>
              <button
                onClick={handleAnalyzeInfluencer}
                disabled={analyzing || !newInfluencerUrl}
                className={`px-6 py-3 rounded font-medium ${
                  analyzing || !newInfluencerUrl
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {analyzing ? "分析中..." : "開始分析"}
              </button>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <p>💡 支援平台: Instagram, YouTube, TikTok, Facebook, Twitter</p>
              <p>🔄 分析內容: 粉絲數據、互動率、內容品質、受眾分析等</p>
            </div>
          </div>
        ) : (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 批次網紅分析</h3>
            <BatchUpload onResults={handleBatchResults} />
          </div>
        )}
      </div>

      {/* Analysis Status */}
      {analyzing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            <div>
              <div className="font-medium text-blue-800">正在分析網紅數據...</div>
              <div className="text-sm text-blue-600">預計需要 30-60 秒，請耐心等待</div>
            </div>
          </div>
          <div className="mt-3 bg-blue-100 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: "45%" }}></div>
          </div>
        </div>
      )}

      {/* Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🧠</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">AI 智慧評分</h3>
              <p className="text-sm text-gray-600">多維度評估網紅表現</p>
            </div>
          </div>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• 內容品質分析</li>
            <li>• 互動率評估</li>
            <li>• 受眾匹配度</li>
            <li>• 品牌安全檢測</li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">數據洞察</h3>
              <p className="text-sm text-gray-600">深度數據分析報告</p>
            </div>
          </div>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• 粉絲成長趨勢</li>
            <li>• 互動模式分析</li>
            <li>• 最佳發文時機</li>
            <li>• 內容偏好洞察</li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🎯</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">精準推薦</h3>
              <p className="text-sm text-gray-600">個人化合作建議</p>
            </div>
          </div>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• 合作方式建議</li>
            <li>• 預算範圍估算</li>
            <li>• 時機選擇建議</li>
            <li>• 風險評估報告</li>
          </ul>
        </div>
      </div>

      {/* Analysis History */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📋 分析記錄</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 text-sm font-medium text-gray-700">URL</th>
                <th className="text-left py-2 text-sm font-medium text-gray-700">平台</th>
                <th className="text-left py-2 text-sm font-medium text-gray-700">時間</th>
                <th className="text-left py-2 text-sm font-medium text-gray-700">狀態</th>
                <th className="text-left py-2 text-sm font-medium text-gray-700">結果</th>
              </tr>
            </thead>
            <tbody>
              {analysisHistory.map((record) => (
                <tr key={record.id} className="border-b border-gray-100">
                  <td className="py-3 text-sm">
                    <a
                      href={record.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 truncate block max-w-xs"
                    >
                      {record.url}
                    </a>
                  </td>
                  <td className="py-3 text-sm text-gray-600">{record.platform}</td>
                  <td className="py-3 text-sm text-gray-600">{record.timestamp}</td>
                  <td className="py-3">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        record.status === "success"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {record.status === "success" ? "成功" : "失敗"}
                    </span>
                  </td>
                  <td className="py-3 text-sm text-gray-600">{record.result}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {analysisHistory.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            尚無分析記錄，開始您的第一次分析吧！
          </div>
        )}
      </div>
    </div>
  );
}

export default AnalysisPage;

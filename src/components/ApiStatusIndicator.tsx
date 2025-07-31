"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { isFirebaseAvailable, getFirebaseStatus } from "@/lib/firebase";
import { isDemoMode } from "@/lib/demo-data";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Settings,
  Link,
  ExternalLink,
  Info
} from "lucide-react";

interface ApiStatus {
  name: string;
  configured: boolean;
  required: boolean;
  description: string;
  setupUrl?: string;
}

export const ApiStatusIndicator = () => {
  const [isOpen, setIsOpen] = useState(false);

  const getApiStatuses = (): ApiStatus[] => {
    const firebaseStatus = getFirebaseStatus();

    return [
      {
        name: "Firebase",
        configured: firebaseStatus.isConfigured,
        required: true,
        description: "用戶認證和數據儲存",
        setupUrl: "https://console.firebase.google.com"
      },
      {
        name: "Gemini AI",
        configured: !!process.env.NEXT_PUBLIC_GEMINI_API_KEY,
        required: true,
        description: "AI 網紅分析和內容生成",
        setupUrl: "https://aistudio.google.com/app/apikey"
      },
      {
        name: "Google Custom Search",
        configured: !!(process.env.NEXT_PUBLIC_GOOGLE_SEARCH_API_KEY && process.env.NEXT_PUBLIC_GOOGLE_SEARCH_ENGINE_ID),
        required: true,
        description: "增強網紅資料搜尋",
        setupUrl: "https://developers.google.com/custom-search/v1/introduction"
      },
      {
        name: "YouTube Data API",
        configured: !!process.env.NEXT_PUBLIC_YOUTUBE_API_KEY,
        required: false,
        description: "YouTube 頻道深度分析",
        setupUrl: "https://console.cloud.google.com/apis/library/youtube.googleapis.com"
      },
      {
        name: "Google Cloud Natural Language",
        configured: !!process.env.NEXT_PUBLIC_GOOGLE_CLOUD_API_KEY,
        required: false,
        description: "內容情感分析",
        setupUrl: "https://console.cloud.google.com/apis/library/language.googleapis.com"
      }
    ];
  };

  const apiStatuses = getApiStatuses();
  const configuredApis = apiStatuses.filter(api => api.configured);
  const requiredApis = apiStatuses.filter(api => api.required);
  const configuredRequiredApis = requiredApis.filter(api => api.configured);

  const getStatusIcon = (configured: boolean, required: boolean) => {
    if (configured) return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (required) return <XCircle className="w-4 h-4 text-red-500" />;
    return <AlertCircle className="w-4 h-4 text-yellow-500" />;
  };

  const getStatusBadge = () => {
    if (isDemoMode()) {
      return <Badge variant="secondary">體驗模式</Badge>;
    }

    const completionPercentage = Math.round((configuredRequiredApis.length / requiredApis.length) * 100);

    if (completionPercentage === 100) {
      return <Badge variant="default" className="bg-green-100 text-green-800">已完成 API 配置</Badge>;
    } else if (completionPercentage > 0) {
      return <Badge variant="secondary">API 配置 {completionPercentage}%</Badge>;
    } else {
      return <Badge variant="destructive">需要配置 API</Badge>;
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            {getStatusBadge()}
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>API 配置狀態</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Current Status Overview */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                {isDemoMode() ? (
                  "目前運行在體驗模式下。要使用完整功能，請配置以下 API。"
                ) : (
                  `已配置 ${configuredApis.length} / ${apiStatuses.length} 個 API。必要 API: ${configuredRequiredApis.length} / ${requiredApis.length}`
                )}
              </AlertDescription>
            </Alert>

            {/* API Status List */}
            <div className="space-y-3">
              {apiStatuses.map((api) => (
                <Card key={api.name} className={api.configured ? "border-green-200" : api.required ? "border-red-200" : "border-yellow-200"}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(api.configured, api.required)}
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{api.name}</span>
                            {api.required && <Badge variant="outline" className="text-xs">必須</Badge>}
                          </div>
                          <p className="text-sm text-gray-600">{api.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {api.configured ? (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            已配置
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            未配置
                          </Badge>
                        )}
                        {api.setupUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(api.setupUrl, '_blank')}
                            className="flex items-center space-x-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>配置</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Setup Guide Link */}
            <Alert>
              <Link className="h-4 w-4" />
              <AlertDescription>
                需要配置幫助？查看我們的{" "}
                <Button
                  variant="link"
                  className="h-auto p-0 text-blue-600"
                  onClick={() => window.open('/API_SETUP_GUIDE.md', '_blank')}
                >
                  API 配置指南
                </Button>
                {" "}了解詳細設定步驟。
              </AlertDescription>
            </Alert>

            {/* Environment Variables Preview */}
            {!isDemoMode() && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">環境變數檢查</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between">
                      <span>NEXT_PUBLIC_FIREBASE_API_KEY:</span>
                      <span>{process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✓ 已設定' : '✗ 未設定'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>NEXT_PUBLIC_GEMINI_API_KEY:</span>
                      <span>{process.env.NEXT_PUBLIC_GEMINI_API_KEY ? '✓ 已設定' : '✗ 未設定'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>NEXT_PUBLIC_GOOGLE_SEARCH_API_KEY:</span>
                      <span>{process.env.NEXT_PUBLIC_GOOGLE_SEARCH_API_KEY ? '✓ 已設定' : '✗ 未設定'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>NEXT_PUBLIC_GOOGLE_SEARCH_ENGINE_ID:</span>
                      <span>{process.env.NEXT_PUBLIC_GOOGLE_SEARCH_ENGINE_ID ? '✓ 已設定' : '✗ 未設定'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

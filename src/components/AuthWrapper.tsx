"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Dashboard } from "./Dashboard";
import { LogIn } from "lucide-react";

export const AuthWrapper = () => {
  const { user, isAuthenticated } = useAuth();

  // If we have a user, show the dashboard
  if (user && isAuthenticated) {
    return <Dashboard />;
  }

  // Always show login interface immediately - no loading states
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md p-8">
        <LogIn className="w-16 h-16 mx-auto mb-4 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          網紅智慧評估儀表板
        </h1>
        <p className="text-lg text-gray-700 mb-2">
          請登入開始使用
        </p>
        <p className="text-gray-600 mb-6">
          使用 Google 帳戶或信箱快速登入
        </p>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg text-left">
          <h3 className="font-semibold text-blue-800 mb-2">🚀 平台功能</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>✨ AI 智慧分析網紅資料</li>
            <li>📊 8 項專業評估指標</li>
            <li>📈 歷史評估趨勢追蹤</li>
            <li>🎯 多專案管理系統</li>
          </ul>
        </div>

        <div className="mt-4 text-xs text-gray-500">
          點擊右上角「登入」按鈕開始使用
        </div>
      </div>
    </div>
  );
};

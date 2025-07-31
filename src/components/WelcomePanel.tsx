"use client";

import { Users } from "lucide-react";

export const WelcomePanel = () => {
  return (
    <div className="flex-grow flex flex-col justify-center items-center text-gray-500 p-8 text-center">
      <Users className="w-16 h-16 mb-4 text-gray-300" />
      <h3 className="text-xl font-semibold">歡迎使用</h3>
      <p className="mt-2 max-w-md">
        請從左側選擇一個專案開始，或建立一個新專案。
        <br />
        然後新增網紅並開始進行評估。
      </p>
      <div className="mt-6 text-sm text-gray-400 space-y-2">
        <p>✨ 支援多個專案管理</p>
        <p>🤖 AI 智慧分析網紅資料</p>
        <p>📊 8 項加權評估指標</p>
        <p>📈 歷史評估趨勢追蹤</p>
      </div>
    </div>
  );
};

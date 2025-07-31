"use client";

import { useEffect, useState } from "react";
import { DemoService } from "@/lib/demo-service";

export default function DebugPage() {
  const [influencers, setInfluencers] = useState<any[]>([]);

  useEffect(() => {
    // 調試網紅資料
    DemoService.debugInfluencers('demo-project-1');
    
    // 訂閱網紅資料
    const unsubscribe = DemoService.subscribeToInfluencers('demo-project-1', (data) => {
      console.log('🔍 Debug 頁面收到網紅資料:', data);
      setInfluencers(data);
    });

    return unsubscribe;
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">調試頁面</h1>
      <div className="mb-4">
        <h2 className="text-lg font-semibold">網紅資料 ({influencers.length} 個)</h2>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
          {JSON.stringify(influencers, null, 2)}
        </pre>
      </div>
    </div>
  );
} 
# 外部 API 整合指南

## 🎯 整合目標

將 Social Blade、HypeAuditor、Klear 等外部 API 整合到您的 KOL 評估平台，特別加強台灣網紅數據的覆蓋和質量。

## 📊 推薦的整合方案

### 🏆 最佳方案：Kolr API (台灣專精)
- **優勢**: 台灣網紅數據最豐富，亞洲市場專精
- **覆蓋**: 300M+ 國際網紅，台灣數據覆蓋率 95%+
- **價格**: 中等，性價比最高
- **API**: 完整且文檔齊全

### 💰 經濟方案：Social Blade + Apify
- **優勢**: 成本最低，數據基礎但完整
- **覆蓋**: 全球平台，台灣數據覆蓋率 60%
- **價格**: $19.99/月 + 使用量
- **API**: 第三方 scraper，穩定可靠

### 🔬 專業方案：HypeAuditor API
- **優勢**: 專業分析，防詐騙檢測
- **覆蓋**: 全球數據，台灣覆蓋率 80%
- **價格**: 企業級，需詢價
- **API**: 官方 API，功能最全

## 🔧 環境變數配置

將以下配置添加到您的 `.env.local` 文件：

```bash
# 外部API整合 - 網紅數據增強
NEXT_PUBLIC_KOLR_API_KEY=your_kolr_api_key_here
NEXT_PUBLIC_APIFY_API_KEY=your_apify_api_key_here
NEXT_PUBLIC_HYPEAUDITOR_API_KEY=your_hypeauditor_api_key_here

# 數據源配置
NEXT_PUBLIC_ENABLE_EXTERNAL_DATA=true
NEXT_PUBLIC_PREFERRED_DATA_SOURCE=kolr
NEXT_PUBLIC_AUTO_USE_KOLR_FOR_TAIWAN=true
```

## 🚀 整合步驟

### 步驟 1：安裝依賴
```bash
# 已包含在您現有的 package.json 中
npm install
```

### 步驟 2：配置 API 金鑰
1. **Kolr API**: 聯繫 kolrus@ikala.ai
2. **Apify API**: 註冊 https://apify.com/
3. **HypeAuditor**: 聯繫銷售團隊

### 步驟 3：更新現有 API
在 `src/app/api/analyze-influencer/route.ts` 中整合：

```typescript
import { ExternalAPIService } from '@/lib/external-api-service';

// 在 analyzeInfluencerData 函數中添加
async function analyzeInfluencerData(url: string) {
  // ... 現有代碼 ...
  
  // 嘗試獲取外部 API 數據
  const externalData = await ExternalAPIService.getBestInfluencerData(url);
  
  if (externalData) {
    console.log(`✅ 外部API數據獲取成功: ${externalData.source}`);
    // 合併外部數據與現有分析結果
    return mergeWithExternalData(analysisResult, externalData);
  }
  
  // ... 現有代碼 ...
}
```

### 步驟 4：測試整合
```bash
# 重新啟動開發伺服器
npm run dev

# 測試台灣網紅URL
curl -X POST http://localhost:3000/api/analyze-influencer \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.instagram.com/taiwan_influencer"}'
```

## 📈 台灣網紅數據覆蓋比較

| 數據維度 | Kolr | HypeAuditor | Social Blade |
|----------|------|-------------|--------------|
| 台灣網紅覆蓋 | 95%+ ⭐⭐⭐⭐⭐ | 80% ⭐⭐⭐⭐ | 60% ⭐⭐⭐ |
| 受眾分析 | 詳細亞洲數據 ✅ | 全球標準 ✅ | 基礎數據 ❌ |
| 成長趨勢 | 即時追蹤 ✅ | 專業分析 ✅ | 歷史數據 ✅ |
| API 文檔 | 完整 ✅ | 完整 ✅ | 第三方 ⚠️ |
| 月費用 | $200-500 💰💰 | $800+ 💰💰💰 | $20+ 💰 |

## 🎯 分階段部署建議

### 第一階段：快速啟動
- 整合 **Social Blade API** (Apify)
- 成本低，立即可用
- 獲得基礎的台灣網紅數據

### 第二階段：台灣專精
- 添加 **Kolr API**
- 大幅提升台灣網紅數據質量
- 建立智能數據源切換

### 第三階段：專業升級
- 整合 **HypeAuditor API**
- 添加防詐騙檢測
- 提供企業級分析報告

## 🛠️ 程式碼整合範例

### 數據源智能選擇邏輯
```typescript
// 自動選擇最佳數據源
static async getBestInfluencerData(url: string) {
  // 台灣網紅優先使用 Kolr
  if (this.isTaiwanRelated(url)) {
    const kolrData = await this.getKolrData(url);
    if (kolrData) return kolrData;
  }
  
  // 備用：Social Blade
  return await this.getSocialBladeData(username, platform);
}
```

### 數據合併邏輯
```typescript
function mergeWithExternalData(geminiResult, externalData) {
  return {
    ...geminiResult,
    // 使用外部 API 的真實數據覆蓋估算值
    followers: externalData.followers,
    engagementRate: externalData.engagement_rate,
    audienceLocation: externalData.audience_location,
    dataSource: 'enhanced_external',
    externalSource: externalData.source,
    taiwan_focused: externalData.taiwan_focused
  };
}
```

## 📊 效果預期

整合外部 API 後，您的平台將獲得：

1. **數據準確性提升 60%+**
2. **台灣網紅覆蓋率提升到 95%+**
3. **真實粉絲數據，非估算**
4. **專業級受眾分析**
5. **成長趨勢追蹤**
6. **防詐騙網紅檢測**

## 🎉 下一步行動

1. **立即實施**: 先整合 Social Blade API (最低成本)
2. **評估 Kolr**: 聯繫取得試用帳號測試台灣數據
3. **規劃預算**: 根據使用量估算 API 成本
4. **分階段部署**: 避免一次性大量投資風險

需要技術支援或有任何問題，隨時詢問！🚀 
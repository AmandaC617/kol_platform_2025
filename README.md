# 網紅智慧評估儀表板 (KOL Evaluation Platform)

專業的 KOL (Key Opinion Leader) 評估平台，幫助您精準分析網紅價值和影響力。

## ✨ 主要功能

- 🚀 **專案管理**: 支援多個評估專案，分類管理不同活動的網紅評估
- 🤖 **AI 智慧分析**: 整合 Google Gemini AI + Custom Search API，自動擷取和分析網紅資料
- 🔍 **增強資料擷取**: Google Custom Search API 提供更準確的網紅資訊
- 📊 **8 項評估指標**:
  - 品牌契合度 (15%) | 內容品質 (15%) | 互動率 (20%) | 受眾輪廓 (15%)
  - 專業領袖 (10%) | 商業能力 (10%) | 品牌安全 (10%) | 穩定度 (5%)
- 📈 **歷史追蹤**: 評估記錄和趨勢圖表分析
- 📥 **批次上傳**: CSV 檔案批次導入網紅，支援中英文欄位名稱
- 🔐 **多重認證**: Google OAuth、Firebase 匿名登入、體驗模式
- 🎨 **平台識別**: 自動識別並適配不同社群平台特性 (Instagram, YouTube, TikTok, Facebook, Twitter)
- 📱 **響應式設計**: 完美支援桌面和行動裝置

## 🛠 技術架構

- **Frontend**: Next.js 15, React 18, TypeScript
- **UI**: Tailwind CSS, shadcn/ui
- **認證**: NextAuth.js (Google OAuth) + Firebase Authentication
- **資料庫**: Firebase Firestore + 體驗模式本地存儲
- **AI 服務**: Google Gemini API (智慧分析)
- **搜尋服務**: Google Custom Search API (資料增強)
- **圖表**: Chart.js, react-chartjs-2
- **字體**: Inter + Noto Sans TC (繁體中文支援)

## 🚀 快速開始

### 1. 環境設置

```bash
# 複製環境變數範本
cp .env.example .env.local

# 編輯 .env.local，填入您的 Firebase 配置
```

### 2. Firebase 設置

1. 前往 [Firebase Console](https://console.firebase.google.com/)
2. 建立新專案或使用現有專案
3. 啟用 Authentication 和 Firestore Database
4. 在 Authentication 中啟用「匿名登入」
5. 複製專案配置到 `.env.local`

### 3. Gemini AI 設置 (選用)

1. 前往 [Google AI Studio](https://aistudio.google.com/)
2. 取得 API 金鑰
3. 將金鑰添加到 `.env.local` 中的 `NEXT_PUBLIC_GEMINI_API_KEY`

### 4. 安裝與執行

```bash
# 安裝依賴
bun install

# 啟動開發伺服器
bun dev
```

開啟 [http://localhost:3000](http://localhost:3000) 查看應用程式。

## 📝 使用說明

### 1. 建立專案
- 點擊專案列表中的 "+" 按鈕
- 輸入專案名稱 (例如: "美妝新品上市")
- 點擊儲存建立專案

### 2. 新增網紅

#### 單個新增
- 選擇專案後，點擊網紅列表中的「單個新增」按鈕
- 貼上網紅的社群媒體 URL (Instagram, YouTube, TikTok, Facebook, Twitter)
- AI 將自動分析並擷取網紅資料

#### 批次上傳 CSV
- 點擊「批次上傳」按鈕
- 下載 CSV 範本檔案
- 填入網紅資料：
  - **必填欄位**: `url` (網紅社群媒體連結)
  - **選填欄位**: `name` (姓名)、`platform` (平台)、`category` (分類)、`notes` (備註)
- 上傳 CSV 檔案，系統將自動處理所有網紅資料

**CSV 範例格式：**
```csv
name,url,platform,category,notes
美妝達人小雅,https://www.instagram.com/beauty_guru_tw,Instagram,美妝,主要分享美妝教學和產品評測
旅遊部落客阿明,https://www.youtube.com/c/travel_blogger_ming,YouTube,旅遊,專業旅遊頻道，粉絲互動率高
```

### 3. 進行評估
- 選擇要評估的網紅
- 使用滑桿為 8 項指標評分 (0-100)
- 添加評估備註
- 提交評估獲得加權總分

### 4. 查看分析
- 查看歷史評估記錄
- 分析評分趨勢圖表
- 比較不同時期的評估結果

## 🎯 評估指標說明

| 指標 | 權重 | 說明 |
|------|------|------|
| 品牌契合度 | 15% | 網紅形象、價值觀與品牌是否一致 |
| 內容品質 | 15% | 內容的創意、製作精良度與專業性 |
| 互動率 | 20% | 粉絲的按讚、留言、分享等互動表現 |
| 受眾輪廓 | 15% | 粉絲群體的人口統計特徵是否符合目標客群 |
| 專業領袖 | 10% | 在特定領域的專業形象與影響力 |
| 商業能力 | 10% | 過往合作案例的成效與商業配合度 |
| 品牌安全 | 10% | 網紅過往是否有爭議或負面新聞 |
| 穩定度 | 5% | 內容更新頻率與品質的穩定性 |

## 🔧 開發指令

```bash
# 開發環境
bun dev

# 建置
bun build

# 啟動正式環境
bun start

# 程式碼檢查
bun lint

# 型別檢查
bun type-check
```

## 📁 專案結構

```
src/
├── app/                 # Next.js App Router
├── components/          # React 組件
│   ├── ui/             # shadcn/ui 基礎組件
│   ├── Dashboard.tsx   # 主儀表板
│   ├── Header.tsx      # 頁首
│   ├── ProjectsPanel.tsx
│   ├── InfluencersPanel.tsx
│   └── ...
├── contexts/           # React Context
├── lib/               # 工具函式和服務
│   ├── firebase.ts    # Firebase 配置
│   ├── firebase-service.ts
│   └── gemini-service.ts
└── types/             # TypeScript 類型定義
```

## 🚀 部署

此專案已配置為可部署到 Netlify。執行 `bun build` 建置專案後，上傳 `out` 資料夾或連接 Git 倉庫進行自動部署。

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request 來改善這個專案！

## 📄 授權

MIT License

---

Built with ❤️ using Next.js and Firebase

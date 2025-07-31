"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Target, 
  Star, 
  Users, 
  TrendingUp, 
  Shield, 
  Briefcase, 
  Heart,
  BarChart3,
  Info,
  CheckCircle,
  AlertCircle
} from "lucide-react";

interface ComparisonDimensionsGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const ComparisonDimensionsGuide = ({ isOpen, onClose }: ComparisonDimensionsGuideProps) => {
  const [selectedDimension, setSelectedDimension] = useState<string>('brandFit');

  const dimensions = [
    {
      key: 'brandFit',
      label: '品牌契合度',
      weight: 25,
      icon: Target,
      color: 'bg-blue-500',
      description: '網紅與品牌價值觀、形象、目標受眾的匹配程度',
      factors: [
        '品牌價值觀一致性',
        '目標受眾重疊度',
        '內容風格匹配',
        '品牌調性適配',
        '市場定位吻合度'
      ],
      scoring: {
        excellent: '90-100分：完美匹配，品牌與網紅高度契合',
        good: '70-89分：良好匹配，大部分方面契合',
        average: '50-69分：一般匹配，部分方面契合',
        poor: '0-49分：匹配度低，不建議合作'
      }
    },
    {
      key: 'contentQuality',
      label: '內容品質',
      weight: 20,
      icon: Star,
      color: 'bg-yellow-500',
      description: '網紅創作內容的質量、創意度和專業水準',
      factors: [
        '內容創意水準',
        '視覺美學質量',
        '文案表達能力',
        '內容一致性',
        '專業製作水準'
      ],
      scoring: {
        excellent: '90-100分：內容品質優秀，創意十足',
        good: '70-89分：內容品質良好，有一定創意',
        average: '50-69分：內容品質一般，中規中矩',
        poor: '0-49分：內容品質較差，缺乏創意'
      }
    },
    {
      key: 'engagementRate',
      label: '互動率',
      weight: 15,
      icon: Heart,
      color: 'bg-red-500',
      description: '粉絲與網紅內容的互動頻率和質量',
      factors: [
        '平均互動率',
        '評論質量',
        '分享轉發率',
        '互動增長趨勢',
        '粉絲活躍度'
      ],
      scoring: {
        excellent: '90-100分：互動率極高（>8%）',
        good: '70-89分：互動率良好（4-8%）',
        average: '50-69分：互動率一般（2-4%）',
        poor: '0-49分：互動率較低（<2%）'
      }
    },
    {
      key: 'audienceProfile',
      label: '受眾輪廓',
      weight: 15,
      icon: Users,
      color: 'bg-green-500',
      description: '網紅粉絲群體特徵與品牌目標受眾的匹配度',
      factors: [
        '年齡分布匹配',
        '性別比例適配',
        '地理位置重疊',
        '興趣標籤一致',
        '消費能力匹配'
      ],
      scoring: {
        excellent: '90-100分：受眾高度匹配目標客群',
        good: '70-89分：受眾較好匹配目標客群',
        average: '50-69分：受眾部分匹配目標客群',
        poor: '0-49分：受眾與目標客群差異較大'
      }
    },
    {
      key: 'professionalism',
      label: '專業度',
      weight: 10,
      icon: Briefcase,
      color: 'bg-indigo-500',
      description: '網紅在商業合作中的專業表現和可靠性',
      factors: [
        '合作履約能力',
        '溝通響應速度',
        '內容交付質量',
        '合約執行能力',
        '行業專業知識'
      ],
      scoring: {
        excellent: '90-100分：非常專業，值得信賴',
        good: '70-89分：較為專業，合作順暢',
        average: '50-69分：專業度一般，需要指導',
        poor: '0-49分：專業度不足，需謹慎合作'
      }
    },
    {
      key: 'businessAbility',
      label: '商業能力',
      weight: 10,
      icon: TrendingUp,
      color: 'bg-purple-500',
      description: '網紅的商業變現能力和市場影響力',
      factors: [
        '帶貨轉換率',
        '品牌影響力',
        '市場號召力',
        '商業合作經驗',
        'ROI表現'
      ],
      scoring: {
        excellent: '90-100分：商業能力極強，ROI優秀',
        good: '70-89分：商業能力良好，ROI不錯',
        average: '50-69分：商業能力一般，ROI普通',
        poor: '0-49分：商業能力較弱，ROI較低'
      }
    },
    {
      key: 'brandSafety',
      label: '品牌安全',
      weight: 5,
      icon: Shield,
      color: 'bg-orange-500',
      description: '網紅內容和行為對品牌形象的風險評估',
      factors: [
        '爭議內容風險',
        '負面新聞評估',
        '價值觀衝突風險',
        '法律合規性',
        '社會責任表現'
      ],
      scoring: {
        excellent: '90-100分：品牌安全，無風險',
        good: '70-89分：較為安全，風險較低',
        average: '50-69分：安全度一般，需要關注',
        poor: '0-49分：存在風險，需謹慎評估'
      }
    }
  ];

  const selectedDim = dimensions.find(d => d.key === selectedDimension) || dimensions[0];
  const Icon = selectedDim.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            完整比對維度說明
          </DialogTitle>
          <p className="text-gray-600">
            深入了解 KOL 評估的 7 大維度，每個維度的評分標準和權重分配
          </p>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">總覽</TabsTrigger>
            <TabsTrigger value="dimensions">維度詳情</TabsTrigger>
            <TabsTrigger value="algorithm">評分算法</TabsTrigger>
          </TabsList>

          {/* 總覽標籤 */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  評估體系總覽
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dimensions.map((dim) => {
                    const Icon = dim.icon;
                    return (
                      <div
                        key={dim.key}
                        className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => setSelectedDimension(dim.key)}
                      >
                        <div className={`w-10 h-10 ${dim.color} rounded-lg flex items-center justify-center`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold">{dim.label}</h3>
                            <Badge variant="secondary">{dim.weight}%</Badge>
                          </div>
                          <p className="text-sm text-gray-600">{dim.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">權重分配說明</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>品牌契合度</span>
                      <span className="font-medium">25% (最重要)</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>內容品質</span>
                      <span className="font-medium">20%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>互動率 + 受眾輪廓</span>
                      <span className="font-medium">30% (各15%)</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>專業度 + 商業能力</span>
                      <span className="font-medium">20% (各10%)</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>品牌安全</span>
                      <span className="font-medium">5% (基礎要求)</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 維度詳情標籤 */}
          <TabsContent value="dimensions" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 左側維度選擇 */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-lg">選擇維度</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {dimensions.map((dim) => {
                    const Icon = dim.icon;
                    return (
                      <button
                        key={dim.key}
                        onClick={() => setSelectedDimension(dim.key)}
                        className={`w-full text-left p-3 rounded-lg border transition-colors ${
                          selectedDimension === dim.key
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 ${dim.color} rounded-lg flex items-center justify-center`}>
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <div className="font-medium">{dim.label}</div>
                            <div className="text-sm text-gray-500">權重 {dim.weight}%</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </CardContent>
              </Card>

              {/* 右側詳細信息 */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${selectedDim.color} rounded-lg flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div>{selectedDim.label}</div>
                      <div className="text-sm font-normal text-gray-600">
                        權重: {selectedDim.weight}%
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-2">維度說明</h4>
                    <p className="text-gray-700">{selectedDim.description}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">評估要素</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {selectedDim.factors.map((factor, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">{factor}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">評分標準</h4>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <div>
                          <div className="font-medium text-green-800">優秀 (90-100分)</div>
                          <div className="text-sm text-green-700">{selectedDim.scoring.excellent}</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div>
                          <div className="font-medium text-blue-800">良好 (70-89分)</div>
                          <div className="text-sm text-blue-700">{selectedDim.scoring.good}</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                        <div>
                          <div className="font-medium text-yellow-800">一般 (50-69分)</div>
                          <div className="text-sm text-yellow-700">{selectedDim.scoring.average}</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                        <div>
                          <div className="font-medium text-red-800">不佳 (0-49分)</div>
                          <div className="text-sm text-red-700">{selectedDim.scoring.poor}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 評分算法標籤 */}
          <TabsContent value="algorithm" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  評分算法說明
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">總分計算公式</h4>
                  <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm">
                    總分 = (品牌契合度 × 0.25) + (內容品質 × 0.20) + (互動率 × 0.15) + 
                    <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(受眾輪廓 × 0.15) + (專業度 × 0.10) + (商業能力 × 0.10) + 
                    <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(品牌安全 × 0.05)
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">AI 分析流程</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        1
                      </div>
                      <div>
                        <div className="font-medium">數據收集</div>
                        <div className="text-sm text-gray-600">從各平台 API 獲取網紅基礎數據</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        2
                      </div>
                      <div>
                        <div className="font-medium">內容分析</div>
                        <div className="text-sm text-gray-600">AI 分析內容質量、風格、受眾匹配度</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        3
                      </div>
                      <div>
                        <div className="font-medium">風險評估</div>
                        <div className="text-sm text-gray-600">檢測爭議內容、品牌安全風險</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        4
                      </div>
                      <div>
                        <div className="font-medium">綜合評分</div>
                        <div className="text-sm text-gray-600">根據權重計算最終分數和建議</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">分數等級對應</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-green-100 rounded">
                        <span className="font-medium text-green-800">S級 (90-100分)</span>
                        <span className="text-green-600">強烈推薦</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-blue-100 rounded">
                        <span className="font-medium text-blue-800">A級 (80-89分)</span>
                        <span className="text-blue-600">推薦合作</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-yellow-100 rounded">
                        <span className="font-medium text-yellow-800">B級 (70-79分)</span>
                        <span className="text-yellow-600">可以考慮</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-orange-100 rounded">
                        <span className="font-medium text-orange-800">C級 (60-69分)</span>
                        <span className="text-orange-600">需要評估</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-red-100 rounded">
                        <span className="font-medium text-red-800">D級 (0-59分)</span>
                        <span className="text-red-600">不建議合作</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-blue-600 mb-2">85.7</div>
                        <div className="text-lg font-semibold text-green-600">A級 - 推薦合作</div>
                        <div className="text-sm text-gray-600 mt-2">範例分數</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-4">
          <Button onClick={onClose}>
            了解完成
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ComparisonDimensionsGuide;
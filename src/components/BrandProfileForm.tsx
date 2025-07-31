"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Building2, 
  Target, 
  Users, 
  TrendingUp, 
  Globe, 
  MessageSquare,
  Palette,
  Save,
  X,
  Plus,
  Trash2
} from 'lucide-react';
import { BrandProfile, BrandTone, TargetAudience, CampaignGoal, ContentType, BudgetRange, ProductComplexity } from '@/types/brand-matching';

interface BrandProfileFormProps {
  brandProfile?: BrandProfile;
  onSave: (profile: BrandProfile) => void;
  onCancel: () => void;
}

export const BrandProfileForm: React.FC<BrandProfileFormProps> = ({
  brandProfile,
  onSave,
  onCancel
}) => {
  const [profile, setProfile] = useState<Partial<BrandProfile>>({
    id: brandProfile?.id || '',
    name: brandProfile?.name || '',
    industry: brandProfile?.industry || '',
    brandTone: brandProfile?.brandTone || {
      personality: 'professional' as any,
      communicationStyle: 'formal' as any,
      visualStyle: 'modern' as any,
      keywords: []
    },
    targetAudience: brandProfile?.targetAudience || {
      ageRanges: ['25-34' as any],
      gender: 'balanced' as any,
      incomeLevel: 'middle' as any,
      interests: [],
      locations: ['taiwan'],
      lifestyle: ['urban']
    },
    campaignGoals: brandProfile?.campaignGoals || [],
    preferredContentTypes: brandProfile?.preferredContentTypes || [],
    targetMarkets: brandProfile?.targetMarkets || [],
    budgetRange: brandProfile?.budgetRange || 'medium' as any,
    productComplexity: brandProfile?.productComplexity || 'moderate' as any
  });

  const [newKeyword, setNewKeyword] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [newTargetMarket, setNewTargetMarket] = useState('');

  const handleSave = () => {
    if (!profile.name || !profile.industry) {
      alert('❌ 請填寫品牌名稱和產業類別後再儲存');
      return;
    }

    const completeProfile: BrandProfile = {
      id: profile.id || `brand-${Date.now()}`,
      name: profile.name,
      industry: profile.industry,
      brandTone: profile.brandTone!,
      targetAudience: profile.targetAudience!,
      campaignGoals: profile.campaignGoals!,
      preferredContentTypes: profile.preferredContentTypes!,
      targetMarkets: profile.targetMarkets!,
      budgetRange: profile.budgetRange!,
      productComplexity: profile.productComplexity!
    };

    onSave(completeProfile);
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !profile.brandTone?.keywords.includes(newKeyword.trim())) {
      setProfile(prev => ({
        ...prev,
        brandTone: {
          ...prev.brandTone!,
          keywords: [...(prev.brandTone?.keywords || []), newKeyword.trim()]
        }
      }));
      setNewKeyword('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setProfile(prev => ({
      ...prev,
      brandTone: {
        ...prev.brandTone!,
        keywords: prev.brandTone?.keywords.filter((k: string) => k !== keyword) || []
      }
    }));
  };

  const addInterest = () => {
    if (newInterest.trim() && !profile.targetAudience?.interests.includes(newInterest.trim())) {
      setProfile(prev => ({
        ...prev,
        targetAudience: {
          ...prev.targetAudience!,
          interests: [...(prev.targetAudience?.interests || []), newInterest.trim()]
        }
      }));
      setNewInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    setProfile(prev => ({
      ...prev,
      targetAudience: {
        ...prev.targetAudience!,
        interests: prev.targetAudience?.interests.filter(i => i !== interest) || []
      }
    }));
  };

  const addTargetMarket = () => {
    if (newTargetMarket.trim() && !profile.targetMarkets?.includes(newTargetMarket.trim())) {
      setProfile(prev => ({
        ...prev,
        targetMarkets: [...(prev.targetMarkets || []), newTargetMarket.trim()]
      }));
      setNewTargetMarket('');
    }
  };

  const removeTargetMarket = (market: string) => {
    setProfile(prev => ({
      ...prev,
      targetMarkets: prev.targetMarkets?.filter(m => m !== market) || []
    }));
  };

  const toggleCampaignGoal = (goalType: string, goalName: string, goalDescription: string) => {
    const currentGoals = profile.campaignGoals || [];
    const isSelected = currentGoals.some(g => g.type === goalType);
    
    if (isSelected) {
      setProfile(prev => ({
        ...prev,
        campaignGoals: currentGoals.filter(g => g.type !== goalType)
      }));
    } else {
      setProfile(prev => ({
        ...prev,
        campaignGoals: [...currentGoals, {
          type: goalType as any,
          priority: 'medium',
          targetMetrics: [],
          description: goalDescription
        }]
      }));
    }
  };

  const toggleContentType = (contentType: string, contentTypeName: string, contentTypeDescription: string) => {
    const currentTypes = profile.preferredContentTypes || [];
    const isSelected = currentTypes.some(t => t === contentType);
    
    if (isSelected) {
      setProfile(prev => ({
        ...prev,
        preferredContentTypes: currentTypes.filter(t => t !== contentType)
      }));
    } else {
      setProfile(prev => ({
        ...prev,
        preferredContentTypes: [...currentTypes, contentType as any]
      }));
    }
  };

  const campaignGoalOptions = [
    { type: 'awareness', name: '品牌知名度', description: '提升品牌在目標受眾中的認知度' },
    { type: 'engagement', name: '互動參與', description: '增加與受眾的互動和參與度' },
    { type: 'conversion', name: '轉換銷售', description: '直接促進產品銷售和轉換' },
    { type: 'brand_love', name: '品牌好感', description: '建立品牌情感連結' },
    { type: 'sales', name: '銷售促進', description: '直接促進產品銷售' },
    { type: 'education', name: '教育推廣', description: '產品知識和功能教育' }
  ];

  const contentTypeOptions = [
    { type: 'video', name: '影片內容', description: '動態影片展示和介紹' },
    { type: 'image', name: '圖片內容', description: '靜態圖片展示' },
    { type: 'text', name: '文字內容', description: '詳細文字說明和介紹' },
    { type: 'story', name: '故事內容', description: '品牌故事或個人經歷分享' },
    { type: 'live', name: '直播內容', description: '即時互動和產品展示' },
    { type: 'reel', name: '短影片', description: '短時間的精彩內容' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">品牌資訊設定</h2>
        <div className="flex gap-2">
          <Button onClick={handleSave} variant="default">
            <Save className="w-4 h-4 mr-2" />
            儲存
          </Button>
          <Button onClick={onCancel} variant="outline">
            <X className="w-4 h-4 mr-2" />
            取消
          </Button>
        </div>
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic">基本資訊</TabsTrigger>
          <TabsTrigger value="tone">品牌調性</TabsTrigger>
          <TabsTrigger value="audience">目標受眾</TabsTrigger>
          <TabsTrigger value="goals">宣傳目標</TabsTrigger>
          <TabsTrigger value="content">內容偏好</TabsTrigger>
        </TabsList>

        {/* 基本資訊 */}
        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                品牌基本資訊
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="brandName">品牌名稱 *</Label>
                  <Input
                    id="brandName"
                    value={profile.name}
                    onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="例如：Apple、Nike"
                  />
                </div>
                <div>
                  <Label htmlFor="industry">產業類別 *</Label>
                  <Select value={profile.industry} onValueChange={(value) => setProfile(prev => ({ ...prev, industry: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="選擇產業" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technology">科技</SelectItem>
                      <SelectItem value="fashion">時尚</SelectItem>
                      <SelectItem value="beauty">美妝</SelectItem>
                      <SelectItem value="food">食品</SelectItem>
                      <SelectItem value="health">健康</SelectItem>
                      <SelectItem value="automotive">汽車</SelectItem>
                      <SelectItem value="finance">金融</SelectItem>
                      <SelectItem value="education">教育</SelectItem>
                      <SelectItem value="entertainment">娛樂</SelectItem>
                      <SelectItem value="sports">運動</SelectItem>
                      <SelectItem value="travel">旅遊</SelectItem>
                      <SelectItem value="home">居家</SelectItem>
                      <SelectItem value="other">其他</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="budgetRange">預算範圍</Label>
                  <Select value={profile.budgetRange} onValueChange={(value) => setProfile(prev => ({
                    ...prev,
                    budgetRange: value as any
                  }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="micro">微型 ($100-$500)</SelectItem>
                      <SelectItem value="small">小型 ($500-$2000)</SelectItem>
                      <SelectItem value="medium">中型 ($2000-$10000)</SelectItem>
                      <SelectItem value="large">大型 ($10000-$50000)</SelectItem>
                      <SelectItem value="premium">高級 ($50000+)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="productComplexity">產品複雜度</Label>
                  <Select value={profile.productComplexity} onValueChange={(value) => setProfile(prev => ({ ...prev, productComplexity: value as ProductComplexity }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="simple">簡單</SelectItem>
                      <SelectItem value="medium">中等</SelectItem>
                      <SelectItem value="complex">複雜</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>目標市場</Label>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {profile.targetMarkets?.map((market, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {market}
                      <button
                        onClick={() => removeTargetMarket(market)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="新增目標市場"
                    value={newTargetMarket}
                    onChange={(e) => setNewTargetMarket(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTargetMarket()}
                  />
                  <Button onClick={addTargetMarket} size="sm">新增</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 品牌調性 */}
        <TabsContent value="tone" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                品牌調性設定
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="personality">品牌個性</Label>
                  <Select value={profile.brandTone?.personality} onValueChange={(value) => setProfile(prev => ({
                    ...prev,
                    brandTone: {
                      ...prev.brandTone!,
                      personality: value as any
                    }
                  }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">專業</SelectItem>
                      <SelectItem value="friendly">友善</SelectItem>
                      <SelectItem value="luxury">奢華</SelectItem>
                      <SelectItem value="casual">休閒</SelectItem>
                      <SelectItem value="innovative">創新</SelectItem>
                      <SelectItem value="traditional">傳統</SelectItem>
                      <SelectItem value="playful">活潑</SelectItem>
                      <SelectItem value="sophisticated">精緻</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="communicationStyle">溝通風格</Label>
                  <Select value={profile.brandTone?.communicationStyle} onValueChange={(value) => setProfile(prev => ({
                    ...prev,
                    brandTone: {
                      ...prev.brandTone!,
                      communicationStyle: value as any
                    }
                  }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="formal">正式</SelectItem>
                      <SelectItem value="casual">輕鬆</SelectItem>
                      <SelectItem value="humorous">幽默</SelectItem>
                      <SelectItem value="inspirational">激勵</SelectItem>
                      <SelectItem value="educational">教育</SelectItem>
                      <SelectItem value="conversational">對話</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="visualStyle">視覺風格</Label>
                  <Select value={profile.brandTone?.visualStyle} onValueChange={(value) => setProfile(prev => ({
                    ...prev,
                    brandTone: {
                      ...prev.brandTone!,
                      visualStyle: value as any
                    }
                  }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="modern">現代</SelectItem>
                      <SelectItem value="vintage">復古</SelectItem>
                      <SelectItem value="minimalist">極簡</SelectItem>
                      <SelectItem value="colorful">繽紛</SelectItem>
                      <SelectItem value="elegant">優雅</SelectItem>
                      <SelectItem value="bold">大膽</SelectItem>
                      <SelectItem value="natural">自然</SelectItem>
                      <SelectItem value="tech">科技</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>品牌關鍵字</Label>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {profile.brandTone?.keywords?.map((keyword: string, index: number) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {keyword}
                      <button
                        onClick={() => removeKeyword(keyword)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="新增品牌關鍵字"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                  />
                  <Button onClick={addKeyword} size="sm">新增</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 目標受眾 */}
        <TabsContent value="audience" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                目標受眾設定
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ageRange">年齡範圍</Label>
                  <Select value={profile.targetAudience?.ageRanges?.[0] || ''} onValueChange={(value) => setProfile(prev => ({
                    ...prev,
                    targetAudience: {
                      ...prev.targetAudience!,
                      ageRanges: [value as any]
                    }
                  }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="13-17">13-17歲</SelectItem>
                      <SelectItem value="18-24">18-24歲</SelectItem>
                      <SelectItem value="25-34">25-34歲</SelectItem>
                      <SelectItem value="35-44">35-44歲</SelectItem>
                      <SelectItem value="45-54">45-54歲</SelectItem>
                      <SelectItem value="55+">55歲以上</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="gender">性別</Label>
                  <Select value={profile.targetAudience?.gender} onValueChange={(value) => setProfile(prev => ({
                    ...prev,
                    targetAudience: {
                      ...prev.targetAudience!,
                      gender: value as any
                    }
                  }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male_dominant">男性為主</SelectItem>
                      <SelectItem value="female_dominant">女性為主</SelectItem>
                      <SelectItem value="balanced">平衡</SelectItem>
                      <SelectItem value="other">其他</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="incomeLevel">收入水準</Label>
                  <Select value={profile.targetAudience?.incomeLevel} onValueChange={(value) => setProfile(prev => ({
                    ...prev,
                    targetAudience: {
                      ...prev.targetAudience!,
                      incomeLevel: value as any
                    }
                  }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">低收入</SelectItem>
                      <SelectItem value="middle">中等收入</SelectItem>
                      <SelectItem value="high">高收入</SelectItem>
                      <SelectItem value="luxury">奢侈品</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="lifestyle">生活風格</Label>
                  <Select value={profile.targetAudience?.lifestyle?.[0] || ''} onValueChange={(value) => setProfile(prev => ({
                    ...prev,
                    targetAudience: {
                      ...prev.targetAudience!,
                      lifestyle: [value]
                    }
                  }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="urban">都市</SelectItem>
                      <SelectItem value="suburban">郊區</SelectItem>
                      <SelectItem value="rural">鄉村</SelectItem>
                      <SelectItem value="student">學生</SelectItem>
                      <SelectItem value="professional">專業人士</SelectItem>
                      <SelectItem value="entrepreneur">創業者</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>興趣愛好</Label>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {profile.targetAudience?.interests?.map((interest, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {interest}
                      <button
                        onClick={() => removeInterest(interest)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="新增興趣愛好"
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                  />
                  <Button onClick={addInterest} size="sm">新增</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 宣傳目標 */}
        <TabsContent value="goals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                宣傳目標設定
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {campaignGoalOptions.map((goal) => {
                  const isSelected = profile.campaignGoals?.some(g => g.type === goal.type) || false;
                  return (
                    <div key={goal.type} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <Checkbox
                        id={goal.type}
                        checked={isSelected}
                        onCheckedChange={() => toggleCampaignGoal(goal.type, goal.name, goal.description)}
                      />
                      <div className="flex-1">
                        <Label htmlFor={goal.type} className="font-medium cursor-pointer">
                          {goal.name}
                        </Label>
                        <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 內容偏好 */}
        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                內容類型偏好
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {contentTypeOptions.map((contentType) => {
                  const isSelected = profile.preferredContentTypes?.some(t => t === contentType.type) || false;
                  return (
                    <div key={contentType.type} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <Checkbox
                        id={contentType.type}
                        checked={isSelected}
                        onCheckedChange={() => toggleContentType(contentType.type, contentType.name, contentType.description)}
                      />
                      <div className="flex-1">
                        <Label htmlFor={contentType.type} className="font-medium cursor-pointer">
                          {contentType.name}
                        </Label>
                        <p className="text-sm text-gray-600 mt-1">{contentType.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 
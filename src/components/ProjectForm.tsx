"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  FolderOpen, 
  Building2, 
  Target, 
  Users, 
  MessageSquare,
  Save,
  X
} from 'lucide-react';
import { Project } from '@/types';
import { BrandProfile } from '@/types/brand-matching';

interface ProjectEditData {
  name: string;
  description: string;
  budget: string;
  startDate: string;
  endDate: string;
  brandProfile?: BrandProfile;
}

interface ProjectFormProps {
  project?: Project;
  onSave: (project: Project) => void;
  onCancel: () => void;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({
  project,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState<ProjectEditData>({
    name: project?.name || '',
    description: project?.description || '',
    budget: project?.budget || '',
    startDate: project?.startDate || '',
    endDate: project?.endDate || '',
    brandProfile: project?.brandProfile || {
      id: '',
      name: '',
      industry: '',
      brandTone: {
        personality: 'professional' as any,
        communicationStyle: 'formal' as any,
        visualStyle: 'modern' as any,
        keywords: []
      },
      targetAudience: {
        ageRanges: ['25-34' as any],
        gender: 'balanced' as any,
        incomeLevel: 'middle' as any,
        interests: [],
        locations: ['taiwan'],
        lifestyle: ['urban']
      },
      campaignGoals: [],
      preferredContentTypes: [],
      targetMarkets: [],
      budgetRange: 'medium' as any,
      productComplexity: 'moderate' as any
    }
  });

  const [newKeyword, setNewKeyword] = useState('');
  const [newInterest, setNewInterest] = useState('');

  const handleSave = () => {
    if (!formData.name || !formData.description) {
      alert('❌ 請填寫專案名稱和描述後再儲存');
      return;
    }

    const completeProject: Project = {
      id: project?.id || `project-${Date.now()}`,
      name: formData.name,
      description: formData.description,
      budget: formData.budget,
      startDate: formData.startDate,
      endDate: formData.endDate,
      brandProfile: formData.brandProfile,
      status: project?.status || 'planning',
      createdAt: project?.createdAt || new Date(),
      createdBy: project?.createdBy || 'demo-user',
      permissions: project?.permissions || { 'demo-user': 'owner' },
      isPublic: project?.isPublic || false,
      targetAudience: formData.brandProfile?.targetAudience,
      campaignGoals: formData.brandProfile?.campaignGoals?.map(g => g.type),
      preferredContentTypes: formData.brandProfile?.preferredContentTypes?.map(t => t)
    };

    onSave(completeProject);
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !formData.brandProfile?.brandTone.keywords.includes(newKeyword.trim())) {
      setFormData(prev => ({
        ...prev,
        brandProfile: {
          ...prev.brandProfile!,
          brandTone: {
            ...prev.brandProfile!.brandTone,
            keywords: [...(prev.brandProfile?.brandTone.keywords || []), newKeyword.trim()]
          }
        }
      }));
      setNewKeyword('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      brandProfile: {
        ...prev.brandProfile!,
        brandTone: {
          ...prev.brandProfile!.brandTone,
          keywords: prev.brandProfile?.brandTone.keywords.filter((k: string) => k !== keyword) || []
        }
      }
    }));
  };

  const addInterest = () => {
    if (newInterest.trim() && !formData.brandProfile?.targetAudience.interests.includes(newInterest.trim())) {
      setFormData(prev => ({
        ...prev,
        brandProfile: {
          ...prev.brandProfile!,
          targetAudience: {
            ...prev.brandProfile!.targetAudience,
            interests: [...(prev.brandProfile?.targetAudience.interests || []), newInterest.trim()]
          }
        }
      }));
      setNewInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      brandProfile: {
        ...prev.brandProfile!,
        targetAudience: {
          ...prev.brandProfile!.targetAudience,
          interests: prev.brandProfile?.targetAudience.interests.filter(i => i !== interest) || []
        }
      }
    }));
  };

  const toggleCampaignGoal = (goalType: string, goalName: string, goalDescription: string) => {
    const currentGoals = formData.brandProfile?.campaignGoals || [];
    const isSelected = currentGoals.some(g => g.type === goalType);
    
    if (isSelected) {
      setFormData(prev => ({
        ...prev,
        brandProfile: {
          ...prev.brandProfile!,
          campaignGoals: currentGoals.filter(g => g.type !== goalType)
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        brandProfile: {
          ...prev.brandProfile!,
          campaignGoals: [...currentGoals, {
            type: goalType as any,
            priority: 'medium',
            targetMetrics: [],
            description: goalDescription
          }]
        }
      }));
    }
  };

  const toggleContentType = (contentType: string, contentTypeName: string, contentTypeDescription: string) => {
    const currentTypes = formData.brandProfile?.preferredContentTypes || [];
    const isSelected = currentTypes.some(t => t === contentType);
    
    if (isSelected) {
      setFormData(prev => ({
        ...prev,
        brandProfile: {
          ...prev.brandProfile!,
          preferredContentTypes: currentTypes.filter(t => t !== contentType)
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        brandProfile: {
          ...prev.brandProfile!,
          preferredContentTypes: [...currentTypes, contentType as any]
        }
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
        <h2 className="text-2xl font-bold">{project ? '編輯專案' : '新增專案'}</h2>
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">基本資訊</TabsTrigger>
          <TabsTrigger value="brand">品牌設定</TabsTrigger>
          <TabsTrigger value="goals">宣傳目標</TabsTrigger>
        </TabsList>

        {/* 基本資訊 */}
        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5" />
                專案基本資訊
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="projectName">專案名稱 *</Label>
                  <Input
                    id="projectName"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="例如：春季美妝新品推廣"
                  />
                </div>
                <div>
                  <Label htmlFor="budget">預算</Label>
                  <Input
                    id="budget"
                    value={formData.budget}
                    onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                    placeholder="例如：500,000 元"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">專案描述 *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="請描述專案目標、範圍和重點..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">開始日期</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">結束日期</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 品牌設定 */}
        <TabsContent value="brand" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                品牌資訊設定
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="brandName">品牌名稱</Label>
                  <Input
                    id="brandName"
                    value={formData.brandProfile?.name}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      brandProfile: {
                        ...prev.brandProfile!,
                        name: e.target.value
                      }
                    }))}
                    placeholder="例如：Apple、Nike"
                  />
                </div>
                <div>
                  <Label htmlFor="industry">產業類別</Label>
                  <Select value={formData.brandProfile?.industry} onValueChange={(value) => setFormData(prev => ({
                    ...prev,
                    brandProfile: {
                      ...prev.brandProfile!,
                      industry: value
                    }
                  }))}>
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="personality">品牌個性</Label>
                  <Select value={formData.brandProfile?.brandTone.personality} onValueChange={(value) => setFormData(prev => ({
                    ...prev,
                    brandProfile: {
                      ...prev.brandProfile!,
                      brandTone: {
                        ...prev.brandProfile!.brandTone,
                        personality: value as any
                      }
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
                  <Select value={formData.brandProfile?.brandTone.communicationStyle} onValueChange={(value) => setFormData(prev => ({
                    ...prev,
                    brandProfile: {
                      ...prev.brandProfile!,
                      brandTone: {
                        ...prev.brandProfile!.brandTone,
                        communicationStyle: value as any
                      }
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
                <div>
                  <Label htmlFor="visualStyle">視覺風格</Label>
                  <Select value={formData.brandProfile?.brandTone.visualStyle} onValueChange={(value) => setFormData(prev => ({
                    ...prev,
                    brandProfile: {
                      ...prev.brandProfile!,
                      brandTone: {
                        ...prev.brandProfile!.brandTone,
                        visualStyle: value as any
                      }
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
                  {formData.brandProfile?.brandTone.keywords?.map((keyword: string, index: number) => (
                    <span key={index} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                      {keyword}
                      <button
                        onClick={() => removeKeyword(keyword)}
                        className="ml-1 hover:text-red-600"
                      >
                        ×
                      </button>
                    </span>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ageRange">目標年齡</Label>
                  <Select value={formData.brandProfile?.targetAudience.ageRanges?.[0] || ''} onValueChange={(value) => setFormData(prev => ({
                    ...prev,
                    brandProfile: {
                      ...prev.brandProfile!,
                      targetAudience: {
                        ...prev.brandProfile!.targetAudience,
                        ageRanges: [value as any]
                      }
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
                  <Label htmlFor="gender">目標性別</Label>
                  <Select value={formData.brandProfile?.targetAudience.gender} onValueChange={(value) => setFormData(prev => ({
                    ...prev,
                    brandProfile: {
                      ...prev.brandProfile!,
                      targetAudience: {
                        ...prev.brandProfile!.targetAudience,
                        gender: value as any
                      }
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

              <div>
                <Label>興趣愛好</Label>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {formData.brandProfile?.targetAudience.interests?.map((interest, index) => (
                    <span key={index} className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                      {interest}
                      <button
                        onClick={() => removeInterest(interest)}
                        className="ml-1 hover:text-red-600"
                      >
                        ×
                      </button>
                    </span>
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
                  const isSelected = formData.brandProfile?.campaignGoals?.some(g => g.type === goal.type) || false;
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
                  const isSelected = formData.brandProfile?.preferredContentTypes?.some(t => t === contentType.type) || false;
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
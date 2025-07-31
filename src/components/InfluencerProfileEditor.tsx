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
import { 
  User, 
  DollarSign, 
  Phone, 
  Mail, 
  Calendar,
  Tag,
  Star,
  Edit,
  Save,
  X
} from 'lucide-react';

interface InfluencerProfileEditorProps {
  influencer: any;
  onSave: (profile: any) => void;
  onCancel: () => void;
}

export const InfluencerProfileEditor: React.FC<InfluencerProfileEditorProps> = ({
  influencer,
  onSave,
  onCancel
}) => {
  const [profile, setProfile] = useState({
    // 基本資訊
    name: influencer.profile?.name || '',
    platform: influencer.platform || '',
    categories: influencer.categories || [],
    bio: influencer.profile?.bio || '',
    
    // 合作費用
    baseRate: influencer.collaborationFees?.baseRate || 0,
    currency: influencer.collaborationFees?.currency || 'TWD',
    rateType: influencer.collaborationFees?.rateType || 'per_post',
    minimumBudget: influencer.collaborationFees?.minimumBudget || 0,
    paymentTerms: influencer.collaborationFees?.paymentTerms || '',
    
    // 聯絡資訊
    email: influencer.contactInfo?.email || '',
    phone: influencer.contactInfo?.phone || '',
    manager: influencer.contactInfo?.manager || '',
    preferredContact: influencer.contactInfo?.preferredContact || 'email',
    responseTime: influencer.contactInfo?.responseTime || '',
    
    // 可用性
    currentStatus: influencer.availability?.currentStatus || 'available',
    nextAvailableDate: influencer.availability?.nextAvailableDate || '',
    preferredTimeline: influencer.availability?.preferredTimeline || '',
    flexibility: influencer.availability?.flexibility || 'medium',
    
    // 合作偏好
    preferredBrands: influencer.preferences?.preferredBrands || [],
    avoidCategories: influencer.preferences?.avoidCategories || [],
    contentGuidelines: influencer.preferences?.contentGuidelines || [],
    creativeFreedom: influencer.preferences?.creativeFreedom || 'medium',
    exclusivity: influencer.preferences?.exclusivity || false
  });

  const [newCategory, setNewCategory] = useState('');
  const [newPreferredBrand, setNewPreferredBrand] = useState('');
  const [newAvoidCategory, setNewAvoidCategory] = useState('');
  const [newContentGuideline, setNewContentGuideline] = useState('');

  const handleSave = () => {
    onSave({
      ...influencer,
      profile: {
        ...influencer.profile,
        name: profile.name,
        bio: profile.bio
      },
      platform: profile.platform,
      categories: profile.categories,
      collaborationFees: {
        baseRate: profile.baseRate,
        currency: profile.currency,
        rateType: profile.rateType,
        minimumBudget: profile.minimumBudget,
        paymentTerms: profile.paymentTerms
      },
      contactInfo: {
        email: profile.email,
        phone: profile.phone,
        manager: profile.manager,
        preferredContact: profile.preferredContact,
        responseTime: profile.responseTime
      },
      availability: {
        currentStatus: profile.currentStatus,
        nextAvailableDate: profile.nextAvailableDate,
        preferredTimeline: profile.preferredTimeline,
        flexibility: profile.flexibility
      },
      preferences: {
        preferredBrands: profile.preferredBrands,
        avoidCategories: profile.avoidCategories,
        contentGuidelines: profile.contentGuidelines,
        creativeFreedom: profile.creativeFreedom,
        exclusivity: profile.exclusivity
      }
    });
  };

  const addCategory = () => {
    if (newCategory.trim() && !profile.categories.includes(newCategory.trim())) {
      setProfile(prev => ({
        ...prev,
        categories: [...prev.categories, newCategory.trim()]
      }));
      setNewCategory('');
    }
  };

  const removeCategory = (category: string) => {
    setProfile(prev => ({
      ...prev,
      categories: prev.categories.filter((c: string) => c !== category)
    }));
  };

  const addPreferredBrand = () => {
    if (newPreferredBrand.trim() && !profile.preferredBrands.includes(newPreferredBrand.trim())) {
      setProfile(prev => ({
        ...prev,
        preferredBrands: [...prev.preferredBrands, newPreferredBrand.trim()]
      }));
      setNewPreferredBrand('');
    }
  };

  const removePreferredBrand = (brand: string) => {
    setProfile(prev => ({
      ...prev,
      preferredBrands: prev.preferredBrands.filter((b: string) => b !== brand)
    }));
  };

  const addAvoidCategory = () => {
    if (newAvoidCategory.trim() && !profile.avoidCategories.includes(newAvoidCategory.trim())) {
      setProfile(prev => ({
        ...prev,
        avoidCategories: [...prev.avoidCategories, newAvoidCategory.trim()]
      }));
      setNewAvoidCategory('');
    }
  };

  const removeAvoidCategory = (category: string) => {
    setProfile(prev => ({
      ...prev,
      avoidCategories: prev.avoidCategories.filter((c: string) => c !== category)
    }));
  };

  const addContentGuideline = () => {
    if (newContentGuideline.trim() && !profile.contentGuidelines.includes(newContentGuideline.trim())) {
      setProfile(prev => ({
        ...prev,
        contentGuidelines: [...prev.contentGuidelines, newContentGuideline.trim()]
      }));
      setNewContentGuideline('');
    }
  };

  const removeContentGuideline = (guideline: string) => {
    setProfile(prev => ({
      ...prev,
      contentGuidelines: prev.contentGuidelines.filter((g: string) => g !== guideline)
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">編輯 KOL 基本資訊</h2>
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">基本資訊</TabsTrigger>
          <TabsTrigger value="fees">合作費用</TabsTrigger>
          <TabsTrigger value="contact">聯絡資訊</TabsTrigger>
          <TabsTrigger value="preferences">合作偏好</TabsTrigger>
        </TabsList>

        {/* 基本資訊 */}
        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                基本資訊
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">姓名</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="platform">平台</Label>
                  <Select value={profile.platform} onValueChange={(value) => setProfile(prev => ({ ...prev, platform: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Instagram">Instagram</SelectItem>
                      <SelectItem value="YouTube">YouTube</SelectItem>
                      <SelectItem value="TikTok">TikTok</SelectItem>
                      <SelectItem value="Facebook">Facebook</SelectItem>
                      <SelectItem value="Twitter">Twitter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="bio">個人簡介</Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                  rows={3}
                />
              </div>

              <div>
                <Label>品類標籤</Label>
                <div className="flex gap-2 mt-2">
                  {profile.categories.map((category: string, index: number) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {category}
                      <button
                        onClick={() => removeCategory(category)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="新增品類"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addCategory()}
                  />
                  <Button onClick={addCategory} size="sm">新增</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 合作費用 */}
        <TabsContent value="fees" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                合作費用
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="baseRate">基本費用</Label>
                  <Input
                    id="baseRate"
                    type="number"
                    value={profile.baseRate}
                    onChange={(e) => setProfile(prev => ({ ...prev, baseRate: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="currency">貨幣</Label>
                  <Select value={profile.currency} onValueChange={(value) => setProfile(prev => ({ ...prev, currency: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TWD">TWD</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="CNY">CNY</SelectItem>
                      <SelectItem value="JPY">JPY</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rateType">計費方式</Label>
                  <Select value={profile.rateType} onValueChange={(value) => setProfile(prev => ({ ...prev, rateType: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="per_post">單篇貼文</SelectItem>
                      <SelectItem value="per_campaign">整檔活動</SelectItem>
                      <SelectItem value="monthly">月費制</SelectItem>
                      <SelectItem value="negotiable">可議價</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="minimumBudget">最低預算</Label>
                  <Input
                    id="minimumBudget"
                    type="number"
                    value={profile.minimumBudget}
                    onChange={(e) => setProfile(prev => ({ ...prev, minimumBudget: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="paymentTerms">付款條件</Label>
                <Textarea
                  id="paymentTerms"
                  value={profile.paymentTerms}
                  onChange={(e) => setProfile(prev => ({ ...prev, paymentTerms: e.target.value }))}
                  placeholder="例如：簽約後付50%，完成後付50%"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 聯絡資訊 */}
        <TabsContent value="contact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                聯絡資訊
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">電子郵件</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">電話</Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="manager">經紀人</Label>
                  <Input
                    id="manager"
                    value={profile.manager}
                    onChange={(e) => setProfile(prev => ({ ...prev, manager: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="preferredContact">偏好聯絡方式</Label>
                  <Select value={profile.preferredContact} onValueChange={(value) => setProfile(prev => ({ ...prev, preferredContact: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">電子郵件</SelectItem>
                      <SelectItem value="phone">電話</SelectItem>
                      <SelectItem value="manager">經紀人</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="responseTime">回應時間</Label>
                <Input
                  id="responseTime"
                  value={profile.responseTime}
                  onChange={(e) => setProfile(prev => ({ ...prev, responseTime: e.target.value }))}
                  placeholder="例如：24小時內"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                可用性
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currentStatus">目前狀態</Label>
                  <Select value={profile.currentStatus} onValueChange={(value) => setProfile(prev => ({ ...prev, currentStatus: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">可合作</SelectItem>
                      <SelectItem value="busy">忙碌中</SelectItem>
                      <SelectItem value="unavailable">不可合作</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="flexibility">時間彈性</Label>
                  <Select value={profile.flexibility} onValueChange={(value) => setProfile(prev => ({ ...prev, flexibility: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">高</SelectItem>
                      <SelectItem value="medium">中</SelectItem>
                      <SelectItem value="low">低</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nextAvailableDate">下次可合作日期</Label>
                  <Input
                    id="nextAvailableDate"
                    type="date"
                    value={profile.nextAvailableDate}
                    onChange={(e) => setProfile(prev => ({ ...prev, nextAvailableDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="preferredTimeline">偏好時程</Label>
                  <Input
                    id="preferredTimeline"
                    value={profile.preferredTimeline}
                    onChange={(e) => setProfile(prev => ({ ...prev, preferredTimeline: e.target.value }))}
                    placeholder="例如：2-3週"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 合作偏好 */}
        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                合作偏好
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 偏好品牌 */}
              <div>
                <Label>偏好品牌類型</Label>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {profile.preferredBrands.map((brand: string, index: number) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {brand}
                      <button
                        onClick={() => removePreferredBrand(brand)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="新增偏好品牌"
                    value={newPreferredBrand}
                    onChange={(e) => setNewPreferredBrand(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addPreferredBrand()}
                  />
                  <Button onClick={addPreferredBrand} size="sm">新增</Button>
                </div>
              </div>

              {/* 避免類別 */}
              <div>
                <Label>避免合作類別</Label>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {profile.avoidCategories.map((category: string, index: number) => (
                    <Badge key={index} variant="destructive" className="flex items-center gap-1">
                      {category}
                      <button
                        onClick={() => removeAvoidCategory(category)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="新增避免類別"
                    value={newAvoidCategory}
                    onChange={(e) => setNewAvoidCategory(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addAvoidCategory()}
                  />
                  <Button onClick={addAvoidCategory} size="sm">新增</Button>
                </div>
              </div>

              {/* 內容指導原則 */}
              <div>
                <Label>內容指導原則</Label>
                <div className="space-y-2 mt-2">
                  {profile.contentGuidelines.map((guideline: string, index: number) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <span className="text-sm flex-1">{guideline}</span>
                      <button
                        onClick={() => removeContentGuideline(guideline)}
                        className="hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="新增內容指導原則"
                    value={newContentGuideline}
                    onChange={(e) => setNewContentGuideline(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addContentGuideline()}
                  />
                  <Button onClick={addContentGuideline} size="sm">新增</Button>
                </div>
              </div>

              {/* 其他偏好設定 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="creativeFreedom">創意自由度</Label>
                  <Select value={profile.creativeFreedom} onValueChange={(value) => setProfile(prev => ({ ...prev, creativeFreedom: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">高</SelectItem>
                      <SelectItem value="medium">中</SelectItem>
                      <SelectItem value="low">低</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="exclusivity"
                    checked={profile.exclusivity}
                    onChange={(e) => setProfile(prev => ({ ...prev, exclusivity: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="exclusivity">要求獨家合作</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 
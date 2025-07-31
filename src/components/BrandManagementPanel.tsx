"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Building2, 
  Plus, 
  Edit, 
  Trash2, 
  Target,
  Users,
  DollarSign
} from 'lucide-react';
import { BrandProfileForm } from './BrandProfileForm';
import { BrandProfile } from '@/types/brand-matching';

interface BrandManagementPanelProps {
  brands?: BrandProfile[];
  onSaveBrand?: (brand: BrandProfile) => void;
  onDeleteBrand?: (brandId: string) => void;
}

export const BrandManagementPanel: React.FC<BrandManagementPanelProps> = ({
  brands = [],
  onSaveBrand,
  onDeleteBrand
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<BrandProfile | undefined>();

  const handleSaveBrand = (brand: BrandProfile) => {
    if (onSaveBrand) {
      onSaveBrand(brand);
    }
    setIsFormOpen(false);
    setEditingBrand(undefined);
  };

  const handleEditBrand = (brand: BrandProfile) => {
    setEditingBrand(brand);
    setIsFormOpen(true);
  };

  const handleDeleteBrand = (brandId: string) => {
    if (confirm('確定要刪除此品牌嗎？')) {
      if (onDeleteBrand) {
        onDeleteBrand(brandId);
      }
    }
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingBrand(undefined);
  };

  const getIndustryLabel = (industry: string) => {
    const industryMap: Record<string, string> = {
      'technology': '科技',
      'fashion': '時尚',
      'beauty': '美妝',
      'food': '食品',
      'health': '健康',
      'automotive': '汽車',
      'finance': '金融',
      'education': '教育',
      'entertainment': '娛樂',
      'sports': '運動',
      'travel': '旅遊',
      'home': '居家',
      'other': '其他'
    };
    return industryMap[industry] || industry;
  };

  const getBudgetLabel = (budget: string) => {
    const budgetMap: Record<string, string> = {
      'micro': '微型',
      'small': '小型',
      'medium': '中型',
      'large': '大型',
      'premium': '高級'
    };
    return budgetMap[budget] || budget;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">品牌管理</h2>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingBrand(undefined)}>
              <Plus className="w-4 h-4 mr-2" />
              新增品牌
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingBrand ? '編輯品牌' : '新增品牌'}
              </DialogTitle>
            </DialogHeader>
            <BrandProfileForm
              brandProfile={editingBrand}
              onSave={handleSaveBrand}
              onCancel={handleCancel}
            />
          </DialogContent>
        </Dialog>
      </div>

      {brands.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">尚未建立品牌</h3>
            <p className="text-gray-500 text-center mb-4">
              點擊「新增品牌」開始建立您的第一個品牌檔案
            </p>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              新增品牌
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {brands.map((brand) => (
            <Card key={brand.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Building2 className="w-5 h-5" />
                      {brand.name}
                    </CardTitle>
                    <Badge variant="secondary" className="mt-2">
                      {getIndustryLabel(brand.industry)}
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditBrand(brand)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteBrand(brand.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Target className="w-4 h-4" />
                  <span>目標受眾: {brand.targetAudience.ageRanges.join(', ')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>性別: {brand.targetAudience.gender}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <DollarSign className="w-4 h-4" />
                  <span>預算: {getBudgetLabel(brand.budgetRange)}</span>
                </div>
                
                {brand.brandTone.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {brand.brandTone.keywords.slice(0, 3).map((keyword, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                    {brand.brandTone.keywords.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{brand.brandTone.keywords.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                {brand.campaignGoals.length > 0 && (
                  <div className="text-xs text-gray-500">
                    宣傳目標: {brand.campaignGoals.length} 項
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}; 
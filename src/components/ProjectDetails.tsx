"use client";

import { useState, useEffect } from "react";
import { Project, Influencer } from "@/types";
import { FirebaseService } from "@/lib/firebase-service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, DollarSign, FileText, TrendingUp, Eye, Edit3, Save, X } from "lucide-react";

interface ProjectDetailsProps {
  project: Project;
  onInfluencerSelect?: (influencer: Influencer) => void;
  onProjectUpdate?: (updatedProject: Project) => void;
}

export const ProjectDetails = ({ project, onInfluencerSelect, onProjectUpdate }: ProjectDetailsProps) => {
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // 編輯表單狀態
  const [editForm, setEditForm] = useState({
    name: project.name,
    description: project.description || '',
    budget: project.budget || '',
    startDate: project.startDate || '',
    endDate: project.endDate || '',
    status: project.status
  });

  useEffect(() => {
    const loadProjectInfluencers = async () => {
      try {
        setLoading(true);
        // 暫時使用空數組，後續實現真正的數據載入
        setInfluencers([]);
      } catch (error) {
        console.error('載入專案網紅失敗:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProjectInfluencers();
  }, [project.id]);

  // 當project變化時更新表單
  useEffect(() => {
    setEditForm({
      name: project.name,
      description: project.description || '',
      budget: project.budget || '',
      startDate: project.startDate || '',
      endDate: project.endDate || '',
      status: project.status
    });
  }, [project]);

  const handleEditToggle = () => {
    if (editMode) {
      // 取消編輯，重置表單
      setEditForm({
        name: project.name,
        description: project.description || '',
        budget: project.budget || '',
        startDate: project.startDate || '',
        endDate: project.endDate || '',
        status: project.status
      });
    }
    setEditMode(!editMode);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // 創建更新後的專案物件
      const updatedProject: Project = {
        ...project,
        name: editForm.name,
        description: editForm.description,
        budget: editForm.budget,
        startDate: editForm.startDate,
        endDate: editForm.endDate,
        status: editForm.status as any
      };

      // 這裡可以調用Firebase服務保存到資料庫
      // await FirebaseService.updateProject(project.id, updatedProject);
      
      // 通知父組件專案已更新
      onProjectUpdate?.(updatedProject);
      
      setEditMode(false);
      
      // 顯示成功訊息
      alert('✅ 專案資訊已成功更新！');
      
    } catch (error) {
      console.error('保存專案失敗:', error);
      alert('❌ 保存失敗，請稍後再試。');
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-yellow-100 text-yellow-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'planning': return '籌備中';
      case 'active': return '進行中';
      case 'completed': return '已完成';
      case 'cancelled': return '已取消';
      default: return '未知狀態';
    }
  };

  const formatFollowerCount = (followers?: number | string): string => {
    if (!followers) return 'N/A';
    const num = typeof followers === 'string' ? parseInt(followers.replace(/[^\d.]/g, '')) : followers;
    if (isNaN(num) || num === 0) return 'N/A';
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* 專案標題區域 */}
      <div className="flex-shrink-0 p-4 lg:p-6 border-b border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="flex-1">
            {editMode ? (
              // 編輯模式
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">專案名稱</label>
                  <Input
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="輸入專案名稱"
                    className="text-xl font-bold"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">專案描述</label>
                  <Textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="輸入專案描述"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">預算</label>
                    <Input
                      value={editForm.budget}
                      onChange={(e) => setEditForm(prev => ({ ...prev, budget: e.target.value }))}
                      placeholder="例如：500,000 元"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">狀態</label>
                    <Select 
                      value={editForm.status} 
                      onValueChange={(value) => setEditForm(prev => ({ ...prev, status: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planning">籌備中</SelectItem>
                        <SelectItem value="active">進行中</SelectItem>
                        <SelectItem value="completed">已完成</SelectItem>
                        <SelectItem value="cancelled">已取消</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">開始日期</label>
                    <Input
                      type="date"
                      value={editForm.startDate}
                      onChange={(e) => setEditForm(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">結束日期</label>
                    <Input
                      type="date"
                      value={editForm.endDate}
                      onChange={(e) => setEditForm(prev => ({ ...prev, endDate: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            ) : (
              // 顯示模式
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
                    {project.name}
                  </h2>
                  <Badge className={`px-3 py-1 ${getStatusColor(project.status)}`}>
                    {getStatusText(project.status)}
                  </Badge>
                </div>
                {project.description && (
                  <p className="text-gray-600 mb-3">{project.description}</p>
                )}
                
                {/* 專案基本資訊 */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {project.budget && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-600">預算：{project.budget}</span>
                    </div>
                  )}
                  
                  {project.startDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-600">開始：{project.startDate}</span>
                    </div>
                  )}
                  
                  {project.endDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-red-600" />
                      <span className="text-sm text-gray-600">結束：{project.endDate}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-600" />
                    <span className="text-sm text-gray-600">網紅：{influencers.length} 位</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex-shrink-0">
            {editMode ? (
              // 編輯模式按鈕
              <div className="flex gap-2">
                <Button 
                  onClick={handleSave}
                  disabled={saving || !editForm.name.trim()}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                >
                  <Save className="w-4 h-4" />
                  {saving ? '保存中...' : '保存'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleEditToggle}
                  disabled={saving}
                  className="flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  取消
                </Button>
              </div>
            ) : (
              // 正常模式按鈕
              <Button 
                variant="outline"
                onClick={handleEditToggle}
                className="flex items-center gap-2"
              >
                <Edit3 className="w-4 h-4" />
                編輯專案
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 專案內容區域 */}
      <div className="flex-1 overflow-auto">
        <Tabs defaultValue="influencers" className="h-full flex flex-col">
          <div className="flex-shrink-0 px-4 lg:px-6 pt-4 border-b border-gray-100">
            <TabsList className="grid w-full grid-cols-3 bg-gray-50/80 p-1">
              <TabsTrigger value="influencers" className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4" />
                <span>網紅列表</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>數據分析</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2 text-sm">
                <FileText className="w-4 h-4" />
                <span>專案設定</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-auto">
            <TabsContent value="influencers" className="h-full m-0 p-4 lg:p-6 pt-4">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-gray-500">載入中...</div>
                </div>
              ) : influencers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">尚未添加網紅</h3>
                  <p className="text-gray-600 mb-4">開始分析網紅數據並添加到此專案</p>
                  <Button variant="outline">
                    前往網紅分析
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {influencers.map((influencer) => (
                    <Card 
                      key={influencer.id} 
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => onInfluencerSelect?.(influencer)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                            {influencer.profile?.name?.charAt(0) || 'N'}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-gray-900">{influencer.profile?.name}</h4>
                              <Badge variant="secondary">{influencer.platform}</Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>粉絲：{formatFollowerCount(influencer.profile?.followers)}</span>
                              {influencer.latestScore && (
                                <span>評分：{influencer.latestScore}/100</span>
                              )}
                              <span>更新：{new Date(influencer.createdAt instanceof Date ? influencer.createdAt : influencer.createdAt.toDate()).toLocaleDateString()}</span>
                            </div>
                          </div>

                          <div className="flex-shrink-0">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="analytics" className="h-full m-0 p-4 lg:p-6 pt-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      專案統計
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">總網紅數量</span>
                        <span className="font-semibold">{influencers.length} 位</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">平均評分</span>
                        <span className="font-semibold">
                          {influencers.length > 0 
                            ? (influencers.reduce((sum, inf) => sum + (inf.latestScore || 0), 0) / influencers.length).toFixed(1)
                            : 'N/A'
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">總粉絲數</span>
                        <span className="font-semibold">
                          {formatFollowerCount(
                            influencers.reduce((sum, inf) => {
                              const followersValue = inf.profile?.followers;
                              const followers = typeof followersValue === 'string' 
                                ? parseInt(followersValue.replace(/[^\d.]/g, '')) || 0
                                : typeof followersValue === 'number' ? followersValue : 0;
                              return sum + followers;
                            }, 0)
                          )}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>平台分布</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(
                        influencers.reduce((acc, inf) => {
                          acc[inf.platform] = (acc[inf.platform] || 0) + 1;
                          return acc;
                        }, {} as Record<string, number>)
                      ).map(([platform, count]) => (
                        <div key={platform} className="flex justify-between items-center">
                          <span className="text-gray-600">{platform}</span>
                          <Badge variant="outline">{count} 位</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="h-full m-0 p-4 lg:p-6 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>專案設定</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">專案名稱</label>
                      <p className="mt-1 text-gray-900">{project.name}</p>
                    </div>
                    
                    {project.description && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">專案描述</label>
                        <p className="mt-1 text-gray-900">{project.description}</p>
                      </div>
                    )}
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700">創建時間</label>
                      <p className="mt-1 text-gray-900">
                        {new Date(project.createdAt).toLocaleString()}
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700">狀態</label>
                      <p className="mt-1">
                        <Badge className={getStatusColor(project.status)}>
                          {getStatusText(project.status)}
                        </Badge>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}; 
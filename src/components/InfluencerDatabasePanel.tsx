"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Database, 
  Upload, 
  Download, 
  Search, 
  Users, 
  FolderOpen,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Project, Influencer } from '@/types';

interface InfluencerDatabasePanelProps {
  selectedProject: Project | null;
  onInfluencerSelect: (influencer: Influencer) => void;
}

export const InfluencerDatabasePanel: React.FC<InfluencerDatabasePanelProps> = ({
  selectedProject,
  onInfluencerSelect
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'global' | 'sync' | 'stats'>('global');
  const [globalInfluencers, setGlobalInfluencers] = useState<Influencer[]>([]);
  const [projectInfluencers, setProjectInfluencers] = useState<Influencer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedInfluencers, setSelectedInfluencers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncResult, setSyncResult] = useState<{
    success: boolean;
    message: string;
    syncedCount: number;
    duplicatesFound: number;
  } | null>(null);

  // 模擬資料庫統計
  const [stats, setStats] = useState({
    totalInfluencers: 0,
    projectInfluencers: 0,
    globalInfluencers: 0,
    duplicateCount: 0,
    lastSyncTime: new Date()
  });

  useEffect(() => {
    if (user) {
      loadGlobalInfluencers();
      if (selectedProject) {
        loadProjectInfluencers();
      }
      updateStats();
    }
  }, [user, selectedProject]);

  const loadGlobalInfluencers = async () => {
    setLoading(true);
    try {
      // 模擬載入全域網紅資料
      const mockGlobalInfluencers: Influencer[] = [
        {
          id: 'global-1',
          url: 'https://instagram.com/global_influencer_1',
          platform: 'Instagram',
          profile: {
            name: '全域網紅 1',
            platform: 'Instagram',
            followers: 500000,
            bio: '美妝部落客',
            avatar: 'https://placehold.co/100x100',
            recentPosts: [],
            audienceLocation: 'Taiwan',
            contentTopics: ['美妝', '保養'],
            contentStyle: ['專業', '親切'],
            recentContentAnalysis: {
              mainTopics: '美妝教學',
              engagementTrend: '上升',
              contentFrequency: '每週3次',
              popularContentType: '影片'
            }
          },
          createdAt: new Date(),
          createdBy: user?.uid || 'demo-user',
          latestScore: 85,
          tags: ['美妝', '專業'],
          notes: '高品質美妝內容創作者'
        },
        {
          id: 'global-2',
          url: 'https://youtube.com/global_influencer_2',
          platform: 'YouTube',
          profile: {
            name: '全域網紅 2',
            platform: 'YouTube',
            followers: 800000,
            bio: '科技評測',
            avatar: 'https://placehold.co/100x100',
            recentPosts: [],
            audienceLocation: 'Taiwan',
            contentTopics: ['科技', '評測'],
            contentStyle: ['專業', '詳細'],
            recentContentAnalysis: {
              mainTopics: '科技評測',
              engagementTrend: '穩定',
              contentFrequency: '每週2次',
              popularContentType: '長影片'
            }
          },
          createdAt: new Date(),
          createdBy: user?.uid || 'demo-user',
          latestScore: 92,
          tags: ['科技', '評測'],
          notes: '專業科技評測頻道'
        }
      ];
      
      setGlobalInfluencers(mockGlobalInfluencers);
    } catch (error) {
      console.error('載入全域網紅失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProjectInfluencers = async () => {
    if (!selectedProject) return;
    
    setLoading(true);
    try {
      // 模擬載入專案網紅資料
      const mockProjectInfluencers: Influencer[] = [
        {
          id: 'project-1',
          url: 'https://instagram.com/project_influencer_1',
          platform: 'Instagram',
          profile: {
            name: '專案網紅 1',
            platform: 'Instagram',
            followers: 300000,
            bio: '時尚穿搭',
            avatar: 'https://placehold.co/100x100',
            recentPosts: [],
            audienceLocation: 'Taiwan',
            contentTopics: ['時尚', '穿搭'],
            contentStyle: ['時尚', '年輕'],
            recentContentAnalysis: {
              mainTopics: '時尚穿搭',
              engagementTrend: '上升',
              contentFrequency: '每日1次',
              popularContentType: '圖片'
            }
          },
          createdAt: new Date(),
          createdBy: user?.uid || 'demo-user',
          latestScore: 78,
          tags: ['時尚', '穿搭'],
          notes: '專案專屬網紅'
        }
      ];
      
      setProjectInfluencers(mockProjectInfluencers);
    } catch (error) {
      console.error('載入專案網紅失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStats = () => {
    setStats({
      totalInfluencers: globalInfluencers.length + projectInfluencers.length,
      projectInfluencers: projectInfluencers.length,
      globalInfluencers: globalInfluencers.length,
      duplicateCount: 0,
      lastSyncTime: new Date()
    });
  };

  const handleSyncToGlobal = async () => {
    if (!selectedProject) return;
    
    setLoading(true);
    try {
      // 模擬同步操作
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const result = {
        success: true,
        message: `成功同步 ${projectInfluencers.length} 位網紅到全域資料庫`,
        syncedCount: projectInfluencers.length,
        duplicatesFound: 0
      };
      
      setSyncResult(result);
      updateStats();
    } catch (error) {
      setSyncResult({
        success: false,
        message: `同步失敗: ${error}`,
        syncedCount: 0,
        duplicatesFound: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToProject = async (influencerId: string) => {
    if (!selectedProject) return;
    
    try {
      const influencer = globalInfluencers.find(inf => inf.id === influencerId);
      if (influencer) {
        // 模擬添加到專案
        setProjectInfluencers(prev => [...prev, influencer]);
        updateStats();
      }
    } catch (error) {
      console.error('添加到專案失敗:', error);
    }
  };

  const filteredGlobalInfluencers = globalInfluencers.filter(influencer => {
    const matchesQuery = !searchQuery || 
      influencer.profile?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlatform = selectedPlatform === 'all' || !selectedPlatform || influencer.platform === selectedPlatform;
    return matchesQuery && matchesPlatform;
  });

  const handleInfluencerToggle = (influencerId: string) => {
    setSelectedInfluencers(prev => 
      prev.includes(influencerId) 
        ? prev.filter(id => id !== influencerId)
        : [...prev, influencerId]
    );
  };

  const handleBulkAddToProject = async () => {
    if (!selectedProject || selectedInfluencers.length === 0) return;
    
    setLoading(true);
    try {
      const influencersToAdd = globalInfluencers.filter(inf => 
        selectedInfluencers.includes(inf.id)
      );
      
      // 模擬批量添加
      setProjectInfluencers(prev => [...prev, ...influencersToAdd]);
      setSelectedInfluencers([]);
      updateStats();
    } catch (error) {
      console.error('批量添加失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white border border-gray-200 rounded-lg">
      {/* 標籤頁切換 */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('global')}
          className={`flex items-center gap-2 px-4 py-3 font-medium ${
            activeTab === 'global' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Database className="w-4 h-4" />
          全域資料庫
        </button>
        <button
          onClick={() => setActiveTab('sync')}
          className={`flex items-center gap-2 px-4 py-3 font-medium ${
            activeTab === 'sync' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Upload className="w-4 h-4" />
          同步管理
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex items-center gap-2 px-4 py-3 font-medium ${
            activeTab === 'stats' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Users className="w-4 h-4" />
          統計資訊
        </button>
      </div>

      <div className="p-4">
        {/* 全域資料庫標籤頁 */}
        {activeTab === 'global' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">全域網紅資料庫</h3>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={loadGlobalInfluencers}
                  disabled={loading}
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  重新載入
                </Button>
              </div>
            </div>

            {/* 搜尋和篩選 */}
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="search">搜尋網紅</Label>
                <Input
                  id="search"
                  placeholder="輸入網紅名稱或 URL"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="w-48">
                <Label htmlFor="platform">平台篩選</Label>
                <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                  <SelectTrigger>
                    <SelectValue placeholder="所有平台" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有平台</SelectItem>
                    <SelectItem value="Instagram">Instagram</SelectItem>
                    <SelectItem value="YouTube">YouTube</SelectItem>
                    <SelectItem value="TikTok">TikTok</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 批量操作 */}
            {selectedInfluencers.length > 0 && (
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm text-blue-800">
                  已選擇 {selectedInfluencers.length} 位網紅
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedInfluencers([])}
                  >
                    <X className="w-4 h-4" />
                    取消選擇
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleBulkAddToProject}
                    disabled={!selectedProject || loading}
                  >
                    <FolderOpen className="w-4 h-4" />
                    批量添加到專案
                  </Button>
                </div>
              </div>
            )}

            {/* 網紅列表 */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredGlobalInfluencers.map((influencer) => (
                <div
                  key={influencer.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedInfluencers.includes(influencer.id)
                      ? 'bg-blue-100 border-blue-300'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => onInfluencerSelect(influencer)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={selectedInfluencers.includes(influencer.id)}
                        onCheckedChange={() => handleInfluencerToggle(influencer.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <Avatar
                        src={influencer.profile?.avatar}
                        name={influencer.profile?.name || influencer.id.toString()}
                        alt={influencer.profile?.name || '未知'}
                        size="md"
                      />
                      <div>
                        <p className="font-medium text-gray-900">
                          {influencer.profile?.name || '未知姓名'}
                        </p>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {influencer.platform}
                          </Badge>
                          {influencer.profile?.followers && (
                            <span className="text-sm text-gray-500">
                              {influencer.profile.followers >= 1000000
                                ? `${(influencer.profile.followers / 1000000).toFixed(1)}M`
                                : influencer.profile.followers >= 1000
                                  ? `${(influencer.profile.followers / 1000).toFixed(0)}K`
                                  : influencer.profile.followers.toString()
                              } 粉絲
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {influencer.latestScore && (
                        <Badge variant="secondary" className="text-xs">
                          {influencer.latestScore} 分
                        </Badge>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToProject(influencer.id);
                        }}
                        disabled={!selectedProject}
                      >
                        <FolderOpen className="w-4 h-4" />
                        添加到專案
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 同步管理標籤頁 */}
        {activeTab === 'sync' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">專案同步管理</h3>
            </div>

            {selectedProject ? (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FolderOpen className="w-5 h-5" />
                      {selectedProject.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{projectInfluencers.length}</p>
                        <p className="text-sm text-gray-600">專案網紅</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{globalInfluencers.length}</p>
                        <p className="text-sm text-gray-600">全域網紅</p>
                      </div>
                    </div>

                    <Button
                      onClick={handleSyncToGlobal}
                      disabled={loading || projectInfluencers.length === 0}
                      className="w-full"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {loading ? '同步中...' : '同步專案網紅到全域資料庫'}
                    </Button>

                    {syncResult && (
                      <div className={`mt-4 p-3 rounded-lg ${
                        syncResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                      }`}>
                        <div className="flex items-center gap-2">
                          {syncResult.success ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-600" />
                          )}
                          <span className={`text-sm ${syncResult.success ? 'text-green-800' : 'text-red-800'}`}>
                            {syncResult.message}
                          </span>
                        </div>
                        {syncResult.success && (
                          <div className="mt-2 text-sm text-green-700">
                            同步數量: {syncResult.syncedCount} | 重複數量: {syncResult.duplicatesFound}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FolderOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>請先選擇一個專案來管理同步</p>
              </div>
            )}
          </div>
        )}

        {/* 統計資訊標籤頁 */}
        {activeTab === 'stats' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">資料庫統計</h3>
              <Button
                size="sm"
                variant="outline"
                onClick={updateStats}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                更新統計
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="text-center p-4">
                  <p className="text-2xl font-bold text-blue-600">{stats.totalInfluencers}</p>
                  <p className="text-sm text-gray-600">總網紅數</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="text-center p-4">
                  <p className="text-2xl font-bold text-green-600">{stats.globalInfluencers}</p>
                  <p className="text-sm text-gray-600">全域網紅</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="text-center p-4">
                  <p className="text-2xl font-bold text-orange-600">{stats.projectInfluencers}</p>
                  <p className="text-sm text-gray-600">專案網紅</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="text-center p-4">
                  <p className="text-2xl font-bold text-red-600">{stats.duplicateCount}</p>
                  <p className="text-sm text-gray-600">重複資料</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>最近同步時間</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  {stats.lastSyncTime.toLocaleString('zh-TW')}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}; 
"use client";

import React from "react";
import { DemoInfluencer, ProjectInfo } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar } from "@/components/ui/avatar";
import { GitCompare, Filter, Search, Edit, Save, X, Plus, Users } from "lucide-react";

interface InfluencersPageProps {
  demoInfluencers: DemoInfluencer[];
  projects: ProjectInfo[];
  selectedProject: ProjectInfo | null;
  selectedInfluencer: DemoInfluencer | null;
  setSelectedInfluencer: (influencer: DemoInfluencer | null) => void;
  compareMode: boolean;
  setCompareMode: (mode: boolean) => void;
  selectedInfluencers: number[];
  setSelectedInfluencers: (influencers: number[]) => void;
  showComparison: boolean;
  setShowComparison: (show: boolean) => void;
  filterCategory: string;
  filterPlatform: string;
  setFilterCategory: (category: string) => void;
  setFilterPlatform: (platform: string) => void;
  editingFollowers: boolean;
  setEditingFollowers: (editing: boolean) => void;
  editFollowersValue: string;
  setEditFollowersValue: (value: string) => void;
  editReason: string;
  setEditReason: (reason: string) => void;
  showFollowersHistory: boolean;
  setShowFollowersHistory: (show: boolean) => void;
  showProjectSelect: boolean;
  setShowProjectSelect: (show: boolean) => void;
  targetInfluencerId: number | null;
  setTargetInfluencerId: (id: number | null) => void;
  startEditFollowers: (influencer: DemoInfluencer) => void;
  saveFollowersEdit: () => void;
  cancelEditFollowers: () => void;
  addToProject: (influencer: DemoInfluencer) => void;
  removeFromProject: (influencer: DemoInfluencer) => void;
  addInfluencerToProject: (influencerId: number, projectId: string) => void;
}

const InfluencersPage: React.FC<InfluencersPageProps> = ({
  demoInfluencers,
  projects,
  selectedProject,
  selectedInfluencer,
  setSelectedInfluencer,
  compareMode,
  setCompareMode,
  selectedInfluencers,
  setSelectedInfluencers,
  showComparison,
  setShowComparison,
  filterCategory,
  filterPlatform,
  setFilterCategory,
  setFilterPlatform,
  editingFollowers,
  setEditingFollowers,
  editFollowersValue,
  setEditFollowersValue,
  editReason,
  setEditReason,
  showFollowersHistory,
  setShowFollowersHistory,
  showProjectSelect,
  setShowProjectSelect,
  targetInfluencerId,
  setTargetInfluencerId,
  startEditFollowers,
  saveFollowersEdit,
  cancelEditFollowers,
  addToProject,
  removeFromProject,
  addInfluencerToProject,
}) => {
  // Filter influencers based on category and platform
  const filteredInfluencers = demoInfluencers.filter((influencer) => {
    const categoryMatch = filterCategory === "all" || influencer.category === filterCategory;
    const platformMatch = filterPlatform === "all" || influencer.platform === filterPlatform;
    return categoryMatch && platformMatch;
  });

  const handleInfluencerSelect = (influencer: DemoInfluencer) => {
    if (compareMode) {
      const isSelected = selectedInfluencers.includes(influencer.id);
      if (isSelected) {
        setSelectedInfluencers(selectedInfluencers.filter(id => id !== influencer.id));
      } else {
        setSelectedInfluencers([...selectedInfluencers, influencer.id]);
      }
    } else {
      setSelectedInfluencer(influencer);
    }
  };

  const handleCompareToggle = () => {
    setCompareMode(!compareMode);
    setSelectedInfluencers([]);
  };

  const handleStartComparison = () => {
    if (selectedInfluencers.length >= 2) {
      setShowComparison(true);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 60) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">網紅管理</h2>
          <p className="text-gray-600">管理您的網紅資料庫</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant={compareMode ? "default" : "outline"}
            onClick={handleCompareToggle}
            className="flex items-center space-x-2"
          >
            <GitCompare className="w-4 h-4" />
            <span>{compareMode ? "結束比較" : "比較模式"}</span>
          </Button>
          {compareMode && selectedInfluencers.length >= 2 && (
            <Button onClick={handleStartComparison} className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>開始比較 ({selectedInfluencers.length})</span>
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>篩選條件</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">分類</label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="選擇分類" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="美妝">美妝</SelectItem>
                  <SelectItem value="時尚">時尚</SelectItem>
                  <SelectItem value="生活">生活</SelectItem>
                  <SelectItem value="科技">科技</SelectItem>
                  <SelectItem value="美食">美食</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">平台</label>
              <Select value={filterPlatform} onValueChange={setFilterPlatform}>
                <SelectTrigger>
                  <SelectValue placeholder="選擇平台" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="Instagram">Instagram</SelectItem>
                  <SelectItem value="YouTube">YouTube</SelectItem>
                  <SelectItem value="TikTok">TikTok</SelectItem>
                  <SelectItem value="Facebook">Facebook</SelectItem>
                  <SelectItem value="Twitter">Twitter</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">搜尋</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="搜尋網紅名稱..."
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Influencers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredInfluencers.map((influencer) => {
          const isSelected = selectedInfluencers.includes(influencer.id);
          const isEditing = editingFollowers && targetInfluencerId === influencer.id;

          return (
            <Card
              key={influencer.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                compareMode && isSelected ? "ring-2 ring-blue-500" : ""
              }`}
              onClick={() => handleInfluencerSelect(influencer)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  {compareMode && (
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleInfluencerSelect(influencer)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                  <Avatar
                    src={influencer.avatar}
                    name={influencer.name}
                    alt={influencer.name}
                    size="lg"
                  />
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditFollowers(influencer);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-800 truncate">{influencer.name}</h3>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {influencer.platform}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {influencer.category}
                    </Badge>
                  </div>

                  {isEditing ? (
                    <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                      <Input
                        value={editFollowersValue}
                        onChange={(e) => setEditFollowersValue(e.target.value)}
                        placeholder="粉絲數"
                        className="text-sm"
                      />
                      <Input
                        value={editReason}
                        onChange={(e) => setEditReason(e.target.value)}
                        placeholder="修改原因"
                        className="text-sm"
                      />
                      <div className="flex space-x-1">
                        <Button size="sm" onClick={saveFollowersEdit}>
                          <Save className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={cancelEditFollowers}>
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">{influencer.followers} 粉絲</p>
                      <p className="text-sm text-gray-600">互動率: {influencer.engagementRate}</p>
                      <div className="flex items-center justify-between">
                        <Badge className={`text-xs ${getScoreColor(influencer.score)}`}>
                          {influencer.score.toFixed(1)} 分
                        </Badge>
                        <div className="flex space-x-1">
                          {selectedProject && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                addInfluencerToProject(influencer.id, selectedProject.id);
                              }}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredInfluencers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">沒有找到符合條件的網紅</p>
        </div>
      )}
    </div>
  );
};

export default InfluencersPage; 
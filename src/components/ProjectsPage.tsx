"use client";

import React from "react";
import { ProjectInfo, DemoInfluencer } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Save, X, Calendar, Users, DollarSign, Target } from "lucide-react";

interface ProjectsPageProps {
  projects: ProjectInfo[];
  demoInfluencers: DemoInfluencer[];
  selectedProject: ProjectInfo | null;
  setSelectedProject: (project: ProjectInfo | null) => void;
  newProject: {
    name: string;
    description: string;
    budget: string;
    startDate: string;
    endDate: string;
  };
  setNewProject: (project: any) => void;
  editingProject: boolean;
  setEditingProject: (editing: boolean) => void;
  editProjectData: {
    name: string;
    description: string;
    budget: string;
    startDate: string;
    endDate: string;
  };
  setEditProjectData: (data: any) => void;
  addProject: () => void;
  startEditProject: () => void;
  saveProjectEdit: () => void;
  cancelEditProject: () => void;
  updateProjectStatus: (newStatus: string) => void;
}

const ProjectsPage: React.FC<ProjectsPageProps> = ({
  projects,
  demoInfluencers,
  selectedProject,
  setSelectedProject,
  newProject,
  setNewProject,
  editingProject,
  setEditingProject,
  editProjectData,
  setEditProjectData,
  addProject,
  startEditProject,
  saveProjectEdit,
  cancelEditProject,
  updateProjectStatus,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "進行中":
        return "bg-green-100 text-green-800";
      case "已完成":
        return "bg-blue-100 text-blue-800";
      case "暫停":
        return "bg-yellow-100 text-yellow-800";
      case "籌備中":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getProjectInfluencers = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project || !project.influencers) return [];
    return demoInfluencers.filter(inf => project.influencers!.includes(inf.id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">專案管理</h2>
          <p className="text-gray-600">管理您的行銷專案</p>
        </div>
        <Button onClick={addProject} className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>新增專案</span>
        </Button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => {
          const projectInfluencers = getProjectInfluencers(project.id);
          const isSelected = selectedProject?.id === project.id;

          return (
            <Card
              key={project.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                isSelected ? "ring-2 ring-blue-500" : ""
              }`}
              onClick={() => setSelectedProject(project)}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  <Badge className={getStatusColor(project.status)}>
                    {project.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 text-sm">{project.description}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <DollarSign className="w-4 h-4" />
                    <span>預算: {project.budget}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{project.startDate} - {project.endDate}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{projectInfluencers.length} 位網紅</span>
                  </div>
                </div>

                {/* Project Influencers */}
                {projectInfluencers.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">參與網紅</h4>
                    <div className="flex flex-wrap gap-1">
                      {projectInfluencers.slice(0, 3).map((influencer) => (
                        <div
                          key={influencer.id}
                          className="flex items-center space-x-1 bg-gray-100 rounded-full px-2 py-1"
                        >
                          <img
                            src={influencer.avatar}
                            alt={influencer.name}
                            className="w-4 h-4 rounded-full"
                          />
                          <span className="text-xs text-gray-600 truncate max-w-16">
                            {influencer.name}
                          </span>
                        </div>
                      ))}
                      {projectInfluencers.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{projectInfluencers.length - 3} 更多
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProject(project);
                    }}
                  >
                    <Target className="w-3 h-3 mr-1" />
                    查看詳情
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditProjectData({
                        name: project.name,
                        description: project.description,
                        budget: project.budget,
                        startDate: project.startDate,
                        endDate: project.endDate,
                      });
                      startEditProject();
                    }}
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add Project Modal */}
      {editingProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6 m-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">新增專案</h3>
              <Button variant="ghost" size="sm" onClick={cancelEditProject}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">專案名稱</label>
                <Input
                  value={editProjectData.name}
                  onChange={(e) => setEditProjectData({ ...editProjectData, name: e.target.value })}
                  placeholder="輸入專案名稱"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">專案描述</label>
                <Textarea
                  value={editProjectData.description}
                  onChange={(e) => setEditProjectData({ ...editProjectData, description: e.target.value })}
                  placeholder="輸入專案描述"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">預算</label>
                <Input
                  value={editProjectData.budget}
                  onChange={(e) => setEditProjectData({ ...editProjectData, budget: e.target.value })}
                  placeholder="例如: 500,000 元"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">開始日期</label>
                  <Input
                    type="date"
                    value={editProjectData.startDate}
                    onChange={(e) => setEditProjectData({ ...editProjectData, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">結束日期</label>
                  <Input
                    type="date"
                    value={editProjectData.endDate}
                    onChange={(e) => setEditProjectData({ ...editProjectData, endDate: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="flex space-x-2 pt-4">
                <Button onClick={saveProjectEdit} className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  儲存
                </Button>
                <Button variant="outline" onClick={cancelEditProject} className="flex-1">
                  取消
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {projects.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">尚無專案，點擊「新增專案」開始您的第一個專案</p>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage; 
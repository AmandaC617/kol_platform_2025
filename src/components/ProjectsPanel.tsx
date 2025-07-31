"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { FirebaseService } from "@/lib/firebase-service";
import { Project } from "@/types";
import { Unsubscribe } from "firebase/firestore";
import { ProjectForm } from "./ProjectForm";

interface ProjectsPanelProps {
  selectedProject: Project | null;
  onProjectSelect: (project: Project) => void;
}

export const ProjectsPanel = ({ selectedProject, onProjectSelect }: ProjectsPanelProps) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    let unsubscribe: Unsubscribe;

    const loadProjects = async () => {
      unsubscribe = FirebaseService.subscribeToProjects(user.uid, (projectsData) => {
        setProjects(projectsData);
      });
    };

    loadProjects();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user]);

  const handleCreateProject = async (project: Project) => {
    if (!user) return;

    setLoading(true);
    try {
      // 暫時只保存專案名稱，後續可以擴展 FirebaseService
      await FirebaseService.createProject(user.uid, project.name);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to create project:", error);
      alert("建立專案失敗，請稍後再試。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-1/4 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-bold">專案列表</h2>
        <Button size="sm" onClick={() => setIsModalOpen(true)}>+</Button>
      </div>

      <div className="flex-grow overflow-y-auto p-2 space-y-2 no-scrollbar">
        {projects.length === 0 ? (
          <p className="text-center text-gray-500 p-4">尚未建立任何專案。</p>
        ) : (
          projects.map((project) => (
            <div
              key={project.id}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                selectedProject?.id === project.id
                  ? "bg-blue-100 border-blue-300"
                  : "bg-gray-50 hover:bg-gray-100"
              }`}
              onClick={() => onProjectSelect(project)}
            >
              <h3 className="font-medium text-gray-900">{project.name}</h3>
              {project.description && (
                <p className="text-sm text-gray-600 mt-1">{project.description}</p>
              )}
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500">
                  {project.status === 'planning' && '籌備中'}
                  {project.status === 'active' && '進行中'}
                  {project.status === 'completed' && '已完成'}
                  {project.status === 'cancelled' && '已取消'}
                </span>
                {project.brandProfile && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    已設定品牌
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 專案表單 Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <ProjectForm
              onSave={handleCreateProject}
              onCancel={() => setIsModalOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

"use client";

import { useState, useEffect } from "react";
import { Header } from "./Header";
import { ProjectsPanel } from "./ProjectsPanel";
import { InfluencersPanel } from "./InfluencersPanel";
import { InfluencerDetails } from "./InfluencerDetails";
import { ProjectDetails } from "./ProjectDetails";
import { WelcomePanel } from "./WelcomePanel";
import { BrandManagementPanel } from "./BrandManagementPanel";
import { InfluencerDatabasePanel } from "./InfluencerDatabasePanel";
import { Project, Influencer } from "@/types";
import { BrandProfile } from "@/types/brand-matching";
import { FirebaseService } from "@/lib/firebase-service";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Dashboard = () => {
  const { user } = useAuth();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedInfluencer, setSelectedInfluencer] = useState<Influencer | null>(null);
  const [brands, setBrands] = useState<BrandProfile[]>([]);
  const [activeTab, setActiveTab] = useState("influencers");

  // 自動選擇預設專案
  useEffect(() => {
    // 載入使用者資料
    
    if (user) {
      const loadDefaultProject = async () => {
        try {
          // 在 demo 模式下，我們知道有一個預設專案
          const defaultProject: Project = {
            id: 'demo-project-1',
            name: 'AI 分析專案',
            description: '用於展示系統功能的示範專案',
            budget: '500,000 元',
            startDate: '2024-01-01',
            endDate: '2024-12-31',
            status: 'active' as const,
            createdAt: new Date(),
            createdBy: 'demo-user',
            permissions: { 'demo-user': 'owner' },
            isPublic: false
          };
          // 設置預設專案
          setSelectedProject(defaultProject);
        } catch (error) {
          console.error('Failed to load default project:', error);
        }
      };

      loadDefaultProject();
    }
  }, [user]);

  const handleSaveBrand = (brand: BrandProfile) => {
    setBrands(prev => {
      const existingIndex = prev.findIndex(b => b.id === brand.id);
      if (existingIndex >= 0) {
        // Update existing brand
        return prev.map(b => b.id === brand.id ? brand : b);
      } else {
        // Add new brand
        return [...prev, brand];
      }
    });
  };

  const handleBrandDeleted = (brandId: string) => {
    setBrands(prev => prev.filter(brand => brand.id !== brandId));
  };

  return (
    <div className="flex flex-col min-h-screen bg-transparent">
      {/* Header - 固定高度 */}
      <div className="flex-shrink-0 border-b border-white/20 bg-white/80 backdrop-blur-xl shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <Header />
        </div>
      </div>

      {/* 主內容區域 */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          
          {/* 歡迎區域 - 僅在未選擇網紅且未選擇專案時顯示 */}
          {!selectedInfluencer && !selectedProject && (
            <div className="mb-8">
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg p-6 lg:p-8">
                <WelcomePanel />
              </div>
            </div>
          )}

          {/* 主要工作區域 */}
          <div className="flex flex-col lg:flex-row gap-6 min-h-[600px]">
            
            {/* 左側面板 - 在大螢幕上固定寬度，小螢幕上全寬 */}
            <div className={`
              ${selectedInfluencer || (selectedProject && activeTab === 'projects') ? 'lg:w-80 xl:w-96' : 'w-full'}
              flex-shrink-0 transition-all duration-300 ease-in-out
            `}>
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg min-h-[600px] lg:max-h-[800px] overflow-hidden">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                  <div className="flex-shrink-0 p-4 lg:p-6 border-b border-gray-100">
                    <TabsList className="grid w-full grid-cols-4 bg-gray-50/80">
                      <TabsTrigger value="influencers" className="text-xs lg:text-sm">網紅</TabsTrigger>
                      <TabsTrigger value="projects" className="text-xs lg:text-sm">專案</TabsTrigger>
                      <TabsTrigger value="brands" className="text-xs lg:text-sm">品牌</TabsTrigger>
                      <TabsTrigger value="database" className="text-xs lg:text-sm">資料庫</TabsTrigger>
                    </TabsList>
                  </div>

                  <div className="flex-1 overflow-auto">
                    <TabsContent value="influencers" className="h-full m-0 p-4 lg:p-6 pt-4">
                      <InfluencersPanel
                        selectedProject={selectedProject}
                        onInfluencerSelect={setSelectedInfluencer}
                        selectedInfluencer={selectedInfluencer}
                      />
                    </TabsContent>

                    <TabsContent value="projects" className="h-full m-0 p-4 lg:p-6 pt-4">
                      <ProjectsPanel 
                        selectedProject={selectedProject}
                        onProjectSelect={setSelectedProject} 
                      />
                    </TabsContent>

                    <TabsContent value="brands" className="h-full m-0 p-4 lg:p-6 pt-4">
                      <BrandManagementPanel
                        brands={brands}
                        onSaveBrand={handleSaveBrand}
                        onDeleteBrand={handleBrandDeleted}
                      />
                    </TabsContent>

                    <TabsContent value="database" className="h-full m-0 p-4 lg:p-6 pt-4">
                      <InfluencerDatabasePanel 
                        selectedProject={selectedProject}
                        onInfluencerSelect={setSelectedInfluencer}
                      />
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            </div>

            {/* 右側詳細區域 - 響應式寬度 */}
            {selectedInfluencer && selectedProject && (
              <div className="flex-1 min-w-0">
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg min-h-[600px] overflow-auto">
                  <InfluencerDetails
                    project={selectedProject}
                    influencer={selectedInfluencer}
                    onEvaluationSubmitted={() => {
                      // Refresh logic if needed
                    }}
                  />
                </div>
              </div>
            )}

            {/* 專案詳情區域 - 當選擇專案但沒有選擇網紅時顯示 */}
            {selectedProject && !selectedInfluencer && activeTab === 'projects' && (
              <div className="flex-1 min-w-0">
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg min-h-[600px] overflow-auto">
                  <ProjectDetails
                    project={selectedProject}
                    onInfluencerSelect={(influencer) => {
                      setSelectedInfluencer(influencer);
                      setActiveTab('influencers'); // 切換到網紅tab
                    }}
                    onProjectUpdate={(updatedProject) => {
                      setSelectedProject(updatedProject);
                    }}
                  />
                </div>
              </div>
            )}

            {/* 佔位符 - 當沒有選擇網紅和專案時 */}
            {!selectedInfluencer && (!selectedProject || activeTab !== 'projects') && (
              <div className="hidden lg:flex flex-1 items-center justify-center">
                <div className="text-center p-12">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xl">🎯</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">選擇項目開始使用</h3>
                  <p className="text-gray-600 max-w-md">
                    從左側面板選擇一個專案或網紅，即可查看詳細的分析報告和評估數據
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

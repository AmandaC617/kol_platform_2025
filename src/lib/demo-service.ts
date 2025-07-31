import { Influencer, Evaluation, DemoInfluencer, getEntityId, toEntityId, ErrorCode, Project, EvaluationScores } from "@/types";
import { logger } from "./logger-service";
import { ErrorService } from "./error-service";

export class DemoService {
  // 使用統一的 ID 類型
  private static projects: Project[] = [];
  private static influencers: { [projectId: string]: Influencer[] } = {};
  private static evaluations: { [projectId: string]: { [influencerId: string]: Evaluation[] } } = {};

  // 初始化方法
  private static initialize() {
    // 檢查是否已經初始化過
    if (this.projects.length > 0) {
      return;
    }

    // 在客戶端從 localStorage 讀取資料
    if (typeof window !== 'undefined') {
      try {
        const savedProjects = localStorage.getItem('demo-projects');
        const savedInfluencers = localStorage.getItem('demo-influencers');
        const savedEvaluations = localStorage.getItem('demo-evaluations');

        if (savedProjects) {
          this.projects = JSON.parse(savedProjects);
        } else {
          // 初始化預設專案
          this.initializeDefaults();
        }

        if (savedInfluencers) {
          this.influencers = JSON.parse(savedInfluencers);
        } else {
          this.influencers = { 'demo-project-1': [] };
        }

        if (savedEvaluations) {
          this.evaluations = JSON.parse(savedEvaluations);
        } else {
          this.evaluations = { 'demo-project-1': {} };
        }
      } catch (error) {
        console.warn('讀取本地存儲失敗，使用預設資料:', error);
        this.initializeDefaults();
      }
    } else {
      // 服務器端直接使用預設資料
      console.log('🔧 DemoService: 服務器端初始化');
      this.initializeDefaults();
    }
  }

  // 初始化預設資料
  private static initializeDefaults() {
    this.projects = [
      {
        id: 'demo-project-1',
        name: 'AI 分析專案',
        description: 'Demo 專案用於展示 KOL 評估功能',
        budget: '100,000',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        status: 'active' as const,
        createdAt: new Date(),
        createdBy: 'demo-user',
        permissions: { 'demo-user': 'owner' as const },
        isPublic: false
      }
    ];
    this.influencers = { 'demo-project-1': [] };
    this.evaluations = { 'demo-project-1': {} };
  }

  // 保存資料到 localStorage
  private static saveToStorage() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('demo-projects', JSON.stringify(this.projects));
        localStorage.setItem('demo-influencers', JSON.stringify(this.influencers));
        localStorage.setItem('demo-evaluations', JSON.stringify(this.evaluations));
      } catch (error) {
        console.warn('保存到本地存儲失敗:', error);
      }
    }
  }
  private static influencerCallbacks: { [projectId: string]: ((influencers: Influencer[]) => void)[] } = {};
  private static evaluationCallbacks: { [projectId: string]: { [influencerId: string]: ((evaluations: Evaluation[]) => void)[] } } = {};
  private static projectCallbacks: ((projects: Project[]) => void)[] = [];

  // Project operations
  static async getProjects(): Promise<Project[]> {
    try {
      this.initialize();
      logger.info('獲取專案列表');
      return [...this.projects];
    } catch (error) {
      ErrorService.handleError(error as Error, ErrorCode.DATA_INVALID, { operation: 'getProjects' });
      return [];
    }
  }

  static async createProject(name: string): Promise<void> {
    try {
      const newProject: Project = {
        id: toEntityId(Date.now()),
        name,
        description: '新建專案',
        budget: '50,000',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'planning' as const,
        createdAt: new Date(),
        createdBy: 'demo-user',
        permissions: { 'demo-user': 'owner' as const },
        isPublic: false
      };

      this.projects.push(newProject);
      this.influencers[newProject.id] = [];
      this.evaluations[newProject.id] = {};
      this.saveToStorage();
      this.triggerProjectCallback();
      
      logger.info('創建專案成功', { projectId: newProject.id, name });
    } catch (error) {
      ErrorService.handleError(error as Error, ErrorCode.DATA_INVALID, { operation: 'createProject', name });
      throw error;
    }
  }

  static subscribeToProjects(callback: (projects: Project[]) => void): () => void {
    this.projectCallbacks.push(callback);
    
    // 立即調用一次
    callback(this.projects);

    return () => {
      this.projectCallbacks = this.projectCallbacks.filter(cb => cb !== callback);
    };
  }

  static async getInfluencers(projectId: string): Promise<Influencer[]> {
    try {
      this.initialize();
      logger.info('獲取網紅列表', { projectId });
      return this.influencers[projectId] || [];
    } catch (error) {
      ErrorService.handleError(error as Error, ErrorCode.DATA_INVALID, { operation: 'getInfluencers', projectId });
      return [];
    }
  }

  static async createInfluencer(projectId: string, influencerData: Omit<Influencer, 'id' | 'createdAt' | 'latestScore'>): Promise<Influencer> {
    try {
      // 確保數據結構已初始化
      this.initialize();
      
      const newInfluencer: Influencer = {
        ...influencerData,
        id: toEntityId(Date.now()), // 使用統一的 ID 轉換
        createdAt: new Date(),
        latestScore: (influencerData as any).latestScore || null // 保留傳入的分數，如果有的話
      };

      if (!this.influencers[projectId]) {
        this.influencers[projectId] = [];
      }

      this.influencers[projectId].push(newInfluencer);
      this.saveToStorage();
      this.triggerInfluencerCallback(projectId);
      
      logger.info('創建網紅成功', { 
        projectId, 
        influencerId: newInfluencer.id,
        influencerName: newInfluencer.profile.name 
      });

      return newInfluencer;
    } catch (error) {
      ErrorService.handleError(error as Error, ErrorCode.DATA_INVALID, { 
        operation: 'createInfluencer', 
        projectId,
        influencerData 
      });
      throw error;
    }
  }

  static subscribeToInfluencers(projectId: string, callback: (influencers: Influencer[]) => void): () => void {
    if (!this.influencerCallbacks[projectId]) {
      this.influencerCallbacks[projectId] = [];
    }
    this.influencerCallbacks[projectId].push(callback);

    // 立即調用一次
    const influencers = this.influencers[projectId] || [];
    console.log(`🔍 DemoService: 訂閱網紅資料，專案 ${projectId}，網紅數量: ${influencers.length}`);
    callback(influencers);

    return () => {
      this.influencerCallbacks[projectId] = this.influencerCallbacks[projectId].filter(cb => cb !== callback);
    };
  }

  // 調試方法：檢查網紅資料
  static debugInfluencers(projectId: string): void {
    const influencers = this.influencers[projectId] || [];
    console.log(`🔍 DemoService 調試 - 專案 ${projectId}:`, {
      網紅數量: influencers.length,
      網紅列表: influencers.map(inf => ({
        id: inf.id,
        name: inf.profile?.name,
        platform: inf.platform,
        score: inf.latestScore
      }))
    });
  }

  static async updateInfluencerScore(projectId: string, influencerId: string, score: number): Promise<void> {
    try {
      const influencers = this.influencers[projectId] || [];
      const influencer = influencers.find(inf => inf.id === influencerId);
      
      if (influencer) {
        influencer.latestScore = score;
        this.triggerInfluencerCallback(projectId);
        
        logger.info('更新網紅分數', { 
          projectId, 
          influencerId, 
          score 
        });
      }
    } catch (error) {
      ErrorService.handleError(error as Error, ErrorCode.DATA_INVALID, { 
        operation: 'updateInfluencerScore', 
        projectId, 
        influencerId, 
        score 
      });
      throw error;
    }
  }

  static async getEvaluations(projectId: string, influencerId: string): Promise<Evaluation[]> {
    try {
      // 處理 DemoInfluencer 的數字 ID
      const numericId = parseInt(influencerId, 10);
      if (!isNaN(numericId)) {
        const key = numericId.toString();
        return this.evaluations[projectId]?.[key] || [];
      }
      return this.evaluations[projectId]?.[influencerId] || [];
    } catch (error) {
      ErrorService.handleError(error as Error, ErrorCode.DATA_INVALID, { 
        operation: 'getEvaluations', 
        projectId, 
        influencerId 
      });
      return [];
    }
  }

  static async createEvaluation(
    projectId: string,
    influencerId: string,
    scores: EvaluationScores,
    totalScore: number,
    notes: string,
    evaluatedBy: string
  ): Promise<void> {
    try {
      const newEvaluation: Evaluation = {
        id: toEntityId(Date.now()),
        scores,
        totalScore,
        notes,
        evaluatedBy,
        evaluatorName: '體驗用戶',
        createdAt: new Date()
      };

      if (!this.evaluations[projectId]) {
        this.evaluations[projectId] = {};
      }

      // 處理 DemoInfluencer 的數字 ID
      const numericId = parseInt(influencerId, 10);
      const key = !isNaN(numericId) ? numericId.toString() : influencerId;

      if (!this.evaluations[projectId][key]) {
        this.evaluations[projectId][key] = [];
      }

      this.evaluations[projectId][key].unshift(newEvaluation);
      this.triggerEvaluationCallback(projectId, influencerId);
      
      // Update influencer score
      await this.updateInfluencerScore(projectId, influencerId, totalScore);
      
      logger.info('創建評估成功', { 
        projectId, 
        influencerId, 
        evaluationId: newEvaluation.id 
      });
    } catch (error) {
      ErrorService.handleError(error as Error, ErrorCode.DATA_INVALID, { 
        operation: 'createEvaluation', 
        projectId, 
        influencerId,
        scores,
        totalScore,
        notes,
        evaluatedBy
      });
      throw error;
    }
  }

  static async addEvaluation(
    projectId: string,
    influencerId: string,
    evaluation: Omit<Evaluation, 'id' | 'createdAt'>
  ): Promise<void> {
    try {
      const newEvaluation: Evaluation = {
        ...evaluation,
        id: toEntityId(Date.now()),
        createdAt: new Date()
      };

      if (!this.evaluations[projectId]) {
        this.evaluations[projectId] = {};
      }

      // 處理 DemoInfluencer 的數字 ID
      const numericId = parseInt(influencerId, 10);
      const key = !isNaN(numericId) ? numericId.toString() : influencerId;

      if (!this.evaluations[projectId][key]) {
        this.evaluations[projectId][key] = [];
      }

      this.evaluations[projectId][key].unshift(newEvaluation);
      this.triggerEvaluationCallback(projectId, influencerId);
      
      logger.info('添加評估成功', { 
        projectId, 
        influencerId, 
        evaluationId: newEvaluation.id 
      });
    } catch (error) {
      ErrorService.handleError(error as Error, ErrorCode.DATA_INVALID, { 
        operation: 'addEvaluation', 
        projectId, 
        influencerId,
        evaluation 
      });
      throw error;
    }
  }

  static subscribeToEvaluations(
    projectId: string,
    influencerId: string,
    callback: (evaluations: Evaluation[]) => void
  ): () => void {
    if (!this.evaluationCallbacks[projectId]) {
      this.evaluationCallbacks[projectId] = {};
    }
    if (!this.evaluationCallbacks[projectId][influencerId]) {
      this.evaluationCallbacks[projectId][influencerId] = [];
    }

    this.evaluationCallbacks[projectId][influencerId].push(callback);

    // 立即調用一次
    this.getEvaluations(projectId, influencerId).then(callback);

    return () => {
      this.evaluationCallbacks[projectId][influencerId] = this.evaluationCallbacks[projectId][influencerId].filter(cb => cb !== callback);
    };
  }

  // 強制從本地存儲重新載入數據（用於客戶端）
  static async syncFromServer(): Promise<void> {
    if (typeof window !== 'undefined') {
      try {
        console.log('🔄 從本地存儲重新載入數據...');
        
        // 重新初始化，這會從 localStorage 重新載入數據
        this.projects = [];
        this.initialize();
        
        // 觸發回調
        this.triggerInfluencerCallback('demo-project-1');
        this.triggerProjectCallback();
        
        console.log('✅ 本地數據重新載入完成');
      } catch (error) {
        console.error('重新載入本地數據失敗:', error);
      }
    }
  }

  private static triggerProjectCallback(): void {
    const projects = this.projects;
    this.projectCallbacks.forEach(callback => callback(projects));
  }

  private static triggerInfluencerCallback(projectId: string): void {
    const callbacks = this.influencerCallbacks[projectId] || [];
    const influencers = this.influencers[projectId] || [];
    
    console.log(`🔍 DemoService: 觸發網紅回調`, {
      projectId,
      回調數量: callbacks.length,
      網紅數量: influencers.length,
      網紅列表: influencers.map(inf => ({
        id: inf.id,
        name: inf.profile?.name,
        platform: inf.platform
      }))
    });
    
    callbacks.forEach(callback => {
      try {
        callback(influencers);
      } catch (error) {
        console.error('🔍 DemoService: 回調執行失敗', error);
      }
    });
  }

  private static triggerEvaluationCallback(projectId: string, influencerId: string): void {
    const callbacks = this.evaluationCallbacks[projectId]?.[influencerId] || [];
    this.getEvaluations(projectId, influencerId).then(evaluations => {
      callbacks.forEach(callback => callback(evaluations));
    });
  }
}

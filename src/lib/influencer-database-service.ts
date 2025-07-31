import { Influencer, Project } from '@/types';
import { FirebaseService } from './firebase-service';
import { DemoService } from './demo-service';

export interface InfluencerDatabaseStats {
  totalInfluencers: number;
  projectInfluencers: number;
  globalInfluencers: number;
  duplicateCount: number;
  lastSyncTime: Date;
}

export interface InfluencerSyncResult {
  success: boolean;
  message: string;
  syncedCount: number;
  duplicatesFound: number;
  errors: string[];
}

/**
 * 網紅資料庫管理服務
 * 負責管理專案網紅與全域資料庫的同步
 */
export class InfluencerDatabaseService {
  
  /**
   * 檢查網紅是否已存在於全域資料庫
   */
  static async checkInfluencerExists(
    userId: string, 
    influencerUrl: string
  ): Promise<{ exists: boolean; influencer?: Influencer }> {
    try {
      if (process.env.NODE_ENV === 'development' && !process.env.FIREBASE_PROJECT_ID) {
        // Demo 模式
                const demoInfluencers = await DemoService.getInfluencers('demo-project-1');
        const existing = demoInfluencers.find((inf: any) =>
          inf.url === influencerUrl || 
          inf.profile?.name?.toLowerCase().includes(influencerUrl.toLowerCase())
        );
        
        return {
          exists: !!existing,
          influencer: existing ? this.convertDemoToInfluencer(existing) : undefined
        };
      } else {
        // Firebase 模式
        // Firebase模式：暫時返回空數組，待實現
        const globalInfluencers: any[] = [];
        const existing = globalInfluencers.find((inf: any) => 
          inf.url === influencerUrl || 
          inf.profile?.name?.toLowerCase().includes(influencerUrl.toLowerCase())
        );
        
        return {
          exists: !!existing,
          influencer: existing || undefined
        };
      }
    } catch (error) {
      console.error('檢查網紅存在性失敗:', error);
      return { exists: false };
    }
  }

  /**
   * 將專案網紅同步到全域資料庫
   */
  static async syncProjectToGlobal(
    userId: string,
    projectId: string
  ): Promise<InfluencerSyncResult> {
    const result: InfluencerSyncResult = {
      success: false,
      message: '',
      syncedCount: 0,
      duplicatesFound: 0,
      errors: []
    };

    try {
      // 獲取專案網紅列表
      const projectInfluencers = await this.getProjectInfluencers(userId, projectId);
      
      if (projectInfluencers.length === 0) {
        result.message = '專案中沒有網紅資料';
        result.success = true;
        return result;
      }

      // 獲取全域網紅列表
      const globalInfluencers = await this.getGlobalInfluencers(userId);
      
      // 檢查重複並同步
      for (const projectInfluencer of projectInfluencers) {
        try {
          const isDuplicate = globalInfluencers.some(global => 
            global.url === projectInfluencer.url ||
            global.profile?.name === projectInfluencer.profile?.name
          );

          if (isDuplicate) {
            result.duplicatesFound++;
            continue;
          }

          // 同步到全域資料庫
          await this.addToGlobalDatabase(userId, projectInfluencer);
          result.syncedCount++;
        } catch (error) {
          result.errors.push(`同步 ${projectInfluencer.profile?.name || '未知網紅'} 失敗: ${error}`);
        }
      }

      result.success = true;
      result.message = `成功同步 ${result.syncedCount} 位網紅到全域資料庫，發現 ${result.duplicatesFound} 個重複`;
      
    } catch (error) {
      result.message = `同步失敗: ${error}`;
      result.errors.push(error as string);
    }

    return result;
  }

  /**
   * 將全域網紅添加到專案
   */
  static async addGlobalToProject(
    userId: string,
    projectId: string,
    influencerId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // 獲取全域網紅資料
      const globalInfluencer = await this.getGlobalInfluencer(userId, influencerId);
      
      if (!globalInfluencer) {
        return { success: false, message: '找不到指定的網紅' };
      }

      // 檢查專案中是否已存在
      const projectInfluencers = await this.getProjectInfluencers(userId, projectId);
      const exists = projectInfluencers.some(inf => 
        inf.url === globalInfluencer.url ||
        inf.profile?.name === globalInfluencer.profile?.name
      );

      if (exists) {
        return { success: false, message: '該網紅已在專案中' };
      }

      // 添加到專案
      await this.addToProject(userId, projectId, globalInfluencer);
      
      return { success: true, message: '成功添加網紅到專案' };
    } catch (error) {
      return { success: false, message: `添加失敗: ${error}` };
    }
  }

  /**
   * 獲取資料庫統計資訊
   */
  static async getDatabaseStats(userId: string): Promise<InfluencerDatabaseStats> {
    try {
      const globalInfluencers = await this.getGlobalInfluencers(userId);
      const projects = await this.getUserProjects(userId);
      
      let totalProjectInfluencers = 0;
      for (const project of projects) {
        const projectInfluencers = await this.getProjectInfluencers(userId, project.id);
        totalProjectInfluencers += projectInfluencers.length;
      }

      return {
        totalInfluencers: globalInfluencers.length + totalProjectInfluencers,
        projectInfluencers: totalProjectInfluencers,
        globalInfluencers: globalInfluencers.length,
        duplicateCount: 0, // 需要進一步計算
        lastSyncTime: new Date()
      };
    } catch (error) {
      console.error('獲取資料庫統計失敗:', error);
      return {
        totalInfluencers: 0,
        projectInfluencers: 0,
        globalInfluencers: 0,
        duplicateCount: 0,
        lastSyncTime: new Date()
      };
    }
  }

  /**
   * 搜尋全域網紅資料庫
   */
  static async searchGlobalInfluencers(
    userId: string,
    query: string,
    filters?: {
      platforms?: string[];
      minFollowers?: number;
      maxFollowers?: number;
    }
  ): Promise<Influencer[]> {
    try {
      const globalInfluencers = await this.getGlobalInfluencers(userId);
      
      return globalInfluencers.filter(influencer => {
        // 搜尋條件
        const matchesQuery = !query || 
          influencer.profile?.name?.toLowerCase().includes(query.toLowerCase()) ||
          influencer.url.toLowerCase().includes(query.toLowerCase());

        // 平台篩選
        const matchesPlatform = !filters?.platforms?.length || 
          filters.platforms.includes(influencer.platform);

        // 粉絲數篩選
        const followers = influencer.profile?.followers || 0;
        const matchesFollowers = 
          (!filters?.minFollowers || followers >= filters.minFollowers) &&
          (!filters?.maxFollowers || followers <= filters.maxFollowers);

        return matchesQuery && matchesPlatform && matchesFollowers;
      });
    } catch (error) {
      console.error('搜尋全域網紅失敗:', error);
      return [];
    }
  }

  /**
   * 合併重複的網紅資料
   */
  static async mergeDuplicateInfluencers(
    userId: string,
    influencerIds: string[]
  ): Promise<{ success: boolean; message: string; mergedCount: number }> {
    try {
      if (influencerIds.length < 2) {
        return { success: false, message: '需要至少兩個網紅才能合併', mergedCount: 0 };
      }

      const globalInfluencers = await this.getGlobalInfluencers(userId);
      const influencersToMerge = globalInfluencers.filter(inf => 
        influencerIds.includes(inf.id)
      );

      if (influencersToMerge.length < 2) {
        return { success: false, message: '找不到指定的網紅', mergedCount: 0 };
      }

      // 選擇主要網紅（粉絲數最多的）
      const primaryInfluencer = influencersToMerge.reduce((prev, current) => 
        (current.profile?.followers || 0) > (prev.profile?.followers || 0) ? current : prev
      );

      // 合併資料
      const mergedInfluencer = this.mergeInfluencerData(influencersToMerge, primaryInfluencer);

      // 刪除重複的網紅
      for (const influencer of influencersToMerge) {
        if (influencer.id !== primaryInfluencer.id) {
          await this.deleteGlobalInfluencer(userId, influencer.id);
        }
      }

      // 更新主要網紅資料
      await this.updateGlobalInfluencer(userId, primaryInfluencer.id, mergedInfluencer);

      return { 
        success: true, 
        message: `成功合併 ${influencersToMerge.length} 個網紅資料`, 
        mergedCount: influencersToMerge.length 
      };
    } catch (error) {
      return { success: false, message: `合併失敗: ${error}`, mergedCount: 0 };
    }
  }

  // ==================== 私有方法 ====================

  private static async getProjectInfluencers(userId: string, projectId: string): Promise<Influencer[]> {
    if (process.env.NODE_ENV === 'development' && !process.env.FIREBASE_PROJECT_ID) {
      return DemoService.getInfluencers(projectId);
    } else {
      return new Promise((resolve) => {
        FirebaseService.subscribeToInfluencers(userId, projectId, resolve);
      });
    }
  }

  private static async getGlobalInfluencers(userId: string): Promise<Influencer[]> {
    if (process.env.NODE_ENV === 'development' && !process.env.FIREBASE_PROJECT_ID) {
      const allInfluencers = await DemoService.getInfluencers('demo-project-1');
      return allInfluencers;
    } else {
      // Placeholder: Firebase全域網紅功能待實現
      return [];
    }
  }

  private static async getGlobalInfluencer(userId: string, influencerId: string): Promise<Influencer | null> {
    const globalInfluencers = await this.getGlobalInfluencers(userId);
    return globalInfluencers.find(inf => inf.id === influencerId) || null;
  }

  private static async getUserProjects(userId: string): Promise<Project[]> {
    if (process.env.NODE_ENV === 'development' && !process.env.FIREBASE_PROJECT_ID) {
      return DemoService.getProjects();
    } else {
      return new Promise((resolve) => {
        FirebaseService.subscribeToProjects(userId, resolve);
      });
    }
  }

  private static async addToGlobalDatabase(userId: string, influencer: Influencer): Promise<void> {
    try {
      if (isDemoMode() || !FirebaseService.isAvailable()) {
        // Demo模式: 添加到預設專案
        await DemoService.createInfluencer('demo-project-1', influencer);
      } else {
        // Firebase模式：添加到全域資料庫  
        if (!db) throw new Error('Firebase not initialized');
        
        const globalRef = collection(db, `artifacts/${APP_ID}/global-influencers`);
        await addDoc(globalRef, {
          ...influencer,
          addedBy: userId,
          addedAt: serverTimestamp(),
          lastUpdated: serverTimestamp()
        });
        
        console.log('網紅已添加到全域資料庫:', influencer.profile?.name);
      }
    } catch (error) {
      console.error('添加到全域資料庫失敗:', error);
      throw error;
    }
  }

  private static async addToProject(userId: string, projectId: string, influencer: Influencer): Promise<void> {
    try {
      if (isDemoMode() || !FirebaseService.isAvailable()) {
        await DemoService.createInfluencer(projectId, influencer);
      } else {
        await FirebaseService.createInfluencer(projectId, influencer, userId);
      }
    } catch (error) {
      console.error('添加到專案失敗:', error);
      throw error;
    }
  }

  private static async deleteGlobalInfluencer(userId: string, influencerId: string): Promise<void> {
    if (process.env.NODE_ENV === 'development' && !process.env.FIREBASE_PROJECT_ID) {
      // Demo模式: 刪除功能待實現
      console.warn('Demo模式刪除功能尚未完整實現');
    } else {
      // Firebase模式: 刪除功能待實現
      console.warn('Firebase全域網紅刪除功能待實現');
    }
  }

  private static async updateGlobalInfluencer(userId: string, influencerId: string, data: Partial<Influencer>): Promise<void> {
    if (process.env.NODE_ENV === 'development' && !process.env.FIREBASE_PROJECT_ID) {
      // Demo模式: 更新功能待實現
      console.warn('Demo模式更新功能尚未實現');
    } else {
      // Firebase模式: 更新功能待實現
      console.warn('Firebase全域網紅更新功能待實現');
    }
  }

  private static convertDemoToInfluencer(demoInfluencer: any): Influencer {
    return {
      id: demoInfluencer.id.toString(),
      url: demoInfluencer.url,
      platform: demoInfluencer.platform,
      profile: {
        name: demoInfluencer.name,
        platform: demoInfluencer.platform as any,
        followers: parseInt(demoInfluencer.followers.replace(/[^\d]/g, '')) || 0,
        bio: '',
        avatar: demoInfluencer.avatar || '',
        recentPosts: [],
        audienceLocation: demoInfluencer.audienceLocation || '',
        contentTopics: demoInfluencer.contentTopics || [],
        contentStyle: demoInfluencer.contentStyle || [],
        recentContentAnalysis: {
          mainTopics: '',
          engagementTrend: '',
          contentFrequency: '',
          popularContentType: ''
        }
      },
      createdAt: new Date(),
      createdBy: 'demo-user',
      latestScore: demoInfluencer.score,
      tags: demoInfluencer.tags || [],
      notes: ''
    };
  }

  private static mergeInfluencerData(influencers: Influencer[], primary: Influencer): Influencer {
    // 合併標籤
    const allTags = new Set<string>();
    influencers.forEach(inf => {
      inf.tags?.forEach(tag => allTags.add(tag));
    });

    // 合併備註
    const allNotes = influencers
      .map(inf => inf.notes)
      .filter(note => note && note.trim())
      .join('\n\n');

    // 選擇最佳資料
    const bestProfile = influencers.reduce((best, current) => {
      if ((current.profile?.followers || 0) > (best.profile?.followers || 0)) {
        return current;
      }
      return best;
    }).profile;

    return {
      ...primary,
      tags: Array.from(allTags),
      notes: allNotes,
      profile: bestProfile || primary.profile
    };
  }
} 
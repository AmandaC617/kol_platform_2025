"use client";

import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  where,
  onSnapshot,
  deleteDoc,
  serverTimestamp,
  Unsubscribe,
  updateDoc,
  arrayUnion,
  arrayRemove
} from "firebase/firestore";
import { db, APP_ID } from "./firebase";
import {
  Team,
  TeamMember,
  TeamInvitation,
  ActivityLog,
  User,
  UserRole,
  Project,
  Notification,
  ActivityAction
} from "@/types";
import { isDemoMode } from "./demo-data";

export class TeamService {

  /**
   * 創建新團隊
   */
  static async createTeam(
    creatorId: string,
    creatorName: string,
    teamName: string,
    description: string
  ): Promise<string> {
    if (isDemoMode()) {
      return 'demo-team-1';
    }

    if (!db) {
      throw new Error("Firestore not initialized");
    }

    const teamsRef = collection(db, `artifacts/${APP_ID}/teams`);

    const newTeam: Omit<Team, 'id'> = {
      name: teamName,
      description,
      createdAt: serverTimestamp() as any,
      createdBy: creatorId,
      members: [{
        userId: creatorId,
        email: '',
        displayName: creatorName,
        role: 'owner',
        joinedAt: serverTimestamp() as any,
        invitedBy: creatorId,
        status: 'active'
      }],
      settings: {
        allowGuestEvaluations: false,
        requireEvaluationApproval: true,
        allowExternalSharing: false,
        defaultProjectPermissions: 'viewer'
      }
    };

    const docRef = await addDoc(teamsRef, newTeam);

    // 更新用戶的團隊列表
    await this.addUserToTeam(creatorId, docRef.id);

    // 記錄活動
    await this.logActivity(
      creatorId,
      creatorName,
      'team_created',
      `創建了團隊「${teamName}」`,
      docRef.id
    );

    return docRef.id;
  }

  /**
   * 獲取用戶的團隊列表
   */
  static async getUserTeams(userId: string): Promise<Team[]> {
    if (isDemoMode()) {
      return this.getDemoTeams();
    }

    if (!db) return [];

    const teamsRef = collection(db, `artifacts/${APP_ID}/teams`);
    const q = query(
      teamsRef,
      where('members', 'array-contains', { userId })
    );

    const querySnapshot = await getDocs(q);
    const teams: Team[] = [];

    querySnapshot.forEach((doc) => {
      teams.push({ id: doc.id, ...doc.data() } as Team);
    });

    return teams;
  }

  /**
   * 獲取團隊詳情
   */
  static async getTeam(teamId: string): Promise<Team | null> {
    if (isDemoMode()) {
      return this.getDemoTeam(teamId);
    }

    if (!db) return null;

    const teamDoc = await getDoc(doc(db, `artifacts/${APP_ID}/teams`, teamId));

    if (!teamDoc.exists()) {
      return null;
    }

    return { id: teamDoc.id, ...teamDoc.data() } as Team;
  }

  /**
   * 邀請成員加入團隊
   */
  static async inviteMemberToTeam(
    teamId: string,
    inviterUserId: string,
    inviterName: string,
    invitedEmail: string,
    role: UserRole,
    message?: string
  ): Promise<string> {
    if (isDemoMode()) {
      return 'demo-invitation-1';
    }

    if (!db) {
      throw new Error("Firestore not initialized");
    }

    // 獲取團隊資訊
    const team = await this.getTeam(teamId);
    if (!team) {
      throw new Error("團隊不存在");
    }

    const invitationsRef = collection(db, `artifacts/${APP_ID}/invitations`);

    const invitation: Omit<TeamInvitation, 'id'> = {
      teamId,
      teamName: team.name,
      invitedEmail,
      invitedBy: inviterUserId,
      inviterName,
      role,
      status: 'pending',
      createdAt: serverTimestamp() as any,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      message
    };

    const docRef = await addDoc(invitationsRef, invitation);

    // 記錄活動
    await this.logActivity(
      inviterUserId,
      inviterName,
      'member_invited',
      `邀請 ${invitedEmail} 加入團隊，角色為 ${role}`,
      teamId
    );

    // 發送通知給被邀請者（如果已註冊）
    await this.sendNotificationToEmail(
      invitedEmail,
      'team_invitation',
      '團隊邀請',
      `${inviterName} 邀請您加入「${team.name}」團隊`,
      { teamId, invitationId: docRef.id }
    );

    return docRef.id;
  }

  /**
   * 接受團隊邀請
   */
  static async acceptTeamInvitation(
    invitationId: string,
    userId: string,
    userEmail: string,
    userName: string
  ): Promise<void> {
    if (isDemoMode()) return;

    if (!db) {
      throw new Error("Firestore not initialized");
    }

    const invitationDoc = await getDoc(doc(db, `artifacts/${APP_ID}/invitations`, invitationId));

    if (!invitationDoc.exists()) {
      throw new Error("邀請不存在");
    }

    const invitation = invitationDoc.data() as TeamInvitation;

    if (invitation.status !== 'pending') {
      throw new Error("邀請已失效");
    }

    if (invitation.invitedEmail !== userEmail) {
      throw new Error("邀請郵箱不匹配");
    }

    // 更新邀請狀態
    await updateDoc(doc(db, `artifacts/${APP_ID}/invitations`, invitationId), {
      status: 'accepted'
    });

    // 添加成員到團隊
    const newMember: TeamMember = {
      userId,
      email: userEmail,
      displayName: userName,
      role: invitation.role,
      joinedAt: serverTimestamp() as any,
      invitedBy: invitation.invitedBy,
      status: 'active'
    };

    await updateDoc(doc(db, `artifacts/${APP_ID}/teams`, invitation.teamId), {
      members: arrayUnion(newMember)
    });

    // 更新用戶的團隊列表
    await this.addUserToTeam(userId, invitation.teamId);

    // 記錄活動
    await this.logActivity(
      userId,
      userName,
      'member_joined',
      `${userName} 加入了團隊`,
      invitation.teamId
    );
  }

  /**
   * 更新團隊成員角色
   */
  static async updateMemberRole(
    teamId: string,
    memberUserId: string,
    newRole: UserRole,
    updaterUserId: string,
    updaterName: string
  ): Promise<void> {
    if (isDemoMode()) return;

    if (!db) {
      throw new Error("Firestore not initialized");
    }

    const team = await this.getTeam(teamId);
    if (!team) {
      throw new Error("團隊不存在");
    }

    // 更新成員角色
    const updatedMembers = team.members.map(member =>
      member.userId === memberUserId
        ? { ...member, role: newRole }
        : member
    );

    await updateDoc(doc(db, `artifacts/${APP_ID}/teams`, teamId), {
      members: updatedMembers
    });

    // 記錄活動
    const memberName = team.members.find(m => m.userId === memberUserId)?.displayName || '未知';
    await this.logActivity(
      updaterUserId,
      updaterName,
      'role_changed',
      `將 ${memberName} 的角色更改為 ${newRole}`,
      teamId
    );
  }

  /**
   * 移除團隊成員
   */
  static async removeMemberFromTeam(
    teamId: string,
    memberUserId: string,
    removerUserId: string,
    removerName: string
  ): Promise<void> {
    if (isDemoMode()) return;

    if (!db) {
      throw new Error("Firestore not initialized");
    }

    const team = await this.getTeam(teamId);
    if (!team) {
      throw new Error("團隊不存在");
    }

    const memberToRemove = team.members.find(m => m.userId === memberUserId);
    if (!memberToRemove) {
      throw new Error("成員不存在");
    }

    // 更新團隊成員列表
    await updateDoc(doc(db, `artifacts/${APP_ID}/teams`, teamId), {
      members: arrayRemove(memberToRemove)
    });

    // 更新用戶的團隊列表
    await this.removeUserFromTeam(memberUserId, teamId);

    // 記錄活動
    await this.logActivity(
      removerUserId,
      removerName,
      'member_removed',
      `移除了成員 ${memberToRemove.displayName}`,
      teamId
    );
  }

  /**
   * 分享專案給團隊成員
   */
  static async shareProjectWithTeam(
    projectId: string,
    teamId: string,
    sharedBy: string,
    sharedByName: string,
    permissions: { [userId: string]: UserRole }
  ): Promise<void> {
    if (isDemoMode()) return;

    if (!db) {
      throw new Error("Firestore not initialized");
    }

    // 更新專案權限
    await updateDoc(doc(db, `artifacts/${APP_ID}/users/${sharedBy}/projects`, projectId), {
      teamId,
      permissions,
      isPublic: false
    });

    // 記錄活動
    await this.logActivity(
      sharedBy,
      sharedByName,
      'project_shared',
      `分享了專案給團隊`,
      teamId,
      projectId
    );
  }

  /**
   * 記錄活動日誌
   */
  static async logActivity(
    userId: string,
    userName: string,
    action: ActivityAction,
    details: string,
    teamId?: string,
    projectId?: string,
    influencerId?: string,
    metadata?: { [key: string]: any }
  ): Promise<void> {
    if (isDemoMode()) return;

    if (!db) return;

    const activityLog: Omit<ActivityLog, 'id'> = {
      teamId,
      projectId,
      influencerId,
      userId,
      userName,
      action,
      details,
      metadata,
      createdAt: serverTimestamp() as any
    };

    await addDoc(collection(db, `artifacts/${APP_ID}/activities`), activityLog);
  }

  /**
   * 獲取團隊活動日誌
   */
  static async getTeamActivities(teamId: string, limit: number = 50): Promise<ActivityLog[]> {
    if (isDemoMode()) {
      return this.getDemoActivities();
    }

    if (!db) return [];

    const activitiesRef = collection(db, `artifacts/${APP_ID}/activities`);
    const q = query(
      activitiesRef,
      where('teamId', '==', teamId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const activities: ActivityLog[] = [];

    querySnapshot.forEach((doc) => {
      activities.push({ id: doc.id, ...doc.data() } as ActivityLog);
    });

    return activities.slice(0, limit);
  }

  /**
   * 獲取用戶通知
   */
  static async getUserNotifications(userId: string): Promise<Notification[]> {
    if (isDemoMode()) {
      return this.getDemoNotifications();
    }

    if (!db) return [];

    const notificationsRef = collection(db, `artifacts/${APP_ID}/notifications`);
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      where('read', '==', false),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const notifications: Notification[] = [];

    querySnapshot.forEach((doc) => {
      notifications.push({ id: doc.id, ...doc.data() } as Notification);
    });

    return notifications;
  }

  /**
   * 標記通知為已讀
   */
  static async markNotificationAsRead(notificationId: string): Promise<void> {
    if (isDemoMode()) return;

    if (!db) return;

    await updateDoc(doc(db, `artifacts/${APP_ID}/notifications`, notificationId), {
      read: true
    });
  }

  // Helper methods
  private static async addUserToTeam(userId: string, teamId: string): Promise<void> {
    if (!db) return;

    const userRef = doc(db, `artifacts/${APP_ID}/users`, userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      await updateDoc(userRef, {
        teams: arrayUnion(teamId)
      });
    } else {
      await setDoc(userRef, {
        teams: [teamId],
        createdAt: serverTimestamp()
      });
    }
  }

  private static async removeUserFromTeam(userId: string, teamId: string): Promise<void> {
    if (!db) return;

    await updateDoc(doc(db, `artifacts/${APP_ID}/users`, userId), {
      teams: arrayRemove(teamId)
    });
  }

  private static async sendNotificationToEmail(
    email: string,
    type: string,
    title: string,
    message: string,
    data?: { [key: string]: any }
  ): Promise<void> {
    if (!db) return;

    // 首先查找該郵箱對應的用戶
    const usersRef = collection(db, `artifacts/${APP_ID}/users`);
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      const userId = userDoc.id;

      const notification: Omit<Notification, 'id'> = {
        userId,
        type: type as any,
        title,
        message,
        data,
        read: false,
        createdAt: serverTimestamp() as any
      };

      await addDoc(collection(db, `artifacts/${APP_ID}/notifications`), notification);
    }
  }

  // Demo data methods
  private static getDemoTeams(): Team[] {
    return [
      {
        id: 'demo-team-1',
        name: '行銷團隊',
        description: '負責品牌行銷和網紅合作',
        createdAt: new Date(),
        createdBy: 'demo-user-1',
        members: [
          {
            userId: 'demo-user-1',
            email: 'admin@company.com',
            displayName: '李經理',
            role: 'owner',
            joinedAt: new Date(),
            invitedBy: 'demo-user-1',
            status: 'active'
          },
          {
            userId: 'demo-user-2',
            email: 'evaluator@company.com',
            displayName: '王專員',
            role: 'evaluator',
            joinedAt: new Date(),
            invitedBy: 'demo-user-1',
            status: 'active'
          }
        ],
        settings: {
          allowGuestEvaluations: false,
          requireEvaluationApproval: true,
          allowExternalSharing: false,
          defaultProjectPermissions: 'viewer'
        }
      }
    ];
  }

  private static getDemoTeam(teamId: string): Team | null {
    const teams = this.getDemoTeams();
    return teams.find(team => team.id === teamId) || null;
  }

  private static getDemoActivities(): ActivityLog[] {
    return [
      {
        id: '1',
        teamId: 'demo-team-1',
        userId: 'demo-user-1',
        userName: '李經理',
        action: 'team_created',
        details: '創建了團隊「行銷團隊」',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
      },
      {
        id: '2',
        teamId: 'demo-team-1',
        projectId: 'demo-project-1',
        userId: 'demo-user-1',
        userName: '李經理',
        action: 'project_created',
        details: '創建了專案「美妝新品上市」',
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
      },
      {
        id: '3',
        teamId: 'demo-team-1',
        userId: 'demo-user-2',
        userName: '王專員',
        action: 'member_joined',
        details: '王專員 加入了團隊',
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000)
      }
    ];
  }

  private static getDemoNotifications(): Notification[] {
    return [
      {
        id: '1',
        userId: 'demo-user-1',
        type: 'team_invitation',
        title: '新的團隊邀請',
        message: '您有一個新的團隊邀請等待處理',
        read: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        data: { teamId: 'demo-team-1' }
      }
    ];
  }
}

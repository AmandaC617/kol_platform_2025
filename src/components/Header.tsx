"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { TeamManagement } from "@/components/TeamManagement";
import { LoginModal } from "@/components/LoginModal";
import { ApiStatusIndicator } from "@/components/ApiStatusIndicator";
import { Avatar } from "@/components/ui/avatar";
import { isFirebaseAvailable } from "@/lib/firebase";
import { isDemoMode } from "@/lib/demo-data";
import { Users, LogIn, LogOut, Settings } from "lucide-react";

export const Header = () => {
  const { user, signOutUser, authMethod, isAuthenticated } = useAuth();
  const [isTeamManagementOpen, setIsTeamManagementOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOutUser();
      if (authMethod !== 'demo') {
        // Optionally reload to ensure clean state
        // window.location.reload();
      }
    } catch (error) {
      console.error("Sign out failed:", error);
      alert("登出失敗，請重試");
    }
  };

  const renderUserInfo = () => {
    if (!isAuthenticated || !user) {
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsLoginModalOpen(true)}
          className="flex items-center space-x-2"
        >
          <LogIn className="w-4 h-4" />
          <span>登入</span>
        </Button>
      );
    }

    return (
      <div className="flex items-center space-x-3">
        {/* User Info */}
        <div className="flex items-center space-x-2">
          <Avatar
            src={user.photoURL}
            name={user.displayName || user.name || user.email || '用戶'}
            alt={user.displayName || "User"}
            size="sm"
          />
          <span className="text-sm text-gray-700">
            {user.displayName || user.name || user.email || '用戶'}
          </span>
        </div>

        {/* Auth Method Badge */}
        <Badge variant={getAuthBadgeVariant()}>
          {getAuthBadgeText()}
        </Badge>

        {/* Sign Out Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="flex items-center space-x-1 text-gray-600 hover:text-gray-800"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden md:inline">登出</span>
        </Button>
      </div>
    );
  };

  const getAuthBadgeVariant = (): "default" | "secondary" | "outline" => {
    switch (authMethod) {
      case 'google': return 'default';
      case 'firebase': return 'secondary';
      case 'demo': return 'outline';
      default: return 'outline';
    }
  };

  const getAuthBadgeText = () => {
    switch (authMethod) {
      case 'google': return '🔗 Google';
      case 'firebase': return user?.isAnonymous ? '👤 訪客' : '📧 信箱';
      case 'demo': return '🎭 體驗';
      default: return '未知';
    }
  };

  return (
    <>
      <header className="bg-white shadow-md w-full p-4 flex justify-between items-center z-10">
        <div className="flex items-center space-x-3">
          <h1 className="text-2xl font-bold text-gray-800">KOL Review</h1>
          <div className="hidden md:block text-sm text-gray-500">
            網紅智慧評估儀表板
          </div>
          {/* Firebase Status Indicator */}
          {!isDemoMode() && isFirebaseAvailable() && (
            <Badge variant="outline" className="text-xs">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
              已連線
            </Badge>
          )}
          {isDemoMode() && (
            <Badge variant="secondary" className="text-xs">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
              體驗模式 (數據自動保存)
            </Badge>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {/* API Status Indicator */}
          <ApiStatusIndicator />

          {/* Team Management (only for authenticated users) */}
          {isAuthenticated && user && (
            <Dialog open={isTeamManagementOpen} onOpenChange={setIsTeamManagementOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span className="hidden md:inline">團隊</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>團隊管理</DialogTitle>
                </DialogHeader>
                <TeamManagement />
              </DialogContent>
            </Dialog>
          )}

          {/* User Authentication */}
          {renderUserInfo()}
        </div>
      </header>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  );
};

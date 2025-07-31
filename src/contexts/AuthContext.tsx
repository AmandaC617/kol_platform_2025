"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  signInAnonymously,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile
} from "firebase/auth";
import { auth, isFirebaseAvailable } from "@/lib/firebase";

interface User {
  uid: string;
  email?: string | null;
  name?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  isAnonymous?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  authMethod: 'demo' | 'firebase' | 'google';
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName?: string) => Promise<void>;
  signInAnonymouslyAsync: () => Promise<void>;
  signInAsDemo: () => void;
  signOutUser: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState<'demo' | 'firebase' | 'google'>('firebase');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const setupAuth = () => {
        if (isFirebaseAvailable() && auth) {
          console.log("🔐 Setting up Firebase auth listener");

          const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
            if (firebaseUser) {
              console.log("✅ User authenticated:", firebaseUser.uid);

              const userData: User = {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                name: firebaseUser.displayName,
                displayName: firebaseUser.displayName,
                photoURL: firebaseUser.photoURL,
                isAnonymous: firebaseUser.isAnonymous
              };

              setUser(userData);
              setAuthMethod(firebaseUser.providerData.some(p => p.providerId === 'google.com') ? 'google' : 'firebase');
            } else {
              console.log("🔓 No authenticated user");
              setUser(null);
              setAuthMethod('firebase');
            }
          });

          return unsubscribe;
        } else {
          console.log("🎭 Firebase not available - using demo mode");
          setAuthMethod('demo');
          return undefined;
        }
      };

      const unsubscribe = setupAuth();
      return () => {
        if (unsubscribe) {
          unsubscribe();
        }
      };
    }
  }, []);

  const signInWithGoogle = async () => {
    if (!isFirebaseAvailable() || !auth) {
      throw new Error("Firebase not available");
    }

    try {
      console.log("🔑 Attempting Google sign-in...");
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');

      const result = await signInWithPopup(auth, provider);
      console.log("✅ Google sign-in successful:", result.user.uid);
    } catch (error: any) {
      console.error("❌ Google sign-in failed:", error);

      // Handle domain authorization errors with detailed guidance
      if (error.message?.includes('requests-from-referer') ||
          error.message?.includes('are-blocked') ||
          error.code === 'auth/unauthorized-domain') {

        const currentDomain = typeof window !== 'undefined' ? window.location.hostname : 'unknown';
        const currentUrl = typeof window !== 'undefined' ? window.location.origin : 'unknown';

        throw new Error(`域名授權錯誤！

需要在以下兩個地方添加域名授權：

1. Firebase Console > Authentication > Settings > Authorized domains
   添加：${currentDomain}

2. Google Cloud Console > APIs & Services > Credentials > OAuth 2.0
   在 "Authorized JavaScript origins" 添加：${currentUrl}

當前域名：${currentDomain}
錯誤詳情：${error.message}`);
      }

      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error("登入已取消");
      } else if (error.code === 'auth/popup-blocked') {
        throw new Error("彈出視窗被阻擋，請允許彈出視窗後重試");
      } else if (error.code === 'auth/network-request-failed') {
        throw new Error("網路連線失敗，請檢查網路連線");
      } else {
        throw new Error(`Google 登入失敗: ${error.message}`);
      }
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    if (!isFirebaseAvailable() || !auth) {
      throw new Error("Firebase not available");
    }

    try {
      console.log("📧 Attempting email sign-in...");
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log("✅ Email sign-in successful:", result.user.uid);
    } catch (error: any) {
      console.error("❌ Email sign-in failed:", error);

      if (error.code === 'auth/user-not-found') {
        throw new Error("找不到此電子郵件對應的帳戶");
      } else if (error.code === 'auth/wrong-password') {
        throw new Error("密碼錯誤");
      } else if (error.code === 'auth/invalid-email') {
        throw new Error("電子郵件格式無效");
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error("嘗試次數過多，請稍後再試");
      } else {
        throw new Error(`登入失敗: ${error.message}`);
      }
    }
  };

  const signUpWithEmail = async (email: string, password: string, displayName?: string) => {
    if (!isFirebaseAvailable() || !auth) {
      throw new Error("Firebase not available");
    }

    try {
      console.log("📝 Attempting email sign-up...");
      const result = await createUserWithEmailAndPassword(auth, email, password);

      if (displayName && result.user) {
        await updateProfile(result.user, {
          displayName: displayName
        });
      }

      console.log("✅ Email sign-up successful:", result.user.uid);
    } catch (error: any) {
      console.error("❌ Email sign-up failed:", error);

      if (error.code === 'auth/email-already-in-use') {
        throw new Error("此電子郵件已被使用");
      } else if (error.code === 'auth/weak-password') {
        throw new Error("密碼強度不足，請使用至少 6 個字元");
      } else if (error.code === 'auth/invalid-email') {
        throw new Error("電子郵件格式無效");
      } else {
        throw new Error(`註冊失敗: ${error.message}`);
      }
    }
  };

  const signInAnonymouslyAsync = async () => {
    if (!isFirebaseAvailable() || !auth) {
      throw new Error("Firebase not available");
    }

    try {
      console.log("👤 Attempting anonymous sign-in...");
      const result = await signInAnonymously(auth);
      console.log("✅ Anonymous sign-in successful:", result.user.uid);
    } catch (error: any) {
      console.error("❌ Anonymous sign-in failed:", error);
      throw new Error(`匿名登入失敗: ${error.message}`);
    }
  };

  const signInAsDemo = () => {
    console.log("🎭 Creating demo user...");
    const demoUser: User = {
      uid: 'demo-user', // 使用固定的 demo 用戶 ID，與 API 保持一致
      email: 'demo.user@example.com',
      name: '體驗用戶',
      displayName: '體驗用戶',
      photoURL: 'https://placehold.co/40x40/6366f1/ffffff?text=Demo',
      isAnonymous: false
    };

    setUser(demoUser);
    setAuthMethod('demo');
    console.log("✅ Demo user created:", demoUser.uid);
  };

  const signOutUser = async () => {
    if (authMethod === 'demo') {
      setUser(null);
      setAuthMethod('firebase');
      return;
    }

    if (!isFirebaseAvailable() || !auth) {
      throw new Error("Firebase not available");
    }

    try {
      console.log("👋 Signing out...");
      await signOut(auth);
      console.log("✅ Sign out successful");
    } catch (error: any) {
      console.error("❌ Sign out failed:", error);
      throw new Error(`登出失敗: ${error.message}`);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    authMethod,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signInAnonymouslyAsync,
    signInAsDemo,
    signOutUser,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

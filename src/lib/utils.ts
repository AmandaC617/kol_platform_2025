import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Influencer, DemoInfluencer, getEntityId, isValidEntityId, toEntityId } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 安全的屬性獲取函數
 */
export function getInfluencerProperty<T extends keyof Influencer['profile'] | keyof DemoInfluencer>(
  influencer: Influencer | DemoInfluencer,
  property: T
): T extends keyof Influencer['profile'] ? string | number | undefined : T extends keyof DemoInfluencer ? DemoInfluencer[T] : never {
  try {
    if ('profile' in influencer && influencer.profile && property in influencer.profile) {
      return (influencer.profile as any)[property];
    }
    if (property in influencer) {
      return (influencer as any)[property];
    }
    return undefined as any;
  } catch (error) {
    console.warn(`無法獲取屬性 ${String(property)}:`, error);
    return undefined as any;
  }
}

/**
 * 安全的 ID 比較函數
 */
export function compareIds(id1: unknown, id2: unknown): boolean {
  try {
    const entityId1 = toEntityId(id1);
    const entityId2 = toEntityId(id2);
    return entityId1 === entityId2;
  } catch {
    return false;
  }
}

/**
 * 安全的數字轉換
 */
export function safeParseInt(value: unknown, defaultValue: number = 0): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  }
  return defaultValue;
}

/**
 * 安全的字串轉換
 */
export function safeToString(value: unknown, defaultValue: string = ''): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value.toString();
  if (value === null || value === undefined) return defaultValue;
  return String(value);
}

/**
 * 類型安全的深度合併
 */
export function deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
  const result = { ...target };
  
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {} as any, source[key] as Record<string, any>);
    } else {
      result[key] = source[key] as T[Extract<keyof T, string>];
    }
  }
  
  return result;
}

/**
 * 防抖函數
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * 節流函數
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * 安全的異步操作包裝器
 */
export async function safeAsync<T>(
  operation: () => Promise<T>,
  fallback: T,
  errorHandler?: (error: Error) => void
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (errorHandler) {
      errorHandler(error as Error);
    }
    return fallback;
  }
}

/**
 * 驗證電子郵件格式
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 驗證 URL 格式
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * 格式化數字（添加千分位分隔符）
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('zh-TW');
}

/**
 * 格式化日期
 */
export function formatDate(date: Date | string | number): string {
  const d = new Date(date);
  return d.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

/**
 * 格式化日期時間
 */
export function formatDateTime(date: Date | string | number): string {
  const d = new Date(date);
  return d.toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * 計算相對時間
 */
export function getRelativeTime(date: Date | string | number): string {
  const now = new Date();
  const target = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - target.getTime()) / 1000);

  if (diffInSeconds < 60) return '剛剛';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}分鐘前`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}小時前`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}天前`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}個月前`;
  return `${Math.floor(diffInSeconds / 31536000)}年前`;
}

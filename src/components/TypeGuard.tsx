import React from 'react';
import { isDemoInfluencer, isInfluencer, isValidEntityId, toEntityId } from '@/types';
import { logger } from '@/lib/logger-service';

/**
 * 類型守衛組件 - 用於運行時類型檢查
 */
interface TypeGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onTypeError?: (error: Error) => void;
}

export const TypeGuard: React.FC<TypeGuardProps> = ({ 
  children, 
  fallback = <div>類型檢查失敗</div>,
  onTypeError 
}) => {
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    try {
      // 這裡可以添加額外的運行時檢查邏輯
      setHasError(false);
    } catch (error) {
      setHasError(true);
      logger.error('類型檢查失敗', error as Error);
      onTypeError?.(error as Error);
    }
  }, [onTypeError]);

  if (hasError) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

/**
 * 網紅類型檢查組件
 */
interface InfluencerTypeGuardProps {
  influencer: unknown;
  children: (influencer: any) => React.ReactNode;
  fallback?: React.ReactNode;
}

export const InfluencerTypeGuard: React.FC<InfluencerTypeGuardProps> = ({
  influencer,
  children,
  fallback = <div>無效的網紅資料</div>
}) => {
  if (isDemoInfluencer(influencer) || isInfluencer(influencer)) {
    return <>{children(influencer)}</>;
  }

  logger.warn('無效的網紅資料類型', { influencer });
  return <>{fallback}</>;
};

/**
 * ID 驗證組件
 */
interface IdValidationProps {
  id: unknown;
  children: (validId: string) => React.ReactNode;
  fallback?: React.ReactNode;
}

export const IdValidation: React.FC<IdValidationProps> = ({
  id,
  children,
  fallback = <div>無效的 ID</div>
}) => {
  try {
    const validId = toEntityId(id);
    return <>{children(validId)}</>;
  } catch (error) {
    logger.warn('ID 驗證失敗', { id, error });
    return <>{fallback}</>;
  }
};

/**
 * 條件渲染組件
 */
interface ConditionalRenderProps {
  condition: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ConditionalRender: React.FC<ConditionalRenderProps> = ({
  condition,
  children,
  fallback = null
}) => {
  return condition ? <>{children}</> : <>{fallback}</>;
};

/**
 * 錯誤邊界組件
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('組件錯誤', error, { errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 text-red-600">
          <h3>發生錯誤</h3>
          <p>{this.state.error?.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * 異步數據載入組件
 */
interface AsyncDataProps<T> {
  data: T | null;
  loading: boolean;
  error?: Error | null;
  children: (data: T) => React.ReactNode;
  loadingFallback?: React.ReactNode;
  errorFallback?: (error: Error) => React.ReactNode;
  emptyFallback?: React.ReactNode;
}

export function AsyncData<T>({
  data,
  loading,
  error,
  children,
  loadingFallback = <div>載入中...</div>,
  errorFallback = (error) => <div>載入失敗: {error.message}</div>,
  emptyFallback = <div>沒有資料</div>
}: AsyncDataProps<T>) {
  if (loading) {
    return <>{loadingFallback}</>;
  }

  if (error) {
    return <>{errorFallback(error)}</>;
  }

  if (!data) {
    return <>{emptyFallback}</>;
  }

  return <>{children(data)}</>;
} 
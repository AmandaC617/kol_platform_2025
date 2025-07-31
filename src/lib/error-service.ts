import { AppError, ErrorCode, createAppError } from "@/types";
import { logger } from "./logger-service";

/**
 * 統一的錯誤處理服務
 */
export class ErrorService {
  private static errors: AppError[] = [];
  private static maxErrors = 100; // 最大錯誤條目數

  /**
   * 處理並記錄錯誤
   */
  static handleError(
    error: Error | string,
    code: ErrorCode = ErrorCode.UNKNOWN_ERROR,
    context?: Record<string, unknown>
  ): AppError {
    const message = typeof error === 'string' ? error : error.message;
    const appError = createAppError(code, message, undefined, context);

    // 記錄錯誤
    logger.error(`[${code}] ${message}`, typeof error === 'string' ? undefined : error, context);

    // 儲存錯誤
    this.errors.push(appError);
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    return appError;
  }

  /**
   * 處理 API 錯誤
   */
  static handleApiError(error: any, endpoint: string, context?: Record<string, unknown>): AppError {
    const code = this.getApiErrorCode(error);
    const message = this.getApiErrorMessage(error, endpoint);
    
    return this.handleError(error, code, {
      endpoint,
      ...context
    });
  }

  /**
   * 處理驗證錯誤
   */
  static handleValidationError(field: string, value: unknown, rule: string): AppError {
    return this.handleError(
      `驗證失敗: ${field} 不符合規則 ${rule}`,
      ErrorCode.VALIDATION_ERROR,
      { field, value, rule }
    );
  }

  /**
   * 處理數據錯誤
   */
  static handleDataError(operation: string, entity: string, details?: string): AppError {
    return this.handleError(
      `數據操作失敗: ${operation} ${entity}`,
      ErrorCode.DATA_INVALID,
      { operation, entity, details }
    );
  }

  /**
   * 獲取所有錯誤
   */
  static getErrors(): AppError[] {
    return [...this.errors];
  }

  /**
   * 獲取指定代碼的錯誤
   */
  static getErrorsByCode(code: ErrorCode): AppError[] {
    return this.errors.filter(error => error.code === code);
  }

  /**
   * 清除錯誤記錄
   */
  static clearErrors(): void {
    this.errors = [];
  }

  /**
   * 根據錯誤對象判斷錯誤代碼
   */
  private static getApiErrorCode(error: any): ErrorCode {
    if (error?.response?.status) {
      const status = error.response.status;
      if (status === 401) return ErrorCode.AUTH_FAILED;
      if (status === 403) return ErrorCode.AUTH_INSUFFICIENT_PERMISSIONS;
      if (status === 404) return ErrorCode.DATA_NOT_FOUND;
      if (status === 409) return ErrorCode.DATA_CONFLICT;
      if (status >= 500) return ErrorCode.SYSTEM_ERROR;
      return ErrorCode.API_ERROR;
    }
    
    if (error?.code === 'NETWORK_ERROR') return ErrorCode.NETWORK_ERROR;
    if (error?.code === 'TIMEOUT') return ErrorCode.TIMEOUT_ERROR;
    
    return ErrorCode.UNKNOWN_ERROR;
  }

  /**
   * 獲取 API 錯誤訊息
   */
  private static getApiErrorMessage(error: any, endpoint: string): string {
    if (error?.response?.data?.message) {
      return error.response.data.message;
    }
    
    if (error?.message) {
      return error.message;
    }
    
    return `API 請求失敗: ${endpoint}`;
  }

  /**
   * 檢查是否為可恢復的錯誤
   */
  static isRecoverableError(error: AppError): boolean {
    const recoverableCodes = [
      ErrorCode.NETWORK_ERROR,
      ErrorCode.TIMEOUT_ERROR,
      ErrorCode.API_ERROR
    ];
    return recoverableCodes.includes(error.code as ErrorCode);
  }

  /**
   * 獲取用戶友好的錯誤訊息
   */
  static getUserFriendlyMessage(error: AppError): string {
    const messages: Record<ErrorCode, string> = {
      [ErrorCode.AUTH_FAILED]: '登入失敗，請重新登入',
      [ErrorCode.AUTH_EXPIRED]: '登入已過期，請重新登入',
      [ErrorCode.AUTH_INSUFFICIENT_PERMISSIONS]: '權限不足',
      [ErrorCode.DATA_NOT_FOUND]: '找不到相關資料',
      [ErrorCode.DATA_INVALID]: '資料格式錯誤',
      [ErrorCode.DATA_CONFLICT]: '資料衝突',
      [ErrorCode.NETWORK_ERROR]: '網路連線錯誤，請檢查網路',
      [ErrorCode.API_ERROR]: '服務暫時無法使用，請稍後再試',
      [ErrorCode.TIMEOUT_ERROR]: '請求超時，請稍後再試',
      [ErrorCode.VALIDATION_ERROR]: '輸入資料有誤',
      [ErrorCode.BUSINESS_RULE_VIOLATION]: '操作不符合業務規則',
      [ErrorCode.SYSTEM_ERROR]: '系統錯誤，請稍後再試',
      [ErrorCode.UNKNOWN_ERROR]: '發生未知錯誤，請稍後再試'
    };

    return messages[error.code as ErrorCode] || messages[ErrorCode.UNKNOWN_ERROR];
  }
} 
import { LogLevel, LogEntry, Logger } from "@/types";

/**
 * 統一的日誌服務
 */
export class LoggerService implements Logger {
  private static instance: LoggerService;
  private logs: LogEntry[] = [];
  private maxLogs = 1000; // 最大日誌條目數

  private constructor() {}

  static getInstance(): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService();
    }
    return LoggerService.instance;
  }

  private addLog(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error): void {
    const logEntry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context,
      error
    };

    this.logs.push(logEntry);

    // 限制日誌條目數量
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // 根據環境輸出到控制台
    if (process.env.NODE_ENV === 'development') {
      const logMethod = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
      const prefix = `[${level.toUpperCase()}]`;
      
      if (error) {
        console[logMethod](prefix, message, error, context);
      } else {
        console[logMethod](prefix, message, context);
      }
    }
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.addLog(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.addLog(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.addLog(LogLevel.WARN, message, context);
  }

  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    this.addLog(LogLevel.ERROR, message, context, error);
  }

  /**
   * 獲取所有日誌
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * 獲取指定級別的日誌
   */
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter(log => log.level === level);
  }

  /**
   * 清除日誌
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * 導出日誌為 JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

// 導出單例實例
export const logger = LoggerService.getInstance(); 
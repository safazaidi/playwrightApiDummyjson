import fs from 'fs-extra';
import path from 'path';


export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  stack?: string;
}

interface RequestLog {
  method: string;
  url: string;
  statusCode?: number;
  duration?: number;
  requestHeaders?: Record<string, string>;
  responseHeaders?: Record<string, string>;
  requestBody?: any;
  responseBody?: any;
  error?: string;
}

class Logger {
  private logs: LogEntry[] = [];
  private requestLogs: RequestLog[] = [];
  private logsDir = 'test-results/logs';
  private currentTestName = 'unknown';
private logLevel: LogLevel =
  process.env.DEBUG === 'true'
    ? 'DEBUG'
    : 'INFO';
  private enableFileLogging = true;
  private enableConsoleOutput = true;

  constructor() {
    this.ensureLogsDirectory();
  }

  /**
   * Set the current test name for organized logging
   */
  setTestName(testName: string): void {
    this.currentTestName = testName.replace(/\s+/g, '_');
  }

  /**
   * Set logging level (DEBUG, INFO, WARN, ERROR)
   */
  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  /**
   * Enable/disable file logging
   */
  setFileLogging(enabled: boolean): void {
    this.enableFileLogging = enabled;
  }

  /**
   * Enable/disable console output
   */
  setConsoleOutput(enabled: boolean): void {
    this.enableConsoleOutput = enabled;
  }

  /**
   * Private method: Check if log level should be logged
   */
  private shouldLog(level: LogLevel): boolean {
    const levelOrder: Record<LogLevel, number> = {
      DEBUG: 0,
      INFO: 1,
      WARN: 2,
      ERROR: 3,
    };
    return levelOrder[level] >= levelOrder[this.logLevel];
  }

  /**
   * Private method: Get color code for console output
   */
  private getColorCode(level: LogLevel): string {
    const colors: Record<LogLevel, string> = {
      DEBUG: '\x1b[36m', // Cyan
      INFO: '\x1b[32m', // Green
      WARN: '\x1b[33m', // Yellow
      ERROR: '\x1b[31m', // Red
    };
    return colors[level];
  }

  /**
   * Private method: Create log entry
   */
  private createEntry(
    level: LogLevel,
    message: string,
    context?: Record<string, any>,
    stack?: string
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      stack,
    };
  }

  /**
   * Private method: Ensure logs directory exists
   */
  private ensureLogsDirectory(): void {
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
  }

  /**
   * Private method: Output to console
   */
  private outputToConsole(entry: LogEntry): void {
    if (!this.enableConsoleOutput) return;

    const color = this.getColorCode(entry.level);
    const reset = '\x1b[0m';
    const timestamp = entry.timestamp.split('T')[1].split('.')[0]; // HH:MM:SS

    const message = `${color}[${timestamp}] [${entry.level}]${reset} ${entry.message}`;
    const contextStr = entry.context ? JSON.stringify(entry.context, null, 2) : '';

    if (entry.level === 'ERROR') {
      console.error(message, contextStr, entry.stack);
    } else if (entry.level === 'WARN') {
      console.warn(message, contextStr);
    } else {
      console.log(message, contextStr);
    }
  }

  /**
   * Private method: Write to file
   */
  private writeToFile(entry: LogEntry): void {
    if (!this.enableFileLogging) return;

    const logFile = path.join(
      this.logsDir,
      `${this.currentTestName}-${new Date().toISOString().split('T')[0]}.log`
    );

    const logLine = JSON.stringify(entry) + '\n';

    try {
      fs.appendFileSync(logFile, logLine);
    } catch (error) {
      console.error('Failed to write log to file:', error);
    }
  }

  /**
   * Debug level logging
   */
  debug(message: string, context?: Record<string, any>): void {
    if (!this.shouldLog('DEBUG')) return;

    const entry = this.createEntry('DEBUG', message, context);
    this.logs.push(entry);
    this.outputToConsole(entry);
    this.writeToFile(entry);
  }

  /**
   * Info level logging
   */
  info(message: string, context?: Record<string, any>): void {
    if (!this.shouldLog('INFO')) return;

    const entry = this.createEntry('INFO', message, context);
    this.logs.push(entry);
    this.outputToConsole(entry);
    this.writeToFile(entry);
  }

  /**
   * Warning level logging
   */
  warn(message: string, context?: Record<string, any>): void {
    if (!this.shouldLog('WARN')) return;

    const entry = this.createEntry('WARN', message, context);
    this.logs.push(entry);
    this.outputToConsole(entry);
    this.writeToFile(entry);
  }

  /**
   * Error level logging
   */
  error(message: string, error?: Error | string, context?: Record<string, any>): void {
    if (!this.shouldLog('ERROR')) return;

    const stack = error instanceof Error ? error.stack : undefined;
    const entry = this.createEntry('ERROR', message, context, stack);
    this.logs.push(entry);
    this.outputToConsole(entry);
    this.writeToFile(entry);
  }

  /**
   * Log HTTP request
   */
  logRequest(
    method: string,
    url: string,
    requestBody?: any,
    headers?: Record<string, string>
  ): void {
    const requestLog: RequestLog = {
      method,
      url,
      requestBody,
      requestHeaders: headers,
    };

    this.info(`➜ ${method} ${url}`, { requestBody });

    this.requestLogs.push(requestLog);
  }

  /**
   * Log HTTP response
   */
  logResponse(
    method: string,
    url: string,
    statusCode: number,
    duration: number,
    responseBody?: any,
    headers?: Record<string, string>
  ): void {
    const statusEmoji = statusCode >= 200 && statusCode < 300 ? '✓' : '✗';
    const level: LogLevel = statusCode >= 400 ? 'WARN' : 'INFO';

    const message = `${statusEmoji} ${method} ${url} - ${statusCode} (${duration}ms)`;
    const logEntry = {
      statusCode,
      duration,
      responseBody: this.truncateBody(responseBody),
      headers,
    };

    if (level === 'WARN') {
      this.warn(message, logEntry);
    } else {
      this.info(message, logEntry);
    }

    // Update last request log with response
    if (this.requestLogs.length > 0) {
      const lastLog = this.requestLogs[this.requestLogs.length - 1];
      if (lastLog.method === method && lastLog.url === url) {
        lastLog.statusCode = statusCode;
        lastLog.duration = duration;
        lastLog.responseBody = responseBody;
        lastLog.responseHeaders = headers;
      }
    }
  }

  /**
   * Log API error
   */
  logApiError(
    method: string,
    url: string,
    statusCode: number,
    errorBody?: any
  ): void {
    this.error(`API Error: ${method} ${url}`, undefined, {
      statusCode,
      errorBody: this.truncateBody(errorBody),
    });
  }

  /**
   * Truncate large response bodies for readability
   */
  private truncateBody(body: any, maxLength = 500): any {
    if (!body) return body;

    const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
    if (bodyStr.length > maxLength) {
      return bodyStr.substring(0, maxLength) + `... (truncated, total: ${bodyStr.length} chars)`;
    }
    return body;
  }

  /**
   * Get all logs for current test
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Get all request logs
   */
  getRequestLogs(): RequestLog[] {
    return [...this.requestLogs];
  }

  /**
   * Get logs for specific level
   */
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter((log) => log.level === level);
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
    this.requestLogs = [];
  }

  /**
   * Export logs to JSON
   */
  exportLogsToJson(): string {
    return JSON.stringify(
      {
        testName: this.currentTestName,
        exportedAt: new Date().toISOString(),
        logs: this.logs,
        requestLogs: this.requestLogs,
      },
      null,
      2
    );
  }

  /**
   * Export logs to file
   */
  saveLogsToFile(fileName?: string): string {
    this.ensureLogsDirectory();
    const file =
      fileName ||
      path.join(
        this.logsDir,
        `${this.currentTestName}-detailed-${new Date().toISOString().split('T')[0]}.json`
      );

    fs.writeFileSync(file, this.exportLogsToJson());
    this.info(`Logs exported to ${file}`);
    return file;
  }

  /**
   * Generate test report summary
   */
  generateSummary(): string {
    const totalLogs = this.logs.length;
    const errorCount = this.getLogsByLevel('ERROR').length;
    const warnCount = this.getLogsByLevel('WARN').length;
    const apiRequestCount = this.requestLogs.length;
    const avgResponseTime =
      this.requestLogs.length > 0
        ? this.requestLogs.reduce((sum, log) => sum + (log.duration || 0), 0) /
          this.requestLogs.length
        : 0;

    return `
===== TEST EXECUTION SUMMARY =====
Test: ${this.currentTestName}
Total Logs: ${totalLogs}
Errors: ${errorCount}
Warnings: ${warnCount}
API Requests: ${apiRequestCount}
Avg Response Time: ${avgResponseTime.toFixed(2)}ms
==================================
    `;
  }
}

// Export singleton instance
export const logger = new Logger();

// Export for use in fixtures
export default logger;
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native'

const LOG_STORAGE_KEY = '@rightfit_logs'
const MAX_LOGS = 500 // Keep last 500 log entries

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export interface LogEntry {
  timestamp: string
  level: LogLevel
  category: string
  message: string
  data?: any
  stack?: string
}

class Logger {
  private logs: LogEntry[] = []
  private initialized = false

  async init() {
    if (this.initialized) return

    try {
      const storedLogs = await AsyncStorage.getItem(LOG_STORAGE_KEY)
      if (storedLogs) {
        this.logs = JSON.parse(storedLogs)
      }
      this.initialized = true
    } catch (error) {
      console.error('Failed to initialize logger:', error)
    }
  }

  private async saveLogs() {
    try {
      // Keep only the last MAX_LOGS entries
      if (this.logs.length > MAX_LOGS) {
        this.logs = this.logs.slice(-MAX_LOGS)
      }
      await AsyncStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(this.logs))
    } catch (error) {
      console.error('Failed to save logs:', error)
    }
  }

  private log(level: LogLevel, category: string, message: string, data?: any, error?: Error) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      data: data ? this.sanitizeData(data) : undefined,
      stack: error?.stack,
    }

    this.logs.push(entry)

    // Console output for development
    const consoleMessage = `[${entry.timestamp}] [${level}] [${category}] ${message}`
    switch (level) {
      case LogLevel.ERROR:
        console.error(consoleMessage, data, error)
        break
      case LogLevel.WARN:
        console.warn(consoleMessage, data)
        break
      case LogLevel.INFO:
        console.info(consoleMessage, data)
        break
      case LogLevel.DEBUG:
        console.log(consoleMessage, data)
        break
    }

    // Save to AsyncStorage (async, don't block)
    this.saveLogs().catch(console.error)
  }

  private sanitizeData(data: any): any {
    try {
      // Remove sensitive information before logging
      const sanitized = JSON.parse(JSON.stringify(data))

      // Remove passwords
      if (sanitized.password) sanitized.password = '***REDACTED***'
      if (sanitized.confirm_password) sanitized.confirm_password = '***REDACTED***'

      // Remove tokens
      if (sanitized.access_token) sanitized.access_token = '***REDACTED***'
      if (sanitized.refresh_token) sanitized.refresh_token = '***REDACTED***'
      if (sanitized.token) sanitized.token = '***REDACTED***'

      // Remove authorization headers
      if (sanitized.headers?.Authorization) {
        sanitized.headers.Authorization = '***REDACTED***'
      }
      if (sanitized.headers?.authorization) {
        sanitized.headers.authorization = '***REDACTED***'
      }

      return sanitized
    } catch {
      return String(data)
    }
  }

  debug(category: string, message: string, data?: any) {
    this.log(LogLevel.DEBUG, category, message, data)
  }

  info(category: string, message: string, data?: any) {
    this.log(LogLevel.INFO, category, message, data)
  }

  warn(category: string, message: string, data?: any) {
    this.log(LogLevel.WARN, category, message, data)
  }

  error(category: string, message: string, error?: Error, data?: any) {
    this.log(LogLevel.ERROR, category, message, data, error)
  }

  // Network-specific logging
  logRequest(method: string, url: string, data?: any, headers?: any) {
    this.info('API_REQUEST', `${method} ${url}`, {
      method,
      url,
      data,
      headers,
      platform: Platform.OS,
      timestamp: new Date().toISOString(),
    })
  }

  logResponse(method: string, url: string, status: number, data?: any, duration?: number) {
    this.info('API_RESPONSE', `${method} ${url} - ${status}`, {
      method,
      url,
      status,
      data,
      duration,
      timestamp: new Date().toISOString(),
    })
  }

  logError(method: string, url: string, error: any) {
    const errorData: any = {
      method,
      url,
      message: error.message,
      platform: Platform.OS,
      timestamp: new Date().toISOString(),
    }

    // Axios error details
    if (error.response) {
      errorData.response = {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers,
      }
    } else if (error.request) {
      errorData.request = {
        message: 'Request was made but no response received',
        // Network error details
        timeout: error.code === 'ECONNABORTED',
        networkError: error.code === 'ERR_NETWORK' || !error.response,
      }
    }

    errorData.code = error.code
    errorData.config = {
      baseURL: error.config?.baseURL,
      url: error.config?.url,
      method: error.config?.method,
      timeout: error.config?.timeout,
    }

    this.error('API_ERROR', `${method} ${url} failed`, error, errorData)
  }

  async getLogs(): Promise<LogEntry[]> {
    await this.init()
    return [...this.logs]
  }

  async clearLogs() {
    this.logs = []
    await AsyncStorage.removeItem(LOG_STORAGE_KEY)
    this.info('LOGGER', 'Logs cleared')
  }

  async exportLogs(): Promise<string> {
    await this.init()
    return JSON.stringify(this.logs, null, 2)
  }
}

export default new Logger()

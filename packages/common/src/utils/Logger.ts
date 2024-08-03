/*
import { getTimestamp } from './time'
import { blue, green, yellow, red, magenta } from 'colorette'

const levelColorMap = {
  DEBUG: magenta,
  INFO: green,
  WARN: yellow,
  ERROR: red
}

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'SILENT'

const LOG_LEVEL_RANK: Record<LogLevel, number> = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  SILENT: 4
}

function resolveLogLevel(): LogLevel {
  const configured = (process.env.LOG_LEVEL ?? 'INFO').toUpperCase()

  if (configured in LOG_LEVEL_RANK) {
    return configured as LogLevel
  }

  return 'INFO'
}

function shouldLog(level: Exclude<LogLevel, 'SILENT'>): boolean {
  const configured = resolveLogLevel()

  if (configured === 'SILENT') {
    return false
  }

  return LOG_LEVEL_RANK[level] >= LOG_LEVEL_RANK[configured]
}

export const DEFAULT_DATE_FORMAT = 'DD-MM-YYYY HH:mm:ssZ'

export default class Logger {
  constructor(
    private readonly name: string,
    private readonly dateFormat: string = DEFAULT_DATE_FORMAT
  ) {}

  public debug(message: unknown, ...args: unknown[]): void {
    if (!shouldLog('DEBUG')) {
      return
    }

    const formatted = this.formatMessage(message, 'DEBUG')
    console.log(blue(formatted), ...args)
  }

  public info(message: unknown, ...args: unknown[]): void {
    if (!shouldLog('INFO')) {
      return
    }

    const formatted = this.formatMessage(message, 'INFO')
    console.log(formatted, ...args)
  }

  public warn(message: unknown, ...args: unknown[]): void {
    if (!shouldLog('WARN')) {
      return
    }

    const formatted = this.formatMessage(message, 'WARN')
    console.warn(yellow(formatted), ...args)
  }

  public error(message: unknown, ...args: unknown[]): void {
    if (!shouldLog('ERROR')) {
      return
    }

    const formatted = this.formatMessage(message, 'ERROR')
    console.error(red(formatted), ...args)
  }

  private formatMessage(message: unknown, level: string): string {
    return `${this.name} ${this.getTimestamp()} ${levelColorMap[level as keyof typeof levelColorMap](level)} - ${
      (message as Error).stack ? (message as Error).stack : message
    }`
  }

  private getTimestamp(): string {
    return getTimestamp(this.dateFormat)
  }
}
*/

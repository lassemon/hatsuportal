import { getTimestamp } from './time'
import { blue, green, yellow, red, magenta } from 'colorette'

const levelColorMap = {
  DEBUG: magenta,
  INFO: green,
  WARN: yellow,
  ERROR: red
}

export const DEFAULT_DATE_FORMAT = 'DD-MM-YYYY HH:mm:ssZ'
export default class Logger {
  constructor(private readonly name: string, private readonly dateFormat: string = DEFAULT_DATE_FORMAT) {}

  public debug(message: unknown, ...args: any[]) {
    if (process.env.LOG_LEVEL === 'DEBUG') {
      const formatted = this.formatMessage(message, 'DEBUG')
      console.log(blue(formatted), ...args)
    }
  }

  public info(message: unknown, ...args: any[]) {
    const formatted = this.formatMessage(message, 'INFO')
    console.log(formatted, ...args)
  }

  public warn(message: unknown, ...args: any[]) {
    const formatted = this.formatMessage(message, 'WARN')
    // Suppress warnings when running tests to avoid cluttering the output
    if (process.env.NODE_ENV !== 'test') {
      console.warn(yellow(formatted), ...args.map((arg) => yellow(arg)))
    }
  }

  public error(message: unknown, ...args: any[]) {
    const formatted = this.formatMessage(message, 'ERROR')
    console.error(red(formatted), ...args)
  }

  private formatMessage(message: unknown, level: string) {
    return `${this.name} ${this.getTimestamp()} ${levelColorMap[level as keyof typeof levelColorMap](level)} - ${
      (message as any).stack ? (message as any).stack : message
    }`
  }

  private getTimestamp() {
    return getTimestamp(this.dateFormat)
  }
}

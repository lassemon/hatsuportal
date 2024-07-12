import { DateTime } from 'luxon'

export default class Logger {
  public DATE_FORMAT
  public name

  constructor(name: string, dateFormat: string = 'DD-MM-YYYY HH:mm:ssZ') {
    this.name = name
    this.DATE_FORMAT = dateFormat
  }

  public debug(message: unknown, ...args: any[]) {
    if (process.env.LOG_LEVEL === 'DEBUG') {
      const formatted = this.formatMessage(message, 'DEBUG')
      console.log(formatted, ...args)
    }
  }

  public info(message: unknown, ...args: any[]) {
    const formatted = this.formatMessage(message, 'INFO')
    console.log(formatted, ...args)
  }

  public warn(message: unknown, ...args: any[]) {
    const formatted = this.formatMessage(message, 'WARN')
    console.warn(formatted, ...args)
  }

  public error(message: unknown, ...args: any[]) {
    const formatted = this.formatMessage(message, 'ERROR')
    console.error(formatted, ...args)
  }

  private formatMessage(message: unknown, level: string) {
    return `${this.name} ${this.getTimestamp()} ${level} - ${(message as any).stack ? (message as any).stack : message}`
  }

  private getTimestamp() {
    return DateTime.now().toFormat(this.DATE_FORMAT)
  }
}

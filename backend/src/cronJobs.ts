import { Logger } from '@hatsuportal/common'
import { ICronJob } from '@hatsuportal/platform'

const logger = new Logger('CronJobs')

export function initializeCronJobs(cronJobs: ICronJob[]): void {
  logger.info('Initializing cron jobs...')

  for (const cronJob of cronJobs) {
    cronJob.start()
  }

  logger.info('All cron jobs initialized')
}

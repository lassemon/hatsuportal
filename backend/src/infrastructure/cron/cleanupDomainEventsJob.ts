import { CronJob } from 'cron'
import { DomainEventCleaner } from '../services/DomainEventCleaner'
import { Logger } from '@hatsuportal/common'
import { ICronJobConfig } from 'config'
import { ICronJob } from '@hatsuportal/platform'

const logger = new Logger('CleanupDomainEventsJob')

export class CleanupDomainEventsJob implements ICronJob {
  private readonly job: CronJob

  constructor(
    private readonly domainEventCleaner: DomainEventCleaner,
    private readonly cronExpression: ICronJobConfig
  ) {
    this.job = CronJob.from({
      cronTime: cronExpression.cronPattern,
      onTick: () => this.onTick(),
      waitForCompletion: true
    })
  }

  start(): void {
    this.onTick()
    this.job.start()
    logger.info(`CleanupDomainEventsJob started - ${this.cronExpression.description}`)
  }

  async stop(): Promise<void> {
    await this.job.stop()
    logger.info('CleanupDomainEventsJob stopped')
  }

  private async onTick(): Promise<void> {
    try {
      await this.domainEventCleaner.cleanOldDomainEvents()
    } catch (error) {
      logger.error('Failed to clean old domain events', error)
    }
  }
}

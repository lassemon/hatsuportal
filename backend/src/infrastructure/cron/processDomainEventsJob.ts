import { CronJob } from 'cron'
import { DomainEventProcessor } from '../services/DomainEventProcessor'
import { Logger } from '@hatsuportal/common'
import { ICronJobConfig } from 'config'
import { ICronJob } from '@hatsuportal/platform'

const logger = new Logger('ProcessDomainEventsJob')

export class ProcessDomainEventsJob implements ICronJob {
  private readonly job: CronJob

  constructor(
    private readonly domainEventProcessor: DomainEventProcessor,
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
    logger.info(`ProcessDomainEventsJob started - ${this.cronExpression.description}`)
  }

  async stop(): Promise<void> {
    await this.job.stop()
    logger.info('ProcessDomainEventsJob stopped')
  }

  private async onTick(): Promise<void> {
    try {
      await this.domainEventProcessor.processDomainEvents()
    } catch (error) {
      logger.error('Failed to process domain events', error)
    }
  }
}

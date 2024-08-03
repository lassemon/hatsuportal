import { CronJob } from 'cron'
import { OrphanImageCleaner } from '../services/OrphanImageCleaner'
import { Logger } from '@hatsuportal/common'
import { ICronJobConfig } from 'config'
import { ICronJob } from '@hatsuportal/platform'

const logger = new Logger('CleanupOrphanImagesJob')

export class CleanupOrphanImagesJob implements ICronJob {
  private readonly job: CronJob

  constructor(
    private readonly orphanImageCleaner: OrphanImageCleaner,
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
    logger.info(`CleanupOrphanImagesJob started - ${this.cronExpression.description}`)
  }

  async stop(): Promise<void> {
    await this.job.stop()
    logger.info('CleanupOrphanImagesJob stopped')
  }

  private async onTick(): Promise<void> {
    try {
      await this.orphanImageCleaner.cleanOrphanImages()
    } catch (error) {
      logger.error('Failed to clean orphan images', error)
    }
  }
}

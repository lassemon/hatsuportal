import { DataPersistenceError, IDomainEventDispatcher, ITransaction } from '@hatsuportal/application'
import { IImageRepository, IStoryRepository, ITransactionalUnitOfWork, Story } from '@hatsuportal/domain'
import { Logger } from '@hatsuportal/common'
import { IKnexConnection } from './database/connection'

const logger = new Logger('StoryUnitOfWork')

export class StoryUnitOfWork implements ITransactionalUnitOfWork<Story> {
  private transaction: ITransaction | null = null

  private _story: Story | null = null

  constructor(
    private readonly connection: IKnexConnection,
    private readonly storyRepository: IStoryRepository,
    private readonly imageRepository: IImageRepository,
    private readonly eventDispatcher: IDomainEventDispatcher
  ) {}

  public get aggregate(): Story {
    if (!this._story) throw new DataPersistenceError("Create story unit of work hasn't been properly initialized")
    return this._story
  }

  public set aggregate(story: Story) {
    this._story = story
  }

  async execute(): Promise<void> {
    await this.beginTransaction()
    await this.commit()
  }

  async beginTransaction(): Promise<void> {
    if (!this._story) throw new DataPersistenceError("Create story unit of work hasn't been properly initialized")

    logger.debug('Begin transaction')
    this.transaction = await this.connection.getTransaction()
    this.storyRepository.setTransaction(this.transaction)
    this.imageRepository.setTransaction(this.transaction)
  }

  async commit(): Promise<void> {
    if (!this._story) throw new DataPersistenceError("Create story unit of work hasn't been properly initialized")

    if (!this.transaction) {
      throw new DataPersistenceError('Cannot commit work. Transaction not started')
    }

    try {
      for (const event of this._story!.domainEvents) {
        logger.debug(`Dispatching event ${event.eventType} for ${this._story!.id.value}`)
        await this.eventDispatcher.dispatch(event)
      }
      this._story!.clearEvents()

      await this.transaction.commit()
    } catch (error) {
      await this.rollback()
      throw error
    } finally {
      this.clearTransactions()
    }
  }

  async rollback(): Promise<void> {
    if (!this.transaction) {
      throw new DataPersistenceError('Cannot rollback work. Transaction not started')
    }

    await this.transaction.rollback()
    this.clearTransactions()
  }

  private clearTransactions(): void {
    this.transaction = null
    this.storyRepository.setTransaction(null)
    this.imageRepository.setTransaction(null)
  }
}

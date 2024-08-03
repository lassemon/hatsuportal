import { IUnitOfWorkFactory } from '@hatsuportal/application'
import { IImageRepository, IStoryRepository, IUnitOfWork, Story } from '@hatsuportal/domain'
import { DomainEventDispatcher } from './DomainEventDispatcher'
import { StoryUnitOfWork } from '../dataAccess/StoryUnitOfWork'
import { IKnexConnection } from '../dataAccess/database/connection'

export class UnitOfWorkFactory implements IUnitOfWorkFactory {
  constructor(
    private readonly connection: IKnexConnection,
    private readonly storyRepository: IStoryRepository,
    private readonly imageRepository: IImageRepository,
    private readonly eventDispatcher: DomainEventDispatcher
  ) {}

  createStoryUnitOfWork(): IUnitOfWork<Story> {
    return new StoryUnitOfWork(this.connection, this.storyRepository, this.imageRepository, this.eventDispatcher)
  }
}

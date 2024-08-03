import { OrderEnum, StorySortableKeyEnum } from '@hatsuportal/common'
import { ITransactionAware, ITransaction } from '@hatsuportal/platform'
import { PostCreatorId, PostId } from '../../domain'
import { IStoryReadRepository, StoryReadModelDTO, StorySearchCriteriaDTO } from '../../application'

export class StoryReadRepositoryWithCache implements IStoryReadRepository, ITransactionAware {
  constructor(
    private readonly baseRepo: IStoryReadRepository & ITransactionAware,
    private readonly cache: Map<string, StoryReadModelDTO | null>
  ) {}

  async findAllPublic(orderBy: StorySortableKeyEnum, order: OrderEnum): Promise<StoryReadModelDTO[]> {
    return await this.baseRepo.findAllPublic(orderBy, order)
  }

  async findLatest(limit: number, loggedIn: boolean): Promise<StoryReadModelDTO[]> {
    return await this.baseRepo.findLatest(limit, loggedIn)
  }

  async count(query: StorySearchCriteriaDTO): Promise<number> {
    return await this.baseRepo.count(query)
  }

  async search(query: StorySearchCriteriaDTO): Promise<StoryReadModelDTO[]> {
    return await this.baseRepo.search(query)
  }

  async findByImageId(imageId: PostId): Promise<StoryReadModelDTO[]> {
    return await this.baseRepo.findByImageId(imageId)
  }

  async findAllVisibleForLoggedInCreator(
    creatorId: PostCreatorId,
    orderBy: StorySortableKeyEnum,
    order: OrderEnum
  ): Promise<StoryReadModelDTO[]> {
    return await this.baseRepo.findAllVisibleForLoggedInCreator(creatorId, orderBy, order)
  }

  async findAllForCreator(creatorId: PostCreatorId): Promise<StoryReadModelDTO[]> {
    return await this.baseRepo.findAllForCreator(creatorId)
  }

  async findStoriesOfCreatorByName(storyName: string, creatorId: PostCreatorId): Promise<StoryReadModelDTO[]> {
    return await this.baseRepo.findStoriesOfCreatorByName(storyName, creatorId)
  }

  async countStoriesByCreator(creatorId: PostCreatorId): Promise<number> {
    return await this.baseRepo.countStoriesByCreator(creatorId)
  }

  async findById(storyId: PostId): Promise<StoryReadModelDTO | null> {
    const key = `findById:${storyId.value}`
    if (!this.cache.has(key)) {
      const story = await this.baseRepo.findById(storyId)
      this.cache.set(key, story)
    }
    return this.cache.get(key) || null
  }

  getTableName(): string {
    return this.baseRepo.getTableName()
  }

  setTransaction(transaction: ITransaction): void {
    this.baseRepo.setTransaction(transaction)
  }

  clearLastLoadedMap(): void {
    this.baseRepo.clearLastLoadedMap()
  }
}

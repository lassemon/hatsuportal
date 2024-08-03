import { ITransaction } from '@hatsuportal/common-bounded-context'
import { IStoryRepository, Story, PostId, PostCreatorId, StorySearchCriteriaDTO } from '@hatsuportal/post-management'
import { OrderEnum, StorySortableKeyEnum } from '@hatsuportal/common'

export class StoryRepositoryWithCache implements IStoryRepository {
  constructor(private readonly baseRepo: IStoryRepository, private readonly cache: Map<string, Story | null>) {}

  async findAllPublic(orderBy: StorySortableKeyEnum, order: OrderEnum): Promise<Story[]> {
    return await this.baseRepo.findAllPublic(orderBy, order)
  }

  async findLatest(limit: number, loggedIn: boolean): Promise<Story[]> {
    return await this.baseRepo.findLatest(limit, loggedIn)
  }

  async count(query: StorySearchCriteriaDTO): Promise<number> {
    return await this.baseRepo.count(query)
  }

  async search(query: StorySearchCriteriaDTO): Promise<Story[]> {
    return await this.baseRepo.search(query)
  }

  async findByImageId(imageId: PostId): Promise<Story[]> {
    return await this.baseRepo.findByImageId(imageId)
  }

  async findAllVisibleForLoggedInCreator(creatorId: PostCreatorId, orderBy: StorySortableKeyEnum, order: OrderEnum): Promise<Story[]> {
    return await this.baseRepo.findAllVisibleForLoggedInCreator(creatorId, orderBy, order)
  }

  async findAllForCreator(creatorId: PostCreatorId): Promise<Story[]> {
    return await this.baseRepo.findAllForCreator(creatorId)
  }

  async findStoriesOfCreatorByName(storyName: string, creatorId: PostCreatorId): Promise<Story[]> {
    return await this.baseRepo.findStoriesOfCreatorByName(storyName, creatorId)
  }

  async countStoriesByCreator(creatorId: PostCreatorId): Promise<number> {
    return await this.baseRepo.countStoriesByCreator(creatorId)
  }

  async findById(storyId: PostId): Promise<Story | null> {
    const key = `findById:${storyId.value}`
    if (!this.cache.has(key)) {
      const story = await this.baseRepo.findById(storyId)
      this.cache.set(key, story)
    }
    return this.cache.get(key) || null
  }

  async insert(story: Story): Promise<Story> {
    return await this.baseRepo.insert(story)
  }

  async update(story: Story): Promise<Story> {
    return await this.baseRepo.update(story)
  }

  async delete(storyId: PostId): Promise<void> {
    await this.baseRepo.delete(storyId)
  }

  setTransaction(transaction: ITransaction): void {
    this.baseRepo.setTransaction(transaction)
  }

  clearLastLoadedMap(): void {
    this.baseRepo.clearLastLoadedMap()
  }
}

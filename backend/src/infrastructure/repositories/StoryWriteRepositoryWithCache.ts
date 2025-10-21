import { ITransaction } from '@hatsuportal/foundation'
import { IStoryWriteRepository, Story, PostId } from '@hatsuportal/post-management'

export class StoryWriteRepositoryWithCache implements IStoryWriteRepository {
  constructor(private readonly baseRepo: IStoryWriteRepository, private readonly cache: Map<string, Story | null>) {}

  async findByIdForUpdate(storyId: PostId): Promise<Story | null> {
    const key = `findByIdForUpdate:${storyId.value}`
    if (!this.cache.has(key)) {
      const story = await this.baseRepo.findByIdForUpdate(storyId)
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

  async delete(story: Story): Promise<Story> {
    return await this.baseRepo.delete(story)
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

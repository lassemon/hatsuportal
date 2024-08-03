import { IRepository } from '@hatsuportal/foundation'
import Story from '../entities/Story'
import { PostId } from '../valueObjects/PostId'

export interface IStoryWriteRepository extends IRepository {
  findByIdForUpdate(storyId: PostId): Promise<Story | null>
  insert(story: Story): Promise<Story>
  update(story: Story): Promise<Story>
  delete(story: Story): Promise<Story>
}

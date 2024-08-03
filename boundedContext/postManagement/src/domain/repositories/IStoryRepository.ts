import { StorySortableKeyEnum, OrderEnum } from '@hatsuportal/common'
import { IRepository } from '@hatsuportal/common-bounded-context'
import Story from '../entities/Story'
import { PostId } from '../valueObjects/PostId'
import { PostCreatorId } from '../valueObjects/PostCreatorId'
import { StorySearchCriteriaDTO } from '../../application/dtos'

export interface IStoryRepository extends IRepository {
  insert(story: Story): Promise<Story>
  update(story: Story): Promise<Story>
  count(query: StorySearchCriteriaDTO): Promise<number>
  search(query: StorySearchCriteriaDTO): Promise<Story[]>
  findAllPublic(orderBy: StorySortableKeyEnum, order: OrderEnum): Promise<Story[]>
  findById(id: PostId): Promise<Story | null>
  findByImageId(imageId: PostId): Promise<Story[]>
  findAllVisibleForLoggedInCreator(creatorId: PostCreatorId, orderBy: StorySortableKeyEnum, order: OrderEnum): Promise<Story[]>
  findAllForCreator(creatorId: PostCreatorId): Promise<Story[]>
  findLatest(limit: number, loggedIn: boolean): Promise<Story[]>
  findStoriesOfCreatorByName(storyName: string, creatorId: PostCreatorId): Promise<Story[]>
  countStoriesByCreator(creatorId: PostCreatorId): Promise<number>
  delete(storyId: PostId): Promise<void>
}

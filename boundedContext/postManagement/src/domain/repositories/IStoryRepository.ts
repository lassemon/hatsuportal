import { StorySortableKeyEnum, OrderEnum, VisibilityEnum } from '@hatsuportal/common'
import { IRepository } from '@hatsuportal/common-bounded-context'
import Story from '../entities/Story'
import { PostId } from '../valueObjects/PostId'
import { PostCreatorId } from '../valueObjects/PostCreatorId'

export interface StorySearchCriteria {
  order: OrderEnum
  orderBy: StorySortableKeyEnum
  storiesPerPage?: number
  pageNumber?: number
  loggedInCreatorId?: PostCreatorId
  onlyMyStories?: boolean
  search?: string
  visibility?: VisibilityEnum[]
  hasImage?: boolean | null
}

export interface IStoryRepository extends IRepository {
  insert(story: Story): Promise<Story>
  update(story: Story): Promise<Story>
  count(query: StorySearchCriteria): Promise<number>
  search(query: StorySearchCriteria): Promise<Story[]>
  findAllPublic(orderBy: StorySortableKeyEnum, order: OrderEnum): Promise<Story[]>
  findById(id: PostId): Promise<Story | null>
  findByImageId(imageId: PostId): Promise<Story[]>
  findAllVisibleForLoggedInCreator(creatorId: PostCreatorId, orderBy: StorySortableKeyEnum, order: OrderEnum): Promise<Story[]>
  findAllForCreator(creatorId: PostCreatorId): Promise<Story[]>
  findLatest(limit: number, loggedIn: boolean): Promise<Story[]>
  findStoriesOfCreatorByName(storyName: string, creatorId: PostCreatorId): Promise<Story[]>
  countAll(): Promise<number>
  countStoriesByCreator(creatorId: PostCreatorId): Promise<number>
  delete(storyId: PostId): Promise<void>
}

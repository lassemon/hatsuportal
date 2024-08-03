import { StorySortableKeyEnum, OrderEnum, VisibilityEnum } from '@hatsuportal/common'
import Story from '../entities/Story'
import { PostId } from '../valueObjects/PostId'
import { UserId } from '../valueObjects/UserId'

export interface StorySearchCriteria {
  order: OrderEnum
  orderBy: StorySortableKeyEnum
  storiesPerPage?: number
  pageNumber?: number
  loggedInUserId?: UserId
  onlyMyStories?: boolean
  search?: string
  visibility?: VisibilityEnum[]
  hasImage?: boolean | null
}

export interface IStoryRepository {
  insert(story: Story): Promise<Story>
  update(story: Story): Promise<Story>
  count(query: StorySearchCriteria): Promise<number>
  search(query: StorySearchCriteria): Promise<Story[]>
  findAllPublic(orderBy: StorySortableKeyEnum, order: OrderEnum): Promise<Story[]>
  findById(id: PostId): Promise<Story | null>
  findByImageId(imageId: PostId): Promise<Story[]>
  findAllVisibleForLoggedInUser(userId: UserId, orderBy: StorySortableKeyEnum, order: OrderEnum): Promise<Story[]>
  findAllForUser(userId: UserId): Promise<Story[]>
  findLatest(limit: number, loggedIn: boolean): Promise<Story[]>
  findUserStoriesByName(storyName: string, userId: UserId): Promise<Story[]>
  countAll(): Promise<number>
  countStoriesCreatedByUser(userId: UserId): Promise<number>
  delete(storyId: PostId): Promise<void>
}

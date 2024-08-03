import { SortableKeyEnum, OrderEnum } from '@hatsuportal/common'
import { PostId } from '../../domain/valueObjects/PostId'
import { PostCreatorId } from '../../domain/valueObjects/PostCreatorId'
import { StorySearchCriteriaDTO } from '../dtos'
import { StoryReadModelDTO } from '../dtos/post/story/StoryReadModelDTO'

export interface IStoryReadRepository {
  count(query: StorySearchCriteriaDTO): Promise<number>
  search(query: StorySearchCriteriaDTO): Promise<StoryReadModelDTO[]>
  findAll(orderBy: SortableKeyEnum, order: OrderEnum): Promise<StoryReadModelDTO[]>
  findAllPublic(orderBy: SortableKeyEnum, order: OrderEnum): Promise<StoryReadModelDTO[]>
  findById(id: PostId): Promise<StoryReadModelDTO | null>
  findByIds(ids: PostId[]): Promise<StoryReadModelDTO[]>
  findByImageId(imageId: PostId): Promise<StoryReadModelDTO[]>
  findAllReferencedCoverImageIds(): Promise<string[]>
  findAllVisibleForLoggedInCreator(creatorId: PostCreatorId, orderBy: SortableKeyEnum, order: OrderEnum): Promise<StoryReadModelDTO[]>
  findAllForCreator(creatorId: PostCreatorId): Promise<StoryReadModelDTO[]>
  findLatest(limit: number, loggedIn: boolean): Promise<StoryReadModelDTO[]>
  findStoriesOfCreatorByName(storyName: string, creatorId: PostCreatorId): Promise<StoryReadModelDTO[]>
  countStoriesByCreator(creatorId: PostCreatorId): Promise<number>
  invalidateById(storyId: PostId): void
}

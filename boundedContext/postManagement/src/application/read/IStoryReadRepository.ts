import { StorySortableKeyEnum, OrderEnum } from '@hatsuportal/common'
import { ITransactionAware } from '@hatsuportal/platform'
import { PostId } from '../../domain/valueObjects/PostId'
import { PostCreatorId } from '../../domain/valueObjects/PostCreatorId'
import { StorySearchCriteriaDTO } from '../dtos'
import { StoryReadModelDTO } from '../dtos/post/story/StoryReadModelDTO'

export interface IStoryReadRepository extends ITransactionAware {
  count(query: StorySearchCriteriaDTO): Promise<number>
  search(query: StorySearchCriteriaDTO): Promise<StoryReadModelDTO[]>
  findAllPublic(orderBy: StorySortableKeyEnum, order: OrderEnum): Promise<StoryReadModelDTO[]>
  findById(id: PostId): Promise<StoryReadModelDTO | null>
  findByImageId(imageId: PostId): Promise<StoryReadModelDTO[]>
  findAllVisibleForLoggedInCreator(creatorId: PostCreatorId, orderBy: StorySortableKeyEnum, order: OrderEnum): Promise<StoryReadModelDTO[]>
  findAllForCreator(creatorId: PostCreatorId): Promise<StoryReadModelDTO[]>
  findLatest(limit: number, loggedIn: boolean): Promise<StoryReadModelDTO[]>
  findStoriesOfCreatorByName(storyName: string, creatorId: PostCreatorId): Promise<StoryReadModelDTO[]>
  countStoriesByCreator(creatorId: PostCreatorId): Promise<number>
}

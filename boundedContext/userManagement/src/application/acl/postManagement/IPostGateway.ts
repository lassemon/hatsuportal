import { EntityLoadError, EntityLoadResult } from '@hatsuportal/platform'
import { StoryReadModelDTO } from '../../dtos/story/StoryReadModelDTO'

export interface IPostGateway {
  // EntityLoadError contains the creatorId that failed to load
  getStoriesByCreatorId(creatorId: string): Promise<EntityLoadResult<StoryReadModelDTO[], EntityLoadError>>
}

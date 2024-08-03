import { postV1 } from '@hatsuportal/bounded-context-service-contracts'
import { ApplicationError, EntityLoadError, EntityLoadResult } from '@hatsuportal/platform'
import { IPostGateway } from '../../../../application/acl/postManagement/IPostGateway'
import { IPostGatewayMapper } from '../../../../application/acl/postManagement/mappers/IPostGatewayMapper'
import { StoryReadModelDTO } from '../../../../application/dtos/story/StoryReadModelDTO'

export class PostGateway implements IPostGateway {
  constructor(
    private readonly postQueryFacade: postV1.IPostQueryFacade,
    private readonly postGatewayMapper: IPostGatewayMapper
  ) {}

  async getStoriesByCreatorId(creatorId: string): Promise<EntityLoadResult<StoryReadModelDTO[], EntityLoadError>> {
    try {
      const stories = await this.postQueryFacade.getStoriesByCreatorId(creatorId)
      return EntityLoadResult.success(stories.map((story) => this.postGatewayMapper.toStoryReadModelDTO(story)))
    } catch (error) {
      if (error instanceof Error) {
        return EntityLoadResult.failedToLoad(creatorId, error)
      } else {
        return EntityLoadResult.failedToLoad(creatorId, new ApplicationError({ message: 'Unknown error occurred', cause: error }))
      }
    }
  }
}

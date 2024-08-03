import { postV1 } from '@hatsuportal/bounded-context-service-contracts'
import { IPostGatewayMapper } from '../../../../application/acl/postManagement/mappers/IPostGatewayMapper'
import { StoryReadModelDTO } from '../../../../application/dtos/story/StoryReadModelDTO'

export class PostGatewayMapper implements IPostGatewayMapper {
  toStoryReadModelDTO(story: postV1.StoryContract): StoryReadModelDTO {
    return {
      id: story.id,
      visibility: story.visibility,
      title: story.title,
      body: story.body,
      coverImage: story.coverImage,
      tags: story.tags,
      createdByName: story.createdByName,
      createdById: story.createdById,
      createdAt: story.createdAt,
      updatedAt: story.updatedAt
    }
  }
}

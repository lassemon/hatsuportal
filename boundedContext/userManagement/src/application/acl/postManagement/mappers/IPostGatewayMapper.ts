import { postV1 } from '@hatsuportal/bounded-context-service-contracts'
import { StoryReadModelDTO } from '../../../dtos/story/StoryReadModelDTO'

export interface IPostGatewayMapper {
  toStoryReadModelDTO(story: postV1.StoryContract): StoryReadModelDTO
}

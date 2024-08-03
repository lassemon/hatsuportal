import { postV1 } from '@hatsuportal/bounded-context-service-contracts'
import { IStoryLookupService } from '../../services/story/StoryLookupService'
import { PostCreatorId } from '../../../domain'
import { IPostQueryMapper } from './mappers/PostQueryMapper'

export class PostQueryFacade implements postV1.IPostQueryFacade {
  constructor(
    private readonly storyLookupService: IStoryLookupService,
    private readonly postQueryMapper: IPostQueryMapper
  ) {}

  async getStoriesByCreatorId(creatorId: string): Promise<postV1.StoryContract[]> {
    const stories = await this.storyLookupService.findAllForCreator(new PostCreatorId(creatorId))
    return stories.map((story) => this.postQueryMapper.toStoryContract(story))
  }
}

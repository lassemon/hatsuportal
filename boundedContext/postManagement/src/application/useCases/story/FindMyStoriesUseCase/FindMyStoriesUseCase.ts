import { IUseCase, IUseCaseOptions } from '@hatsuportal/platform'
import { PostCreatorId } from '../../../../domain'
import { IStoryLookupService } from '../../../services/story/StoryLookupService'
import { StoryWithRelationsDTO } from '../../../dtos/post/story/StoryWithRelationsDTO'

export interface IFindMyStoriesUseCaseOptions extends IUseCaseOptions {
  loggedInUserId: string
  storiesFound(myStories: StoryWithRelationsDTO[]): void
}

export type IFindMyStoriesUseCase = IUseCase<IFindMyStoriesUseCaseOptions>

export class FindMyStoriesUseCase implements IFindMyStoriesUseCase {
  constructor(private readonly storyLookupService: IStoryLookupService) {}

  async execute({ loggedInUserId, storiesFound }: IFindMyStoriesUseCaseOptions): Promise<void> {
    storiesFound(await this.storyLookupService.findAllForCreator(new PostCreatorId(loggedInUserId)))
  }
}

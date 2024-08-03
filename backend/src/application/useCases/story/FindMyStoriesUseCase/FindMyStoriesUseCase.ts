import {
  IFindMyStoriesUseCase,
  IFindMyStoriesUseCaseOptions,
  IStoryApplicationMapper,
  IStoryRepository,
  PostCreatorId
} from '@hatsuportal/post-management'

export class FindMyStoriesUseCase implements IFindMyStoriesUseCase {
  constructor(private readonly storyRepository: IStoryRepository, private readonly storyApplicationMapper: IStoryApplicationMapper) {}

  async execute({ loggedInUserId, storiesFound }: IFindMyStoriesUseCaseOptions): Promise<void> {
    storiesFound(
      (await this.storyRepository.findAllForCreator(new PostCreatorId(loggedInUserId))).map((story) =>
        this.storyApplicationMapper.toDTO(story)
      )
    )
  }
}

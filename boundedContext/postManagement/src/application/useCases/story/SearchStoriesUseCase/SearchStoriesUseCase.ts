import { IUseCase, IUseCaseOptions } from '@hatsuportal/platform'
import { StorySearchCriteriaDTO, StoryWithRelationsDTO } from '../../../dtos'
import { IStoryListSearchService } from '../../../services/story/StoryListSearchService'

export interface ISearchStoriesUseCaseOptions extends IUseCaseOptions {
  loggedInUserId?: string
  searchCriteria: StorySearchCriteriaDTO
  foundStories(stories: StoryWithRelationsDTO[], totalCount: number): void
}

export type ISearchStoriesUseCase = IUseCase<ISearchStoriesUseCaseOptions>

export class SearchStoriesUseCase implements ISearchStoriesUseCase {
  constructor(private readonly storyListSearchService: IStoryListSearchService) {}

  async execute({ loggedInUserId, searchCriteria, foundStories }: ISearchStoriesUseCaseOptions) {
    const { stories, totalCount } = await this.storyListSearchService.search({ loggedInUserId, searchCriteria })
    foundStories(stories, totalCount)
  }
}

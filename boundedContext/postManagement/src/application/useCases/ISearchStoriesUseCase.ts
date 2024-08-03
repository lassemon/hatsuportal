import { IUseCase, IUseCaseOptions } from '@hatsuportal/common-bounded-context'
import { SearchStoriesInputDTO, StoryDTO } from '../dtos'

export interface ISearchStoriesUseCaseOptions extends IUseCaseOptions {
  searchStoriesInput: SearchStoriesInputDTO
  foundStories(stories: StoryDTO[], totalCount: number): void
}

export type ISearchStoriesUseCase = IUseCase<ISearchStoriesUseCaseOptions>

import { IUseCase, IUseCaseOptions } from './IUseCase'
import { StoryDTO } from '../dtos/StoryDTO'
import { SearchStoriesInputDTO } from '../dtos/SearchStoriesInputDTO'

export interface ISearchStoriesUseCaseOptions extends IUseCaseOptions {
  searchStoriesInput: SearchStoriesInputDTO
  foundStories: (Stories: StoryDTO[], totalCount: number) => void
}

export type ISearchStoriesUseCase = IUseCase<ISearchStoriesUseCaseOptions>

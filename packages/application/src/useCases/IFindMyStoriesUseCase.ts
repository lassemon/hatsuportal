import { IUseCase, IUseCaseOptions } from './IUseCase'
import { StoryDTO } from '../dtos/StoryDTO'

export interface IFindMyStoriesUseCaseOptions extends IUseCaseOptions {
  loggedInUserId: string
  storiesFound: (myStories: StoryDTO[]) => void
}

export type IFindMyStoriesUseCase = IUseCase<IFindMyStoriesUseCaseOptions>

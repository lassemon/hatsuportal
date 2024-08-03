import { IUseCase, IUseCaseOptions } from '@hatsuportal/common-bounded-context'
import { StoryDTO } from '../dtos/StoryDTO'

export interface IFindMyStoriesUseCaseOptions extends IUseCaseOptions {
  loggedInUserId: string
  storiesFound: (myStories: StoryDTO[]) => void
}

export type IFindMyStoriesUseCase = IUseCase<IFindMyStoriesUseCaseOptions>

import { IUseCase, IUseCaseOptions } from '@hatsuportal/common-bounded-context'
import { StoryDTO } from '../dtos/StoryDTO'
import { FindStoryInputDTO } from '../dtos/FindStoryInputDTO'

export interface IFindStoryUseCaseOptions extends IUseCaseOptions {
  findStoryInput: FindStoryInputDTO
  storyFound(story: StoryDTO): void
}

export type IFindStoryUseCase = IUseCase<IFindStoryUseCaseOptions>

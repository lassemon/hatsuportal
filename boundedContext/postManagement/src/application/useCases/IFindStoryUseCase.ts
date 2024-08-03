import { IUseCase, IUseCaseOptions } from '@hatsuportal/common-bounded-context'
import { FindStoryInputDTO, StoryDTO } from '../dtos'

export interface IFindStoryUseCaseOptions extends IUseCaseOptions {
  findStoryInput: FindStoryInputDTO
  storyFound(story: StoryDTO): void
}

export type IFindStoryUseCase = IUseCase<IFindStoryUseCaseOptions>

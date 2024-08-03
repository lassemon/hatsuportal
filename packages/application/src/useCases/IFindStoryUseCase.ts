import { IUseCase, IUseCaseOptions } from './IUseCase'
import { StoryDTO } from '../dtos/StoryDTO'
import { FindStoryInputDTO } from '../dtos/FindStoryInputDTO'

export interface IFindStoryUseCaseOptions extends IUseCaseOptions {
  findStoryInput: FindStoryInputDTO
  storyFound: (Story: StoryDTO) => void
}

export type IFindStoryUseCase = IUseCase<IFindStoryUseCaseOptions>

import { IUseCase, IUseCaseOptions } from './IUseCase'
import { StoryDTO } from '../dtos/StoryDTO'
import { UpdateStoryInputDTO } from '../dtos/UpdateStoryInputDTO'

export interface IUpdateStoryUseCaseOptions extends IUseCaseOptions {
  updateStoryInput: UpdateStoryInputDTO
  storyUpdated: (Story: StoryDTO) => void
}

export type IUpdateStoryUseCase = IUseCase<IUpdateStoryUseCaseOptions>

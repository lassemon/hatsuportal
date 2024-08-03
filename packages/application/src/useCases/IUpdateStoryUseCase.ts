import { IUseCase, IUseCaseOptions } from './IUseCase'
import { StoryDTO } from '../dtos/StoryDTO'
import { ImageDTO } from '../dtos/ImageDTO'
import { UpdateStoryInputDTO } from '../dtos/UpdateStoryInputDTO'

export interface IUpdateStoryUseCaseOptions extends IUseCaseOptions {
  updateStoryInput: UpdateStoryInputDTO
  storyUpdated: (Story: StoryDTO, StoryImage: ImageDTO | null) => void
}

export type IUpdateStoryUseCase = IUseCase<IUpdateStoryUseCaseOptions>

import { IUseCase, IUseCaseOptions } from './IUseCase'
import { StoryDTO } from '../dtos/StoryDTO'
import { RemoveImageFromStoryInputDTO } from '../dtos/RemoveImageFromStoryInputDTO'

export interface IRemoveImageFromStoryUseCaseOptions extends IUseCaseOptions {
  removeImageFromStoryInput: RemoveImageFromStoryInputDTO
  imageRemoved?: (StoryWithoutImage: StoryDTO) => void
}

export type IRemoveImageFromStoryUseCase = IUseCase<IRemoveImageFromStoryUseCaseOptions>

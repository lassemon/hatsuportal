import { IUseCase, IUseCaseOptions } from '@hatsuportal/common-bounded-context'
import { StoryDTO } from '../dtos/StoryDTO'
import { RemoveImageFromStoryInputDTO } from '../dtos/RemoveImageFromStoryInputDTO'

export interface IRemoveImageFromStoryUseCaseOptions extends IUseCaseOptions {
  removeImageFromStoryInput: RemoveImageFromStoryInputDTO
  imageRemoved?: (StoryWithoutImage: StoryDTO) => void
}

export type IRemoveImageFromStoryUseCase = IUseCase<IRemoveImageFromStoryUseCaseOptions>

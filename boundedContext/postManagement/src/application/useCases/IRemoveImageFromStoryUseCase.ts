import { IUseCase, IUseCaseOptions } from '@hatsuportal/common-bounded-context'
import { RemoveImageFromStoryInputDTO, StoryDTO } from '../dtos'

export interface IRemoveImageFromStoryUseCaseOptions extends IUseCaseOptions {
  removeImageFromStoryInput: RemoveImageFromStoryInputDTO
  imageRemoved(storyWithoutImage: StoryDTO): void
}

export type IRemoveImageFromStoryUseCase = IUseCase<IRemoveImageFromStoryUseCaseOptions>

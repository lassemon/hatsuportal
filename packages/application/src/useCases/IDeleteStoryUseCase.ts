import { IUseCase, IUseCaseOptions } from './IUseCase'
import { StoryDTO } from '../dtos/StoryDTO'
import { DeleteStoryInputDTO } from '../dtos/DeleteStoryInputDTO'

export interface IDeleteStoryUseCaseOptions extends IUseCaseOptions {
  deleteStoryInput: DeleteStoryInputDTO
  storyDeleted: (deletedStory: StoryDTO) => void
}

export type IDeleteStoryUseCase = IUseCase<IDeleteStoryUseCaseOptions>

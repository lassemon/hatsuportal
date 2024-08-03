import { IUseCase, IUseCaseOptions } from '@hatsuportal/common-bounded-context'
import { StoryDTO } from '../dtos/StoryDTO'
import { DeleteStoryInputDTO } from '../dtos/DeleteStoryInputDTO'

export interface IDeleteStoryUseCaseOptions extends IUseCaseOptions {
  deleteStoryInput: DeleteStoryInputDTO
  storyDeleted(deletedStory: StoryDTO): void
}

export type IDeleteStoryUseCase = IUseCase<IDeleteStoryUseCaseOptions>

import { ConcurrencyError, IUseCase, IUseCaseOptions } from '@hatsuportal/common-bounded-context'
import { DeleteStoryInputDTO, StoryDTO } from '../dtos'
import Story from '../../domain/entities/Story'

export interface IDeleteStoryUseCaseOptions extends IUseCaseOptions {
  deleteStoryInput: DeleteStoryInputDTO
  storyDeleted(deletedStory: StoryDTO): void
  deleteConflict(error: ConcurrencyError<Story>): void
}

export type IDeleteStoryUseCase = IUseCase<IDeleteStoryUseCaseOptions>

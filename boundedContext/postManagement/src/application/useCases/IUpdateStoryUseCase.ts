import { ConcurrencyError, IUseCase, IUseCaseOptions } from '@hatsuportal/common-bounded-context'
import { StoryDTO, UpdateStoryInputDTO } from '../dtos'
import Story from '../../domain/entities/Story'

export interface IUpdateStoryUseCaseOptions extends IUseCaseOptions {
  updateStoryInput: UpdateStoryInputDTO
  storyUpdated(story: StoryDTO): void
  updateConflict(error: ConcurrencyError<Story>): void
}

export type IUpdateStoryUseCase = IUseCase<IUpdateStoryUseCaseOptions>

import { ConcurrencyError, IUseCase, IUseCaseOptions } from '@hatsuportal/common-bounded-context'
import { StoryDTO } from '../dtos/StoryDTO'
import { UpdateStoryInputDTO } from '../dtos/UpdateStoryInputDTO'
import { Story } from '../..'

export interface IUpdateStoryUseCaseOptions extends IUseCaseOptions {
  updateStoryInput: UpdateStoryInputDTO
  storyUpdated(story: StoryDTO): void
  updateConflict(error: ConcurrencyError<Story>): void
}

export type IUpdateStoryUseCase = IUseCase<IUpdateStoryUseCaseOptions>

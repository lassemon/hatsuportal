import { IUseCase, IUseCaseOptions } from '@hatsuportal/common-bounded-context'
import { StoryDTO } from '../dtos/StoryDTO'
import { CreateStoryInputDTO } from '../dtos/CreateStoryInputDTO'

export interface ICreateStoryUseCaseOptions extends IUseCaseOptions {
  createStoryInput: CreateStoryInputDTO
  storyCreated(createdStory: StoryDTO): void
}

export type ICreateStoryUseCase = IUseCase<ICreateStoryUseCaseOptions>

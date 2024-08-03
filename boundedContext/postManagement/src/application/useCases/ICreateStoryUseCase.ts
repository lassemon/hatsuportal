import { IUseCase, IUseCaseOptions } from '@hatsuportal/common-bounded-context'
import { CreateStoryInputDTO, StoryDTO } from '../dtos'

export interface ICreateStoryUseCaseOptions extends IUseCaseOptions {
  createStoryInput: CreateStoryInputDTO
  storyCreated(createdStory: StoryDTO): void
}

export type ICreateStoryUseCase = IUseCase<ICreateStoryUseCaseOptions>

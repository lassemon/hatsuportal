import { IUseCase, IUseCaseOptions } from './IUseCase'
import { StoryDTO } from '../dtos/StoryDTO'
import { CreateStoryInputDTO } from '../dtos/CreateStoryInputDTO'

export interface ICreateStoryUseCaseOptions extends IUseCaseOptions {
  createStoryInput: CreateStoryInputDTO
  storyCreated: (createdStory: StoryDTO) => void
}

export type ICreateStoryUseCase = IUseCase<ICreateStoryUseCaseOptions>

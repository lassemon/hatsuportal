import { IUseCase, IUseCaseOptions } from './IUseCase'
import { StoryDTO } from '../dtos/StoryDTO'
import { ImageDTO } from '../dtos/ImageDTO'
import { CreateStoryInputDTO } from '../dtos/CreateStoryInputDTO'

export interface ICreateStoryUseCaseOptions extends IUseCaseOptions {
  createStoryInput: CreateStoryInputDTO
  storyCreated: (createdStory: StoryDTO, storyImage: ImageDTO | null) => void
}

export type ICreateStoryUseCase = IUseCase<ICreateStoryUseCaseOptions>

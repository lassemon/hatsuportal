import { ICreateStoryUseCase } from '../useCases/ICreateStoryUseCase'
import { IDeleteStoryUseCase } from '../useCases/IDeleteStoryUseCase'
import { IFindStoryUseCase } from '../useCases/IFindStoryUseCase'
import { IFindMyStoriesUseCase } from '../useCases/IFindMyStoriesUseCase'
import { IRemoveImageFromStoryUseCase } from '../useCases/IRemoveImageFromStoryUseCase'
import { ISearchStoriesUseCase } from '../useCases/ISearchStoriesUseCase'
import { IUpdateStoryUseCase } from '../useCases/IUpdateStoryUseCase'

export interface IUseCaseFactory {
  createCreateStoryUseCase(): ICreateStoryUseCase
  createDeleteStoryUseCase(): IDeleteStoryUseCase
  createFindStoryUseCase(): IFindStoryUseCase
  createFindMyStoriesUseCase(): IFindMyStoriesUseCase
  createSearchStoriesUseCase(): ISearchStoriesUseCase
  createUpdateStoryUseCase(): IUpdateStoryUseCase
  createRemoveImageFromStoryUseCase(): IRemoveImageFromStoryUseCase
}

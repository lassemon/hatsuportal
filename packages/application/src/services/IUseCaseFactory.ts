import { ICreateImageUseCase } from '../useCases/ICreateImageUseCase'
import { ICreateStoryUseCase } from '../useCases/ICreateStoryUseCase'
import { ICreateUserUseCase } from '../useCases/ICreateUserUseCase'
import { IDeactivateUserUseCase } from '../useCases/IDeactivateUserUseCase'
import { IDeleteStoryUseCase } from '../useCases/IDeleteStoryUseCase'
import { IFindImageUseCase } from '../useCases/IFindImageUseCase'
import { IFindStoryUseCase } from '../useCases/IFindStoryUseCase'
import { IFindMyStoriesUseCase } from '../useCases/IFindMyStoriesUseCase'
import { IFindUserUseCase } from '../useCases/IFindUserUseCase'
import { IGetAllUsersUseCase } from '../useCases/IGetAllUsersUseCase'
import { IGetUserProfileUseCase } from '../useCases/IGetUserProfileUseCase'
import { IRemoveImageFromStoryUseCase } from '../useCases/IRemoveImageFromStoryUseCase'
import { ISearchStoriesUseCase } from '../useCases/ISearchStoriesUseCase'
import { IUpdateImageUseCase } from '../useCases/IUpdateImageUseCase'
import { IUpdateStoryUseCase } from '../useCases/IUpdateStoryUseCase'
import { IUpdateUserUseCase } from '../useCases/IUpdateUserUseCase'
import { ILoginUserUseCase } from '../useCases/ILoginUserUseCase'
import { IRefreshTokenUseCase } from '../useCases/IRefreshTokenUseCase'

export interface IUseCaseFactory {
  // auth use cases
  createLoginUserUseCase(): ILoginUserUseCase
  createRefreshTokenUseCase(): IRefreshTokenUseCase

  // user use cases
  createCreateUserUseCase(): ICreateUserUseCase
  createDeactivateUserUseCase(): IDeactivateUserUseCase
  createUpdateUserUseCase(): IUpdateUserUseCase
  createFindUserUseCase(): IFindUserUseCase
  createGetAllUsersUseCase(): IGetAllUsersUseCase

  // Story use cases
  createCreateStoryUseCase(): ICreateStoryUseCase
  createDeleteStoryUseCase(): IDeleteStoryUseCase
  createFindStoryUseCase(): IFindStoryUseCase
  createFindMyStoriesUseCase(): IFindMyStoriesUseCase
  createSearchStoriesUseCase(): ISearchStoriesUseCase
  createUpdateStoryUseCase(): IUpdateStoryUseCase

  //image use cases
  createCreateImageUseCase(): ICreateImageUseCase
  createFindImageUseCase(): IFindImageUseCase
  createRemoveImageFromStoryUseCase(): IRemoveImageFromStoryUseCase
  createUpdateImageUseCase(): IUpdateImageUseCase

  // profile use cases
  createGetUserProfileUseCase(): IGetUserProfileUseCase
}

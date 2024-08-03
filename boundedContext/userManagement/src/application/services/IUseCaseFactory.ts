import { ICreateUserUseCase } from '../useCases/ICreateUserUseCase'
import { IDeactivateUserUseCase } from '../useCases/IDeactivateUserUseCase'
import { IFindUserUseCase } from '../useCases/IFindUserUseCase'
import { IGetAllUsersUseCase } from '../useCases/IGetAllUsersUseCase'
import { IGetUserProfileUseCase } from '../useCases/IGetUserProfileUseCase'
import { ILoginUserUseCase } from '../useCases/ILoginUserUseCase'
import { IRefreshTokenUseCase } from '../useCases/IRefreshTokenUseCase'
import { IUpdateUserUseCase } from '../useCases/IUpdateUserUseCase'

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

  // profile use cases
  createGetUserProfileUseCase(): IGetUserProfileUseCase
}

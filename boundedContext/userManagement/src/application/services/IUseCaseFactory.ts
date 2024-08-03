import { ICreateUserUseCase } from '../useCases/user/CreateUserUseCase'
import { IUpdateUserUseCase } from '../useCases/user/UpdateUserUseCase'
import { IDeactivateUserUseCase } from '../useCases/user/DeactivateUserUseCase'
import { IFindUserUseCase } from '../useCases/user/FindUserUseCase'
import { IGetAllUsersUseCase } from '../useCases/user/GetAllUsersUseCase'
import { IGetUserProfileUseCase } from '../useCases/profile/GetUserProfileUseCase'
import { IGetUserPreferencesUseCase } from '../useCases/preferences/GetUserPreferencesUseCase'
import { IUpdateUserProfileUseCase } from '../useCases/profile/UpdateUserProfileUseCase'
import { IUpdateUserPreferencesUseCase } from '../useCases/preferences/UpdateUserPreferencesUseCase'
import { ILoginUserUseCase } from '../useCases/auth/LoginUserUseCase'
import { IRefreshTokenUseCase } from '../useCases/auth/RefreshTokenUseCase'

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
  createGetUserPreferencesUseCase(): IGetUserPreferencesUseCase
  createUpdateUserProfileUseCase(): IUpdateUserProfileUseCase
  createUpdateUserPreferencesUseCase(): IUpdateUserPreferencesUseCase
}

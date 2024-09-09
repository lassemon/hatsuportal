import { ICreateImageUseCase } from '../useCases/ICreateImageUseCase'
import { ICreateItemUseCase } from '../useCases/ICreateItemUseCase'
import { ICreateUserUseCase } from '../useCases/ICreateUserUseCase'
import { IDeactivateUserUseCase } from '../useCases/IDeactivateUserUseCase'
import { IDeleteItemUseCase } from '../useCases/IDeleteItemUseCase'
import { IFindImageUseCase } from '../useCases/IFindImageUseCase'
import { IFindItemUseCase } from '../useCases/IFindItemUseCase'
import { IFindMyItemsUseCase } from '../useCases/IFindMyItemsUseCase'
import { IFindUserUseCase } from '../useCases/IFindUserUseCase'
import { IGetAllUsersUseCase } from '../useCases/IGetAllUsersUseCase'
import { IGetUserProfileUseCase } from '../useCases/IGetUserProfileUseCase'
import { IRemoveImageFromItemUseCase } from '../useCases/IRemoveImageFromItemUseCase'
import { ISearchItemsUseCase } from '../useCases/ISearchItemsUseCase'
import { IUpdateImageUseCase } from '../useCases/IUpdateImageUseCase'
import { IUpdateItemUseCase } from '../useCases/IUpdateItemUseCase'
import { IUpdateUserUseCase } from '../useCases/IUpdateUserUseCase'

export interface IUseCaseFactory {
  // user use cases
  createCreateUserUseCase(): ICreateUserUseCase
  createDeactivateUserUseCase(): IDeactivateUserUseCase
  createUpdateUserUseCase(): IUpdateUserUseCase
  createFindUserUseCase(): IFindUserUseCase
  createGetAllUsersUseCase(): IGetAllUsersUseCase

  // item use cases
  createCreateItemUseCase(): ICreateItemUseCase
  createDeleteItemUseCase(): IDeleteItemUseCase
  createFindItemUseCase(): IFindItemUseCase
  createFindMyItemsUseCase(): IFindMyItemsUseCase
  createSearchItemsUseCase(): ISearchItemsUseCase
  createUpdateItemUseCase(): IUpdateItemUseCase

  //image use cases
  createCreateImageUseCase(): ICreateImageUseCase
  createFindImageUseCase(): IFindImageUseCase
  createRemoveImageFromItemUseCase(): IRemoveImageFromItemUseCase
  createUpdateImageUseCase(): IUpdateImageUseCase

  // profile use cases
  createGetUserProfileUseCase(): IGetUserProfileUseCase
}

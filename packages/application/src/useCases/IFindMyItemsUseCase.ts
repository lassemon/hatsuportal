import { ItemDTO, User } from '@hatsuportal/domain'
import { IUseCase, IUseCaseOptions } from './IUseCase'

export interface IFindMyItemsUseCaseOptions extends IUseCaseOptions {
  user: User
}

export type IFindMyItemsUseCase = IUseCase<IFindMyItemsUseCaseOptions, ItemDTO[]>

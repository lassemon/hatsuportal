import { ItemDTO, User } from '@hatsuportal/domain'
import { IUseCase, IUseCaseOptions } from './IUseCase'

export interface IDeleteItemUseCaseOptions extends IUseCaseOptions {
  itemId: string
  user: User
}

export type IDeleteItemUseCase = IUseCase<IDeleteItemUseCaseOptions, ItemDTO>

import { ItemDTO, User } from '@hatsuportal/domain'
import { IUseCase, IUseCaseOptions } from './IUseCase'

export interface IFindItemUseCaseOptions extends IUseCaseOptions {
  user?: User
  itemId: string
}

export type IFindItemUseCase = IUseCase<IFindItemUseCaseOptions, ItemDTO>

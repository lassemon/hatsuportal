import { ItemDTO, User } from '@hatsuportal/domain'
import { IUseCase, IUseCaseOptions } from './IUseCase'

export interface IRemoveImageFromItemUseCaseOptions extends IUseCaseOptions {
  itemId: string
  user: User
}

export type IRemoveImageFromItemUseCase = IUseCase<IRemoveImageFromItemUseCaseOptions, ItemDTO>

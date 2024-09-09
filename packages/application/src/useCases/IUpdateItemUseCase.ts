import { ImageDTO, ItemDTO, User } from '@hatsuportal/domain'
import { UpdateItemRequestDTO } from '../api/requests/UpdateItemRequestDTO'
import { IUseCase, IUseCaseOptions } from './IUseCase'

interface UpdateItemUseCaseResponse {
  item: ItemDTO
  image: ImageDTO | null
}

export interface UpdateItemUseCaseOptions extends IUseCaseOptions {
  user: User
  updateItemRequest: UpdateItemRequestDTO
}

export type IUpdateItemUseCase = IUseCase<UpdateItemUseCaseOptions, UpdateItemUseCaseResponse>

import { ImageDTO, ItemDTO, User } from '@hatsuportal/domain'
import { IUseCase, IUseCaseOptions } from './IUseCase'
import { CreateItemRequestDTO } from '../api/requests/CreateItemRequestDTO'

interface CreateItemUseCaseResponse {
  item: ItemDTO
  image: ImageDTO | null
}

export interface ICreateItemUseCaseOptions extends IUseCaseOptions {
  user: User
  createItemRequest: CreateItemRequestDTO
}

export type ICreateItemUseCase = IUseCase<ICreateItemUseCaseOptions, CreateItemUseCaseResponse>

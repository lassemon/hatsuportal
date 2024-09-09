import { ItemDTO, User } from '@hatsuportal/domain'
import { IUseCase, IUseCaseOptions } from './IUseCase'
import { SearchItemsRequestDTO } from '../api/requests/SearchItemsRequestDTO'

interface SearchItemsUseCaseResponse {
  items: ItemDTO[]
  totalCount: number
}

export interface ISearchItemsUseCaseOptions extends IUseCaseOptions, SearchItemsRequestDTO {
  user?: User
}

export type ISearchItemsUseCase = IUseCase<ISearchItemsUseCaseOptions, SearchItemsUseCaseResponse>

import {
  CountItemsQueryDTO,
  InsertItemQueryDTO,
  SearchItemsQueryDTO,
  UpdateItemQueryDTO,
  UseCaseInterface,
  UseCaseOptionsInterface
} from '@hatsuportal/application'
import { ApiError, ItemDTO, ItemRepositoryInterface, User, Visibility } from '@hatsuportal/domain'

export interface FindItemUseCaseOptions extends UseCaseOptionsInterface {
  user?: User
  itemId: string
}

export type FindItemUseCaseInterface = UseCaseInterface<FindItemUseCaseOptions, ItemDTO>

export class FindItemUseCase implements FindItemUseCaseInterface {
  constructor(
    private readonly itemRepository: ItemRepositoryInterface<
      CountItemsQueryDTO,
      SearchItemsQueryDTO,
      InsertItemQueryDTO,
      UpdateItemQueryDTO
    >
  ) {}

  async execute({ user, itemId }: FindItemUseCaseOptions): Promise<ItemDTO> {
    const item = await this.itemRepository.findById(itemId)
    if (!item || (item.visibility === Visibility.LoggedIn && !user)) {
      throw new ApiError(404, 'NotFound')
    }
    return item.serialize()
  }
}

import {
  CountItemsQueryDTO,
  InsertItemQueryDTO,
  SearchItemsQueryDTO,
  UpdateItemQueryDTO,
  IFindItemUseCase,
  IFindItemUseCaseOptions
} from '@hatsuportal/application'
import { ApiError, ItemDTO, IItemRepository, Visibility } from '@hatsuportal/domain'

export class FindItemUseCase implements IFindItemUseCase {
  constructor(
    private readonly itemRepository: IItemRepository<CountItemsQueryDTO, SearchItemsQueryDTO, InsertItemQueryDTO, UpdateItemQueryDTO>
  ) {}

  async execute({ user, itemId }: IFindItemUseCaseOptions): Promise<ItemDTO> {
    const item = await this.itemRepository.findById(itemId)
    if (!item || (item.visibility === Visibility.LoggedIn && !user)) {
      throw new ApiError(404, 'NotFound')
    }
    return item.serialize()
  }
}

import {
  CountItemsQueryDTO,
  InsertItemQueryDTO,
  SearchItemsQueryDTO,
  UpdateItemQueryDTO,
  IDeleteItemUseCase,
  IDeleteItemUseCaseOptions,
  IRemoveImageFromItemUseCase
} from '@hatsuportal/application'
import { ApiError, ItemDTO, IItemRepository } from '@hatsuportal/domain'

export class DeleteItemUseCase implements IDeleteItemUseCase {
  constructor(
    private readonly itemRepository: IItemRepository<CountItemsQueryDTO, SearchItemsQueryDTO, InsertItemQueryDTO, UpdateItemQueryDTO>,
    private readonly removeImageFromItemUseCase: IRemoveImageFromItemUseCase
  ) {}

  async execute({ itemId, user }: IDeleteItemUseCaseOptions): Promise<ItemDTO> {
    const itemToDelete = await this.itemRepository.findById(itemId)
    if (!itemToDelete) {
      throw new ApiError(404, 'NotFound', `Could not delete item with id ${itemId} because the item does not exist.`)
    }
    if (itemToDelete.createdBy !== user.id) {
      throw new ApiError(401, 'Unauthorized', 'This item was not created by you.')
    }
    await this.removeImageFromItemUseCase.execute({ itemId, user })
    await this.itemRepository.delete(itemId)
    return itemToDelete.serialize()
  }
}

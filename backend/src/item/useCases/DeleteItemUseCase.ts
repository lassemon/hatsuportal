import {
  CountItemsQueryDTO,
  InsertItemQueryDTO,
  SearchItemsQueryDTO,
  UpdateItemQueryDTO,
  UseCaseInterface,
  UseCaseOptionsInterface
} from '@hatsuportal/application'
import { RemoveImageFromItemUseCaseInterface } from '../../image/useCases/RemoveImageFromItemUseCase'
import { ApiError, ItemDTO, ItemRepositoryInterface, User } from '@hatsuportal/domain'

export interface DeleteItemUseCaseOptions extends UseCaseOptionsInterface {
  itemId: string
  user: User
}

export type DeleteItemUseCaseInterface = UseCaseInterface<DeleteItemUseCaseOptions, ItemDTO>

export class DeleteItemUseCase implements DeleteItemUseCaseInterface {
  constructor(
    private readonly itemRepository: ItemRepositoryInterface<
      CountItemsQueryDTO,
      SearchItemsQueryDTO,
      InsertItemQueryDTO,
      UpdateItemQueryDTO
    >,
    private readonly removeImageFromItemUseCase: RemoveImageFromItemUseCaseInterface
  ) {}

  async execute({ itemId, user }: DeleteItemUseCaseOptions): Promise<ItemDTO> {
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

import {
  CountItemsQueryDTO,
  IImageStorageService,
  InsertImageMetadataQueryDTO,
  InsertItemQueryDTO,
  IItemMapper,
  SearchItemsQueryDTO,
  UpdateImageMetadataQueryDTO,
  UpdateItemQueryDTO,
  IRemoveImageFromItemUseCase,
  IRemoveImageFromItemUseCaseOptions
} from '@hatsuportal/application'
import { ApiError, IImageMetadataRepository, ItemDTO, IItemRepository } from '@hatsuportal/domain'
import { Logger } from '@hatsuportal/common'

const logger = new Logger('RemoveImageFromItemUseCase')

export class RemoveImageFromItemUseCase implements IRemoveImageFromItemUseCase {
  constructor(
    private readonly itemRepository: IItemRepository<CountItemsQueryDTO, SearchItemsQueryDTO, InsertItemQueryDTO, UpdateItemQueryDTO>,
    private readonly imageStorageService: IImageStorageService,
    private readonly imageMetadataRepository: IImageMetadataRepository<InsertImageMetadataQueryDTO, UpdateImageMetadataQueryDTO>,
    private readonly itemMapper: IItemMapper
  ) {}

  async execute({ itemId, user }: IRemoveImageFromItemUseCaseOptions): Promise<ItemDTO> {
    try {
      const existingItem = await this.itemRepository.findById(itemId)

      if (existingItem === null) {
        throw new ApiError(404, 'NotFound', `Failed to remove image from item with id ${itemId} because the item does not exist.`)
      }

      if (existingItem.createdBy !== user.id) {
        throw new ApiError(401, 'Unauthorized', `Cannot remove image from item that is not yours.`)
      }

      if (existingItem?.imageId) {
        const existingImage = await this.imageMetadataRepository.findById(existingItem.imageId)
        if (existingImage) {
          await this.imageStorageService.deleteImageFromFileSystem(existingImage.fileName)
          // Image can be deleted at this point because currently using 1to1 relatioship between
          // an image and an item. No image can belong to multiple items
          await this.imageMetadataRepository.delete(existingImage.id)
        }
      }
      const item = await this.itemRepository.update(this.itemMapper.toUpdateQuery({ ...existingItem.serialize(), imageId: null }))
      return item.serialize()
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 404) {
        logger.debug('Attempted to remove item or image that does not exist.', itemId)
      }
      throw error
    }
  }
}

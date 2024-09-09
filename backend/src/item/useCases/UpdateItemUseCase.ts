import {
  CountItemsQueryDTO,
  ImageResponseDTO,
  InsertItemQueryDTO,
  IItemMapper,
  SearchItemsQueryDTO,
  UpdateItemQueryDTO,
  IUpdateItemUseCase,
  UpdateItemUseCaseOptions,
  IRemoveImageFromItemUseCase,
  ICreateImageUseCase
} from '@hatsuportal/application'
import { ApiError, IItemRepository } from '@hatsuportal/domain'

import _ from 'lodash'

import { Logger } from '@hatsuportal/common'

const logger = new Logger('UpdateItemUseCase')

export class UpdateItemUseCase implements IUpdateItemUseCase {
  constructor(
    private readonly itemRepository: IItemRepository<CountItemsQueryDTO, SearchItemsQueryDTO, InsertItemQueryDTO, UpdateItemQueryDTO>,
    private readonly createImageUseCase: ICreateImageUseCase,
    private readonly removeImageFromItemUseCase: IRemoveImageFromItemUseCase,
    private readonly itemMapper: IItemMapper
  ) {}
  async execute({ user, updateItemRequest }: UpdateItemUseCaseOptions) {
    const { image } = updateItemRequest

    const existingItem = await this.itemRepository.findById(updateItemRequest.item.id)
    if (!existingItem) {
      throw new ApiError(404, 'NotFound', `Cannot update item with id ${updateItemRequest.item.id} because it does not exist.`)
    }

    // if item has existing images on the filesystem, remove them so that no 'ghost' files are
    // accidentally left on the filesystem
    try {
      await this.removeImageFromItemUseCase.execute({ itemId: existingItem.id, user })
    } catch (error: any) {
      logger.warn(`Something went wrong trying to remove image from item ${existingItem.id}`, error.stack ? error.stack : error)
      // fail silently
    }

    const item = this.itemMapper.updateRequestToItem(existingItem.serialize(), updateItemRequest)

    let savedImage: ImageResponseDTO | null = null
    if (image) {
      // always set image filename to item id here to avoid duplicating filename prefix
      image.fileName = item.id.toLowerCase()
      savedImage = await this.createImageUseCase.execute({
        createImageRequest: image,
        user
      })
      item.imageId = savedImage.id
    }

    const savedItem = await this.itemRepository.update(this.itemMapper.toUpdateQuery(item))

    return {
      item: savedItem.serialize(),
      image: savedImage
    }
  }
}

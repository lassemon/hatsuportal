import {
  CountItemsQueryDTO,
  ImageResponseDTO,
  InsertItemQueryDTO,
  ItemMapperInterface,
  SearchItemsQueryDTO,
  UpdateItemQueryDTO
} from '@hatsuportal/application'
import { UpdateItemRequestDTO, UseCaseInterface, UseCaseOptionsInterface } from '@hatsuportal/application'
import { ApiError, ImageDTO, ItemDTO, ItemRepositoryInterface, User } from '@hatsuportal/domain'
import { CreateImageUseCase } from '../../image/useCases/CreateImageUseCase'

import _ from 'lodash'
import { RemoveImageFromItemUseCaseInterface } from '../../image/useCases/RemoveImageFromItemUseCase'
import { Logger } from '@hatsuportal/common'

const logger = new Logger('UpdateItemUseCase')

interface UpdateItemUseCaseResponse {
  item: ItemDTO
  image: ImageDTO | null
}

export interface UpdateItemUseCaseOptions extends UseCaseOptionsInterface {
  user: User
  updateItemRequest: UpdateItemRequestDTO
}

export type UpdateItemUseCaseInterface = UseCaseInterface<UpdateItemUseCaseOptions, UpdateItemUseCaseResponse>

export class UpdateItemUseCase implements UpdateItemUseCaseInterface {
  constructor(
    private readonly itemRepository: ItemRepositoryInterface<
      CountItemsQueryDTO,
      SearchItemsQueryDTO,
      InsertItemQueryDTO,
      UpdateItemQueryDTO
    >,
    private readonly createImageUseCase: CreateImageUseCase,
    private readonly removeImageFromItemUseCase: RemoveImageFromItemUseCaseInterface,
    private readonly itemMapper: ItemMapperInterface
  ) {}
  async execute({ user, updateItemRequest }: UpdateItemUseCaseOptions): Promise<UpdateItemUseCaseResponse> {
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

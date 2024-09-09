import {
  CountItemsQueryDTO,
  ICreateImageUseCase,
  ICreateItemUseCase,
  ICreateItemUseCaseOptions,
  ImageResponseDTO,
  InsertItemQueryDTO,
  IRemoveImageFromItemUseCase,
  SearchItemsQueryDTO,
  UpdateItemQueryDTO
} from '@hatsuportal/application'
import { IItemRepository } from '@hatsuportal/domain'

import _ from 'lodash'
import { IItemMapper } from '@hatsuportal/application'

export class CreateItemUseCase implements ICreateItemUseCase {
  constructor(
    private readonly itemRepository: IItemRepository<CountItemsQueryDTO, SearchItemsQueryDTO, InsertItemQueryDTO, UpdateItemQueryDTO>,
    private readonly createImageUseCase: ICreateImageUseCase,
    private readonly removeImageFromItemUseCase: IRemoveImageFromItemUseCase,
    private readonly itemMapper: IItemMapper
  ) {}
  async execute({ user, createItemRequest }: ICreateItemUseCaseOptions) {
    const item = this.itemMapper.createRequestToItem(createItemRequest, user)
    // if item has existing images on the filesystem, remove them so that no 'ghost' files are
    // accidentally left on the filesystem
    try {
      await this.removeImageFromItemUseCase.execute({ itemId: item.id, user })
    } catch {
      // fail silently
    }

    const { image: createImageRequest } = createItemRequest

    let savedImage: ImageResponseDTO | null = null
    if (createImageRequest) {
      createImageRequest.fileName = item.id.toLowerCase()
      savedImage = await this.createImageUseCase.execute({ user, createImageRequest })
      item.imageId = savedImage.id
    }

    let savedItem = null
    savedItem = await this.itemRepository.insert(this.itemMapper.toInsertQuery(item.serialize()), user.id)

    return {
      item: savedItem.serialize(),
      image: savedImage
    }
  }
}

import { CountItemsQueryDTO, ImageResponseDTO, InsertItemQueryDTO, SearchItemsQueryDTO, UpdateItemQueryDTO } from '@hatsuportal/application'
import { ImageDTO, ItemDTO, ItemRepositoryInterface, User } from '@hatsuportal/domain'
import { CreateImageUseCase } from '../../image/useCases/CreateImageUseCase'

import _ from 'lodash'
import { CreateItemRequestDTO, ItemMapperInterface, UseCaseInterface, UseCaseOptionsInterface } from '@hatsuportal/application'
import { RemoveImageFromItemUseCaseInterface } from '../../image/useCases/RemoveImageFromItemUseCase'

interface CreateItemUseCaseResponse {
  item: ItemDTO
  image: ImageDTO | null
}

export interface CreateItemUseCaseOptions extends UseCaseOptionsInterface {
  user: User
  createItemRequest: CreateItemRequestDTO
}

export type CreateItemUseCaseInterface = UseCaseInterface<CreateItemUseCaseOptions, CreateItemUseCaseResponse>

export class CreateItemUseCase implements CreateItemUseCaseInterface {
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
  async execute({ user, createItemRequest }: CreateItemUseCaseOptions): Promise<CreateItemUseCaseResponse> {
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

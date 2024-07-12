import {
  CountItemsQueryDTO,
  InsertItemQueryDTO,
  SearchItemsQueryDTO,
  UpdateItemQueryDTO,
  UseCaseInterface,
  UseCaseOptionsInterface
} from '@hatsuportal/application'
import { ItemDTO, ItemRepositoryInterface, User } from '@hatsuportal/domain'

export interface FindMyItemsUseCaseOptions extends UseCaseOptionsInterface {
  user: User
}

export type FindMyItemsUseCaseInterface = UseCaseInterface<FindMyItemsUseCaseOptions, ItemDTO[]>

export class FindMyItemsUseCase implements FindMyItemsUseCaseInterface {
  constructor(
    private readonly itemRepository: ItemRepositoryInterface<
      CountItemsQueryDTO,
      SearchItemsQueryDTO,
      InsertItemQueryDTO,
      UpdateItemQueryDTO
    >
  ) {}

  async execute({ user }: FindMyItemsUseCaseOptions): Promise<ItemDTO[]> {
    return (await this.itemRepository.findAllForUser(user.id)).map((item) => item.serialize())
  }
}

import {
  CountItemsQueryDTO,
  InsertItemQueryDTO,
  SearchItemsQueryDTO,
  UpdateItemQueryDTO,
  IGetUserProfileUseCase,
  IGetUserProfileUseCaseOptions
} from '@hatsuportal/application'
import { IItemRepository } from '@hatsuportal/domain'

export class GetUserProfileUseCase implements IGetUserProfileUseCase {
  constructor(
    private readonly itemRepository: IItemRepository<CountItemsQueryDTO, SearchItemsQueryDTO, InsertItemQueryDTO, UpdateItemQueryDTO>
  ) {}

  async execute({ user }: IGetUserProfileUseCaseOptions) {
    const itemsCreated = await this.itemRepository.countItemsCreatedByUser(user.id)

    return {
      itemsCreated
    }
  }
}

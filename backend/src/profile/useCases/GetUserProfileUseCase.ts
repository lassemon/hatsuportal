import {
  CountItemsQueryDTO,
  InsertItemQueryDTO,
  ProfileResponseDTO,
  SearchItemsQueryDTO,
  UpdateItemQueryDTO,
  UseCaseInterface,
  UseCaseOptionsInterface
} from '@hatsuportal/application'
import { ItemRepositoryInterface, User } from '@hatsuportal/domain'

interface GetUserProfileUseCaseResponse extends ProfileResponseDTO {}

export interface GetUserProfileUseCaseOptions extends UseCaseOptionsInterface {
  user: User
}

export type GetUserProfileUseCaseInterface = UseCaseInterface<GetUserProfileUseCaseOptions, GetUserProfileUseCaseResponse>

export class GetUserProfileUseCase implements GetUserProfileUseCaseInterface {
  constructor(
    private readonly itemRepository: ItemRepositoryInterface<
      CountItemsQueryDTO,
      SearchItemsQueryDTO,
      InsertItemQueryDTO,
      UpdateItemQueryDTO
    >
  ) {}

  async execute({ user }: GetUserProfileUseCaseOptions): Promise<GetUserProfileUseCaseResponse> {
    const itemsCreated = await this.itemRepository.countItemsCreatedByUser(user.id)

    return {
      itemsCreated
    }
  }
}

import {
  CountItemsQueryDTO,
  InsertItemQueryDTO,
  SearchItemsQueryDTO,
  UpdateItemQueryDTO,
  IFindMyItemsUseCase,
  IFindMyItemsUseCaseOptions
} from '@hatsuportal/application'
import { ItemDTO, IItemRepository } from '@hatsuportal/domain'

export class FindMyItemsUseCase implements IFindMyItemsUseCase {
  constructor(
    private readonly itemRepository: IItemRepository<CountItemsQueryDTO, SearchItemsQueryDTO, InsertItemQueryDTO, UpdateItemQueryDTO>
  ) {}

  async execute({ user }: IFindMyItemsUseCaseOptions): Promise<ItemDTO[]> {
    return (await this.itemRepository.findAllForUser(user.id)).map((item) => item.serialize())
  }
}

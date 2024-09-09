import {
  CountItemsQueryDTO,
  ICreateImageUseCase,
  ICreateItemUseCase,
  ICreateUserUseCase,
  IDeactivateUserUseCase,
  IDeleteItemUseCase,
  IFindImageUseCase,
  IFindItemUseCase,
  IFindMyItemsUseCase,
  IFindUserUseCase,
  IGetAllUsersUseCase,
  IGetUserProfileUseCase,
  IImageMapper,
  IImageService,
  IImageStorageService,
  IItemMapper,
  InsertImageMetadataQueryDTO,
  InsertItemQueryDTO,
  InsertUserQueryDTO,
  IRemoveImageFromItemUseCase,
  ISearchItemsUseCase,
  IUpdateImageUseCase,
  IUpdateItemUseCase,
  IUpdateUserUseCase,
  IUseCaseFactory,
  IUserMapper,
  IUserService,
  SearchItemsQueryDTO,
  UpdateImageMetadataQueryDTO,
  UpdateItemQueryDTO,
  UpdateUserQueryDTO
} from '@hatsuportal/application'
import { IImageMetadataRepository, IItemRepository, IUserRepository } from '@hatsuportal/domain'
import { CreateUserUseCase } from '/user/useCases/CreateUserUseCase'
import { UpdateUserUseCase } from '/user/useCases/UpdateUserUseCase'
import { DeactivateUserUseCase } from '/user/useCases/DeadtivateUserUseCase'
import { FindUserUseCase } from '/user/useCases/FindUserUseCase'
import { GetAllUsersUseCase } from '/user/useCases/GetAllUsersUseCase'
import { CreateImageUseCase } from '/image/useCases/CreateImageUseCase'
import { UpdateImageUseCase } from '/image/useCases/UpdateImageUseCase'
import { RemoveImageFromItemUseCase } from '/image/useCases/RemoveImageFromItemUseCase'
import { FindImageUseCase } from '/image/useCases/FindImageUseCase'
import { CreateItemUseCase } from '/item/useCases/CreateItemUseCase'
import { UpdateItemUseCase } from '/item/useCases/UpdateItemUseCase'
import { DeleteItemUseCase } from '/item/useCases/DeleteItemUseCase'
import { SearchItemsUseCase } from '/item/useCases/SearchItemsUseCase'
import { FindItemUseCase } from '/item/useCases/FindItemUseCase'
import { FindMyItemsUseCase } from '/item/useCases/FindMyItemsUseCase'
import { GetUserProfileUseCase } from '/profile/useCases/GetUserProfileUseCase'

export class UseCaseFactory implements IUseCaseFactory {
  constructor(
    private readonly userRepository: IUserRepository<InsertUserQueryDTO, UpdateUserQueryDTO>,
    private readonly userMapper: IUserMapper,
    private readonly userService: IUserService,
    private readonly itemRepository: IItemRepository<CountItemsQueryDTO, SearchItemsQueryDTO, InsertItemQueryDTO, UpdateItemQueryDTO>,
    private readonly itemMapper: IItemMapper,
    private readonly imageMetadataRepository: IImageMetadataRepository<InsertImageMetadataQueryDTO, UpdateImageMetadataQueryDTO>,
    private readonly imageService: IImageService,
    private readonly imageStorageService: IImageStorageService,
    private readonly imageMapper: IImageMapper
  ) {}

  // user
  createCreateUserUseCase(): ICreateUserUseCase {
    return new CreateUserUseCase(this.userRepository, this.userMapper)
  }

  createUpdateUserUseCase(): IUpdateUserUseCase {
    return new UpdateUserUseCase(this.userRepository, this.userMapper, this.userService)
  }

  createDeactivateUserUseCase(): IDeactivateUserUseCase {
    return new DeactivateUserUseCase(this.userRepository)
  }

  createFindUserUseCase(): IFindUserUseCase {
    return new FindUserUseCase(this.userRepository)
  }

  createGetAllUsersUseCase(): IGetAllUsersUseCase {
    return new GetAllUsersUseCase(this.userRepository)
  }

  // item
  createCreateItemUseCase(): ICreateItemUseCase {
    return new CreateItemUseCase(
      this.itemRepository,
      this.createCreateImageUseCase(),
      this.createRemoveImageFromItemUseCase(),
      this.itemMapper
    )
  }

  createUpdateItemUseCase(): IUpdateItemUseCase {
    return new UpdateItemUseCase(
      this.itemRepository,
      this.createCreateImageUseCase(),
      this.createRemoveImageFromItemUseCase(),
      this.itemMapper
    )
  }

  createDeleteItemUseCase(): IDeleteItemUseCase {
    return new DeleteItemUseCase(this.itemRepository, this.createRemoveImageFromItemUseCase())
  }

  createSearchItemsUseCase(): ISearchItemsUseCase {
    return new SearchItemsUseCase(this.itemRepository)
  }

  createFindItemUseCase(): IFindItemUseCase {
    return new FindItemUseCase(this.itemRepository)
  }

  createFindMyItemsUseCase(): IFindMyItemsUseCase {
    return new FindMyItemsUseCase(this.itemRepository)
  }

  // image
  createCreateImageUseCase(): ICreateImageUseCase {
    return new CreateImageUseCase(this.imageService, this.imageMetadataRepository, this.imageMapper)
  }

  createUpdateImageUseCase(): IUpdateImageUseCase {
    return new UpdateImageUseCase(this.imageService, this.imageMetadataRepository, this.imageMapper)
  }

  createRemoveImageFromItemUseCase(): IRemoveImageFromItemUseCase {
    return new RemoveImageFromItemUseCase(this.itemRepository, this.imageStorageService, this.imageMetadataRepository, this.itemMapper)
  }

  createFindImageUseCase(): IFindImageUseCase {
    return new FindImageUseCase(this.imageMetadataRepository, this.imageService)
  }

  // profile
  createGetUserProfileUseCase(): IGetUserProfileUseCase {
    return new GetUserProfileUseCase(this.itemRepository)
  }
}

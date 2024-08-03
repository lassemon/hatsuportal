import { CreateUserRequest, FetchOptions, UpdateUserRequest } from '@hatsuportal/contracts'
import { IUserHttpClient, IUserService, IUserViewModelMapper } from 'application/interfaces'
import { UserViewModel } from 'ui/features/user/viewModels/UserViewModel'

export class UserService implements IUserService {
  constructor(private readonly userHttpClient: IUserHttpClient, private readonly userViewModelMapper: IUserViewModelMapper) {}

  public async findAll(options?: FetchOptions): Promise<UserViewModel[]> {
    const response = await this.userHttpClient.findAll(options)
    return response.map((user) => this.userViewModelMapper.toViewModel(user))
  }

  public async findCurrentUser(options?: FetchOptions): Promise<UserViewModel> {
    const response = await this.userHttpClient.findCurrentUser(options)
    return this.userViewModelMapper.toViewModel(response)
  }

  public async findById(userId: string, options?: FetchOptions): Promise<UserViewModel> {
    const response = await this.userHttpClient.findById(userId, options)
    return this.userViewModelMapper.toViewModel(response)
  }

  public async count(options?: FetchOptions): Promise<number> {
    return await this.userHttpClient.count(options)
  }

  public async create(user: CreateUserRequest, options?: FetchOptions): Promise<UserViewModel> {
    const response = await this.userHttpClient.create(user, options)
    return this.userViewModelMapper.toViewModel(response)
  }

  public async update(userId: string, user: UpdateUserRequest, options?: FetchOptions): Promise<UserViewModel> {
    const response = await this.userHttpClient.update(userId, user, options)
    return this.userViewModelMapper.toViewModel(response)
  }

  public async deactivate(userId: string, options?: FetchOptions): Promise<void> {
    return await this.userHttpClient.deactivate(userId, options)
  }
}

import { CreateUserRequest, FetchOptions, IUserPresentationMapper, UpdateUserRequest, UserPresentation } from '@hatsuportal/presentation'
import { IUserHttpClient, IUserService } from 'application'

export class UserService implements IUserService {
  constructor(private readonly userHttpClient: IUserHttpClient, private readonly userPresentationMapper: IUserPresentationMapper) {}

  public async findAll(options?: FetchOptions): Promise<UserPresentation[]> {
    const response = await this.userHttpClient.findAll(options)
    return response.map((user) => this.userPresentationMapper.toUserPresentation(user))
  }

  public async findCurrentUser(options?: FetchOptions): Promise<UserPresentation> {
    const response = await this.userHttpClient.findCurrentUser(options)
    return this.userPresentationMapper.toUserPresentation(response)
  }

  public async findById(userId: string, options?: FetchOptions): Promise<UserPresentation> {
    const response = await this.userHttpClient.findById(userId, options)
    return this.userPresentationMapper.toUserPresentation(response)
  }

  public async count(options?: FetchOptions): Promise<number> {
    return await this.userHttpClient.count(options)
  }

  public async create(user: CreateUserRequest, options?: FetchOptions): Promise<UserPresentation> {
    const response = await this.userHttpClient.create(user, options)
    return this.userPresentationMapper.toUserPresentation(response)
  }

  public async update(user: UpdateUserRequest, options?: FetchOptions): Promise<UserPresentation> {
    const response = await this.userHttpClient.update(user, options)
    return this.userPresentationMapper.toUserPresentation(response)
  }

  public async deactivate(userId: string, options?: FetchOptions): Promise<void> {
    return await this.userHttpClient.deactivate(userId, options)
  }
}

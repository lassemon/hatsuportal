import { CreateUserRequest, FetchOptions, HttpError, UpdateUserRequest, UserResponse } from '@hatsuportal/contracts'
import { IHttpClient, IUserHttpClient } from 'application/interfaces'

export class UserHttpClient implements IUserHttpClient {
  private readonly baseUrl = '/users'
  constructor(private readonly httpClient: IHttpClient) {}

  async findAll(options?: FetchOptions): Promise<UserResponse[]> {
    throw new HttpError(501, 'NotImplemented')
  }

  async findCurrentUser(options?: FetchOptions): Promise<UserResponse> {
    return await this.httpClient.getJson<UserResponse>({ endpoint: `${this.baseUrl}/me`, ...options })
  }

  async findById(userId: string, options?: FetchOptions): Promise<UserResponse> {
    return await this.httpClient.getJson<UserResponse>({ endpoint: `${this.baseUrl}/${userId ? userId : ''}`, ...options })
  }

  async count(options?: FetchOptions): Promise<number> {
    throw new HttpError(501, 'NotImplemented')
  }

  async create(user: CreateUserRequest, options?: FetchOptions): Promise<UserResponse> {
    return await this.httpClient.postJson<UserResponse, CreateUserRequest>({
      endpoint: `${this.baseUrl}`,
      payload: user,
      ...options
    })
  }

  async update(userId: string, user: UpdateUserRequest, options?: FetchOptions): Promise<UserResponse> {
    return await this.httpClient.patchJson<UserResponse, UpdateUserRequest>({
      endpoint: `${this.baseUrl}/${userId}`,
      payload: user,
      ...options
    })
  }

  async deactivate(userId: string, options?: FetchOptions) {
    throw new HttpError(501, 'NotImplemented')
  }
}

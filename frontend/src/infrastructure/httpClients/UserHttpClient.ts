import { CreateUserRequest, FetchOptions, HttpError, UpdateUserRequest, UserPresentation, UserResponse } from '@hatsuportal/presentation'
import { IHttpClient, IUserHttpClient } from 'application'

export class UserHttpClient implements IUserHttpClient {
  constructor(private readonly httpClient: IHttpClient) {}

  async findAll(options?: FetchOptions): Promise<UserPresentation[]> {
    throw new HttpError(501, 'NotImplemented')
  }

  async findCurrentUser(options?: FetchOptions): Promise<UserResponse> {
    return await this.httpClient.getJson<UserResponse>({ ...{ endpoint: `/user/me` }, ...options })
  }

  async findById(userId: string, options?: FetchOptions): Promise<UserResponse> {
    return await this.httpClient.getJson<UserResponse>({ ...{ endpoint: `/user/${userId ? userId : ''}` }, ...options })
  }

  async count(options?: FetchOptions): Promise<number> {
    throw new HttpError(501, 'NotImplemented')
  }

  async create(user: CreateUserRequest, options?: FetchOptions): Promise<UserResponse> {
    return await this.httpClient.postJson<UserResponse, CreateUserRequest>({
      ...{ endpoint: '/user', payload: user },
      ...options
    })
  }

  async update(user: UpdateUserRequest, options?: FetchOptions): Promise<UserResponse> {
    return await this.httpClient.putJson<UserResponse, UpdateUserRequest>({
      ...{ endpoint: '/user', payload: user },
      ...options
    })
  }

  async deactivate(userId: string, options?: FetchOptions) {
    throw new HttpError(501, 'NotImplemented')
  }
}

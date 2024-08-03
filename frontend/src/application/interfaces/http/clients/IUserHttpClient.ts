import { CreateUserRequest, UpdateUserRequest, UserResponse, FetchOptions } from '@hatsuportal/contracts'

export interface IUserHttpClient {
  findAll(options?: FetchOptions): Promise<UserResponse[]>
  findCurrentUser(options?: FetchOptions): Promise<UserResponse>
  findById(userId: string, options?: FetchOptions): Promise<UserResponse>
  count(options?: FetchOptions): Promise<number>
  create(user: CreateUserRequest, options?: FetchOptions): Promise<UserResponse>
  update(userId: string, user: UpdateUserRequest, options?: FetchOptions): Promise<UserResponse>
  deactivate(userId: string, options?: FetchOptions): Promise<void>
}

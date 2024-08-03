import { CreateUserRequest, FetchOptions, UpdateUserRequest, UserPresentation } from '@hatsuportal/presentation'

export interface IUserService {
  findAll(options?: FetchOptions): Promise<UserPresentation[]>
  findCurrentUser(options?: FetchOptions): Promise<UserPresentation>
  findById(userId: string, options?: FetchOptions): Promise<UserPresentation>
  count(options?: FetchOptions): Promise<number>
  create(user: CreateUserRequest, options?: FetchOptions): Promise<UserPresentation>
  update(user: UpdateUserRequest, options?: FetchOptions): Promise<UserPresentation>
  deactivate(userId: string, options?: FetchOptions): Promise<void>
}

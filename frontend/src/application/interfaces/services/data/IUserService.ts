import { CreateUserRequest, UpdateUserRequest, FetchOptions } from '@hatsuportal/contracts'
import { UserViewModel } from 'ui/features/user/viewModels/UserViewModel'

export interface IUserService {
  findAll(options?: FetchOptions): Promise<UserViewModel[]>
  findCurrentUser(options?: FetchOptions): Promise<UserViewModel>
  findById(userId: string, options?: FetchOptions): Promise<UserViewModel>
  count(options?: FetchOptions): Promise<number>
  create(user: CreateUserRequest, options?: FetchOptions): Promise<UserViewModel>
  update(userId: string, user: UpdateUserRequest, options?: FetchOptions): Promise<UserViewModel>
  deactivate(userId: string, options?: FetchOptions): Promise<void>
}

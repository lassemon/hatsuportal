import { FetchOptions, CreateUserRequestDTO, UserResponseDTO, UpdateUserRequestDTO } from '@hatsuportal/application'

export interface UserApiServiceInterface {
  findAll(options?: FetchOptions): Promise<UserResponseDTO[]>
  findById(userId: string, options?: FetchOptions): Promise<UserResponseDTO>
  count(options?: FetchOptions): Promise<number>
  create(user: CreateUserRequestDTO, options?: FetchOptions): Promise<UserResponseDTO>
  update(user: UpdateUserRequestDTO, options?: FetchOptions): Promise<UserResponseDTO>
  deactivate(userId: string, options?: FetchOptions): Promise<void>
}

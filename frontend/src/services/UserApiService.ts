import { FetchOptions, CreateUserRequestDTO, UserResponseDTO, UpdateUserRequestDTO } from '@hatsuportal/application'
import { ApiError } from '@hatsuportal/domain'
import { getJson, postJson, putJson } from 'infrastructure/dataAccess/http/fetch'
import { UserApiServiceInterface } from '../infrastructure/repositories/UserApiServiceInterface'

class UserApiService implements UserApiServiceInterface {
  async findAll(options?: FetchOptions): Promise<UserResponseDTO[]> {
    throw new ApiError(501, 'NotImplemented')
  }

  async findById(userId: string, options?: FetchOptions): Promise<UserResponseDTO> {
    return await getJson<UserResponseDTO>({ ...{ endpoint: `/user/${userId ? userId : ''}` }, ...options })
  }

  async count(options?: FetchOptions): Promise<number> {
    throw new ApiError(501, 'NotImplemented')
  }

  async create(user: CreateUserRequestDTO, options?: FetchOptions): Promise<UserResponseDTO> {
    return await postJson<UserResponseDTO>({ ...{ endpoint: '/user', payload: user }, ...options })
  }

  async update(user: UpdateUserRequestDTO, options?: FetchOptions): Promise<UserResponseDTO> {
    return await putJson<UserResponseDTO>({ ...{ endpoint: '/user', payload: user }, ...options })
  }

  async deactivate(userId: string, options?: FetchOptions) {
    throw new ApiError(501, 'NotImplemented')
  }
}

export default UserApiService

import { UserLoadError } from './errors/UserLoadError'
import { UserReadModelDTO } from '../../dtos/UserReadModelDTO'
import { UserLoadResult } from './outcomes/UserLoadResult'

export interface IUserGateway {
  getUserById(params: { userId: string }): Promise<UserLoadResult<UserReadModelDTO, UserLoadError>>
}

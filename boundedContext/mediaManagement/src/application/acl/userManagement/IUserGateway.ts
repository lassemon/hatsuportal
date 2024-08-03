import { EntityLoadResult } from '@hatsuportal/platform'
import { UserLoadError } from './errors/UserLoadError'
import { UserReadModelDTO } from '../../dtos/UserReadModelDTO'

export interface IUserGateway {
  getUserById(params: { userId: string }): Promise<EntityLoadResult<UserReadModelDTO, UserLoadError>>
}

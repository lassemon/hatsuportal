import { DomainError, EntityFactoryResult } from '@hatsuportal/common-bounded-context'
import { User, UserProps } from '../../domain/entities/User'

export interface IUserFactory {
  createUser(props: UserProps): EntityFactoryResult<User, DomainError>
}

import { DomainError, EntityFactoryResult } from '@hatsuportal/common-bounded-context'
import { IUserFactory, User, UserProps } from '@hatsuportal/user-management'

export class UserFactory implements IUserFactory {
  createUser(props: UserProps): EntityFactoryResult<User, DomainError> {
    try {
      const user = User.create(props)
      return EntityFactoryResult.ok(user)
    } catch (error) {
      if (error instanceof DomainError) {
        return EntityFactoryResult.fail(error)
      }

      return EntityFactoryResult.fail(
        new DomainError({
          message: 'Unknown error occurred while creating user',
          cause: error
        })
      )
    }
  }
}

import { DomainError, EntityFactoryResult } from '@hatsuportal/foundation'
import { User, UserProps } from '../../domain'

export interface IUserFactory {
  createUser(props: UserProps): EntityFactoryResult<User, DomainError>
}

/**
 * Factory responsible for creating new User domain entities.
 *
 * This factory follows the Domain-Driven Design (DDD) Factory pattern and is
 * specifically designed for the creation of new User instances only. It should
 * NOT be used for updating existing users.
 *
 * For updating existing users, use the following pattern:
 * 1. Load the existing user using User.reconstruct() or repository methods
 * 2. Call the user's update() method to modify its state
 * 3. Persist the changes through the repository
 *
 * @example
 * ```typescript
 * // ✅ Correct: Creating a new user
 * const result = userFactory.createUser({
 *   id: 'user-123',
 *   name: 'John Doe',
 *   email: 'john@example.com',
 *   active: true,
 *   roles: [UserRoleEnum.Viewer],
 *   createdAt: unixtimeNow(),
 *   updatedAt: null
 * })
 *
 * // ❌ Incorrect: Don't use factory for updates
 * // Instead, use User.reconstruct() and user.update()
 * ```
 *
 * @implements {IUserFactory}
 */
export class UserFactory implements IUserFactory {
  /**
   * Creates a new User domain entity with the provided properties.
   *
   * This method is specifically for creating NEW users only. It encapsulates
   * the creation logic and provides proper error handling for domain validation
   * failures. The created user will have a UserCreatedEvent domain event.
   *
   * For updating existing users, use:
   * - User.reconstruct() to load existing user
   * - User.update() to modify the user's state
   *
   * @param props - The properties required to create a new user
   * @returns {EntityFactoryResult<User, DomainError>} A result containing either:
   *   - Success: The newly created User entity with UserCreatedEvent
   *   - Failure: A DomainError describing what went wrong during creation
   *
   * @throws {DomainError} When user properties are invalid or creation fails
   *
   * @example
   * ```typescript
   * const result = userFactory.createUser({
   *   id: uuid(),
   *   name: 'Jane Smith',
   *   email: 'jane@example.com',
   *   active: true,
   *   roles: [UserRoleEnum.Admin],
   *   createdAt: unixtimeNow(),
   *   updatedAt: null
   * })
   *
   * if (result.isSuccess()) {
   *   const newUser = result.value
   *   // newUser has UserCreatedEvent in its domain events
   * } else {
   *   console.error('Failed to create user:', result.error.message)
   * }
   * ```
   */
  createUser(props: UserProps): EntityFactoryResult<User, DomainError> {
    try {
      User.canCreate(props, { throwError: true })
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

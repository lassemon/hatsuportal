import { AuthenticationError, NotFoundError, UseCaseWithValidation } from '@hatsuportal/common-bounded-context'
import { IUpdateUserUseCase, IUpdateUserUseCaseOptions, IUserRepository, Password, User, UserId } from '@hatsuportal/user-management'
import { Logger } from '@hatsuportal/common'
import { AuthorizationError } from '@hatsuportal/common-bounded-context/src'

const logger = new Logger('UpdateUserUseCaseWithValidation')

export class UpdateUserUseCaseWithValidation extends UseCaseWithValidation<IUpdateUserUseCaseOptions> implements IUpdateUserUseCase {
  constructor(private readonly useCase: IUpdateUserUseCase, private readonly userRepository: IUserRepository) {
    super(logger)
  }

  async execute(options: IUpdateUserUseCaseOptions): Promise<void> {
    this.logger.debug('Validating UpdateUserUseCase arguments')

    const loggedInUser = await this.userRepository.findById(new UserId(options.updateUserInput.loggedInUserId))
    if (!loggedInUser) throw new AuthenticationError('Not logged in.')

    const user = await this.userRepository.findById(new UserId(options.updateUserInput.updateData.id))
    if (!user) throw new NotFoundError('User to update not found.')

    const valid = this.validateAuthorization(loggedInUser) && this.validateDomainRules(options, user!)

    if (valid) await this.useCase.execute(options)
  }

  private validateAuthorization(loggedInUser: User): boolean {
    // TODO: remove isAdmin and use Policy Based Access Control instead
    if (!loggedInUser.isAdmin()) throw new AuthorizationError('Not authorized to update user.')

    return true
  }

  private validateDomainRules(options: IUpdateUserUseCaseOptions, user: User): boolean {
    return this.testArgument<'updateUserInput'>('updateUserInput', options, (updateUserInput) => {
      const {
        updateData: { name, email, roles, active, oldPassword, newPassword }
      } = updateUserInput

      const userIdToUpdateIsValid = this.testArgumentInstance(UserId, 'updateUserInput.updateData.id', options)
      const oldPasswordIsValid = oldPassword ? this.testArgumentInstance(Password, 'updateUserInput.updateData.oldPassword', options) : true
      const newPasswordIsValid = newPassword ? this.testArgumentInstance(Password, 'updateUserInput.updateData.newPassword', options) : true

      // update function throws error if input is invalid
      user.update({
        name,
        email,
        roles,
        active
      })

      return userIdToUpdateIsValid && oldPasswordIsValid && newPasswordIsValid
    })
  }
}

import { AuthenticationError, AuthorizationError, InvalidInputError, UseCaseWithValidation } from '@hatsuportal/platform'
import { UserRoleEnum, isEnumValue } from '@hatsuportal/common'
import { Logger } from '@hatsuportal/platform'
import { ICreateUserUseCase, ICreateUserUseCaseOptions } from './CreateUserUseCase'
import { Email, UserId, UserName } from '../../../../domain'
import { IUserAuthorizationService } from '../../../authorization/services/UserAuthorizationService'
import { IUserReadRepository } from '../../../read/IUserReadRepository'
import { UserReadModelDTO } from '../../../dtos'
import { IPasswordFactory } from '../../../../domain/authentication/IPasswordFactory'

const logger = new Logger('CreateUserUseCaseWithValidation')

export class CreateUserUseCaseWithValidation extends UseCaseWithValidation<ICreateUserUseCaseOptions> implements ICreateUserUseCase {
  constructor(
    private readonly useCase: ICreateUserUseCase,
    private readonly userReadRepository: IUserReadRepository,
    private readonly authorizationService: IUserAuthorizationService,
    private readonly passwordFactory: IPasswordFactory
  ) {
    super(logger)
  }

  async execute(options: ICreateUserUseCaseOptions): Promise<void> {
    this.logger.debug('Validating CreateUserUseCase arguments')

    const loggedInUser = await this.userReadRepository.findById(new UserId(options.createdById))
    if (!loggedInUser) throw new AuthenticationError('Not logged in.')

    const valid = this.validateAuthorization(loggedInUser, options.createUserInput.roles) && this.validateDomainRules(options)

    if (valid) await this.useCase.execute(options)
  }

  private validateAuthorization(loggedInUser: UserReadModelDTO, newUsersRoles: UserRoleEnum[]): boolean {
    const authorizationResult = this.authorizationService.canCreateUser(loggedInUser, newUsersRoles)
    if (!authorizationResult.allowed) throw new AuthorizationError(authorizationResult.reason)

    return true
  }

  private validateDomainRules(options: ICreateUserUseCaseOptions): boolean {
    this.testArgumentInstance(UserName, 'createUserInput.name', options)
    this.testArgumentInstance(Email, 'createUserInput.email', options)
    this.testArgument<'createUserInput'>('createUserInput', options, (createUserInput) => {
      const { password } = createUserInput
      this.passwordFactory.create(password)
      return true
    })
    this.testArgument<'createUserInput'>('createUserInput', options, (createUserInput) => {
      const { roles } = createUserInput
      if (roles && roles.length > 0) {
        roles.forEach((role) => {
          if (!isEnumValue(role, UserRoleEnum)) {
            throw new InvalidInputError(`Invalid role '${role}'.`)
          }
        })
      }

      return true
    })

    return true
  }
}

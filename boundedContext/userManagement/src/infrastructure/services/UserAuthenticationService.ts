import { Encryption, IUserAuthenticationService } from '../../application'

import { InvalidPasswordError, UserId, IUserRepository } from '../../domain'
import { IPasswordFactory } from '../../domain/authentication/IPasswordFactory'
import { AuthorizationError } from '@hatsuportal/platform'

export class UserAuthenticationService implements IUserAuthenticationService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordFactory: IPasswordFactory
  ) {}

  async validatePasswordChange(userId: string, newPassword: string, oldPassword?: string): Promise<void> {
    if (!oldPassword) {
      throw new AuthorizationError()
    }
    const userCredentials = await this.userRepository.getUserCredentialsByUserId(new UserId(userId))
    if (!userCredentials) {
      throw new AuthorizationError()
    }

    if (!(await Encryption.compare(oldPassword, userCredentials.passwordHash))) {
      throw new InvalidPasswordError()
    }

    this.passwordFactory.create(newPassword)
  }
}

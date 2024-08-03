import { Encryption, IUserAuthenticationService } from '../../application'

import { InvalidPasswordError, UserId, IUserWriteRepository } from '../../domain'
import { IPasswordFactory } from '../../domain/authentication/IPasswordFactory'
import { AuthenticationError } from '@hatsuportal/platform'

export class UserAuthenticationService implements IUserAuthenticationService {
  constructor(
    private readonly userWriteRepository: IUserWriteRepository,
    private readonly passwordFactory: IPasswordFactory
  ) {}

  async validatePasswordChange(userId: string, newPassword: string, oldPassword?: string): Promise<void> {
    if (!oldPassword) {
      throw new AuthenticationError('Old password is required for this operation.')
    }
    const userCredentials = await this.userWriteRepository.getUserCredentialsByUserId(new UserId(userId))
    if (!userCredentials) {
      throw new AuthenticationError('Invalid credentials.')
    }

    if (!(await Encryption.compare(oldPassword, userCredentials.passwordHash))) {
      throw new InvalidPasswordError()
    }

    this.passwordFactory.create(newPassword)
  }
}

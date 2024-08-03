import { Encryption, IUserService } from '../../application'

import { InvalidPasswordError, UserId, IUserRepository } from '../../domain'
import { ValidationError } from '../errors/ValidationError'
import { IPasswordFactory } from '../../domain/authentication/IPasswordFactory'

export class UserService implements IUserService {
  constructor(private readonly userRepository: IUserRepository, private readonly passwordFactory: IPasswordFactory) {}

  async validatePasswordChange(userId: string, newPassword: string, oldPassword?: string): Promise<void> {
    if (!oldPassword) {
      throw new ValidationError('Unauthorized')
    }
    const userCredentials = await this.userRepository.getUserCredentialsByUserId(new UserId(userId))
    if (!userCredentials) {
      throw new ValidationError('Unauthorized')
    }

    if (!(await Encryption.compare(oldPassword, userCredentials.passwordHash))) {
      throw new InvalidPasswordError('Unauthorized')
    }

    this.passwordFactory.create(newPassword)
  }
}

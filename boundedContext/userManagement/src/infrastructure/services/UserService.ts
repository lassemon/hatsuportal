import { Encryption, IUserService } from '../../application'

import { InvalidPasswordError, Password, UserId } from '../../domain'
import { IUserRepository } from '../../application'
import { ValidationError } from '../errors/ValidationError'

export class UserService implements IUserService {
  constructor(private readonly userRepository: IUserRepository) {}

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

    new Password(newPassword)
  }
}

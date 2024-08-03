import { Encryption, IUserRepository, IUserService } from '@hatsuportal/application'
import { Password, UserId } from '@hatsuportal/domain'
import { ValidationError } from '../errors/ValidationError'

export class UserService implements IUserService {
  constructor(private readonly userRepository: IUserRepository) {}

  async validatePasswordChange(userId: string, newPassword: string, oldPassword?: string): Promise<boolean> {
    if (!oldPassword) {
      throw new ValidationError('Unauthorized')
    }
    const userWithPassword = await this.userRepository.getUserCredentialsByUserId(new UserId(userId))
    if (!userWithPassword) {
      throw new ValidationError('Unauthorized')
    }

    if (!(await Encryption.compare(oldPassword, userWithPassword.passwordHash))) {
      throw new ValidationError('Unauthorized')
    }

    return Password.canCreate(newPassword)
  }
}

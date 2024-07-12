import { Encryption, InsertUserQueryDTO, UpdateUserQueryDTO, UserServiceInterface } from '@hatsuportal/application'
import { ApiError, UserRepositoryInterface } from '@hatsuportal/domain'

export class UserService implements UserServiceInterface {
  constructor(private readonly userRepository: UserRepositoryInterface<InsertUserQueryDTO, UpdateUserQueryDTO>) {}

  async validatePasswordChange(userId: string, newPassword: string, oldPassword?: string): Promise<boolean> {
    if (!oldPassword) {
      throw new ApiError(401, 'Unauthorized')
    }
    const userWithPassword = await this.userRepository.findWithPasswordById(userId)
    if (!userWithPassword) {
      throw new ApiError(401, 'Unauthorized')
    }

    if (!(await Encryption.compare(oldPassword, userWithPassword.password))) {
      throw new ApiError(401, 'Unauthorized')
    }

    return this.validateNewPassword(newPassword)
  }

  validateNewPassword(newPassword: string) {
    // TODO new password length and complexity rules?
    // duplicate these rules to frontend input validation when implementing
    return true
  }
}

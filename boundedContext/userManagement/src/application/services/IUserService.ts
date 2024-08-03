export interface IUserService {
  validatePasswordChange(userId: string, newPassword: string, oldPassword?: string): Promise<void>
}

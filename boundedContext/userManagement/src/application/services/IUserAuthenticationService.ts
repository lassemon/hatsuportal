export interface IUserAuthenticationService {
  validatePasswordChange(userId: string, newPassword: string, oldPassword?: string): Promise<void>
}

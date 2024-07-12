export interface UserServiceInterface {
  validatePasswordChange(userId: string, newPassword: string, oldPassword?: string): Promise<boolean>
}

import { UserContract /*UserCredentialsContract*/ } from './contracts'

export interface IUserQueryFacade {
  getUserById(params: { userId: string }): Promise<UserContract>
  //getUserByEmail(params: { email: string }): Promise<UserContract>
  //getUserByUsername(params: { username: string }): Promise<UserContract>
}

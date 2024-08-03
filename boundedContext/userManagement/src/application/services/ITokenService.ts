import { JwtPayload } from 'jsonwebtoken'
import { UserDTO } from '../dtos'

export interface ITokenService {
  createAuthToken(user: UserDTO): string
  createRefreshToken(user: UserDTO): string
  verifyRefreshToken(token: string): JwtPayload
}

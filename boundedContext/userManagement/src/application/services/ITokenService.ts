import { JwtPayload } from 'jsonwebtoken'
import { User } from '../../domain'

export interface ITokenService {
  createAuthToken(user: User): string
  createRefreshToken(user: User): string
  verifyRefreshToken(token: string): JwtPayload
}

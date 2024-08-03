import jwt from 'jsonwebtoken'
import { User, JwtPayload } from '@hatsuportal/user-management'
import { ApplicationError, AuthenticationError } from '@hatsuportal/platform'
import { dateStringFromUnixTime, Logger, unixtimeNow } from '@hatsuportal/common'

const logger = new Logger('TokenService')

export class TokenService {
  private identifier: string

  constructor() {
    this.identifier = process.env.IDENTIFIER || 'localhost'
  }

  public createAuthToken = (user: User): string => {
    if (!process.env.JWT_SECRET) {
      throw new ApplicationError('JWT_SECRET environment variable is not set')
    }

    const jwtTokenLife = parseInt(process.env.TOKEN_EXP || '15', 10)

    const jwtSecret = process.env.JWT_SECRET
    const expires = unixtimeNow({ add: { minutes: jwtTokenLife } })
    const authToken = jwt.sign(
      {
        exp: expires,
        userId: user.id.value
      },
      jwtSecret,
      {
        issuer: this.identifier,
        subject: this.identifier + '|' + user.id.value
      }
    )

    logger.debug(
      `CREATED AUTH TOKEN FOR ${user.name.value} THAT IS ISSUED AT ${dateStringFromUnixTime(
        this.decodeToken(authToken).iat
      )} AND EXPIRES IN ${dateStringFromUnixTime(this.decodeToken(authToken).exp)}`
    )

    return authToken
  }

  public createRefreshToken = (user: User): string => {
    if (!process.env.REFRESH_TOKEN_SECRET) {
      throw new ApplicationError('REFRESH_TOKEN_SECRET environment variable is not set')
    }

    const refreshTokenLife = parseInt(process.env.REFRESH_TOKEN_EXP || '720', 10)

    const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET
    const expires = unixtimeNow({ add: { minutes: refreshTokenLife } })
    const refreshToken = jwt.sign(
      {
        exp: expires,
        userId: user.id.value
      },
      refreshTokenSecret,
      {
        issuer: this.identifier,
        subject: this.identifier + '|' + user.id.value
      }
    )

    logger.debug(
      `CREATED REFRESH TOKEN FOR ${user.name.value} THAT IS ISSUED AT ${dateStringFromUnixTime(
        this.decodeToken(refreshToken).iat
      )} AND EXPIRES IN ${dateStringFromUnixTime(this.decodeToken(refreshToken).exp)}`
    )

    return refreshToken
  }

  public verifyRefreshToken = (token: string): JwtPayload => {
    if (!process.env.REFRESH_TOKEN_SECRET) {
      throw new ApplicationError('REFRESH_TOKEN_SECRET environment variable is not set')
    }

    try {
      return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET) as JwtPayload
    } catch (error) {
      if (error instanceof Error) {
        logger.error(error.stack || error.message)
      } else {
        logger.error(error)
      }
      throw new AuthenticationError('Invalid or expired token')
    }
  }

  private decodeToken = (token: string): JwtPayload => {
    return jwt.decode(token) as JwtPayload
  }
}

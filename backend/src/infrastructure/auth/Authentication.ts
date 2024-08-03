import { PassportStatic } from 'passport'
import { Strategy as JwtStrategy, ExtractJwt, VerifiedCallback, StrategyOptions } from 'passport-jwt'
import express from 'express'
import { UserId, JwtPayload, IUserReadRepository, IUserApplicationMapper, UserDTO } from '@hatsuportal/user-management'
import { AuthenticationError } from '@hatsuportal/platform'
import { Logger } from '@hatsuportal/platform'
import { IAuthentication } from './IAuthentication'
import { JwtSecretMissingError } from 'application/errors/JwtSecretMissingError'

const logger = new Logger('Authentication')

export class Authentication implements IAuthentication {
  private passport: PassportStatic
  private static instance: Authentication

  constructor(
    passport: PassportStatic,
    private readonly userRepository: IUserReadRepository,
    private readonly userMapper: IUserApplicationMapper
  ) {
    this.passport = passport
    this.init()
  }

  private init = () => {
    if (!Authentication.instance) {
      if (!process.env.JWT_SECRET) {
        throw new JwtSecretMissingError()
      }

      const options: StrategyOptions = {
        jwtFromRequest: ExtractJwt.fromExtractors([
          (request: express.Request) => {
            let token = null
            if (request && request.cookies) {
              token = request.cookies.token
            }
            return token
          }
        ]),
        secretOrKey: process.env.JWT_SECRET
      }

      this.passport.use(
        new JwtStrategy(options, async (jwtPayload: JwtPayload, done: VerifiedCallback) => {
          try {
            const user = await this.userRepository.findById(new UserId(jwtPayload.userId))

            if (!user) {
              return done(null, false)
            }

            const userDTO = this.userMapper.fromReadModel(user)

            return done(null, userDTO, { issuedAt: jwtPayload.iat })
          } catch (error) {
            return done(error, false)
          }
        })
      )

      Authentication.instance = this
    }
  }

  public authenticationMiddleware = () => {
    return (req: express.Request, res: express.Response, next: express.NextFunction) => {
      const passportAuthenticator = this.passport.authenticate(
        'jwt',
        { session: false },
        (err: any, user: UserDTO | false | null, info: object | string | Array<string | undefined>) => {
          if (err) {
            logger.error(err)
            return next(err)
          }
          if (!user) {
            logger.debug(info)
            const tokenExpired = (info as { name?: string }).name === 'TokenExpiredError'
            if (tokenExpired) {
              return next(new AuthenticationError('Unauthorized, Token expired.'))
            }
            return next(new AuthenticationError('Unauthorized, User not found.'))
          }
          if (user) {
            req.user = user
          }
          return next()
        }
      )
      passportAuthenticator(req, res, next)
    }
  }

  public passThroughAuthenticationMiddleware = () => {
    return (req: express.Request, res: express.Response, next: express.NextFunction) => {
      const passportAuthenticator = this.passport.authenticate(
        'jwt',
        { session: false },
        (err: any, user: UserDTO | false | null, info: object | string | Array<string | undefined>) => {
          if (err) {
            return next(err)
          }
          if (user) {
            req.user = user
          }
          // Proceed to the next middleware, user is allowed to be undefined if not authenticated
          return next()
        }
      )
      passportAuthenticator(req, res, next)
    }
  }

  public initialize() {
    return this.passport.initialize()
  }
}

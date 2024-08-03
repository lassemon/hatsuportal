import { isEmpty } from 'lodash'
import { PassportStatic } from 'passport'
import { Strategy as JwtStrategy, ExtractJwt, VerifiedCallback, StrategyOptions } from 'passport-jwt'
import express from 'express'
import { IUserRepository, User, UserId, JwtPayload } from '@hatsuportal/user-management'
import { HttpError } from '@hatsuportal/contracts'
import { AuthenticationError } from '@hatsuportal/platform'
import { Logger } from '@hatsuportal/common'

const logger = new Logger('Authentication')

export class Authentication {
  private passport: PassportStatic
  private static instance: Authentication

  constructor(passport: PassportStatic, private readonly userRepository: IUserRepository) {
    this.passport = passport
    this.init()
  }

  private init = () => {
    if (!Authentication.instance) {
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
        secretOrKey: process.env.JWT_SECRET || 'jwtSecret'
      }

      this.passport.use(
        new JwtStrategy(options, async (jwtPayload: JwtPayload, done: VerifiedCallback) => {
          try {
            const user = await this.userRepository.findById(new UserId(jwtPayload.userId))

            if (isEmpty(user)) {
              return done(user, false)
            }

            if (!user) {
              return done(null, false)
            } else {
              return done(null, user, { issuedAt: jwtPayload.iat })
            }
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
        (err: any, user: User | false | null, info: object | string | Array<string | undefined>) => {
          if (err) {
            logger.error(err)
            return res.status(500).json(new HttpError(500, 'InternalServerError'))
          }
          if (!user) {
            logger.debug(info)
            const tokenExpired = (info as any).name === 'TokenExpiredError'
            if (tokenExpired) {
              throw new AuthenticationError(`Unauthorized, Token expired.`)
            } else {
              throw new AuthenticationError(`Unauthorized, User not found.`)
            }
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
        (err: any, user: User | false | null, info: object | string | Array<string | undefined>) => {
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

import { isEmpty } from 'lodash'
import { PassportStatic } from 'passport'
import { Strategy as JwtStrategy, ExtractJwt, VerifiedCallback, StrategyOptions } from 'passport-jwt'
import express from 'express'
import { ApiError, User, UserRepositoryInterface } from '@hatsuportal/domain'
import { JwtPayload } from '@hatsuportal/application'
import { InsertUserQueryDTO, UpdateUserQueryDTO } from '@hatsuportal/application'
import UserRepository from '/user/UserRepository'

export default class Authentication {
  private passport: PassportStatic
  private static instance: Authentication
  private userRepository: UserRepositoryInterface<InsertUserQueryDTO, UpdateUserQueryDTO>

  constructor(passport: PassportStatic) {
    this.passport = passport
    this.userRepository = new UserRepository()
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
            const user = await this.userRepository.findById(jwtPayload.userId)

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

  public authenticationMiddleware = (...args: any[]) => {
    return (req: express.Request, res: express.Response, next: express.NextFunction) => {
      const passportAuthenticator = this.passport.authenticate(
        'jwt',
        { session: false },
        (err: any, user: User | false | null, info: object | string | Array<string | undefined>) => {
          if (err) {
            return res.status(500).json(err)
          }
          if (!user) {
            // Authentication failed
            throw new ApiError(401, 'Unauthorized')
          }
          if (user) {
            req.user = user
          }
          // Proceed to the next middleware, user might be undefined if not authenticated
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
          // Proceed to the next middleware, user might be undefined if not authenticated
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

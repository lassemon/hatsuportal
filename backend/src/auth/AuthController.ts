import express from 'express'
import { Body, Get, Middlewares, Post, Request, Response, Route, Tags } from 'tsoa'
import Authorization from './Authorization'
import { Logger } from '@hatsuportal/common'
import { DateTime } from 'luxon'
import Authentication from './Authentication'
import passport from 'passport'
import { ApiError, UserDTO } from '@hatsuportal/domain'
import { Encryption, LoginRequestDTO, UserResponseDTO } from '@hatsuportal/application'
import { UserMapper } from '@hatsuportal/infrastructure'
import { TsoaRequest } from '../common/entities/TsoaRequest'
import UserRepository from '/user/UserRepository'
import { RootController } from '/common/RootController'

const logger = new Logger('AuthController')
const refreshTokenList = {} as { [key: string]: UserDTO }
const authentication = new Authentication(passport)

const userRepository = new UserRepository()
const userMapper = new UserMapper()
const authorization = new Authorization()

async function loginMiddleware(request: TsoaRequest, response: express.Response, next: express.NextFunction) {
  const username: string = request.body.username
  const password: string = request.body.password

  try {
    const userWithPassword = await userRepository.findWithPasswordByName(username)

    if (!userWithPassword || !(await Encryption.compare(password, userWithPassword.password)) || !userWithPassword.active) {
      response.status(401).send({ statusTest: 'Unauthorized', message: 'Incorrect username or password' })
    } else {
      const user = userMapper.toUser(userWithPassword)
      const authToken = authorization.createAuthToken(user)
      const refreshToken = authorization.createRefreshToken(user)

      response.cookie('token', authToken, { httpOnly: true })
      response.cookie('refreshToken', refreshToken, { httpOnly: true })

      refreshTokenList[refreshToken] = user.serialize()

      response.json(userMapper.toResponse(user.serialize()))
    }
  } catch (error: any) {
    logger.error(`Error logging in user "${username}"`, error?.stack ? error.stack : error)
    response.status(401).send({ statusTest: 'Unauthorized', message: 'Incorrect username or password' })
  }
  next()
}

async function logoutMiddleware(request: TsoaRequest, response: express.Response, next: express.NextFunction) {
  response.clearCookie('token')
  response.clearCookie('refreshToken')
  next()
}

async function refreshMiddleware(request: TsoaRequest, response: express.Response, next: express.NextFunction) {
  if (request && request.cookies && request.cookies.refreshToken in refreshTokenList) {
    const refreshToken = authorization.decodeToken(request.cookies.refreshToken)

    if (!authorization.validateToken(refreshToken)) {
      logger.debug('REFRESH TOKEN EXPIRED ' + DateTime.fromSeconds(refreshToken.exp).toFormat('dd HH:mm:ss'))
      response.status(401).send({ statusTest: 'Unauthorized' })
    } else {
      const user = await userRepository.findById(refreshToken.userId)
      if (!user || !user.active) {
        throw new ApiError(404, 'NotFound')
      }
      const newAuthToken = authorization.createAuthToken(user)

      response.cookie('token', newAuthToken, { httpOnly: true })
    }
  } else {
    logger.debug('REFRESH TOKEN NOT IN LIST')
    response.status(401).send({ statusTest: 'Unauthorized' })
  }
  next()
}

@Route('/auth')
export class AuthController extends RootController {
  @Tags('Auth')
  @Middlewares(loginMiddleware)
  @Response(422, 'UnprocessableContent')
  @Response<UserResponseDTO>(200, 'Success')
  @Post('login')
  public async login(@Body() loginRequest: LoginRequestDTO): Promise<boolean> {
    if (!loginRequest.username) {
      throw new ApiError(422, 'Missing required post parameter "username"')
    }
    if (!loginRequest.password) {
      throw new ApiError(422, 'Missing required post parameter "password"')
    }
    return true
  }

  @Tags('Auth')
  @Middlewares(logoutMiddleware)
  @Response(200, 'Success')
  @Post('logout')
  public async logout(): Promise<boolean> {
    return true
  }

  @Tags('Auth')
  @Middlewares(refreshMiddleware)
  @Response(401, 'Unauthorized')
  @Response(200, 'Success')
  @Post('refresh')
  public async refresh(): Promise<boolean> {
    return true
  }

  @Tags('Auth')
  @Middlewares(authentication.authenticationMiddleware())
  @Get('status')
  public async status(@Request() request: TsoaRequest): Promise<UserResponseDTO> {
    logger.debug(`calling status to see if ${request?.user?.id} is authenticated. isAuthenticated: ${request?.isAuthenticated()}.`)
    this.validateAuthentication(request)

    return userMapper.toResponse(request.user.serialize())
  }
}

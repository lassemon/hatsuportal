import { Body, Get, Middlewares, Post, Request, Res, Response, Route, Tags, TsoaResponse } from 'tsoa'
import { UserApplicationMapper } from '@hatsuportal/user-management'
import { RootController } from './RootController'
import { container, injectable, singleton } from 'tsyringe'
import { IUserApiMapper, IAuthApiMapper } from '@hatsuportal/user-management'
import { ErrorResponse, LoginRequest, UserResponse } from '@hatsuportal/contracts'
import { UserDTO } from '@hatsuportal/user-management'
import { TsoaRequest } from '../TsoaRequest'
import { AuthenticationError } from '@hatsuportal/platform'
import { Logger } from '@hatsuportal/common'

const logger = new Logger('AuthController')

/**
 * Setting refresh token list to a variable here so that it stays alive as long as the server instance is up.
 * If we want to invalidate all refresh tokens, we simply need to reboot the server.
 * WORKS ONLY IN SINGLE SERVER INSTANCE ENVIRONMENT
 * Rethink this if the app needs to run in a load-balanced environment.
 */
const refreshTokenList = {} as { [key: string]: UserDTO }

/**
 * FIXME, TSOA does not allow union types in TsoaResponse first generics type, nor does it allow to import the ServerError from another file,
 * see https://github.com/lukeautry/tsoa/blob/c50fc6d4322b71f0746d6ff67000b6563593bbdb/docs/ExternalInterfacesExplanation.MD for possible details on import error.
 * Thus we need to redeclare this type at the top of each Controller.
 */
type ServerError = TsoaResponse<400 | 401 | 403 | 409 | 422 | 404 | 500 | 501, ErrorResponse>

/**
 * TODO:
 * Rate Limiting: Consider implementing a login attempt limiter from a single ip within a given timeframe.
 * Lockout Mechanism: Consider implementing a lockout mechanism and/or CAPTCHA for repeated login attempts.
 */
@injectable()
@singleton()
@Route('/auth')
export class AuthController extends RootController {
  protected readonly userApiMapper: IUserApiMapper
  protected readonly userApplicationMapper: UserApplicationMapper
  protected readonly authApiMapper: IAuthApiMapper

  constructor() {
    super()
    this.userApiMapper = container.resolve('IUserApiMapper')
    this.userApplicationMapper = container.resolve('IUserApplicationMapper')
    this.authApiMapper = container.resolve('IAuthApiMapper')
  }

  @Tags('Auth')
  @Response(422, 'UnprocessableContent')
  @Response<UserResponse>(200, 'Success')
  @Post('login')
  public async login(
    @Body() loginRequest: LoginRequest,
    @Res() loginResponse: TsoaResponse<200, UserResponse, { 'Set-Cookie': string[] }>,
    @Res() errorResponse: ServerError
  ) {
    try {
      const loginUserInput = this.authApiMapper.toLoginUserInputDTO(loginRequest)
      const loginUserUseCase = this.useCaseFactory.createLoginUserUseCase()
      await loginUserUseCase.execute({
        loginUserInput,
        loginSuccess: (authToken, refreshToken, user) => {
          refreshTokenList[refreshToken] = user
          loginResponse(200, this.userApiMapper.toResponse(user), {
            'Set-Cookie': [
              `token=${authToken}; HttpOnly; Secure; Path=/; SameSite=Strict`,
              `refreshToken=${refreshToken}; HttpOnly; Secure; Path=/; SameSite=Strict`
            ]
          })
        }
      })
    } catch (error) {
      const httpError = this.httpErrorMapper.mapApplicationErrorToHttpError(error)
      errorResponse(httpError.status, httpError)
    }
  }

  @Tags('Auth')
  @Response(200, 'Success')
  @Post('logout')
  public async logout(
    @Request() request: TsoaRequest,
    @Res() logoutResponse: TsoaResponse<200, {}, { 'Set-Cookie': string[] }>,
    @Res() errorResponse: ServerError
  ) {
    try {
      delete refreshTokenList[request.cookies.refreshToken]
      logoutResponse(
        200,
        {},
        {
          'Set-Cookie': [
            `token=deleted; expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/; `,
            `refreshToken=deleted; expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/; `
          ]
        }
      )
    } catch (error) {
      const httpError = this.httpErrorMapper.mapApplicationErrorToHttpError(error)
      errorResponse(httpError.status, httpError)
    }
  }

  @Tags('Auth')
  @Response(401, 'Unauthorized')
  @Response(200, 'Success')
  @Post('refresh')
  public async refresh(
    @Request() request: TsoaRequest,
    @Res() tokenRefreshResponse: TsoaResponse<200, { foo: string }, { 'Set-Cookie': string }>,
    @Res() errorResponse: ServerError
  ) {
    try {
      if (request && request.cookies && request.cookies.refreshToken in refreshTokenList) {
        const refreshTokenUseCase = this.useCaseFactory.createRefreshTokenUseCase()
        await refreshTokenUseCase.execute({
          refreshToken: request.cookies.refreshToken,
          tokenRefreshed: (newAuthToken) => {
            tokenRefreshResponse(200, { foo: 'test' }, { 'Set-Cookie': `token=${newAuthToken}; HttpOnly; Secure; Path=/; SameSite=Strict` })
          }
        })
      } else {
        logger.debug('REFRESH TOKEN NOT IN LIST')
        throw new AuthenticationError('Unauthorized')
      }
    } catch (error) {
      const httpError = this.httpErrorMapper.mapApplicationErrorToHttpError(error)
      errorResponse(httpError.status, httpError)
    }
  }

  @Tags('Auth')
  @Middlewares(RootController.authentication.authenticationMiddleware())
  @Get('status')
  public async status(
    @Request() request: TsoaRequest,
    @Res() statusResponse: TsoaResponse<200, UserResponse>,
    @Res() errorResponse: ServerError
  ) {
    try {
      logger.debug(`calling status to see if ${request?.user?.id} is authenticated. isAuthenticated: ${request?.isAuthenticated()}.`)
      /**
       * This endpoint is polled periodically from the frontend.
       * When the initial jwt token expires, the authenticationMiddleware will respond with an error, which triggers a call on the frontend
       * to the above refresh endpoint, which in turn will check the refreshToken and issue a new jwt auth token if refreshToken is still valid.
       * If the refresh call is successful, the frontend will retry the original call, it tried to make, with this new issued auth token.
       */
      this.validateAuthentication(request)
      statusResponse(200, this.userApiMapper.toResponse(this.userApplicationMapper.toDTO(request.user)))
    } catch (error) {
      const httpError = this.httpErrorMapper.mapApplicationErrorToHttpError(error)
      errorResponse(httpError.status, httpError)
    }
  }
}

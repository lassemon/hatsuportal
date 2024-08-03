import { Body, Get, Middlewares, Post, Request, Res, Response, Route, Tags, TsoaResponse } from 'tsoa'
import { Logger } from '@hatsuportal/common'
import Authentication from './Authentication'
import passport from 'passport'
import { AuthenticationError, UserApplicationMapper, UserDTO } from '@hatsuportal/application'
import { RootController } from '/common/RootController'
import {
  AuthPresentationMapper,
  ErrorPresentationMapper,
  ErrorResponse,
  LoginRequest,
  UserPresentationMapper,
  UserResponse
} from '@hatsuportal/presentation'
import { TsoaRequest } from '/common/TsoaRequest'

const logger = new Logger('AuthController')

// Setting refresh token list to a variable here so that it stays alive as long as the server instance is up.
// If we want to invalidate all refresh tokens, we simply need to reboot the server.
const refreshTokenList = {} as { [key: string]: UserDTO }

const authentication = new Authentication(passport)

const userPresentationMapper = new UserPresentationMapper()
const userApplicationMapper = new UserApplicationMapper()
const authPresentationMapper = new AuthPresentationMapper()

const errorPresentationMapper = new ErrorPresentationMapper()

/**
 * FIXME, TSOA does not allow union types in TsoaResponse first generics type, nor does it allow to import the ServerError from another file,
 * see https://github.com/lukeautry/tsoa/blob/c50fc6d4322b71f0746d6ff67000b6563593bbdb/docs/ExternalInterfacesExplanation.MD for possible details on import error.
 * Thus we need to redeclare this type at the top of each Controller.
 */
type ServerError = TsoaResponse<400 | 401 | 403 | 422 | 404 | 500 | 501, ErrorResponse>

@Route('/auth')
export class AuthController extends RootController {
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
      const loginUserInput = authPresentationMapper.toLoginUserInputDTO(loginRequest)
      const loginUserUseCase = this.useCaseFactory.createLoginUserUseCase()
      await loginUserUseCase.execute({
        loginUserInput,
        loginSuccess: (authToken, refreshToken, user) => {
          refreshTokenList[refreshToken] = user
          loginResponse(200, userPresentationMapper.toResponse(user), {
            'Set-Cookie': [`token=${authToken}; HttpOnly`, `refreshToken=${refreshToken}; HttpOnly`]
          })
        }
      })
    } catch (error) {
      const httpError = errorPresentationMapper.mapApplicationErrorToHttpError(error)
      errorResponse(httpError.status, httpError)
    }
  }

  @Tags('Auth')
  @Response(200, 'Success')
  @Post('logout')
  public async logout(@Res() logoutResponse: TsoaResponse<200, {}, { 'Set-Cookie': string[] }>, @Res() errorResponse: ServerError) {
    try {
      logoutResponse(
        200,
        {},
        {
          'Set-Cookie': [
            `token=deleted; expires=Thu, 01 Jan 1970 00:00:00 GMT`,
            `refreshToken=deleted; expires=Thu, 01 Jan 1970 00:00:00 GMT`
          ]
        }
      )
    } catch (error) {
      const httpError = errorPresentationMapper.mapApplicationErrorToHttpError(error)
      errorResponse(httpError.status, httpError)
    }
  }

  @Tags('Auth')
  //@Middlewares(refreshMiddleware)
  @Response(401, 'Unauthorized')
  @Response(200, 'Success')
  @Post('refresh')
  public async refresh(
    @Request() request: TsoaRequest,
    @Res() tokenRefreshResponse: TsoaResponse<200, {}, { 'Set-Cookie': string[] }>,
    @Res() errorResponse: ServerError
  ) {
    try {
      if (request && request.cookies && request.cookies.refreshToken in refreshTokenList) {
        const refreshTokenUseCase = this.useCaseFactory.createRefreshTokenUseCase()
        refreshTokenUseCase.execute({
          refreshToken: request.cookies.refreshToken,
          tokenRefreshed: (newAuthToken) => {
            tokenRefreshResponse(
              200,
              {},
              { 'Set-Cookie': [`token=${newAuthToken}; HttpOnly`, `refreshToken=${request.cookies.refreshToken}; HttpOnly`] }
            )
          }
        })
      } else {
        logger.debug('REFRESH TOKEN NOT IN LIST')
        throw new AuthenticationError('Unauthorized')
      }
    } catch (error) {
      const httpError = errorPresentationMapper.mapApplicationErrorToHttpError(error)
      errorResponse(httpError.status, httpError)
    }
  }

  @Tags('Auth')
  @Middlewares(authentication.authenticationMiddleware())
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
      statusResponse(200, userPresentationMapper.toResponse(userApplicationMapper.toDTO(request.user)))
    } catch (error) {
      const httpError = errorPresentationMapper.mapApplicationErrorToHttpError(error)
      errorResponse(httpError.status, httpError)
    }
  }
}

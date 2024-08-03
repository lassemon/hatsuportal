import { Get, Middlewares, Request, Response, Route, Security } from 'tsoa'
import Authentication from '../auth/Authentication'
import passport from 'passport'
import { RootController } from '/common/RootController'
import { ErrorPresentationMapper } from '@hatsuportal/presentation'
import { TsoaRequest } from '/common/TsoaRequest'
const authentication = new Authentication(passport)

const errorPresentationMapper = new ErrorPresentationMapper()

@Route('/')
export class PingController extends RootController {
  @Get()
  public async ping(): Promise<any> {
    try {
      return 'Hello World!'
    } catch (error) {
      throw errorPresentationMapper.mapApplicationErrorToHttpError(error)
    }
  }
}

@Route('/ping')
@Middlewares(authentication.passThroughAuthenticationMiddleware())
export class PingController1 extends RootController {
  @Get()
  public async ping(): Promise<any> {
    try {
      return {
        ping: 'pong'
      }
    } catch (error) {
      throw errorPresentationMapper.mapApplicationErrorToHttpError(error)
    }
  }
}

@Route('/secureping')
@Middlewares(authentication.authenticationMiddleware())
@Response(401, 'Unauthorized')
export class PingController2 extends RootController {
  @Get('')
  public async ping(@Request() request: TsoaRequest): Promise<any> {
    try {
      this.validateAuthentication(request)
      return {
        securePing: 'pong'
      }
    } catch (error) {
      throw errorPresentationMapper.mapApplicationErrorToHttpError(error)
    }
  }
}

@Route('/apikeyping')
export class PingController3 extends RootController {
  @Security('api_key')
  @Get('')
  public async ping(): Promise<any> {
    try {
      return {
        apiKeyPing: 'pong'
      }
    } catch (error) {
      throw errorPresentationMapper.mapApplicationErrorToHttpError(error)
    }
  }
}

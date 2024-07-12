import { Get, Middlewares, Request, Response, Route, Security } from 'tsoa'
import Authentication from '../auth/Authentication'
import passport from 'passport'
import { TsoaRequest } from '../common/entities/TsoaRequest'
import { RootController } from '/common/RootController'
const authentication = new Authentication(passport)

@Route('/')
export class PingController extends RootController {
  @Get()
  public async ping(): Promise<any> {
    return 'Hello World!'
  }
}

@Route('/ping')
@Middlewares(authentication.passThroughAuthenticationMiddleware())
export class PingController1 extends RootController {
  @Get()
  public async ping(): Promise<any> {
    return {
      ping: 'pong'
    }
  }
}

@Route('/secureping')
@Middlewares(authentication.authenticationMiddleware())
@Response(401, 'Unauthorized')
export class PingController2 extends RootController {
  @Get('')
  public async ping(@Request() request: TsoaRequest): Promise<any> {
    this.validateAuthentication(request)
    return {
      securePing: 'pong'
    }
  }
}

@Route('/apikeyping')
export class PingController3 extends RootController {
  @Security('api_key')
  @Get('')
  public async ping(): Promise<any> {
    return {
      apiKeyPing: 'pong'
    }
  }
}

import { Get, Middlewares, Query, Request, Response, Route, Security } from 'tsoa'
import { TsoaRequest } from '../TsoaRequest'
import { RootController } from './RootController'
import { container } from 'tsyringe'
import { Authentication } from '../auth/Authentication'

/**
 * TODO:
 * Rate Limiting: Consider implementing an attempt limiter from a single ip within a given timeframe.
 * Lockout Mechanism: Consider implementing a lockout mechanism and/or CAPTCHA for repeated attempts.
 */
@Route('/')
export class PingController extends RootController {
  constructor() {
    super()
  }

  @Get()
  public async ping(): Promise<any> {
    try {
      return 'Hello World!'
    } catch (error) {
      throw this.httpErrorMapper.mapApplicationErrorToHttpError(error)
    }
  }
}

@Route('/ping')
@Middlewares(container.resolve<Authentication>('Authentication').passThroughAuthenticationMiddleware())
export class PingController1 extends RootController {
  constructor() {
    super()
  }

  @Get()
  public async ping(): Promise<any> {
    try {
      return {
        ping: 'pong'
      }
    } catch (error) {
      throw this.httpErrorMapper.mapApplicationErrorToHttpError(error)
    }
  }
}

@Route('/secureping')
@Middlewares(container.resolve<Authentication>('Authentication').authenticationMiddleware())
@Response(401, 'Unauthorized')
export class PingController2 extends RootController {
  constructor() {
    super()
  }

  @Get('')
  public async ping(@Request() request: TsoaRequest): Promise<any> {
    try {
      this.validateAuthentication(request)
      return {
        securePing: 'pong'
      }
    } catch (error) {
      throw this.httpErrorMapper.mapApplicationErrorToHttpError(error)
    }
  }
}

@Route('/apikeyping')
export class PingController3 extends RootController {
  constructor() {
    super()
  }

  @Security('api_key')
  @Get('')
  public async ping(@Query() api_key: string): Promise<any> {
    // api_key is handled in AuthenticationProvider but needs to be
    // explicitly mentioned here for swagger.json to generate properly
    try {
      return {
        apiKeyPing: 'pong'
      }
    } catch (error) {
      throw this.httpErrorMapper.mapApplicationErrorToHttpError(error)
    }
  }
}

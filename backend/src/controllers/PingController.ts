import { Get, Middlewares, Query, Request, Response, Route, Security } from 'tsoa'
import { Authentication } from 'infrastructure'
import { RootController } from './RootController'
import { ErrorPresentationMapper, TsoaRequest } from '@hatsuportal/presentation-common'
import { container } from 'tsyringe'

@Route('/')
export class PingController extends RootController {
  protected readonly errorPresentationMapper: ErrorPresentationMapper

  constructor() {
    super()
    this.errorPresentationMapper = container.resolve('IErrorPresentationMapper')
  }

  @Get()
  public async ping(): Promise<any> {
    try {
      return 'Hello World!'
    } catch (error) {
      throw this.errorPresentationMapper.mapApplicationErrorToHttpError(error)
    }
  }
}

@Route('/ping')
@Middlewares(container.resolve<Authentication>('Authentication').passThroughAuthenticationMiddleware())
export class PingController1 extends RootController {
  protected readonly errorPresentationMapper: ErrorPresentationMapper

  constructor() {
    super()
    this.errorPresentationMapper = container.resolve('IErrorPresentationMapper')
  }

  @Get()
  public async ping(): Promise<any> {
    try {
      return {
        ping: 'pong'
      }
    } catch (error) {
      throw this.errorPresentationMapper.mapApplicationErrorToHttpError(error)
    }
  }
}

@Route('/secureping')
@Middlewares(container.resolve<Authentication>('Authentication').authenticationMiddleware())
@Response(401, 'Unauthorized')
export class PingController2 extends RootController {
  protected readonly errorPresentationMapper: ErrorPresentationMapper

  constructor() {
    super()
    this.errorPresentationMapper = container.resolve('IErrorPresentationMapper')
  }

  @Get('')
  public async ping(@Request() request: TsoaRequest): Promise<any> {
    try {
      this.validateAuthentication(request)
      return {
        securePing: 'pong'
      }
    } catch (error) {
      throw this.errorPresentationMapper.mapApplicationErrorToHttpError(error)
    }
  }
}

@Route('/apikeyping')
export class PingController3 extends RootController {
  protected readonly errorPresentationMapper: ErrorPresentationMapper

  constructor() {
    super()
    this.errorPresentationMapper = container.resolve('IErrorPresentationMapper')
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
      throw this.errorPresentationMapper.mapApplicationErrorToHttpError(error)
    }
  }
}

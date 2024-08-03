import { AuthenticationError } from '@hatsuportal/platform'
import { IUseCaseFactory } from '../services/UseCaseFactory'
import { User } from '@hatsuportal/user-management'

import { Controller } from 'tsoa'
import { Authentication } from '../auth/Authentication'
import { TsoaRequest } from '../TsoaRequest'
import { container } from 'tsyringe'
import { IHttpErrorMapper } from '@hatsuportal/platform'

export class RootController extends Controller {
  public static readonly authentication: Authentication = container.resolve('Authentication')
  protected readonly useCaseFactory: IUseCaseFactory
  protected readonly httpErrorMapper: IHttpErrorMapper

  constructor() {
    super()
    this.useCaseFactory = container.resolve('IUseCaseFactory')
    this.httpErrorMapper = container.resolve('IHttpErrorMapper')
  }

  validateAuthentication(request: TsoaRequest): asserts request is TsoaRequest & { user: User } {
    if (!request.user || !request?.isAuthenticated()) {
      throw new AuthenticationError('Must be logged in to do that.')
    }
  }
}

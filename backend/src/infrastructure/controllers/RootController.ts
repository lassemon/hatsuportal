import { AuthenticationError } from '@hatsuportal/platform'
import { IUseCaseFactory } from '../services/UseCaseFactory'
import { User } from '@hatsuportal/user-management'

import { Controller } from 'tsoa'
import { IAuthentication } from '../auth/IAuthentication'
import { TsoaRequest } from '../TsoaRequest'
import { container } from 'tsyringe'
import { IHttpErrorMapper } from '@hatsuportal/platform'

export class RootController extends Controller {
  public static readonly authentication: IAuthentication = container.resolve<IAuthentication>('IAuthentication')
  protected readonly useCaseFactory: IUseCaseFactory
  protected readonly httpErrorMapper: IHttpErrorMapper

  constructor() {
    super()
    // This is the Service Locator antipattern — dependencies are resolved from the container
    // at runtime instead of being injected through the constructor. We accept this tradeoff
    // because tsoa generates controller instantiation in routes.ts at build time, giving us
    // no control over constructor arguments. The alternative — overriding tsoa's route
    // template — would couple us to its internals and complicate future upgrades.
    this.useCaseFactory = container.resolve<IUseCaseFactory>('IUseCaseFactory')
    this.httpErrorMapper = container.resolve<IHttpErrorMapper>('IHttpErrorMapper')
  }

  validateAuthentication(request: TsoaRequest): asserts request is TsoaRequest & { user: User } {
    if (!request.user || !request?.isAuthenticated()) {
      throw new AuthenticationError('Must be logged in to do that.')
    }
  }
}

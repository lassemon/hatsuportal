import { ApiError, User } from '@hatsuportal/domain'
import { Controller } from 'tsoa'
import { TsoaRequest } from './entities/TsoaRequest'

export class RootController extends Controller {
  constructor() {
    super()
  }

  validateAuthentication(request: TsoaRequest): asserts request is TsoaRequest & { user: User } {
    if (!request.user || !request?.isAuthenticated()) {
      throw new ApiError(401, 'Unauthorized', 'Must be logged in to do that.')
    }
  }
}

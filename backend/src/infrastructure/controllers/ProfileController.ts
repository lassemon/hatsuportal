import { Get, Middlewares, Request, Res, Response, Route, SuccessResponse, Tags, TsoaResponse } from 'tsoa'
import { Authentication } from 'infrastructure'
import { RootController } from './RootController'
import { container, injectable } from 'tsyringe'
import { IHttpErrorMapper } from '/infrastructure/dataAccess/http/mappers/HttpErrorMapper'
import { IProfileApiMapper } from '/application/dataAccess/http/mappers/IProfileApiMapper'
import { ErrorResponse, ProfileResponse } from '@hatsuportal/contracts'
import { ProfileDTO } from '@hatsuportal/user-management'
import { TsoaRequest } from '/infrastructure/TsoaRequest'

/**
 * FIXME, TSOA does not allow union types in TsoaResponse first generics type, nor does it allow to import the ServerError from another file,
 * see https://github.com/lukeautry/tsoa/blob/c50fc6d4322b71f0746d6ff67000b6563593bbdb/docs/ExternalInterfacesExplanation.MD for possible details on import error.
 * Thus we need to redeclare this type at the top of each Controller.
 */
type ServerError = TsoaResponse<400 | 401 | 403 | 409 | 422 | 404 | 500 | 501, ErrorResponse>

@injectable()
@Route('/profile')
export class ProfileController extends RootController {
  protected readonly profileApiMapper: IProfileApiMapper
  protected readonly httpErrorMapper: IHttpErrorMapper

  constructor() {
    super()
    this.profileApiMapper = container.resolve('IProfileApiMapper')
    this.httpErrorMapper = container.resolve('IHttpErrorMapper')
  }

  @Tags('profile')
  @Middlewares(container.resolve<Authentication>('Authentication').authenticationMiddleware())
  @Response(401, 'Unauthorized')
  @SuccessResponse(200, 'OK')
  @Get()
  public async getAll(
    @Request() request: TsoaRequest,
    @Res() profioleResponse: TsoaResponse<200, ProfileResponse>,
    @Res() errorResponse: ServerError
  ) {
    try {
      this.validateAuthentication(request)
      const getUserProfileUseCase = this.useCaseFactory.createGetUserProfileUseCase()
      await getUserProfileUseCase.execute({
        user: request.user,
        userProfile: (profile: ProfileDTO) => {
          profioleResponse(200, this.profileApiMapper.toResponse(profile))
        }
      })
    } catch (error) {
      const httpError = this.httpErrorMapper.mapApplicationErrorToHttpError(error)
      errorResponse(httpError.status, httpError)
    }
  }
}

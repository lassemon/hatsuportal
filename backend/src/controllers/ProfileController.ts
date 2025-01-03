import { Get, Middlewares, Request, Res, Response, Route, SuccessResponse, Tags, TsoaResponse } from 'tsoa'
import { Authentication } from 'infrastructure'
import { RootController } from './RootController'
import { ErrorPresentationMapper, ErrorResponse, ProfilePresentationMapper, ProfileResponse } from '@hatsuportal/presentation'
import { ProfileDTO } from '@hatsuportal/application'
import { TsoaRequest } from '/presentation/api/requests/TsoaRequest'
import { container, injectable } from 'tsyringe'

const errorPresentationMapper = new ErrorPresentationMapper()
const profilePresentationMapper = new ProfilePresentationMapper()

/**
 * FIXME, TSOA does not allow union types in TsoaResponse first generics type, nor does it allow to import the ServerError from another file,
 * see https://github.com/lukeautry/tsoa/blob/c50fc6d4322b71f0746d6ff67000b6563593bbdb/docs/ExternalInterfacesExplanation.MD for possible details on import error.
 * Thus we need to redeclare this type at the top of each Controller.
 */
type ServerError = TsoaResponse<400 | 401 | 403 | 422 | 404 | 500 | 501, ErrorResponse>

@injectable()
@Route('/profile')
export class ProfileController extends RootController {
  constructor() {
    super()
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
          profioleResponse(200, profilePresentationMapper.toResponse(profile))
        }
      })
    } catch (error) {
      const httpError = errorPresentationMapper.mapApplicationErrorToHttpError(error)
      errorResponse(httpError.status, httpError)
    }
  }
}

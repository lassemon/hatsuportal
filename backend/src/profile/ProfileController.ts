import { Get, Middlewares, Request, Response, Route, Tags } from 'tsoa'
import Authentication from '../auth/Authentication'
import passport from 'passport'
import { TsoaRequest } from '../common/entities/TsoaRequest'
import { ProfileResponseDTO } from '@hatsuportal/application'
import { RootController } from '/common/RootController'

const authentication = new Authentication(passport)

@Route('/profile')
export class ProfileController extends RootController {
  constructor() {
    super()
  }

  @Tags('profile')
  @Middlewares(authentication.authenticationMiddleware())
  @Response(401, 'Unauthorized')
  @Get()
  public async getAll(@Request() request: TsoaRequest): Promise<ProfileResponseDTO> {
    this.validateAuthentication(request)

    const getUserProfileUseCase = this.useCaseFactory.createGetUserProfileUseCase()
    return await getUserProfileUseCase.execute({
      user: request.user
    })
  }
}

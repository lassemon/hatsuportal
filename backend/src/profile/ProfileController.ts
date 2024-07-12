import { Get, Middlewares, Request, Response, Route, Tags } from 'tsoa'
import Authentication from '../auth/Authentication'
import passport from 'passport'
import { TsoaRequest } from '../common/entities/TsoaRequest'
import { ProfileResponseDTO } from '@hatsuportal/application'
import { ItemMapper } from '@hatsuportal/infrastructure'
import { GetUserProfileUseCase } from './useCases/GetUserProfileUseCase'
import ItemRepository from '/item/ItemRepository'
import { RootController } from '/common/RootController'

const authentication = new Authentication(passport)
const itemMapper = new ItemMapper()
const itemRepository = new ItemRepository(itemMapper)

const getUserProfileUseCase = new GetUserProfileUseCase(itemRepository)

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
    return await getUserProfileUseCase.execute({
      user: request.user
    })
  }
}

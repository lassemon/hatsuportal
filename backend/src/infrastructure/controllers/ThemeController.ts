import {
  Body,
  Delete,
  Get,
  Middlewares,
  Patch,
  Path,
  Post,
  Request,
  Res,
  Response,
  Route,
  SuccessResponse,
  Tags,
  TsoaResponse
} from 'tsoa'
import { RootController } from './RootController'
import { CreateThemeRequest, ErrorResponse, ThemeListResponse, ThemeResponse, UpdateThemeRequest } from '@hatsuportal/contracts'
import { ThemeDTO } from '@hatsuportal/user-management'
import { TsoaRequest } from '../TsoaRequest'
import { container as tsyringeContainer } from 'tsyringe'
import { IThemeApiMapper } from '@hatsuportal/user-management'
import { ConcurrencyError } from '@hatsuportal/platform'
import { Theme } from '@hatsuportal/user-management'

type ServerError = TsoaResponse<400 | 401 | 403 | 409 | 422 | 404 | 500 | 501, ErrorResponse>

@Route('/themes/')
export class ThemeController extends RootController {
  protected readonly themeApiMapper: IThemeApiMapper

  constructor() {
    super()
    this.themeApiMapper = tsyringeContainer.resolve<IThemeApiMapper>('IThemeApiMapper')
  }

  @Tags('Theme')
  @Middlewares(RootController.authentication.authenticationMiddleware())
  @Response(401, 'Unauthorized')
  @Response(403, 'Forbidden')
  @SuccessResponse(200, 'OK')
  @Get()
  public async list(
    @Request() request: TsoaRequest,
    @Res() themesListedResponse: TsoaResponse<200, ThemeListResponse>,
    @Res() errorResponse: ServerError
  ) {
    try {
      this.validateAuthentication(request)
      const listThemesUseCase = this.useCaseFactory.createListThemesUseCase()
      await listThemesUseCase.execute({
        loggedInUserId: request.user.id,
        themesListed: (themes: ThemeDTO[]) => {
          themesListedResponse(200, themes.map(this.themeApiMapper.toResponse))
        }
      })
    } catch (error) {
      const httpError = this.httpErrorMapper.mapApplicationErrorToHttpError(error)
      errorResponse(httpError.status, httpError)
    }
  }

  @Tags('Theme')
  @Middlewares(RootController.authentication.authenticationMiddleware())
  @Response(401, 'Unauthorized')
  @Response(403, 'Forbidden')
  @SuccessResponse(201, 'Created')
  @Post()
  public async create(
    @Request() request: TsoaRequest,
    @Body() createThemeRequest: CreateThemeRequest,
    @Res() themeCreatedResponse: TsoaResponse<201, ThemeResponse>,
    @Res() errorResponse: ServerError
  ) {
    try {
      this.validateAuthentication(request)
      const createThemeUseCase = this.useCaseFactory.createCreateThemeUseCase()
      await createThemeUseCase.execute({
        createdById: request.user.id,
        createThemeInput: this.themeApiMapper.toCreateThemeInputDTO(createThemeRequest),
        themeCreated: (theme: ThemeDTO) => {
          themeCreatedResponse(201, this.themeApiMapper.toResponse(theme))
        }
      })
    } catch (error) {
      const httpError = this.httpErrorMapper.mapApplicationErrorToHttpError(error)
      errorResponse(httpError.status, httpError)
    }
  }

  @Tags('Theme')
  @Middlewares(RootController.authentication.authenticationMiddleware())
  @Response(401, 'Unauthorized')
  @Response(403, 'Forbidden')
  @Response(404, 'NotFound')
  @Response(409, 'Conflict')
  @SuccessResponse(200, 'OK')
  @Patch('{id}')
  public async update(
    @Request() request: TsoaRequest,
    @Path() id: string,
    @Body() updateThemeRequest: UpdateThemeRequest,
    @Res() themeUpdatedResponse: TsoaResponse<200, ThemeResponse>,
    @Res() errorResponse: ServerError
  ) {
    try {
      this.validateAuthentication(request)
      const updateThemeUseCase = this.useCaseFactory.createUpdateThemeUseCase()
      await updateThemeUseCase.execute({
        updatedById: request.user.id,
        themeId: id,
        updateThemeInput: this.themeApiMapper.toUpdateThemeInputDTO(updateThemeRequest),
        themeUpdated: (theme: ThemeDTO) => {
          themeUpdatedResponse(200, this.themeApiMapper.toResponse(theme))
        },
        updateConflict: (error: ConcurrencyError<Theme>) => {
          errorResponse(409, {
            status: 409,
            name: 'Conflict',
            message: error.message
          })
        }
      })
    } catch (error) {
      const httpError = this.httpErrorMapper.mapApplicationErrorToHttpError(error)
      errorResponse(httpError.status, httpError)
    }
  }

  @Tags('Theme')
  @Middlewares(RootController.authentication.authenticationMiddleware())
  @Response(401, 'Unauthorized')
  @Response(403, 'Forbidden')
  @Response(404, 'NotFound')
  @Response(409, 'Conflict')
  @SuccessResponse(204, 'NoContent')
  @Delete('{id}')
  public async delete(
    @Request() request: TsoaRequest,
    @Path() id: string,
    @Res() themeDeletedResponse: TsoaResponse<204, void>,
    @Res() errorResponse: ServerError
  ) {
    try {
      this.validateAuthentication(request)
      const deleteThemeUseCase = this.useCaseFactory.createDeleteThemeUseCase()
      await deleteThemeUseCase.execute({
        deletedById: request.user.id,
        deleteThemeInput: { themeIdToDelete: id },
        themeDeleted: () => {
          themeDeletedResponse(204)
        },
        deleteConflict: (error: ConcurrencyError<Theme>) => {
          errorResponse(409, {
            status: 409,
            name: 'Conflict',
            message: error.message
          })
        }
      })
    } catch (error) {
      const httpError = this.httpErrorMapper.mapApplicationErrorToHttpError(error)
      errorResponse(httpError.status, httpError)
    }
  }
}

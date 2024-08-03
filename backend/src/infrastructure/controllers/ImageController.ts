import { Body, Get, Middlewares, Patch, Path, Post, Request, Res, Response, Route, SuccessResponse, Tags, TsoaResponse } from 'tsoa'
import { RootController } from './RootController'
import { container } from 'tsyringe'
import { IImageApiMapper, Image, ImageWithRelationsDTO } from '@hatsuportal/media-management'
import { TsoaRequest } from '../TsoaRequest'
import { CreateImageRequest, ErrorResponse, ImageWithRelationsResponse, UpdateImageRequest } from '@hatsuportal/contracts'
import { InvalidRequestError, ConcurrencyError } from '@hatsuportal/platform'

/**
 * FIXME, TSOA does not allow union types in TsoaResponse first generics type, nor does it allow to import the ServerError from another file,
 * see https://github.com/lukeautry/tsoa/blob/c50fc6d4322b71f0746d6ff67000b6563593bbdb/docs/ExternalInterfacesExplanation.MD for possible details on import error.
 * Thus we need to redeclare this type at the top of each Controller.
 */
type ServerError = TsoaResponse<400 | 401 | 403 | 409 | 422 | 404 | 500 | 501, ErrorResponse>

/**
 * TODO:
 * Rate Limiting: Consider implementing an attempt limiter from a single ip within a given timeframe.
 * Lockout Mechanism: Consider implementing a lockout mechanism and/or CAPTCHA for repeated attempts.
 */
@Route('/images/')
export class ImageController extends RootController {
  protected readonly imageApiMapper: IImageApiMapper

  constructor() {
    super()
    this.imageApiMapper = container.resolve('IImageApiMapper')
  }

  @Tags('Image')
  @Response(404, 'NotFound')
  @Response(422, 'UnprocessableContent')
  @Response(500, 'InternalServerError')
  @SuccessResponse(200, 'OK')
  @Get('{imageId}')
  public async get(@Res() getResponse: TsoaResponse<200, ImageWithRelationsResponse>, @Res() errorResponse: ServerError, imageId?: string) {
    try {
      if (!imageId) {
        throw new InvalidRequestError('Missing required path parameter "imageId"')
      }
      const findImageUseCase = this.useCaseFactory.createFindImageUseCase()
      await findImageUseCase.execute({
        imageId: imageId,
        imageFound: (image: ImageWithRelationsDTO) => {
          getResponse(200, this.imageApiMapper.toResponseWithRelations(image))
        }
      })
    } catch (error) {
      const httpError = this.httpErrorMapper.mapApplicationErrorToHttpError(error)
      errorResponse(httpError.status, httpError)
    }
  }

  @Tags('Image')
  @Middlewares(RootController.authentication.authenticationMiddleware())
  @Response(401, 'Unauthorized')
  @SuccessResponse(201, 'Created')
  @Post()
  public async create(
    @Request() request: TsoaRequest,
    @Body() createImageRequest: CreateImageRequest,
    @Res() createResponse: TsoaResponse<201, ImageWithRelationsResponse>,
    @Res() errorResponse: ServerError
  ) {
    try {
      this.validateAuthentication(request)
      const createImageInput = this.imageApiMapper.toCreateImageInputDTO(createImageRequest, request.user.id.value)
      const createImageUseCase = this.useCaseFactory.createCreateImageUseCase()
      await createImageUseCase.execute({
        createdById: request.user.id.value,
        createImageInput,
        imageCreated: (createdImage: ImageWithRelationsDTO) => {
          createResponse(201, this.imageApiMapper.toResponseWithRelations(createdImage))
        }
      })
    } catch (error) {
      const httpError = this.httpErrorMapper.mapApplicationErrorToHttpError(error)
      errorResponse(httpError.status, httpError)
    }
  }

  @Tags('Image')
  @Middlewares(RootController.authentication.authenticationMiddleware())
  @Response(401, 'Unauthorized')
  @SuccessResponse(201, 'Created')
  @Patch('{imageId}')
  public async update(
    @Request() request: TsoaRequest,
    @Path() imageId: string,
    @Body() updateImageRequest: UpdateImageRequest,
    @Res() updateResponse: TsoaResponse<200, ImageWithRelationsResponse>,
    @Res() errorResponse: ServerError
  ): Promise<void> {
    try {
      this.validateAuthentication(request)
      const updateImageInput = this.imageApiMapper.toUpdateImageInputDTO(updateImageRequest, imageId, request.user.id.value)
      const updateImageUseCase = this.useCaseFactory.createUpdateImageUseCase()
      await updateImageUseCase.execute({
        updatedById: request.user.id.value,
        updateImageInput,
        imageUpdated: (updatedImage: ImageWithRelationsDTO) => {
          updateResponse(200, this.imageApiMapper.toResponseWithRelations(updatedImage))
        },
        updateConflict: (error: ConcurrencyError<Image>) => {
          errorResponse(409, this.httpErrorMapper.mapApplicationErrorToHttpError(error))
        }
      })
    } catch (error) {
      const httpError = this.httpErrorMapper.mapApplicationErrorToHttpError(error)
      errorResponse(httpError.status, httpError)
    }
  }

  // TODO, delete that returns ImageWithRelationsResponse
}

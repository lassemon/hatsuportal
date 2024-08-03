import { Body, Get, Middlewares, Post, Put, Request, Res, Response, Route, SuccessResponse, Tags, TsoaResponse } from 'tsoa'
import { RootController } from './RootController'
import { ConcurrencyError, Image } from '@hatsuportal/common-bounded-context'
import { container } from 'tsyringe'
import { IHttpErrorMapper } from '/infrastructure/dataAccess/http/mappers/HttpErrorMapper'
import { IImageApiMapper } from '/application/dataAccess/http/mappers/IImageApiMapper'
import { ImageDTO } from '@hatsuportal/common-bounded-context'
import { TsoaRequest } from '/infrastructure/TsoaRequest'
import { CreateImageRequest, ErrorResponse, ImageResponse, UpdateImageRequest } from '@hatsuportal/contracts'
import { InvalidRequestError } from '/infrastructure/errors/InvalidRequestError'

/**
 * FIXME, TSOA does not allow union types in TsoaResponse first generics type, nor does it allow to import the ServerError from another file,
 * see https://github.com/lukeautry/tsoa/blob/c50fc6d4322b71f0746d6ff67000b6563593bbdb/docs/ExternalInterfacesExplanation.MD for possible details on import error.
 * Thus we need to redeclare this type at the top of each Controller.
 */
type ServerError = TsoaResponse<400 | 401 | 403 | 409 | 422 | 404 | 500 | 501, ErrorResponse>

@Route('/')
export class ImageController extends RootController {
  protected readonly imageApiMapper: IImageApiMapper
  protected readonly httpErrorMapper: IHttpErrorMapper

  constructor() {
    super()
    this.imageApiMapper = container.resolve('IImageApiMapper')
    this.httpErrorMapper = container.resolve('IHttpErrorMapper')
  }

  @Tags('Image')
  @Response(404, 'NotFound')
  @Response(422, 'UnprocessableContent')
  @Response(500, 'InternalServerError')
  @SuccessResponse(200, 'OK')
  @Get('image/{imageId}')
  public async get(@Res() getResponse: TsoaResponse<200, ImageResponse>, @Res() errorResponse: ServerError, imageId?: string) {
    try {
      if (!imageId) {
        throw new InvalidRequestError('Missing required path parameter "imageId"')
      }
      const findImageUseCase = this.useCaseFactory.createFindImageUseCase()
      await findImageUseCase.execute({
        imageId: imageId,
        imageFound: (image: ImageDTO) => {
          getResponse(200, this.imageApiMapper.toResponse(image))
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
  @Post('image')
  public async create(
    @Request() request: TsoaRequest,
    @Body() createImageRequest: CreateImageRequest,
    @Res() createResponse: TsoaResponse<201, ImageResponse>,
    @Res() errorResponse: ServerError
  ) {
    try {
      this.validateAuthentication(request)
      const createImageInput = this.imageApiMapper.toCreateImageInputDTO(createImageRequest, request.user.id.value)
      const createImageUseCase = this.useCaseFactory.createCreateImageUseCase()
      await createImageUseCase.execute({
        createImageInput,
        imageCreated: (createdImage: ImageDTO) => {
          createResponse(201, this.imageApiMapper.toResponse(createdImage))
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
  @Put('image')
  public async update(
    @Request() request: TsoaRequest,
    @Body() updateImageRequest: UpdateImageRequest,
    @Res() updateResponse: TsoaResponse<200, ImageResponse>,
    @Res() errorResponse: ServerError
  ): Promise<void> {
    try {
      this.validateAuthentication(request)
      const updateImageInput = this.imageApiMapper.toUpdateImageInputDTO(updateImageRequest, request.user.id.value)
      const updateImageUseCase = this.useCaseFactory.createUpdateImageUseCase()
      await updateImageUseCase.execute({
        updateImageInput,
        imageUpdated: (updatedImage: ImageDTO) => {
          updateResponse(200, this.imageApiMapper.toResponse(updatedImage))
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
}

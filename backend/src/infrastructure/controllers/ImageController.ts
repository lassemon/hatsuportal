import { Get, Res, Response, Route, SuccessResponse, Tags, TsoaResponse } from 'tsoa'
import { RootController } from './RootController'
import { container as tsyringeContainer } from 'tsyringe'
import { IImageApiMapper, ImageWithRelationsDTO } from '@hatsuportal/media-management'
import { ErrorResponse, ImageWithRelationsResponse } from '@hatsuportal/contracts'
import { InvalidRequestError } from '@hatsuportal/platform'

/**
 * FIXME, TSOA does not allow union types in TsoaResponse first generics type, nor does it allow to import the ServerError from another file,
 * see https://github.com/lukeautry/tsoa/blob/c50fc6d4322b71f0746d6ff67000b6563593bbdb/docs/ExternalInterfacesExplanation.MD for possible details on import error.
 * Thus we need to redeclare this type at the top of each Controller.
 */
type ServerError = TsoaResponse<400 | 401 | 403 | 409 | 422 | 404 | 500 | 501, ErrorResponse>

@Route('/images/')
export class ImageController extends RootController {
  protected readonly imageApiMapper: IImageApiMapper

  constructor() {
    super()
    this.imageApiMapper = tsyringeContainer.resolve<IImageApiMapper>('IImageApiMapper')
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
}

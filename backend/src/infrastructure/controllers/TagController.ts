import { Get, Res, Route, SuccessResponse, Tags, TsoaResponse, Response } from 'tsoa'
import { RootController } from './RootController'
import { ErrorResponse, TagListResponse } from '@hatsuportal/contracts'
import { container } from 'tsyringe'
import { ITagApiMapper } from '@hatsuportal/post-management'

/**
 * FIXME, TSOA does not allow union types in TsoaResponse first generics type, nor does it allow to import the ServerError from another file,
 * see https://github.com/lukeautry/tsoa/blob/c50fc6d4322b71f0746d6ff67000b6563593bbdb/docs/ExternalInterfacesExplanation.MD for possible details on import error.
 * Thus we need to redeclare this type at the top of each Controller.
 */
type ServerError = TsoaResponse<400 | 401 | 403 | 409 | 422 | 404 | 500 | 501, ErrorResponse>

@Route('/tags/')
export class TagController extends RootController {
  protected readonly tagApiMapper: ITagApiMapper

  constructor() {
    super()
    this.tagApiMapper = container.resolve('ITagApiMapper')
  }

  @Tags('Tag')
  @Response(404, 'NotFound')
  @Response(422, 'UnprocessableContent')
  @Response(500, 'InternalServerError')
  @SuccessResponse(200, 'OK')
  @Get()
  public async get(@Res() getTagsResponse: TsoaResponse<200, TagListResponse>, @Res() errorResponse: ServerError) {
    try {
      const findAllTagsUseCase = this.useCaseFactory.createFindAllTagsUseCase()
      await findAllTagsUseCase.execute({
        tagsFound: (tags) => {
          getTagsResponse(200, {
            tags: tags.map(this.tagApiMapper.toResponse),
            totalCount: tags.length
          })
        }
      })
    } catch (error) {
      const httpError = this.httpErrorMapper.mapApplicationErrorToHttpError(error)
      errorResponse(httpError.status, httpError)
    }
  }
}

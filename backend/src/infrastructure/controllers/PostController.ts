import { ErrorResponse, GetCommentsRequest, GetCommentsResponse } from '@hatsuportal/contracts'
import { Get, Middlewares, Path, Queries, Res, Route, SuccessResponse, Tags, TsoaResponse } from 'tsoa'
import { RootController } from './RootController'
import { ICommentApiMapper } from '@hatsuportal/post-management'
import { container } from 'tsyringe'
import config from '../../config'

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
@Route('/')
export class PostController extends RootController {
  protected readonly commentApiMapper: ICommentApiMapper

  constructor() {
    super()
    this.commentApiMapper = container.resolve('ICommentApiMapper')
  }

  //* Top-level comments:
  //GET /posts/{postId}/comments?cursor=...&limit=... → returns comments where parent_comment_id IS NULL, plus nextCursor.

  @Tags('Comment')
  @Middlewares(RootController.authentication.passThroughAuthenticationMiddleware())
  @SuccessResponse(200, 'OK')
  @Get('post/{postId}/comments')
  public async getComments(
    @Path() postId: string,
    @Queries() getCommentsRequest: GetCommentsRequest,
    @Res() getCommentsResponse: TsoaResponse<200, GetCommentsResponse>,
    @Res() errorResponse: ServerError
  ) {
    try {
      const getCommentsInput = this.commentApiMapper.toGetCommentsInputDTO(getCommentsRequest, postId)
      const getCommentsUseCase = this.useCaseFactory.createGetCommentsUseCase()
      await getCommentsUseCase.execute({
        getCommentsInput,
        defaultSortOrder: config.comment.defaultSortOrder,
        defaultRepliesPreviewLimit: config.comment.defaultRepliesPreviewLimit,
        commentsFound: (comments) => {
          getCommentsResponse(200, this.commentApiMapper.toGetCommentsResponse(comments))
        }
      })
    } catch (error) {
      const httpError = this.httpErrorMapper.mapApplicationErrorToHttpError(error)
      errorResponse(httpError.status, httpError)
    }
  }
}

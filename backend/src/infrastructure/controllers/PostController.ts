import {
  AddCommentRequest,
  CommentResponse,
  ErrorResponse,
  GetCommentsRequest,
  GetCommentsResponse,
  SearchPostsRequest,
  SearchPostsResponse
} from '@hatsuportal/contracts'
import { Body, Get, Middlewares, Path, Post, Queries, Request, Res, Route, SuccessResponse, Tags, TsoaResponse } from 'tsoa'
import { RootController } from './RootController'
import { ICommentApiMapper, IPostApiMapper } from '@hatsuportal/post-management'
import { container as tsyringeContainer } from 'tsyringe'
import config from '../../config'
import { TsoaRequest } from '../TsoaRequest'

/**
 * FIXME, TSOA does not allow union types in TsoaResponse first generics type, nor does it allow to import the ServerError from another file,
 * see https://github.com/lukeautry/tsoa/blob/c50fc6d4322b71f0746d6ff67000b6563593bbdb/docs/ExternalInterfacesExplanation.MD for possible details on import error.
 * Thus we need to redeclare this type at the top of each Controller.
 */
type ServerError = TsoaResponse<400 | 401 | 403 | 409 | 422 | 404 | 500 | 501, ErrorResponse>

@Route('/posts')
export class PostController extends RootController {
  protected readonly commentApiMapper: ICommentApiMapper
  protected readonly postApiMapper: IPostApiMapper

  constructor() {
    super()
    this.commentApiMapper = tsyringeContainer.resolve<ICommentApiMapper>('ICommentApiMapper')
    this.postApiMapper = tsyringeContainer.resolve<IPostApiMapper>('IPostApiMapper')
  }

  @Tags('Post')
  @Middlewares(RootController.authentication.passThroughAuthenticationMiddleware())
  @SuccessResponse(200, 'OK')
  @Get()
  public async search(
    @Request() request: TsoaRequest,
    @Queries() searchPostsRequest: SearchPostsRequest,
    @Res() searchResponse: TsoaResponse<200, SearchPostsResponse>,
    @Res() errorResponse: ServerError
  ) {
    try {
      const searchPostsInput = this.postApiMapper.toPostSearchCriteriaDTO(searchPostsRequest)
      const searchPostsUseCase = this.useCaseFactory.createSearchPostsUseCase()
      await searchPostsUseCase.execute({
        loggedInUserId: request.user?.id,
        searchCriteria: searchPostsInput,
        foundPosts: (posts, totalCount) => {
          searchResponse(200, {
            posts: posts.map(this.postApiMapper.toPostWithRelationsResponse),
            totalCount
          })
        }
      })
    } catch (error) {
      const httpError = this.httpErrorMapper.mapApplicationErrorToHttpError(error)
      errorResponse(httpError.status, httpError)
    }
  }

  //* Top-level comments:
  //GET /posts/{postId}/comments?cursor=...&limit=... → returns comments where parent_comment_id IS NULL, plus nextCursor.

  @Tags('Comment')
  @Middlewares(RootController.authentication.passThroughAuthenticationMiddleware())
  @SuccessResponse(200, 'OK')
  @Get('{postId}/comments')
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

  @Tags('Comment')
  @Middlewares(RootController.authentication.authenticationMiddleware())
  @SuccessResponse(201, 'Created')
  @Post('{postId}/comments')
  public async addComment(
    @Request() request: TsoaRequest,
    @Path() postId: string,
    @Body() addCommentRequest: AddCommentRequest,
    @Res() addCommentResponse: TsoaResponse<201, CommentResponse>,
    @Res() errorResponse: ServerError
  ) {
    try {
      const addCommentInput = this.commentApiMapper.toAddCommentInputDTO(addCommentRequest, postId, request.user?.id)
      const addCommentUseCase = this.useCaseFactory.createAddCommentUseCase()
      await addCommentUseCase.execute({
        addCommentInput,
        commentCreated: (comment) => {
          addCommentResponse(201, this.commentApiMapper.toCommentResponse(comment))
        }
      })
    } catch (error) {
      const httpError = this.httpErrorMapper.mapApplicationErrorToHttpError(error)
      errorResponse(httpError.status, httpError)
    }
  }
}

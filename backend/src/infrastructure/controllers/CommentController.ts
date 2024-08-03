/**
 *
 * Endpoints

POST /posts/{postId}/comments → add a top-level comment

POST /comments/{commentId}/replies → reply to a comment

PATCH /comments/{commentId} → edit own comment

DELETE /comments/{commentId} → delete (author/moderator)

GET /posts/{postId}/comments?parentId&after&limit → list (paginated, cursor)

The UI calls GET /posts/{postId}/comments for the thread (paged).

repliesPreview gives a taste of the thread;
repliesNextCursor lets you fetch the rest via GET /posts/{postId}/comments?parentId={commentId}&cursor=...

GET /posts/{postId}/comments?limit=20&cursor=<that-string>


ListCommentsForPost (and/or ListRepliesForComment)
 *
 *
 * Top-level comments:
GET /posts/{postId}/comments?cursor=...&limit=... → returns comments where parent_comment_id IS NULL, plus nextCursor.

Replies for a comment:
GET /comments/{commentId}/replies?cursor=...&limit=... → returns comments where parent_comment_id = {commentId}, plus nextCursor.


Use cases

AddCommentToPost

ReplyToComment

EditComment

DeleteComment


also PostController
*
 */

import { Body, Delete, Get, Middlewares, Patch, Path, Post, Queries, Request, Res, Route, SuccessResponse, Tags, TsoaResponse } from 'tsoa'
import {
  AddCommentRequest,
  CommentResponse,
  EditCommentRequest,
  ErrorResponse,
  GetRepliesRequest,
  GetRepliesResponse
} from '@hatsuportal/contracts'
import { RootController } from './RootController'
import { ICommentApiMapper } from '@hatsuportal/post-management'
import { container } from 'tsyringe'
import { TsoaRequest } from '../TsoaRequest'
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
@Route('/comments/')
export class CommentController extends RootController {
  protected readonly commentApiMapper: ICommentApiMapper

  constructor() {
    super()
    this.commentApiMapper = container.resolve('ICommentApiMapper')
  }

  @Tags('Comment')
  @Middlewares(RootController.authentication.passThroughAuthenticationMiddleware())
  @SuccessResponse(200, 'OK')
  @Get('{commentId}/replies')
  public async getReplies(
    @Queries() getRepliesRequest: GetRepliesRequest,
    @Path() commentId: string,
    @Res() getRepliesResponse: TsoaResponse<200, GetRepliesResponse>,
    @Res() errorResponse: ServerError
  ) {
    try {
      const getRepliesInput = this.commentApiMapper.toGetRepliesInputDTO(getRepliesRequest, commentId)
      const getRepliesUseCase = this.useCaseFactory.createGetRepliesUseCase()
      await getRepliesUseCase.execute({
        getRepliesInput,
        defaultRepliesSortOrder: config.comment.defaultRepliesSortOrder,
        repliesFound: (replies) => {
          getRepliesResponse(200, this.commentApiMapper.toGetRepliesResponse(replies))
        }
      })
    } catch (error) {
      const httpError = this.httpErrorMapper.mapApplicationErrorToHttpError(error)
      errorResponse(httpError.status, httpError)
    }
  }

  @Tags('Comment')
  @Middlewares(RootController.authentication.passThroughAuthenticationMiddleware())
  @SuccessResponse(201, 'Created')
  @Post('{postId}/comment')
  public async addComment(
    @Request() request: TsoaRequest,
    @Path() postId: string,
    @Body() addCommentRequest: AddCommentRequest,
    @Res() addCommentResponse: TsoaResponse<201, CommentResponse>,
    @Res() errorResponse: ServerError
  ) {
    try {
      const addCommentInput = this.commentApiMapper.toAddCommentInputDTO(addCommentRequest, postId, request.user?.id.value)
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

  // PATCH /comments/{commentId} → edit own comment
  @Tags('Comment')
  @Middlewares(RootController.authentication.passThroughAuthenticationMiddleware())
  @SuccessResponse(200, 'OK')
  @Patch('{commentId}')
  public async editComment(
    @Request() request: TsoaRequest,
    @Path() commentId: string,
    @Body() editCommentRequest: EditCommentRequest,
    @Res() editCommentResponse: TsoaResponse<200, CommentResponse>,
    @Res() errorResponse: ServerError
  ) {
    try {
      const editCommentInput = this.commentApiMapper.toEditCommentInputDTO(editCommentRequest, commentId, request.user?.id.value)
      const editCommentUseCase = this.useCaseFactory.createEditCommentUseCase()
      await editCommentUseCase.execute({
        editCommentInput,
        commentEdited: (comment) => {
          editCommentResponse(200, this.commentApiMapper.toCommentResponse(comment))
        }
      })
    } catch (error) {
      const httpError = this.httpErrorMapper.mapApplicationErrorToHttpError(error)
      errorResponse(httpError.status, httpError)
    }
  }

  @Tags('Comment')
  @Middlewares(RootController.authentication.passThroughAuthenticationMiddleware())
  @SuccessResponse(200, 'OK')
  @Delete('{commentId}')
  public async deleteComment(
    @Request() request: TsoaRequest,
    @Path() commentId: string,
    @Res() deleteCommentResponse: TsoaResponse<200, CommentResponse>,
    @Res() errorResponse: ServerError
  ) {
    try {
      const deleteCommentInput = this.commentApiMapper.toDeleteCommentInputDTO(commentId, request.user?.id.value)
      const softDeleteCommentUseCase = this.useCaseFactory.createSoftDeleteCommentUseCase()
      await softDeleteCommentUseCase.execute({
        deleteCommentInput,
        commentSoftDeleted: (comment) => {
          deleteCommentResponse(200, this.commentApiMapper.toCommentResponse(comment))
        }
      })
    } catch (error) {
      const httpError = this.httpErrorMapper.mapApplicationErrorToHttpError(error)
      errorResponse(httpError.status, httpError)
    }
  }
}

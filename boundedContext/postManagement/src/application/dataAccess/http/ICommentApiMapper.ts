import {
  AddCommentRequest,
  CommentResponse,
  EditCommentRequest,
  GetCommentsRequest,
  GetCommentsResponse,
  GetRepliesRequest,
  GetRepliesResponse
} from '@hatsuportal/contracts'
import {
  AddCommentInputDTO,
  CommentListChunkDTO,
  CommentWithRelationsDTO,
  DeleteCommentInputDTO,
  EditCommentInputDTO,
  GetCommentsInputDTO,
  GetRepliesInputDTO,
  RepliesPreviewDTO
} from '../../dtos'

export interface ICommentApiMapper {
  toCommentResponse(comment: CommentWithRelationsDTO): CommentResponse
  toGetCommentsInputDTO(getCommentsRequest: GetCommentsRequest, postId: string): GetCommentsInputDTO
  toGetCommentsResponse(comments: CommentListChunkDTO): GetCommentsResponse
  toGetRepliesInputDTO(getRepliesRequest: GetRepliesRequest, loggedInUserId?: string): GetRepliesInputDTO
  toGetRepliesResponse(replies: RepliesPreviewDTO): GetRepliesResponse
  toAddCommentInputDTO(addCommentRequest: AddCommentRequest, postId: string, loggedInUserId?: string): AddCommentInputDTO
  toEditCommentInputDTO(editCommentRequest: EditCommentRequest, commentId: string, loggedInUserId?: string): EditCommentInputDTO
  toDeleteCommentInputDTO(commentId: string, loggedInUserId?: string): DeleteCommentInputDTO
}

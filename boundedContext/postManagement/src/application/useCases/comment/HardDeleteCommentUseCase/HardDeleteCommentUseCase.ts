import { IUseCase, IUseCaseOptions } from '@hatsuportal/platform'
import { CommentWithRelationsDTO, DeleteCommentInputDTO } from '../../../dtos'

export interface IHardDeleteCommentUseCaseOptions extends IUseCaseOptions {
  deleteCommentInput: DeleteCommentInputDTO
  commentHardDeleted(comment: CommentWithRelationsDTO): void
}

export type IHardDeleteCommentUseCase = IUseCase<IHardDeleteCommentUseCaseOptions>

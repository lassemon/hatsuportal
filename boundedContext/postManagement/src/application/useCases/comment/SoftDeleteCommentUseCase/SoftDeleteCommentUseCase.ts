import { IUseCase, IUseCaseOptions, NotFoundError, IUnitOfWork } from '@hatsuportal/platform'
import { CommentWithRelationsDTO, DeleteCommentInputDTO } from '../../../dtos'
import { Comment, CommentId, ICommentWriteRepository } from '../../../../domain'
import { ICommentLookupService } from '../../../services/comment/CommentLookupService'
import { UniqueId } from '@hatsuportal/shared-kernel'

export interface ISoftDeleteCommentUseCaseOptions extends IUseCaseOptions {
  deleteCommentInput: DeleteCommentInputDTO
  commentSoftDeleted(comment: CommentWithRelationsDTO): void
}

export type ISoftDeleteCommentUseCase = IUseCase<ISoftDeleteCommentUseCaseOptions>

export class SoftDeleteCommentUseCase implements ISoftDeleteCommentUseCase {
  constructor(
    private readonly commentRepository: ICommentWriteRepository,
    private readonly commentLookupService: ICommentLookupService,
    private readonly unitOfWork: IUnitOfWork
  ) {}

  async execute(options: ISoftDeleteCommentUseCaseOptions): Promise<void> {
    const { deleteCommentInput, commentSoftDeleted } = options

    const [comment] = await this.unitOfWork.execute<[Comment | null]>(async () => {
      const existingComment = await this.commentRepository.findByIdForUpdate(new CommentId(deleteCommentInput.commentId))
      if (!existingComment) {
        throw new NotFoundError(`Cannot soft delete comment with id ${deleteCommentInput.commentId} because it does not exist.`)
      }

      if (existingComment.isDeleted) {
        return [null] // idempotent no-op
      }

      existingComment.softDelete(new UniqueId(deleteCommentInput.deletingUserId))
      await this.commentRepository.softDelete(existingComment.id)
      return [existingComment]
    })

    if (!comment) {
      return
    }

    this.commentLookupService.invalidateById(comment.id)
    const dtoWithRelations = await this.commentLookupService.getById(comment.id)

    if (!dtoWithRelations) {
      throw new NotFoundError(`Comment soft deleted but not found in lookup service.`)
    }

    commentSoftDeleted(dtoWithRelations)
  }
}

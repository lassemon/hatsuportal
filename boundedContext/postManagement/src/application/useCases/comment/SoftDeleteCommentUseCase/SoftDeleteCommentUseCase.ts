import { IUseCase, IUseCaseOptions, NotFoundError, ITransactionAware, ITransactionManager } from '@hatsuportal/platform'
import { CommentWithRelationsDTO, DeleteCommentInputDTO } from '../../../dtos'
import { Comment, CommentId, ICommentWriteRepository } from '../../../../domain'
import { ICommentLookupService } from '../../../services/comment/CommentLookupService'
import { UnixTimestamp } from '@hatsuportal/shared-kernel'

export interface ISoftDeleteCommentUseCaseOptions extends IUseCaseOptions {
  deleteCommentInput: DeleteCommentInputDTO
  commentSoftDeleted(comment: CommentWithRelationsDTO): void
}

export type ISoftDeleteCommentUseCase = IUseCase<ISoftDeleteCommentUseCaseOptions>

export class SoftDeleteCommentUseCase implements ISoftDeleteCommentUseCase {
  constructor(
    private readonly commentRepository: ICommentWriteRepository & ITransactionAware,
    private readonly commentLookupService: ICommentLookupService,
    private readonly transactionManager: ITransactionManager<CommentId, UnixTimestamp>
  ) {}

  async execute(options: ISoftDeleteCommentUseCaseOptions): Promise<void> {
    const { deleteCommentInput, commentSoftDeleted } = options

    const [comment] = await this.transactionManager.execute<[Comment]>(async () => {
      const comment = await this.commentRepository.findByIdForUpdate(new CommentId(deleteCommentInput.commentId))
      if (!comment) throw new NotFoundError(`Cannot soft delete comment with id ${deleteCommentInput.commentId} because it does not exist.`)

      if (comment.isDeleted) {
        return [comment] // idempotent
      }

      comment.softDelete()
      await this.commentRepository.softDelete(comment.id)

      return [comment]
    }, [this.commentRepository])

    const dtoWithRelations = await this.commentLookupService.getById(comment.id)

    if (!dtoWithRelations) {
      throw new NotFoundError(`Comment soft deleted but not found in lookup service.`)
    }

    commentSoftDeleted(dtoWithRelations)
  }
}

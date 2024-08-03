import { IUseCase, IUseCaseOptions, NotFoundError, ITransactionAware, IDomainEventService } from '@hatsuportal/platform'
import { CommentWithRelationsDTO, DeleteCommentInputDTO } from '../../../dtos'
import { CommentId, ICommentWriteRepository } from '../../../../domain'
import { ICommentLookupService } from '../../../services/comment/CommentLookupService'
import { UniqueId } from '@hatsuportal/shared-kernel'

export interface ISoftDeleteCommentUseCaseOptions extends IUseCaseOptions {
  deleteCommentInput: DeleteCommentInputDTO
  commentSoftDeleted(comment: CommentWithRelationsDTO): void
}

export type ISoftDeleteCommentUseCase = IUseCase<ISoftDeleteCommentUseCaseOptions>

export class SoftDeleteCommentUseCase implements ISoftDeleteCommentUseCase {
  constructor(
    private readonly commentRepository: ICommentWriteRepository & ITransactionAware,
    private readonly commentLookupService: ICommentLookupService,
    private readonly domainEventService: IDomainEventService
  ) {}

  async execute(options: ISoftDeleteCommentUseCaseOptions): Promise<void> {
    const { deleteCommentInput, commentSoftDeleted } = options

    const comment = await this.commentRepository.findByIdForUpdate(new CommentId(deleteCommentInput.commentId))
    if (!comment) throw new NotFoundError(`Cannot soft delete comment with id ${deleteCommentInput.commentId} because it does not exist.`)

    if (comment.isDeleted) {
      return // idempotent
    }

    comment.softDelete(new UniqueId(deleteCommentInput.deletingUserId))
    await this.commentRepository.softDelete(comment.id)

    const dtoWithRelations = await this.commentLookupService.getById(comment.id)

    if (!dtoWithRelations) {
      throw new NotFoundError(`Comment soft deleted but not found in lookup service.`)
    }

    await this.domainEventService.persistToOutbox(comment.domainEvents)

    commentSoftDeleted(dtoWithRelations)
  }
}

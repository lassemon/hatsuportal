import { IUseCase, IUseCaseOptions, NotFoundError, ITransactionAware, IDomainEventService } from '@hatsuportal/platform'
import { CommentWithRelationsDTO, DeleteCommentInputDTO } from '../../../dtos'
import { CommentId, ICommentWriteRepository } from '../../../../domain'
import { ICommentLookupService } from '../../../services/comment/CommentLookupService'
import { UniqueId } from '@hatsuportal/shared-kernel'

export interface IHardDeleteCommentUseCaseOptions extends IUseCaseOptions {
  deleteCommentInput: DeleteCommentInputDTO
  commentHardDeleted(comment: CommentWithRelationsDTO): void
}

export type IHardDeleteCommentUseCase = IUseCase<IHardDeleteCommentUseCaseOptions>

export class HardDeleteCommentUseCase implements IHardDeleteCommentUseCase {
  constructor(
    private readonly commentRepository: ICommentWriteRepository & ITransactionAware,
    private readonly commentLookupService: ICommentLookupService,
    private readonly domainEventService: IDomainEventService
  ) {}

  async execute(options: IHardDeleteCommentUseCaseOptions): Promise<void> {
    const { deleteCommentInput, commentHardDeleted } = options

    const commentId = new CommentId(deleteCommentInput.commentId)
    const dtoWithRelations = await this.commentLookupService.getById(commentId)
    if (!dtoWithRelations) {
      throw new NotFoundError(`Cannot hard delete comment with id ${deleteCommentInput.commentId} because it does not exist.`)
    }

    const comment = await this.commentRepository.findByIdForUpdate(commentId)
    if (!comment) throw new NotFoundError(`Cannot hard delete comment with id ${deleteCommentInput.commentId} because it does not exist.`)

    await this.commentRepository.deletePermanently(comment.id)

    comment.delete(new UniqueId(deleteCommentInput.deletingUserId))

    await this.domainEventService.persistToOutbox(comment.domainEvents)

    commentHardDeleted(dtoWithRelations)
  }
}

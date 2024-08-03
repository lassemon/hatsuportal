import { IUseCase, IUseCaseOptions, NotFoundError, ITransactionAware, IDomainEventService } from '@hatsuportal/platform'
import { CommentWithRelationsDTO, EditCommentInputDTO } from '../../../dtos'
import { CommentId, ICommentWriteRepository } from '../../../../domain'
import { ICommentLookupService } from '../../../services/comment/CommentLookupService'
import { NonEmptyString } from '@hatsuportal/shared-kernel'

export interface IEditCommentUseCaseOptions extends IUseCaseOptions {
  editCommentInput: EditCommentInputDTO
  commentEdited(comment: CommentWithRelationsDTO): void
}

export type IEditCommentUseCase = IUseCase<IEditCommentUseCaseOptions>

export class EditCommentUseCase implements IEditCommentUseCase {
  constructor(
    private readonly commentRepository: ICommentWriteRepository & ITransactionAware,
    private readonly commentLookupService: ICommentLookupService,
    private readonly domainEventService: IDomainEventService
  ) {}

  public async execute(options: IEditCommentUseCaseOptions): Promise<void> {
    const { editCommentInput, commentEdited } = options

    const existingComment = await this.commentRepository.findByIdForUpdate(new CommentId(editCommentInput.commentId))
    if (!existingComment) {
      throw new NotFoundError(`Cannot edit comment with id ${editCommentInput.commentId} because it does not exist.`)
    }
    existingComment.writeBody(new NonEmptyString(editCommentInput.body))
    await this.commentRepository.update(existingComment)

    const dtoWithRelations = await this.commentLookupService.getById(existingComment.id)

    if (!dtoWithRelations) {
      throw new NotFoundError('Comment edited but not found in lookup service.')
    }

    await this.domainEventService.persistToOutbox(existingComment.domainEvents)

    commentEdited(dtoWithRelations)
  }
}

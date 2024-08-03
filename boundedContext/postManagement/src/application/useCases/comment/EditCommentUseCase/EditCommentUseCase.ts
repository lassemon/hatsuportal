import { IUseCase, IUseCaseOptions, NotFoundError, ITransactionManager, ITransactionAware } from '@hatsuportal/platform'
import { CommentWithRelationsDTO, EditCommentInputDTO } from '../../../dtos'
import { Comment, CommentId, ICommentWriteRepository } from '../../../../domain'
import { ICommentLookupService } from '../../../services/comment/CommentLookupService'
import { NonEmptyString, UnixTimestamp } from '@hatsuportal/shared-kernel'

export interface IEditCommentUseCaseOptions extends IUseCaseOptions {
  editCommentInput: EditCommentInputDTO
  commentEdited(comment: CommentWithRelationsDTO): void
}

export type IEditCommentUseCase = IUseCase<IEditCommentUseCaseOptions>

export class EditCommentUseCase implements IEditCommentUseCase {
  constructor(
    private readonly commentRepository: ICommentWriteRepository & ITransactionAware,
    private readonly commentLookupService: ICommentLookupService,
    private readonly transactionManager: ITransactionManager<CommentId, UnixTimestamp>
  ) {}

  public async execute(options: IEditCommentUseCaseOptions): Promise<void> {
    const { editCommentInput, commentEdited } = options

    const [savedComment] = await this.transactionManager.execute<[Comment]>(async () => {
      const existingComment = await this.commentRepository.findByIdForUpdate(new CommentId(editCommentInput.commentId))
      if (!existingComment) {
        throw new NotFoundError(`Cannot edit comment with id ${editCommentInput.commentId} because it does not exist.`)
      }
      existingComment.writeBody(new NonEmptyString(editCommentInput.body))
      await this.commentRepository.update(existingComment)

      return [existingComment]
    }, [this.commentRepository])

    const dtoWithRelations = await this.commentLookupService.getById(savedComment.id)

    if (!dtoWithRelations) {
      throw new NotFoundError('Comment edited but not found in lookup service.')
    }

    commentEdited(dtoWithRelations)
  }
}

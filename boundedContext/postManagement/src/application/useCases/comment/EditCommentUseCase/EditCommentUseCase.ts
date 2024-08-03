import { IUseCase, IUseCaseOptions, NotFoundError, IUnitOfWork } from '@hatsuportal/platform'
import { CommentWithRelationsDTO, EditCommentInputDTO } from '../../../dtos'
import { Comment, CommentBody, CommentId, ICommentWriteRepository } from '../../../../domain'
import { ICommentLookupService } from '../../../services/comment/CommentLookupService'

export interface IEditCommentUseCaseOptions extends IUseCaseOptions {
  editCommentInput: EditCommentInputDTO
  commentEdited(comment: CommentWithRelationsDTO): void
}

export type IEditCommentUseCase = IUseCase<IEditCommentUseCaseOptions>

export class EditCommentUseCase implements IEditCommentUseCase {
  constructor(
    private readonly commentRepository: ICommentWriteRepository,
    private readonly commentLookupService: ICommentLookupService,
    private readonly unitOfWork: IUnitOfWork
  ) {}

  public async execute(options: IEditCommentUseCaseOptions): Promise<void> {
    const { editCommentInput, commentEdited } = options
    const commentId = new CommentId(editCommentInput.commentId)

    const [savedComment] = await this.unitOfWork.execute<[Comment]>(async () => {
      const existingComment = await this.commentRepository.findByIdForUpdate(commentId)
      if (!existingComment) {
        throw new NotFoundError(`Cannot edit comment with id ${editCommentInput.commentId} because it does not exist.`)
      }
      existingComment.writeBody(new CommentBody(editCommentInput.body))
      await this.commentRepository.update(existingComment)
      return [existingComment]
    })

    this.commentLookupService.invalidateById(savedComment.id)
    const dtoWithRelations = await this.commentLookupService.getById(savedComment.id)

    if (!dtoWithRelations) {
      throw new NotFoundError('Comment edited but not found in lookup service.')
    }

    commentEdited(dtoWithRelations)
  }
}

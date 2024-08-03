import { IUseCase, IUseCaseOptions, NotFoundError, ITransactionManager, ITransactionAware } from '@hatsuportal/platform'
import { AddCommentInputDTO, CommentWithRelationsDTO } from '../../../dtos'
import { Comment, CommentId, ICommentWriteRepository } from '../../../../domain'
import { ICommentApplicationMapper } from '../../../mappers/CommentApplicationMapper'
import { ICommentLookupService } from '../../../services/comment/CommentLookupService'
import { UnixTimestamp } from '@hatsuportal/shared-kernel'

export interface IAddCommentUseCaseOptions extends IUseCaseOptions {
  addCommentInput: AddCommentInputDTO
  commentCreated(comment: CommentWithRelationsDTO): void
}

export type IAddCommentUseCase = IUseCase<IAddCommentUseCaseOptions>

export class AddCommentUseCase implements IAddCommentUseCase {
  constructor(
    private readonly commentRepository: ICommentWriteRepository & ITransactionAware,
    private readonly commentMapper: ICommentApplicationMapper,
    private readonly commentLookupService: ICommentLookupService,
    private readonly transactionManager: ITransactionManager<CommentId, UnixTimestamp>
  ) {}

  public async execute(options: IAddCommentUseCaseOptions): Promise<void> {
    const { addCommentInput, commentCreated } = options

    const [savedComment] = await this.transactionManager.execute<[Comment]>(async () => {
      const comment = this.commentMapper.createInputToDomainEntity(addCommentInput)
      const savedComment = await this.commentRepository.insert(comment)

      return [savedComment]
    }, [this.commentRepository])

    const dtoWithRelations = await this.commentLookupService.getById(savedComment.id)

    if (!dtoWithRelations) {
      throw new NotFoundError('Comment created but not found in lookup service.')
    }

    commentCreated(dtoWithRelations)
  }
}

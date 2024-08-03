import { IUseCase, IUseCaseOptions, NotFoundError, ITransactionManager, ITransactionAware } from '@hatsuportal/platform'
import { AddCommentInputDTO, CommentWithRelationsDTO } from '../../../dtos'
import { Comment, CommentAuthorId, CommentId, ICommentWriteRepository, PostId } from '../../../../domain'
import { ICommentLookupService } from '../../../services/comment/CommentLookupService'
import { NonEmptyString, UnixTimestamp } from '@hatsuportal/shared-kernel'
import { unixtimeNow, uuid } from '@hatsuportal/common'

export interface IAddCommentUseCaseOptions extends IUseCaseOptions {
  addCommentInput: AddCommentInputDTO
  commentCreated(comment: CommentWithRelationsDTO): void
}

export type IAddCommentUseCase = IUseCase<IAddCommentUseCaseOptions>

export class AddCommentUseCase implements IAddCommentUseCase {
  constructor(
    private readonly commentRepository: ICommentWriteRepository & ITransactionAware,
    private readonly commentLookupService: ICommentLookupService,
    private readonly transactionManager: ITransactionManager<CommentId, UnixTimestamp>
  ) {}

  public async execute(options: IAddCommentUseCaseOptions): Promise<void> {
    const { addCommentInput, commentCreated } = options
    const now = unixtimeNow()

    const [savedComment] = await this.transactionManager.execute<[Comment]>(async () => {
      const comment = Comment.create({
        id: new CommentId(uuid()),
        postId: new PostId(addCommentInput.postId),
        authorId: new CommentAuthorId(addCommentInput.authorId),
        body: new NonEmptyString(addCommentInput.body),
        parentCommentId: addCommentInput.parentCommentId ? new CommentId(addCommentInput.parentCommentId) : CommentId.NOT_SET,
        isDeleted: false,
        createdAt: new UnixTimestamp(now),
        updatedAt: new UnixTimestamp(now)
      })
      await this.commentRepository.insert(comment)

      return [comment]
    }, [this.commentRepository])

    const dtoWithRelations = await this.commentLookupService.getById(savedComment.id)

    if (!dtoWithRelations) {
      throw new NotFoundError('Comment created but not found in lookup service.')
    }

    commentCreated(dtoWithRelations)
  }
}

import { IUseCase, IUseCaseOptions, NotFoundError, IUnitOfWork } from '@hatsuportal/platform'
import { AddCommentInputDTO, CommentWithRelationsDTO } from '../../../dtos'
import { Comment, CommentAuthorId, CommentBody, CommentId, ICommentWriteRepository, PostId } from '../../../../domain'
import { ICommentLookupService } from '../../../services/comment/CommentLookupService'
import { CreatedAtTimestamp, UnixTimestamp } from '@hatsuportal/shared-kernel'
import { unixtimeNow, uuid } from '@hatsuportal/common'

export interface IAddCommentUseCaseOptions extends IUseCaseOptions {
  addCommentInput: AddCommentInputDTO
  commentCreated(comment: CommentWithRelationsDTO): void
}

export type IAddCommentUseCase = IUseCase<IAddCommentUseCaseOptions>

export class AddCommentUseCase implements IAddCommentUseCase {
  constructor(
    private readonly commentRepository: ICommentWriteRepository,
    private readonly commentLookupService: ICommentLookupService,
    private readonly unitOfWork: IUnitOfWork
  ) {}

  public async execute(options: IAddCommentUseCaseOptions): Promise<void> {
    const { addCommentInput, commentCreated } = options

    const [savedComment] = await this.unitOfWork.execute<[Comment]>(async () => {
      const now = unixtimeNow()
      const comment = Comment.create({
        id: new CommentId(uuid()),
        postId: new PostId(addCommentInput.postId),
        authorId: new CommentAuthorId(addCommentInput.authorId),
        body: new CommentBody(addCommentInput.body),
        parentCommentId: addCommentInput.parentCommentId ? new CommentId(addCommentInput.parentCommentId) : null,
        isDeleted: false,
        createdAt: new CreatedAtTimestamp(now),
        updatedAt: new UnixTimestamp(now)
      })
      await this.commentRepository.insert(comment)
      return [comment]
    })

    const dtoWithRelations = await this.commentLookupService.getById(savedComment.id)

    if (!dtoWithRelations) {
      throw new NotFoundError('Comment created but not found in lookup service.')
    }

    commentCreated(dtoWithRelations)
  }
}

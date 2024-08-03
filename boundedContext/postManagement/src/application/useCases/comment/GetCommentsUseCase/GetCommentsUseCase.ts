import { IUseCase, IUseCaseOptions } from '@hatsuportal/platform'
import { OrderEnum } from '@hatsuportal/common'
import { CommentListChunkDTO, GetCommentsInputDTO } from '../../../dtos'
import { ICommentLookupService } from '../../../services/comment/CommentLookupService'
import { CommentCursor, PostId } from '../../../../domain'
import { NonNegativeInteger } from '@hatsuportal/shared-kernel'

export interface IGetCommentsUseCaseOptions extends IUseCaseOptions {
  defaultSortOrder: OrderEnum
  defaultRepliesPreviewLimit: NonNegativeInteger
  getCommentsInput: GetCommentsInputDTO
  commentsFound(comments: CommentListChunkDTO): void
}

export type IGetCommentsUseCase = IUseCase<IGetCommentsUseCaseOptions>

export class GetCommentsUseCase implements IGetCommentsUseCase {
  constructor(private readonly commentLookupService: ICommentLookupService) {}

  async execute({
    getCommentsInput,
    commentsFound,
    defaultSortOrder,
    defaultRepliesPreviewLimit
  }: IGetCommentsUseCaseOptions): Promise<void> {
    const comments = await this.commentLookupService.listTopLevelForPost(new PostId(getCommentsInput.postId), {
      limit: new NonNegativeInteger(getCommentsInput.limit),
      cursor: getCommentsInput.cursor ? CommentCursor.fromCursorString(getCommentsInput.cursor) : undefined,
      sort: getCommentsInput.sort ?? defaultSortOrder,
      replyPreviewOptions: {
        perParentLimit: defaultRepliesPreviewLimit
      }
    })
    commentsFound(comments)
  }
}

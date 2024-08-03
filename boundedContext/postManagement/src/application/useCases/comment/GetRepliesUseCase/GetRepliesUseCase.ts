import { IUseCase, IUseCaseOptions } from '@hatsuportal/platform'
import { OrderEnum } from '@hatsuportal/common'
import { GetRepliesInputDTO, RepliesPreviewDTO } from '../../../dtos'
import { ICommentLookupService } from '../../../services/comment/CommentLookupService'
import { CommentCursor, PostId } from '../../../../domain'
import { NonNegativeInteger } from '@hatsuportal/shared-kernel'

export interface IGetRepliesUseCaseOptions extends IUseCaseOptions {
  defaultRepliesSortOrder: OrderEnum
  getRepliesInput: GetRepliesInputDTO
  repliesFound(replies: RepliesPreviewDTO): void
}

export type IGetRepliesUseCase = IUseCase<IGetRepliesUseCaseOptions>

export class GetRepliesUseCase implements IGetRepliesUseCase {
  constructor(private readonly commentLookupService: ICommentLookupService) {}

  async execute({ getRepliesInput, repliesFound, defaultRepliesSortOrder }: IGetRepliesUseCaseOptions): Promise<void> {
    const replies = await this.commentLookupService.listReplies(new PostId(getRepliesInput.parentCommentId), {
      limit: new NonNegativeInteger(getRepliesInput.limit),
      cursor: getRepliesInput.cursor ? CommentCursor.fromCursorString(getRepliesInput.cursor) : undefined,
      sort: defaultRepliesSortOrder
    })
    repliesFound(replies)
  }
}

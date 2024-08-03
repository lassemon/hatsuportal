import { AuthenticationError } from '@hatsuportal/platform'
import { OrderEnum } from '@hatsuportal/common'
import { NonNegativeInteger } from '@hatsuportal/shared-kernel'
import { IUserGateway } from '../../acl/userManagement/IUserGateway'
import { CommentId, PostId } from '../../../domain'
import {
  CommentListChunkDTO,
  CommentReadModelDTO,
  CommentWithRelationsDTO,
  RepliesPreviewDTO,
  ReplyDTO,
  ReplyReadModelDTO
} from '../../dtos'
import { CommentCursor } from '../../../domain/valueObjects/CommentCursor'
import { ICommentReadRepository } from '../../read/ICommentReadRepository'

export interface ICommentLookupService {
  getById(id: CommentId): Promise<CommentWithRelationsDTO | null>
  listTopLevelForPost(
    postId: PostId,
    options: {
      limit: NonNegativeInteger
      sort: OrderEnum
      cursor?: CommentCursor
      replyPreviewOptions: { perParentLimit: NonNegativeInteger }
    }
  ): Promise<CommentListChunkDTO>
  listReplies(
    parentCommentId: CommentId,
    options: { limit: NonNegativeInteger; sort: OrderEnum; cursor?: CommentCursor }
  ): Promise<RepliesPreviewDTO>
  countForPost(postId: PostId): Promise<number>
  countReplies(parentCommentId: CommentId): Promise<number>
}

export class CommentLookupService implements ICommentLookupService {
  constructor(private readonly commentReadRepository: ICommentReadRepository, private readonly userGateway: IUserGateway) {}

  async getById(id: CommentId): Promise<CommentWithRelationsDTO | null> {
    const comment = await this.commentReadRepository.getById(id)
    if (!comment) return null
    return this.enrichOneComment(comment, null)
  }

  async listTopLevelForPost(
    postId: PostId,
    options: {
      limit: NonNegativeInteger
      sort: OrderEnum
      cursor?: CommentCursor
      replyPreviewOptions: { perParentLimit: NonNegativeInteger }
    }
  ): Promise<CommentListChunkDTO> {
    const { comments, nextCursor } = await this.commentReadRepository.listTopLevelForPost(postId, options)
    return {
      comments: await this.enrichManyComments(comments, nextCursor),
      nextCursor: nextCursor
    }
  }

  async listReplies(
    parentCommentId: CommentId,
    options: { limit: NonNegativeInteger; sort: OrderEnum; cursor?: CommentCursor }
  ): Promise<RepliesPreviewDTO> {
    const { replies, nextCursor } = await this.commentReadRepository.listReplies(parentCommentId, options)
    return {
      replies: await Promise.all(replies.map((reply) => this.enrichOneReply(reply))),
      nextCursor: nextCursor
    }
  }

  async countForPost(postId: PostId): Promise<number> {
    return this.commentReadRepository.countForPost(postId)
  }

  async countReplies(parentCommentId: CommentId): Promise<number> {
    return this.commentReadRepository.countReplies(parentCommentId)
  }

  private async enrichManyComments(baseComments: CommentReadModelDTO[], nextCursor: string | null): Promise<CommentWithRelationsDTO[]> {
    return Promise.all(baseComments.map((comment) => this.enrichOneComment(comment, nextCursor)))
  }

  private async enrichOneComment(baseComment: CommentReadModelDTO, nextCursor: string | null): Promise<CommentWithRelationsDTO> {
    const userLoadResult = await this.userGateway.getUserById({ userId: baseComment.authorId })
    if (userLoadResult.isFailed()) {
      throw new AuthenticationError('User not found')
    }

    const user = userLoadResult.value

    const repliesPreview = await Promise.all(
      baseComment.repliesPreview.replies.map(async (reply) => {
        const replyUserLoadResult = await this.userGateway.getUserById({ userId: reply.authorId })
        if (replyUserLoadResult.isFailed()) {
          throw new AuthenticationError('User not found')
        }
        const replyUser = replyUserLoadResult.value
        return {
          id: reply.id,
          authorId: reply.authorId,
          authorName: replyUser.name,
          body: reply.body,
          isDeleted: reply.isDeleted,
          createdAt: reply.createdAt
        }
      })
    )

    return {
      id: baseComment.id,
      postId: baseComment.postId,
      authorId: baseComment.authorId,
      authorName: user.name,
      body: baseComment.body,
      parentCommentId: baseComment.parentCommentId,
      isDeleted: baseComment.isDeleted,
      createdAt: baseComment.createdAt,
      updatedAt: baseComment.updatedAt,
      replyCount: baseComment.replyCount,
      hasReplies: baseComment.hasReplies,
      repliesPreview: {
        replies: repliesPreview,
        nextCursor: baseComment.repliesPreview.nextCursor
      },
      nextCursor: nextCursor
    }
  }

  private async enrichOneReply(baseReply: ReplyReadModelDTO): Promise<ReplyDTO> {
    const userLoadResult = await this.userGateway.getUserById({ userId: baseReply.authorId })
    if (userLoadResult.isFailed()) {
      throw new AuthenticationError('User not found')
    }
    const user = userLoadResult.value
    return {
      id: baseReply.id,
      authorId: baseReply.authorId,
      authorName: user.name,
      body: baseReply.body,
      isDeleted: baseReply.isDeleted,
      createdAt: baseReply.createdAt
    }
  }
}

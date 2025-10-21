import {
  CommentCursor,
  CommentDatabaseSchema,
  CommentId,
  CommentListChunkReadModelDTO,
  CommentReadModelDTO,
  ICommentInfrastructureMapper,
  ICommentReadRepository,
  PostId,
  ReplyListChunkReadModelDTO
} from '@hatsuportal/post-management'
import { Repository } from './Repository'
import config from '../../config'
import { NotFoundError, OrderEnum } from '@hatsuportal/foundation'
import { NonNegativeInteger } from '@hatsuportal/shared-kernel'

export class CommentReadRepository extends Repository implements ICommentReadRepository {
  constructor(private readonly commentMapper: ICommentInfrastructureMapper) {
    super('comments')
  }

  async getById(id: CommentId): Promise<CommentReadModelDTO> {
    const database = await this.databaseOrTransaction()
    const result = await database(this.tableName)
      .select([
        'id',
        'postId',
        'authorId',
        // Null the body when soft-deleted:
        database.raw('CASE WHEN is_deleted THEN NULL ELSE body END AS body'),
        'isDeleted',
        'parentCommentId',
        'createdAt',
        'updatedAt',
        database.raw('(SELECT count(*) FROM comments AS reply WHERE reply.parent_comment_id = comments.id) AS reply_count'),
        database.raw('((SELECT count(*) FROM comments AS reply WHERE reply.parent_comment_id = comments.id) > 0) AS has_replies')
      ])
      .from<any, CommentDatabaseSchema[]>(this.tableName)
      .where('id', id.value)
      .first()
    if (!result) throw new NotFoundError(`Comment ${id.value} not found.`)
    const replies = await this.getRepliesMap([id.value], {
      limit: config.comment.defaultRepliesPreviewLimit,
      cursor: undefined,
      sort: config.comment.defaultRepliesSortOrder
    })
    return this.commentMapper.toDTO(result, replies[id.value] ?? { replies: [], nextCursor: null })
  }

  async listTopLevelForPost(
    postId: PostId,
    options: {
      limit: NonNegativeInteger
      sort: OrderEnum
      cursor?: CommentCursor
      replyPreviewOptions: { perParentLimit: NonNegativeInteger }
    }
  ): Promise<CommentListChunkReadModelDTO> {
    const database = await this.databaseOrTransaction()
    const { limit, cursor, sort } = options

    const isDesc = sort === OrderEnum.Descending
    const base = database(this.tableName).where('post_id', postId.value).whereNull('parent_comment_id')

    // --- keyset cursor ---
    if (cursor) {
      if (cursor.parentId !== null) this.throwDataPersistenceError('Cursor parentId must be null for top-level listing')
      // Postgres row-wise comparison for deterministic keyset:
      // newer-first (DESC): fetch strictly "less than" the last tuple
      // older-first  (ASC): fetch strictly "greater than" the last tuple
      const op = isDesc ? '<' : '>'
      base.andWhereRaw('(created_at, id) ' + op + ' (?, ?)', [cursor.createdAt, cursor.id])
    }

    // --- select with per-item replyCount/hasReplies ---
    // Using correlated subqueries keeps it simple and avoids GROUP BY noise.
    const rows = await base
      .select([
        'id',
        'postId',
        'authorId',
        // Null the body when soft-deleted:
        database.raw('CASE WHEN is_deleted THEN NULL ELSE body END AS body'),
        'isDeleted',
        'parentCommentId',
        'createdAt',
        'updatedAt',
        database.raw('(SELECT count(*) FROM comments AS reply WHERE reply.parent_comment_id = comments.id) AS reply_count'),
        database.raw('((SELECT count(*) FROM comments AS reply WHERE reply.parent_comment_id = comments.id) > 0) AS has_replies')
      ])
      .from<any, CommentDatabaseSchema[]>(this.tableName)
      .orderBy('createdAt', sort)
      .orderBy('id', sort)
      .limit(limit.value + 1) // +1 to detect next page

    // --- chunk slicing & next cursor ---
    let hasMore = false
    let chunk = rows
    if (rows.length > limit.value) {
      hasMore = true
      chunk = rows.slice(0, limit.value)
    }

    // map to read-model DTOs (ensure numeric types if pg returns strings)
    const items: CommentReadModelDTO[] = chunk.map((record) => ({
      id: record.id,
      postId: record.postId,
      authorId: record.authorId,
      body: record.body, // already nulled if deleted
      parentCommentId: record.parentCommentId, // always null for top-level
      isDeleted: !!record.isDeleted,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      replyCount: record.replyCount || 0,
      hasReplies: !!record.hasReplies,
      repliesPreview: {
        replies: [],
        nextCursor: null
      }
    }))

    const last = items[items.length - 1]
    const nextCursor = hasMore && last ? new CommentCursor(null, last.createdAt, last.id).value : null

    // --- replies preview (batched) ---
    if (items.length > 0) {
      const parentIds = items.map((i) => i.id)
      // group into map
      const perParent = options.replyPreviewOptions?.perParentLimit ?? 0
      const repliesMap = await this.getRepliesMap(parentIds, {
        limit: perParent,
        cursor: undefined,
        sort: config.comment.defaultRepliesSortOrder
      })

      items.forEach((item) => {
        item.repliesPreview = {
          replies: repliesMap[item.id]?.replies || [],
          nextCursor: repliesMap[item.id]?.nextCursor ?? null
        }
      })
    }

    return {
      comments: items,
      nextCursor
    }
  }

  private async getRepliesMap(
    parentIds: string[],
    options: { limit: NonNegativeInteger; sort: OrderEnum; cursor?: CommentCursor }
  ): Promise<Record<string, { replies: ReplyListChunkReadModelDTO['replies']; nextCursor: string | null }>> {
    const database = await this.databaseOrTransaction()
    const { limit, cursor, sort } = options
    const order: OrderEnum = sort ?? config.comment.defaultRepliesSortOrder

    const isDesc = order === OrderEnum.Descending

    const base = database(this.tableName).whereIn('parentCommentId', parentIds).whereNotNull('parent_comment_id')

    if (cursor) {
      if (cursor.parentId === null) this.throwDataPersistenceError('Cursor parentId must be not null for replies listing')
      // Postgres row-wise comparison for deterministic keyset:
      // newer-first (DESC): fetch strictly "less than" the last tuple
      // older-first  (ASC): fetch strictly "greater than" the last tuple
      const op = isDesc ? '<' : '>'
      base.andWhereRaw('(created_at, id) ' + op + ' (?, ?)', [cursor.createdAt, cursor.id])
    }

    const previewRows = await base
      .select([
        'id',
        'postId',
        'authorId',
        database.raw('CASE WHEN is_deleted THEN NULL ELSE body END AS body'),
        'isDeleted',
        'createdAt',
        'parentCommentId',
        database.raw('row_number() over (partition by parent_comment_id order by created_at asc, id asc) as row_number'),
        database.raw('count(*) over (partition by parent_comment_id) as total_count')
      ])
      .from<
        any,
        Array<
          CommentDatabaseSchema & {
            rowNumber: number
            totalCount: number
          }
        >
      >(this.tableName)
      .orderBy('parentCommentId', 'asc')
      .orderBy('createdAt', 'asc')
      .orderBy('id', 'asc')

    // group into map
    const map: Record<string, { replies: ReplyListChunkReadModelDTO['replies']; nextCursor: string | null }> = {}
    for (const row of previewRows) {
      const parentId: string = row.parentCommentId!
      if (!map[parentId]) map[parentId] = { replies: [], nextCursor: null }

      if (Number(row.rowNumber) <= limit.value) {
        map[parentId].replies.push({
          id: row.id,
          authorId: row.authorId,
          body: row.body,
          isDeleted: !!row.isDeleted,
          createdAt: row.createdAt
        })
      }

      const total = Number(row.totalCount)
      if (total > limit.value) {
        // give a per-parent cursor starting after the last included preview item
        const lastPreview = map[parentId].replies[map[parentId].replies.length - 1]
        if (lastPreview) {
          map[parentId].nextCursor = new CommentCursor(parentId, lastPreview.createdAt, lastPreview.id).value
        } else {
          map[parentId].nextCursor = null
        }
      }
    }

    return map
  }

  async listReplies(
    parentCommentId: CommentId,
    options: { limit: NonNegativeInteger; sort: OrderEnum; cursor?: CommentCursor }
  ): Promise<ReplyListChunkReadModelDTO> {
    const replies = await this.getRepliesMap([parentCommentId.value], options)
    return {
      replies: replies[parentCommentId.value]?.replies || [],
      nextCursor: replies[parentCommentId.value]?.nextCursor
    }
  }

  async countForPost(postId: PostId): Promise<number> {
    const database = await this.databaseOrTransaction()
    const result = await database(this.tableName).where('postId', postId.value).count('id as count').first()
    return result ? Number(result.count) : 0
  }

  async countReplies(parentCommentId: CommentId): Promise<number> {
    const database = await this.databaseOrTransaction()
    const result = await database(this.tableName).where('parentCommentId', parentCommentId.value).count('id as count').first()
    return result ? Number(result.count) : 0
  }
}

import { uuid } from '@hatsuportal/common'
import {
  Comment,
  CommentBody,
  CommentAuthorId,
  CommentId,
  CommentInfrastructureMapper,
  CommentWriteRepository,
  PostId
} from '@hatsuportal/post-management'
import { CreatedAtTimestamp, UnixTimestamp } from '@hatsuportal/shared-kernel'
import { PersistenceHarness } from '../persistence/PersistenceHarness'
import { seedStoryFixture } from './storyFixture'

export type SeedCommentFixtureOptions = {
  authorId: string
  createdById?: string
}

export type SeedRepliesFixtureOptions = {
  authorId: string
  createdById: string
  replyCreatedAtValues: number[]
}

export function createCommentWriteRepository(persistenceHarness: PersistenceHarness): CommentWriteRepository {
  return new CommentWriteRepository(
    persistenceHarness.dataAccessProvider,
    persistenceHarness.repositoryHelpers,
    persistenceHarness.transactionContext,
    new CommentInfrastructureMapper()
  )
}

export async function seedCommentFixture(
  persistenceHarness: PersistenceHarness,
  unitFixture: {
    storyMock: typeof import('../../testFactory').storyMock
    commentMock: typeof import('../../testFactory').commentMock
  },
  { authorId, createdById = authorId }: SeedCommentFixtureOptions
): Promise<{ comment: Comment; commentWriteRepository: CommentWriteRepository; storyId: string }> {
  const { story } = await seedStoryFixture(persistenceHarness, unitFixture, { createdById })
  const comment = unitFixture.commentMock({
    id: new CommentId(uuid()),
    postId: story.id,
    authorId: new CommentAuthorId(authorId)
  })
  const commentWriteRepository = createCommentWriteRepository(persistenceHarness)

  await persistenceHarness.createUnitOfWork().execute(async () => {
    await commentWriteRepository.insert(comment)
    return [null]
  })

  return { comment, commentWriteRepository, storyId: story.id.value }
}

export async function seedCommentWithRepliesFixture(
  persistenceHarness: PersistenceHarness,
  unitFixture: {
    storyMock: typeof import('../../testFactory').storyMock
    commentMock: typeof import('../../testFactory').commentMock
  },
  { authorId, createdById, replyCreatedAtValues }: SeedRepliesFixtureOptions
): Promise<{
  parentComment: Comment
  replies: Comment[]
  storyId: string
}> {
  const { comment: parentComment, storyId } = await seedCommentFixture(persistenceHarness, unitFixture, {
    authorId,
    createdById
  })
  const commentWriteRepository = createCommentWriteRepository(persistenceHarness)
  const replies: Comment[] = []

  for (const createdAtValue of replyCreatedAtValues) {
    const reply = unitFixture.commentMock({
      id: new CommentId(uuid()),
      postId: new PostId(storyId),
      authorId: new CommentAuthorId(authorId),
      parentCommentId: parentComment.id,
      body: new CommentBody(`reply-${createdAtValue}`),
      createdAt: new CreatedAtTimestamp(createdAtValue),
      updatedAt: new UnixTimestamp(createdAtValue)
    })

    await persistenceHarness.createUnitOfWork().execute(async () => {
      await commentWriteRepository.insert(reply)
      return [null]
    })

    replies.push(reply)
  }

  return { parentComment, replies, storyId }
}

import { uuid } from '@hatsuportal/common'
import { Comment, CommentAuthorId, CommentId, PostId } from '../../../domain'
import { CommentWriteRepository } from '../../../infrastructure/repositories/CommentWriteRepository'
import { CommentInfrastructureMapper } from '../../../infrastructure/mappers/CommentInfrastructureMapper'
import { PersistenceHarness } from '../persistence/PersistenceHarness'
import { seedStoryFixture } from './storyFixture'

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
    sampleUserId: string
  },
  postId?: string
): Promise<{ comment: Comment; commentWriteRepository: CommentWriteRepository; storyId: string }> {
  const storyId = postId ?? (await seedStoryFixture(persistenceHarness, unitFixture)).story.id.value
  const comment = unitFixture.commentMock({
    id: new CommentId(uuid()),
    postId: new PostId(storyId),
    authorId: new CommentAuthorId(unitFixture.sampleUserId)
  })
  const commentWriteRepository = createCommentWriteRepository(persistenceHarness)

  await persistenceHarness.createUnitOfWork().execute(async () => {
    await commentWriteRepository.insert(comment)
    return [null]
  })

  return { comment, commentWriteRepository, storyId }
}

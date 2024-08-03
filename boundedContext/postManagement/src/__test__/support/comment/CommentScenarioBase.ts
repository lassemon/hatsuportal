import { expect, vi } from 'vitest'
import * as Fixture from '../../testFactory'
import { ScenarioBase } from '../ScenarioBase'
import { NotFoundError } from '@hatsuportal/platform'
import {
  CommentAuthorId,
  CommentCreatedEvent,
  CommentDeletedEvent,
  CommentId,
  CommentSoftDeletedEvent,
  CommentUpdatedEvent,
  ICommentWriteRepository
} from '../../../domain'
import {
  CommentApplicationMapper,
  CommentReadModelDTO,
  CommentWithRelationsDTO,
  ICommentLookupService,
  IPostReadRepository,
  PostDTO
} from '../../../application'

/** Convenience map for domain-event assertions */
export const CommentDomainEvents = {
  CommentCreatedEvent,
  CommentUpdatedEvent,
  CommentSoftDeletedEvent,
  CommentDeletedEvent
}

export abstract class CommentScenarioBase<INPUT, CALLBACKS extends string> extends ScenarioBase<
  INPUT,
  CALLBACKS,
  typeof CommentDomainEvents
> {
  protected readonly commentWriteRepository = Fixture.commentWriteRepositoryMock()
  protected readonly commentReadRepository = Fixture.commentReadRepositoryMock()
  protected readonly commentLookupService = Fixture.commentLookupServiceMock()
  protected readonly postReadRepository = Fixture.postReadRepositoryMock()
  protected readonly commentMapper = new CommentApplicationMapper()

  protected constructor(callbackNames: CALLBACKS[]) {
    super(callbackNames, CommentDomainEvents)
    this.commentWriteRepository.insert = vi.fn().mockImplementation((comment) => comment)
    this.commentWriteRepository.update = vi.fn().mockImplementation((comment) => comment)
  }

  withExistingComment(comment = Fixture.commentMock()) {
    this.commentWriteRepository.findByIdForUpdate = vi.fn().mockResolvedValue(comment)
    this.commentReadRepository.getById = vi.fn().mockResolvedValue(
      Fixture.commentReadModelDTOMock({
        id: comment.id.value,
        postId: comment.postId.value,
        authorId: comment.authorId.value,
        body: comment.body?.value ?? null,
        parentCommentId: comment.parentCommentId?.value ?? null,
        isDeleted: comment.isDeleted,
        createdAt: comment.createdAt.value,
        updatedAt: comment.updatedAt.value
      })
    )
    this.commentLookupService.getById = vi.fn().mockResolvedValue(Fixture.commentWithRelationsDTOMock({ id: comment.id.value }))
    return this
  }

  withDeletedComment(comment = Fixture.commentMock({ isDeleted: true, body: null })) {
    return this.withExistingComment(comment)
  }

  withoutExistingComment() {
    this.commentWriteRepository.findByIdForUpdate = vi.fn().mockResolvedValue(null)
    this.commentReadRepository.getById = vi.fn().mockRejectedValue(new NotFoundError('Comment not found.'))
    this.commentLookupService.getById = vi.fn().mockResolvedValue(null)
    return this
  }

  withCommentOwnedByOtherUser() {
    const otherAuthorId = new CommentAuthorId(Fixture.sampleNonAuthorUserId)
    const comment = Fixture.commentMock({ authorId: otherAuthorId })
    return this.withExistingComment(comment)
  }

  withExistingPost(post: PostDTO = Fixture.postDTOMock()) {
    this.postReadRepository.findById = vi.fn().mockResolvedValue(post)
    return this
  }

  withoutExistingPost() {
    this.postReadRepository.findById = vi.fn().mockResolvedValue(null)
    return this
  }

  withParentComment(comment = Fixture.commentMock({ id: new CommentId(Fixture.sampleParentCommentId) })) {
    this.commentWriteRepository.findByIdForUpdate = vi.fn().mockResolvedValue(comment)
    this.commentReadRepository.getById = vi.fn().mockResolvedValue(
      Fixture.commentReadModelDTOMock({
        id: comment.id.value,
        postId: comment.postId.value,
        authorId: comment.authorId.value,
        body: comment.body?.value ?? null,
        parentCommentId: comment.parentCommentId?.value ?? null,
        isDeleted: comment.isDeleted,
        createdAt: comment.createdAt.value,
        updatedAt: comment.updatedAt.value
      })
    )
    return this
  }

  withCommentReadModel(overrides: Partial<CommentReadModelDTO> = {}) {
    this.commentReadRepository.getById = vi.fn().mockResolvedValue(Fixture.commentReadModelDTOMock(overrides))
    return this
  }

  withCommentWithRelations(overrides: Partial<CommentWithRelationsDTO> = {}) {
    this.commentLookupService.getById = vi.fn().mockResolvedValue(Fixture.commentWithRelationsDTOMock(overrides))
    return this
  }

  lookupServiceWillReject(method: keyof ICommentLookupService, error: Error = new Error('Lookup service failure')) {
    // @ts-expect-error – the mock infra object definitely has this key
    this.commentLookupService[method] = vi.fn().mockRejectedValue(error)
    return this
  }

  writeRepositoryWillReject(method: keyof ICommentWriteRepository, error: Error = new Error('Repository failure')) {
    // @ts-expect-error – the mock infra object definitely has this key
    this.commentWriteRepository[method] = vi.fn().mockRejectedValue(error)
    return this
  }

  postReadRepositoryWillReject(method: keyof IPostReadRepository, error: Error = new Error('Repository failure')) {
    // @ts-expect-error – the mock infra object definitely has this key
    this.postReadRepository[method] = vi.fn().mockRejectedValue(error)
    return this
  }

  thenWriteRepositoryCalledTimes(method: keyof ICommentWriteRepository, times: number) {
    this.ensureExecutionCompleted()
    this.ensureNoUnexpectedError()
    expect(this.commentWriteRepository[method]).toHaveBeenCalledTimes(times)
    return this
  }

  thenCommentLookupServiceCalledTimes(method: keyof ICommentLookupService, times: number) {
    this.ensureExecutionCompleted()
    this.ensureNoUnexpectedError()
    expect(this.commentLookupService[method]).toHaveBeenCalledTimes(times)
    return this
  }

  thenDomainEventServiceCalledTimes(times: number) {
    this.ensureExecutionCompleted()
    this.ensureNoUnexpectedError()
    expect(this.domainEventService.persistToOutbox).toHaveBeenCalledTimes(times)
    return this
  }
}

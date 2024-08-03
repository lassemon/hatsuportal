import { describe, expect, it } from 'vitest'
import { UserRoleEnum } from '@hatsuportal/common'
import { AbacEngine, IUserForAuthorization, UserToRequesterMapper } from '@hatsuportal/platform'
import { CommentAuthorizationService } from './CommentAuthorizationService'
import { CommentAction, CommentAuthorizationPayloadMap, commentRequestBuilderMap, commentRuleMap } from '../rules/comment.rules'
import * as Fixture from '../../../__test__/testFactory'

const createAuthorizationService = () =>
  new CommentAuthorizationService(
    new UserToRequesterMapper(),
    new AbacEngine<CommentAction, CommentAuthorizationPayloadMap>(commentRuleMap, commentRequestBuilderMap)
  )

describe('CommentAuthorizationService', () => {
  const service = createAuthorizationService()
  const post = Fixture.postDTOMock()
  const comment = Fixture.commentDTOMock()
  const deletedComment = Fixture.commentDTOMock({ isDeleted: true })
  const parentComment = Fixture.commentDTOMock({ id: Fixture.sampleParentCommentId })

  it('allows add comment for active logged-in user', () => {
    const user: IUserForAuthorization = {
      id: Fixture.sampleUserId,
      name: 'Commenter',
      roles: [UserRoleEnum.Viewer],
      active: true
    }

    expect(service.canAddComment(user, post).allowed).toBe(true)
  })

  it('denies add comment for inactive user', () => {
    const user: IUserForAuthorization = {
      id: Fixture.sampleUserId,
      name: 'Inactive User',
      roles: [UserRoleEnum.Viewer],
      active: false
    }

    expect(service.canAddComment(user, post).allowed).toBe(false)
  })

  it('allows add reply for active logged-in user', () => {
    const user: IUserForAuthorization = {
      id: Fixture.sampleUserId,
      name: 'Replier',
      roles: [UserRoleEnum.Viewer],
      active: true
    }

    expect(service.canAddReply(user, post, parentComment).allowed).toBe(true)
  })

  it('allows edit for comment author', () => {
    const author: IUserForAuthorization = {
      id: Fixture.sampleUserId,
      name: 'Author',
      roles: [UserRoleEnum.Viewer],
      active: true
    }

    expect(service.canEditComment(author, comment).allowed).toBe(true)
  })

  it('denies edit for non-author', () => {
    const otherUser: IUserForAuthorization = {
      id: Fixture.sampleNonAuthorUserId,
      name: 'Other User',
      roles: [UserRoleEnum.Viewer],
      active: true
    }

    const decision = service.canEditComment(otherUser, comment)
    expect(decision.allowed).toBe(false)
    expect(decision.reason).toContain('does not have permission to edit this comment')
  })

  it('denies edit for deleted comment', () => {
    const author: IUserForAuthorization = {
      id: Fixture.sampleUserId,
      name: 'Author',
      roles: [UserRoleEnum.Viewer],
      active: true
    }

    const decision = service.canEditComment(author, deletedComment)
    expect(decision.allowed).toBe(false)
    expect(decision.reason).toBe('Cannot edit a deleted comment.')
  })

  it('allows soft delete for comment author', () => {
    const author: IUserForAuthorization = {
      id: Fixture.sampleUserId,
      name: 'Author',
      roles: [UserRoleEnum.Viewer],
      active: true
    }

    expect(service.canSoftDeleteComment(author, comment).allowed).toBe(true)
  })

  it('allows soft delete idempotently for already deleted comment', () => {
    const author: IUserForAuthorization = {
      id: Fixture.sampleUserId,
      name: 'Author',
      roles: [UserRoleEnum.Viewer],
      active: true
    }

    expect(service.canSoftDeleteComment(author, deletedComment).allowed).toBe(true)
  })

  it('allows hard delete for author on soft-deleted comment', () => {
    const author: IUserForAuthorization = {
      id: Fixture.sampleUserId,
      name: 'Author',
      roles: [UserRoleEnum.Creator],
      active: true
    }

    expect(service.canHardDeleteComment(author, deletedComment).allowed).toBe(true)
  })

  it('denies hard delete for admin on non-deleted comment', () => {
    const admin: IUserForAuthorization = {
      id: Fixture.sampleNonAuthorUserId,
      name: 'Admin User',
      roles: [UserRoleEnum.Admin],
      active: true
    }

    const decision = service.canHardDeleteComment(admin, comment)
    expect(decision.allowed).toBe(false)
    expect(decision.reason).toContain('does not have permission to hard delete comment')
  })

  it('allows hard delete for super admin on non-deleted comment', () => {
    const superAdmin: IUserForAuthorization = {
      id: Fixture.sampleNonAuthorUserId,
      name: 'Super Admin',
      roles: [UserRoleEnum.SuperAdmin],
      active: true
    }

    expect(service.canHardDeleteComment(superAdmin, comment).allowed).toBe(true)
  })

  it('allows hard delete for admin on soft-deleted comment', () => {
    const admin: IUserForAuthorization = {
      id: Fixture.sampleNonAuthorUserId,
      name: 'Admin User',
      roles: [UserRoleEnum.Admin],
      active: true
    }
    expect(service.canHardDeleteComment(admin, deletedComment).allowed).toBe(true)
  })

  it('denies hard delete for non-author viewer on soft-deleted comment', () => {
    const viewer: IUserForAuthorization = {
      id: Fixture.sampleNonAuthorUserId,
      name: 'Viewer User',
      roles: [UserRoleEnum.Viewer],
      active: true
    }
    const decision = service.canHardDeleteComment(viewer, deletedComment)
    expect(decision.allowed).toBe(false)
    expect(decision.reason).toContain('does not have permission to hard delete this comment')
  })
})

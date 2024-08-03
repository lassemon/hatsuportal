import { describe, expect, it } from 'vitest'
import { OrderEnum, SortableKeyEnum, UserRoleEnum, VisibilityEnum } from '@hatsuportal/common'
import { AbacEngine, IUserForAuthorization, UserToRequesterMapper } from '@hatsuportal/platform'
import { StoryAuthorizationService } from './StoryAuthorizationService'
import { StoryAction, StoryAuthorizationPayloadMap, storyRequestBuilderMap, storyRuleMap } from '../rules/story.rules'
import * as Fixture from '../../../__test__/testFactory'

const createAuthorizationService = () =>
  new StoryAuthorizationService(
    new UserToRequesterMapper(),
    new AbacEngine<StoryAction, StoryAuthorizationPayloadMap>(storyRuleMap, storyRequestBuilderMap)
  )

describe('StoryAuthorizationService', () => {
  const service = createAuthorizationService()
  const story = Fixture.storyDTOMock()
  const privateStory = { ...Fixture.storyDTOMock(), visibility: VisibilityEnum.Private }

  it('allows create for creator', () => {
    const creator: IUserForAuthorization = {
      id: Fixture.sampleUserId,
      name: 'Creator User',
      roles: [UserRoleEnum.Creator],
      active: true
    }

    expect(service.canCreateStory(creator).allowed).toBe(true)
  })

  it('allows create for admin', () => {
    const admin: IUserForAuthorization = {
      id: Fixture.sampleUserId,
      name: 'Admin User',
      roles: [UserRoleEnum.Admin],
      active: true
    }

    expect(service.canCreateStory(admin).allowed).toBe(true)
  })

  it('denies create for viewer without named requester message branch', () => {
    const viewer: IUserForAuthorization = {
      id: Fixture.sampleUserId,
      name: '',
      roles: [UserRoleEnum.Viewer],
      active: true
    }

    const decision = service.canCreateStory(viewer)
    expect(decision.allowed).toBe(false)
    expect(decision.reason).toBe('Only users with the Creator role can create stories.')
  })

  it('denies create for viewer with named requester message branch', () => {
    const viewer: IUserForAuthorization = {
      id: Fixture.sampleUserId,
      name: 'Viewer User',
      roles: [UserRoleEnum.Viewer],
      active: true
    }

    const decision = service.canCreateStory(viewer)
    expect(decision.allowed).toBe(false)
    expect(decision.reason).toBe('User Viewer User does not have permission to create a story.')
  })

  it('allows update for story author', () => {
    const author: IUserForAuthorization = {
      id: Fixture.sampleUserId,
      name: 'Author',
      roles: [UserRoleEnum.Creator],
      active: true
    }

    expect(service.canUpdateStory(author, story).allowed).toBe(true)
  })

  it('denies update for non-author', () => {
    const otherUser: IUserForAuthorization = {
      id: Fixture.sampleNonAuthorUserId,
      name: 'Other User',
      roles: [UserRoleEnum.Creator],
      active: true
    }

    const decision = service.canUpdateStory(otherUser, story)
    expect(decision.allowed).toBe(false)
    expect(decision.reason).toContain('does not have permission to update this story')
  })

  it('allows delete for story author', () => {
    const author: IUserForAuthorization = {
      id: Fixture.sampleUserId,
      name: 'Author',
      roles: [UserRoleEnum.Creator],
      active: true
    }

    expect(service.canDeleteStory(author, story).allowed).toBe(true)
  })

  it('allows delete for admin on non-owned story', () => {
    const admin: IUserForAuthorization = {
      id: Fixture.sampleNonAuthorUserId,
      name: 'Admin User',
      roles: [UserRoleEnum.Admin],
      active: true
    }

    expect(service.canDeleteStory(admin, story).allowed).toBe(true)
  })

  it('denies delete for non-author non-admin', () => {
    const otherUser: IUserForAuthorization = {
      id: Fixture.sampleNonAuthorUserId,
      name: 'Other User',
      roles: [UserRoleEnum.Creator],
      active: true
    }

    const decision = service.canDeleteStory(otherUser, story)
    expect(decision.allowed).toBe(false)
    expect(decision.reason).toContain('does not have permission to delete this story')
  })

  it('allows super admin to view private story they do not own', () => {
    const superAdmin: IUserForAuthorization = {
      id: Fixture.sampleNonAuthorUserId,
      name: 'Super Admin',
      roles: [UserRoleEnum.SuperAdmin],
      active: true
    }

    expect(service.canViewStory(superAdmin, privateStory).allowed).toBe(true)
  })

  it('denies anonymous user from viewing logged-in-only story', () => {
    const loggedInOnlyStory = { ...Fixture.storyDTOMock(), visibility: VisibilityEnum.LoggedIn }

    const decision = service.canViewStory(null, loggedInOnlyStory)
    expect(decision.allowed).toBe(false)
    expect(decision.reason).toContain('not logged in')
  })

  it('denies anonymous search with visibility filter', () => {
    const decision = service.canSearchStories(null, {
      order: OrderEnum.Ascending,
      orderBy: SortableKeyEnum.TITLE,
      storiesPerPage: 50,
      pageNumber: 0,
      visibility: [VisibilityEnum.Public]
    })

    expect(decision.allowed).toBe(false)
    expect(decision.reason).toContain('Cannot filter by visibility')
  })

  it('denies anonymous search with onlyMyStories filter', () => {
    const decision = service.canSearchStories(null, {
      order: OrderEnum.Ascending,
      orderBy: SortableKeyEnum.TITLE,
      storiesPerPage: 50,
      pageNumber: 0,
      onlyMyStories: true
    })

    expect(decision.allowed).toBe(false)
    expect(decision.reason).toContain('Cannot filter by only my stories')
  })
})

import { describe, expect, it } from 'vitest'
import { AbacEngine, IUserForAuthorization, UserToRequesterMapper } from '@hatsuportal/platform'
import { UserRoleEnum } from '@hatsuportal/common'
import { MediaAuthorizationService } from './MediaAuthorizationService'
import { MediaAction, MediaAuthorizationPayloadMap, mediaRequestBuilderMap, mediaRuleMap } from '../rules/media.rules'
import * as Fixture from '../../../__test__/testFactory'

const createAuthorizationService = () =>
  new MediaAuthorizationService(
    new UserToRequesterMapper(),
    new AbacEngine<MediaAction, MediaAuthorizationPayloadMap>(mediaRuleMap, mediaRequestBuilderMap)
  )

describe('MediaAuthorizationService', () => {
  const service = createAuthorizationService()
  const image = Fixture.imageDTOMock()

  it('allows create for creator', () => {
    const creator: IUserForAuthorization = {
      id: Fixture.sampleUserId,
      name: 'Creator User',
      roles: [UserRoleEnum.Creator],
      active: true
    }

    expect(service.canCreateImage(creator).allowed).toBe(true)
  })

  it('allows create for admin', () => {
    const admin: IUserForAuthorization = {
      id: Fixture.sampleUserId,
      name: 'Admin User',
      roles: [UserRoleEnum.Admin],
      active: true
    }

    expect(service.canCreateImage(admin).allowed).toBe(true)
  })

  it('denies create for viewer without named requester message branch', () => {
    const viewer: IUserForAuthorization = {
      id: Fixture.sampleUserId,
      name: '',
      roles: [UserRoleEnum.Viewer],
      active: true
    }

    const decision = service.canCreateImage(viewer)
    expect(decision.allowed).toBe(false)
    expect(decision.reason).toBe('Only users with the Creator role can create images.')
  })

  it('denies create for viewer with named requester message branch', () => {
    const viewer: IUserForAuthorization = {
      id: Fixture.sampleUserId,
      name: 'Viewer User',
      roles: [UserRoleEnum.Viewer],
      active: true
    }

    const decision = service.canCreateImage(viewer)
    expect(decision.allowed).toBe(false)
    expect(decision.reason).toBe('User Viewer User does not have permission to create images.')
  })

  it('allows update for image author', () => {
    const author: IUserForAuthorization = {
      id: Fixture.sampleUserId,
      name: 'Author',
      roles: [UserRoleEnum.Creator],
      active: true
    }

    expect(service.canUpdateImage(author, image).allowed).toBe(true)
  })

  it('denies update for non-author with reason string', () => {
    const otherUser: IUserForAuthorization = {
      id: Fixture.sampleNonAuthorUserId,
      name: 'Other User',
      roles: [UserRoleEnum.Creator],
      active: true
    }

    const decision = service.canUpdateImage(otherUser, image)
    expect(decision.allowed).toBe(false)
    expect(decision.reason).toContain('does not have permission to update image')
  })

  it('allows delete for image author', () => {
    const author: IUserForAuthorization = {
      id: Fixture.sampleUserId,
      name: 'Author',
      roles: [UserRoleEnum.Creator],
      active: true
    }

    expect(service.canDeleteImage(author, image).allowed).toBe(true)
  })

  it('denies delete for non-author', () => {
    const otherUser: IUserForAuthorization = {
      id: Fixture.sampleNonAuthorUserId,
      name: 'Other User',
      roles: [UserRoleEnum.Creator],
      active: true
    }

    const decision = service.canDeleteImage(otherUser, image)
    expect(decision.allowed).toBe(false)
    expect(decision.reason).toContain('does not have permission to delete image')
  })

  it('denies create for inactive creator', () => {
    const inactiveCreator: IUserForAuthorization = {
      id: Fixture.sampleUserId,
      name: 'Inactive Creator',
      roles: [UserRoleEnum.Creator],
      active: false
    }

    expect(service.canCreateImage(inactiveCreator).allowed).toBe(false)
  })

  it('denies update for admin on another users image', () => {
    const admin: IUserForAuthorization = {
      id: Fixture.sampleNonAuthorUserId,
      name: 'Admin User',
      roles: [UserRoleEnum.Admin],
      active: true
    }

    expect(service.canUpdateImage(admin, image).allowed).toBe(false)
  })

  it('denies delete for admin on another users image', () => {
    const admin: IUserForAuthorization = {
      id: Fixture.sampleNonAuthorUserId,
      name: 'Admin User',
      roles: [UserRoleEnum.Admin],
      active: true
    }

    expect(service.canDeleteImage(admin, image).allowed).toBe(false)
  })

  it.each([
    ['update', 'canUpdateImage' as const],
    ['delete', 'canDeleteImage' as const]
  ])('denies inactive author from %s', (_action, method) => {
    const inactiveAuthor: IUserForAuthorization = {
      id: Fixture.sampleUserId,
      name: 'Author',
      roles: [UserRoleEnum.Creator],
      active: false
    }

    expect(service[method](inactiveAuthor, image).allowed).toBe(false)
  })
})

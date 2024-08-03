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

  it('denies delete for inactive author before author check matters', () => {
    const inactiveAuthor: IUserForAuthorization = {
      id: Fixture.sampleUserId,
      name: 'Author',
      roles: [UserRoleEnum.Creator],
      active: false
    }

    const decision = service.canDeleteImage(inactiveAuthor, image)
    expect(decision.allowed).toBe(false)
  })
})

import { describe, expect, it } from 'vitest'
import { UserRoleEnum } from '@hatsuportal/common'
import type { IAuthorizationRequest } from './abac/types'
import {
  hasRole,
  isAdmin,
  isAuthorOf,
  isSelf,
  isSuperAdmin,
  requesterDisplayName,
  requireAuthorOrAdmin,
  requireLoggedInActive
} from './predicates'

const activeRequester = {
  userId: 'user-1',
  roles: [UserRoleEnum.Viewer],
  attributes: { active: true },
  name: 'Alice'
}

const inactiveRequester = {
  userId: 'user-2',
  roles: [UserRoleEnum.Viewer],
  attributes: { active: false },
  name: 'Bob'
}

const adminRequester = {
  userId: 'admin-1',
  roles: [UserRoleEnum.Admin],
  attributes: { active: true },
  name: 'Admin'
}

const superAdminRequester = {
  userId: 'super-1',
  roles: [UserRoleEnum.SuperAdmin],
  attributes: { active: true },
  name: 'Super'
}

function request(overrides: Partial<IAuthorizationRequest<{ authorId?: string }>> = {}): IAuthorizationRequest<{ authorId?: string }> {
  return {
    action: 'story:read',
    requester: activeRequester,
    resource: { type: 'Story', id: 'story-1', attributes: { authorId: 'user-1' } },
    ...overrides
  }
}

describe('predicates', () => {
  describe('requireLoggedInActive', () => {
    it('denies anonymous callers', () => {
      expect(requireLoggedInActive(request({ requester: null }))).toEqual({
        allowed: false,
        reason: 'User is not logged in.'
      })
    })

    it('denies inactive users with their display name', () => {
      expect(requireLoggedInActive(request({ requester: inactiveRequester }))).toEqual({
        allowed: false,
        reason: 'User Bob is not active.'
      })
    })

    it('returns null for active logged-in users', () => {
      expect(requireLoggedInActive(request())).toBeNull()
    })
  })

  describe('requireAuthorOrAdmin', () => {
    it('returns null when the requester is the author', () => {
      const isAuthor = (req: IAuthorizationRequest) => req.requester?.userId === 'user-1'

      expect(requireAuthorOrAdmin(request(), isAuthor, 'Not allowed')).toBeNull()
    })

    it('returns null when the requester is an admin', () => {
      const isAuthor = () => false

      expect(requireAuthorOrAdmin(request({ requester: adminRequester }), isAuthor, 'Not allowed')).toBeNull()
    })

    it('denies when the requester is neither author nor admin', () => {
      const isAuthor = () => false

      expect(requireAuthorOrAdmin(request({ requester: { ...activeRequester, userId: 'other' } }), isAuthor, 'Custom deny')).toEqual({
        allowed: false,
        reason: 'Custom deny'
      })
    })
  })

  describe('isAuthorOf', () => {
    it('returns true when requester matches the author id', () => {
      expect(
        isAuthorOf(request(), (req) => (req.resource?.attributes as { authorId?: string } | undefined)?.authorId)
      ).toBe(true)
    })

    it('returns false when author id is missing', () => {
      expect(
        isAuthorOf(request({ resource: { type: 'Story', attributes: {} } }), () => undefined)
      ).toBe(false)
    })
  })

  describe('isAdmin', () => {
    it('returns true for Admin role', () => {
      expect(isAdmin(request({ requester: adminRequester }))).toBe(true)
    })

    it('returns true for SuperAdmin role', () => {
      expect(isAdmin(request({ requester: superAdminRequester }))).toBe(true)
    })

    it('returns false for other roles', () => {
      expect(isAdmin(request())).toBe(false)
    })

    it('returns false when requester is null', () => {
      expect(isAdmin(request({ requester: null }))).toBe(false)
    })
  })

  describe('isSuperAdmin', () => {
    it('returns true only for SuperAdmin role', () => {
      expect(isSuperAdmin(request({ requester: superAdminRequester }))).toBe(true)
      expect(isSuperAdmin(request({ requester: adminRequester }))).toBe(false)
    })

    it('returns false when requester is null', () => {
      expect(isSuperAdmin(request({ requester: null }))).toBe(false)
    })
  })

  describe('isSelf', () => {
    it('returns true when resource id matches requester id', () => {
      expect(isSelf(request({ resource: { type: 'User', id: 'user-1' } }))).toBe(true)
    })

    it('returns false when ids differ', () => {
      expect(isSelf(request({ resource: { type: 'User', id: 'other-user' } }))).toBe(false)
    })
  })

  describe('hasRole', () => {
    it('returns true when role is present', () => {
      expect(hasRole(request(), UserRoleEnum.Viewer)).toBe(true)
    })

    it('returns false when role is absent', () => {
      expect(hasRole(request(), UserRoleEnum.Admin)).toBe(false)
    })
  })

  describe('requesterDisplayName', () => {
    it('returns the requester name when logged in', () => {
      expect(requesterDisplayName(request())).toBe('Alice')
    })

    it('returns undefined for anonymous callers', () => {
      expect(requesterDisplayName(request({ requester: null }))).toBeUndefined()
    })
  })
})

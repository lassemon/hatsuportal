import { VisibilityEnum } from '@hatsuportal/common'
import { AuthorizationError } from '@hatsuportal/common-bounded-context'
import { Story } from '@hatsuportal/post-management'
import { User } from '@hatsuportal/user-management'

export interface IAuthorizationService {
  canCreateStory(user: User): AuthorizationResult
  canUpdateStory(user: User, story: Story): AuthorizationResult
  canDeleteStory(user: User, story: Story): AuthorizationResult
  canViewStory(user: User, story: Story): AuthorizationResult
  canCreateImage(user: User): AuthorizationResult
  canCreateUser(user: User): AuthorizationResult
  canDeactivateUser(user: User): AuthorizationResult
}

export interface AuthorizationResult {
  isAuthorized: boolean
  reason?: string
}

export class AuthorizationService implements IAuthorizationService {
  canCreateStory(user: User): AuthorizationResult {
    if (!user) {
      return { isAuthorized: false, reason: 'User not found.' }
    }

    if (!user.active) {
      return { isAuthorized: false, reason: `${user.name.value} is not active.` }
    }

    if (!user.isCreator()) {
      return { isAuthorized: false, reason: `${user.name.value} does not have proper role to create a new story.` }
    }
    return { isAuthorized: true }
  }

  canUpdateStory(user: User, story: Story): AuthorizationResult {
    if (story.createdById.value !== user.id.value) {
      return { isAuthorized: false, reason: `Cannot update story that is not created by you.` }
    }

    return { isAuthorized: true }
  }

  canDeleteStory(user: User, story: Story): AuthorizationResult {
    if (story.createdById.value !== user.id.value && !user.isAdmin())
      throw new AuthorizationError('Cannot delete a story that is not created by you.')

    if (!user.isAdmin()) {
      return { isAuthorized: false, reason: 'Not authorized to delete a story.' }
    }

    return { isAuthorized: true }
  }

  canViewStory(user: User, story: Story): AuthorizationResult {
    if (story.visibility.value === VisibilityEnum.Private && story.createdById.value !== user.id.value) {
      return { isAuthorized: false, reason: `${user.name.value} is not the creator of this private story.` }
    }

    return { isAuthorized: true }
  }

  canCreateImage(user: User): AuthorizationResult {
    if (!user.isCreator()) {
      return { isAuthorized: false, reason: `${user.name.value} does not have proper role to create a new image.` }
    }
    return { isAuthorized: true }
  }

  canCreateUser(user: User): AuthorizationResult {
    if (!user.isAdmin()) {
      return { isAuthorized: false, reason: `${user.name.value} does not have proper role to create a new user.` }
    }
    return { isAuthorized: true }
  }

  canDeactivateUser(user: User): AuthorizationResult {
    if (!user.isAdmin()) {
      return { isAuthorized: false, reason: `${user.name.value} does not have proper role to deactivate a user.` }
    }
    return { isAuthorized: true }
  }
}

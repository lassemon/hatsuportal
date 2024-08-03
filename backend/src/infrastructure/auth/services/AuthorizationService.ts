import { VisibilityEnum } from '@hatsuportal/common'
import { AuthorizationError, Image } from '@hatsuportal/common-bounded-context'
import { SearchStoriesInputDTO, Story } from '@hatsuportal/post-management'
import { User } from '@hatsuportal/user-management'
import { IAuthorizationService, AuthorizationResult } from '/application/services/IAuthorizationService'
import isEmpty from 'lodash/isEmpty'

export class AuthorizationService implements IAuthorizationService {
  // ───────────────────────────────────────────────────────────────────
  // Story authorization
  // ───────────────────────────────────────────────────────────────────
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

  canRemoveImageFromStory(user: User, story: Story): AuthorizationResult {
    if (!story.createdById.equals(user.id) && !user.isAdmin())
      throw new AuthorizationError('Cannot remove an image from a story that is not yours.')

    return { isAuthorized: true }
  }

  canViewStory(user: User | null, story: Story): AuthorizationResult {
    if (!user && story.visibility.equals(VisibilityEnum.LoggedIn)) {
      return { isAuthorized: false, reason: 'Cannot view a logged in story without being logged in.' }
    }

    if (user && story.visibility.value === VisibilityEnum.Private && story.createdById.value !== user.id.value) {
      return { isAuthorized: false, reason: `${user?.name.value} is not the creator of this private story.` }
    }

    return { isAuthorized: true }
  }

  canSearchStories(user: User | null, searchCriteria: SearchStoriesInputDTO['searchCriteria']): AuthorizationResult {
    if (!user && !isEmpty(searchCriteria.visibility)) {
      return { isAuthorized: false, reason: 'Cannot filter by visibility if not logged in.' }
    }

    if (searchCriteria.onlyMyStories && !user) {
      return { isAuthorized: false, reason: 'Cannot filter by only my stories if not logged in.' }
    }

    return { isAuthorized: true }
  }

  // ───────────────────────────────────────────────────────────────────
  // Image authorization
  // ───────────────────────────────────────────────────────────────────
  canCreateImage(user: User): AuthorizationResult {
    if (!user.isCreator()) {
      return { isAuthorized: false, reason: `${user.name.value} does not have proper role to create a new image.` }
    }
    return { isAuthorized: true }
  }

  canUpdateImage(user: User, image: Image): AuthorizationResult {
    if (image.createdById.value !== user.id.value) {
      return { isAuthorized: false, reason: `Cannot update image that is not created by you.` }
    }
    return { isAuthorized: true }
  }

  // ───────────────────────────────────────────────────────────────────
  // User authorization
  // ───────────────────────────────────────────────────────────────────
  canCreateUser(user: User): AuthorizationResult {
    if (!user.isAdmin()) {
      return { isAuthorized: false, reason: `${user.name.value} does not have proper role to create a new user.` }
    }
    return { isAuthorized: true }
  }

  canUpdateUser(user: User, userToUpdate: User): AuthorizationResult {
    if (userToUpdate.id.value !== user.id.value && !user.isAdmin()) {
      return { isAuthorized: false, reason: `${user.name.value} does not have proper role to update a user.` }
    }
    if (!userToUpdate.active) {
      return { isAuthorized: false, reason: `${userToUpdate.name.value} is not active.` }
    }
    return { isAuthorized: true }
  }

  canDeactivateUser(user: User): AuthorizationResult {
    if (!user.isAdmin()) {
      return { isAuthorized: false, reason: `${user.name.value} does not have proper role to deactivate a user.` }
    }
    return { isAuthorized: true }
  }

  canViewUser(user: User, userToView: User): AuthorizationResult {
    if (userToView.id.value !== user.id.value && !user.isAdmin()) {
      return { isAuthorized: false, reason: `${user.name.value} does not have proper role to view a user.` }
    }
    if (!userToView.active) {
      return { isAuthorized: false, reason: `${userToView.name.value} is not active.` }
    }
    return { isAuthorized: true }
  }

  canListAllUsers(user: User): AuthorizationResult {
    if (!user.isAdmin()) {
      return { isAuthorized: false, reason: `${user.name.value} does not have proper role to list all users.` }
    }
    return { isAuthorized: true }
  }
}

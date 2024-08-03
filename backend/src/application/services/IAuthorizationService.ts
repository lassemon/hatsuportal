import { User } from '@hatsuportal/user-management'
import { Story } from '@hatsuportal/post-management'
import { Image } from '@hatsuportal/common-bounded-context'
import { SearchStoriesInputDTO } from '@hatsuportal/post-management/src/application/dtos/SearchStoriesInputDTO'

export interface IAuthorizationService {
  canCreateStory(user: User): AuthorizationResult
  canUpdateStory(user: User, story: Story): AuthorizationResult
  canDeleteStory(user: User, story: Story): AuthorizationResult
  canRemoveImageFromStory(user: User, story: Story): AuthorizationResult
  canViewStory(user: User | null, story: Story): AuthorizationResult
  canSearchStories(user: User | null, searchCriteria: SearchStoriesInputDTO['searchCriteria']): AuthorizationResult
  canCreateImage(user: User): AuthorizationResult
  canUpdateImage(user: User, image: Image): AuthorizationResult
  canCreateUser(user: User): AuthorizationResult
  canUpdateUser(user: User, userToUpdate: User): AuthorizationResult
  canDeactivateUser(user: User): AuthorizationResult
  canViewUser(user: User, userToView: User): AuthorizationResult
  canListAllUsers(user: User): AuthorizationResult
}

export interface AuthorizationResult {
  isAuthorized: boolean
  reason?: string
}

import { UserRoleEnum, VisibilityEnum } from '@hatsuportal/common'
import { defineRule, IAuthorizationRequest, Rule } from '@hatsuportal/platform'
import { StoryDTO, StorySearchCriteriaDTO } from '../../dtos'
import { isEmpty } from 'lodash'

export enum StoryAction {
  Create = 'story:create',
  Update = 'story:update',
  Delete = 'story:delete',
  RemoveImage = 'story:remove-image',
  View = 'story:view',
  Search = 'story:search'
}

export enum StoryResourceType {
  Story = 'Story',
  StorySearch = 'StorySearch'
}

export interface CreateStoryAuthorizationAttributes {}

export interface UpdateStoryAuthorizationAttributes {
  story: StoryDTO
}

export interface DeleteStoryAuthorizationAttributes {
  story: StoryDTO
}

export interface RemoveImageFromStoryAuthorizationAttributes {
  story: StoryDTO
}

export interface ViewStoryAuthorizationAttributes {
  story: StoryDTO
}

export interface SearchStoriesAuthorizationAttributes {
  searchCriteria: StorySearchCriteriaDTO
}

function isLoggedIn(req: IAuthorizationRequest): boolean {
  return !!req.requester
}
function isActive(req: IAuthorizationRequest): boolean {
  return req.requester?.attributes?.active === true
}
function isAdmin(req: IAuthorizationRequest): boolean {
  return (
    Array.isArray(req.requester?.roles) &&
    (req.requester!.roles.includes(UserRoleEnum.Admin) || req.requester!.roles.includes(UserRoleEnum.SuperAdmin))
  )
}
function hasRole(req: IAuthorizationRequest<{}>, role: string): boolean {
  return Array.isArray(req.requester?.roles) && req.requester!.roles.includes(role)
}
function isAuthor(req: IAuthorizationRequest<{ story: StoryDTO }>): boolean {
  const authorId = req.resource?.attributes?.story.createdById
  return !!authorId && req.requester?.userId === authorId
}
function visibilityOf(req: IAuthorizationRequest<{ story: StoryDTO }>): VisibilityEnum | undefined {
  return req.resource?.attributes?.story.visibility
}

const createStoryRule = defineRule<CreateStoryAuthorizationAttributes>()({
  action: StoryAction.Create,
  resourceType: StoryResourceType.Story,
  condition: (request) => {
    if (!isLoggedIn(request)) {
      return { allowed: false, reason: `User is not logged in.` }
    }
    if (!isActive(request)) {
      return { allowed: false, reason: `User ${request.requester?.name} is not active.` }
    }
    if (!hasRole(request, UserRoleEnum.Creator) && !isAdmin(request)) {
      return { allowed: false, reason: `User ${request.requester?.name} does not have proper role to create a new story.` }
    }
    return { allowed: true }
  }
})

const updateStoryRule = defineRule<UpdateStoryAuthorizationAttributes>()({
  action: StoryAction.Update,
  resourceType: StoryResourceType.Story,
  condition: (request) => {
    if (!isAuthor(request)) {
      return { allowed: false, reason: `Cannot update story that is not created by you.` }
    }
    return { allowed: true }
  }
})

const deleteStoryRule = defineRule<DeleteStoryAuthorizationAttributes>()({
  action: StoryAction.Delete,
  resourceType: StoryResourceType.Story,
  condition: (request) => {
    if (!isAuthor(request) && !isAdmin(request)) {
      return { allowed: false, reason: `Cannot delete story that is not created by you.` }
    }
    return { allowed: true }
  }
})

const removeImageFromStoryRule = defineRule<RemoveImageFromStoryAuthorizationAttributes>()({
  action: StoryAction.RemoveImage,
  resourceType: StoryResourceType.Story,
  condition: (request) => {
    if (!isAuthor(request) && !isAdmin(request)) {
      return { allowed: false, reason: `Cannot remove image from story that is not created by you.` }
    }
    return { allowed: true }
  }
})

const viewStoryRule = defineRule<ViewStoryAuthorizationAttributes>()({
  action: StoryAction.View,
  resourceType: StoryResourceType.Story,
  condition: (request) => {
    const visibility = visibilityOf(request)

    if (!isLoggedIn(request) && visibility === VisibilityEnum.LoggedIn) {
      return { allowed: false, reason: `Cannot view a logged in story without being logged in.` }
    }

    if (isLoggedIn(request) && visibility === VisibilityEnum.Private && !isAuthor(request)) {
      return { allowed: false, reason: `Cannot view a private story that is not created by you.` }
    }

    return { allowed: true }
  }
})

const searchStoriesRule = defineRule<SearchStoriesAuthorizationAttributes>()({
  action: StoryAction.Search,
  resourceType: StoryResourceType.StorySearch,
  condition: (request) => {
    if (!isLoggedIn(request) && !isEmpty(request.resource?.attributes?.searchCriteria.visibility)) {
      return { allowed: false, reason: 'Cannot filter by visibility if not logged in.' }
    }
    if (!isLoggedIn(request) && request.resource?.attributes?.searchCriteria.onlyMyStories === true) {
      return { allowed: false, reason: `Cannot filter by only my stories if not logged in.` }
    }

    return { allowed: true }
  }
})

export const storyRules: Rule[] = [
  createStoryRule,
  updateStoryRule,
  deleteStoryRule,
  removeImageFromStoryRule,
  viewStoryRule,
  searchStoriesRule
]

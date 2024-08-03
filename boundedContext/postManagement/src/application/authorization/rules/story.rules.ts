import { UserRoleEnum, VisibilityEnum } from '@hatsuportal/common'
import {
  defineRule,
  IAuthorizationRequest,
  isAdmin,
  isLoggedIn,
  hasRole,
  isAuthorOf,
  requireLoggedInActive,
  requireAuthorOrAdmin,
  requesterDisplayName,
  IRequester
} from '@hatsuportal/platform'
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

function storyFrom(authorizationRequest: IAuthorizationRequest): StoryDTO | undefined {
  const resourceAttributes = authorizationRequest.resource?.attributes as { story?: StoryDTO } | undefined
  return resourceAttributes?.story
}

function isStoryAuthor(authorizationRequest: IAuthorizationRequest): boolean {
  return isAuthorOf(
    authorizationRequest,
    (authorizationRequestForAuthorLookup) => storyFrom(authorizationRequestForAuthorLookup)?.createdById
  )
}

const createStoryRule = defineRule<CreateStoryAuthorizationAttributes>()({
  action: StoryAction.Create,
  resourceType: StoryResourceType.Story,
  condition: (request) => {
    const isNotLoggedInOrActiveDenial = requireLoggedInActive(request)
    if (isNotLoggedInOrActiveDenial) return isNotLoggedInOrActiveDenial
    if (!hasRole(request, UserRoleEnum.Creator) && !isAdmin(request)) {
      const requesterName = requesterDisplayName(request)
      return {
        allowed: false,
        reason: requesterName
          ? `User ${requesterName} does not have permission to create a story.`
          : 'Only users with the Creator role can create stories.'
      }
    }
    return { allowed: true }
  }
})

const updateStoryRule = defineRule<UpdateStoryAuthorizationAttributes>()({
  action: StoryAction.Update,
  resourceType: StoryResourceType.Story,
  condition: (request) => {
    const isNotLoggedInOrActiveDenial = requireLoggedInActive(request)
    if (isNotLoggedInOrActiveDenial) return isNotLoggedInOrActiveDenial
    if (!isStoryAuthor(request)) {
      return {
        allowed: false,
        reason: `User ${requesterDisplayName(request)} does not have permission to update this story.`
      }
    }
    return { allowed: true }
  }
})

const deleteStoryRule = defineRule<DeleteStoryAuthorizationAttributes>()({
  action: StoryAction.Delete,
  resourceType: StoryResourceType.Story,
  condition: (request) => {
    const requesterName = requesterDisplayName(request)
    const isNotAuthorOrAdminDenial = requireAuthorOrAdmin(
      request,
      isStoryAuthor,
      requesterName ? `User ${requesterName} does not have permission to delete this story.` : 'Only the author can delete a story.'
    )
    if (isNotAuthorOrAdminDenial) return isNotAuthorOrAdminDenial
    return { allowed: true }
  }
})

const removeImageFromStoryRule = defineRule<RemoveImageFromStoryAuthorizationAttributes>()({
  action: StoryAction.RemoveImage,
  resourceType: StoryResourceType.Story,
  condition: (request) => {
    const requesterName = requesterDisplayName(request)
    const isNotAuthorOrAdminDenial = requireAuthorOrAdmin(
      request,
      isStoryAuthor,
      requesterName
        ? `User ${requesterName} does not have permission to remove image from this story.`
        : 'Only the author can remove image from a story.'
    )
    if (isNotAuthorOrAdminDenial) return isNotAuthorOrAdminDenial
    return { allowed: true }
  }
})

const viewStoryRule = defineRule<ViewStoryAuthorizationAttributes>()({
  action: StoryAction.View,
  resourceType: StoryResourceType.Story,
  condition: (request) => {
    const visibility = storyFrom(request)?.visibility

    if (!isLoggedIn(request) && visibility === VisibilityEnum.LoggedIn) {
      return { allowed: false, reason: `User is not logged in. Cannot view a story that requires login.` }
    }

    if (isLoggedIn(request) && visibility === VisibilityEnum.Private && !isStoryAuthor(request)) {
      const requesterName = requesterDisplayName(request)
      return {
        allowed: false,
        reason: requesterName
          ? `User ${requesterName} does not have permission to view this private story.`
          : 'Only the author can view a private story.'
      }
    }

    return { allowed: true }
  }
})

const searchStoriesRule = defineRule<SearchStoriesAuthorizationAttributes>()({
  action: StoryAction.Search,
  resourceType: StoryResourceType.StorySearch,
  condition: (request) => {
    if (!isLoggedIn(request) && !isEmpty(request.resource?.attributes?.searchCriteria.visibility)) {
      return { allowed: false, reason: 'User is not logged in. Cannot filter by visibility.' }
    }
    if (!isLoggedIn(request) && request.resource?.attributes?.searchCriteria.onlyMyStories === true) {
      return { allowed: false, reason: 'User is not logged in. Cannot filter by only my stories.' }
    }

    return { allowed: true }
  }
})

export const storyRuleMap = {
  [StoryAction.Create]: createStoryRule,
  [StoryAction.Update]: updateStoryRule,
  [StoryAction.Delete]: deleteStoryRule,
  [StoryAction.RemoveImage]: removeImageFromStoryRule,
  [StoryAction.View]: viewStoryRule,
  [StoryAction.Search]: searchStoriesRule
}

export interface StoryAuthorizationPayloadMap {
  [StoryAction.Create]: undefined // No payload
  [StoryAction.Update]: { story: StoryDTO }
  [StoryAction.Delete]: { story: StoryDTO }
  [StoryAction.RemoveImage]: { story: StoryDTO }
  [StoryAction.View]: { story: StoryDTO }
  [StoryAction.Search]: { searchCriteria: StorySearchCriteriaDTO }
}

export const storyRequestBuilderMap = {
  [StoryAction.Create]: (requester: IRequester | null) => ({
    requester,
    action: StoryAction.Create,
    resource: { type: StoryResourceType.Story }
  }),
  [StoryAction.Update]: (requester: IRequester | null, payload: { story: StoryDTO }) => ({
    requester,
    action: StoryAction.Update,
    resource: { type: StoryResourceType.Story, id: payload.story.id, attributes: { story: payload.story } }
  }),
  [StoryAction.Delete]: (requester: IRequester | null, payload: { story: StoryDTO }) => ({
    requester,
    action: StoryAction.Delete,
    resource: { type: StoryResourceType.Story, id: payload.story.id, attributes: { story: payload.story } }
  }),
  [StoryAction.RemoveImage]: (requester: IRequester | null, payload: { story: StoryDTO }) => ({
    requester,
    action: StoryAction.RemoveImage,
    resource: { type: StoryResourceType.Story, id: payload.story.id, attributes: { story: payload.story } }
  }),
  [StoryAction.View]: (requester: IRequester | null, payload: { story: StoryDTO }) => ({
    requester,
    action: StoryAction.View,
    resource: { type: StoryResourceType.Story, id: payload.story.id, attributes: { story: payload.story } }
  }),
  [StoryAction.Search]: (requester: IRequester | null, payload: { searchCriteria: StorySearchCriteriaDTO }) => ({
    requester,
    action: StoryAction.Search,
    resource: { type: StoryResourceType.StorySearch, attributes: { searchCriteria: payload.searchCriteria } }
  })
}

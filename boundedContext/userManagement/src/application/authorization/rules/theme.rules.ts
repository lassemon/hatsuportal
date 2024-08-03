import { defineRule, isAdmin, requireLoggedInActive, requesterDisplayName, IRequester } from '@hatsuportal/platform'
import { ThemeDTO } from '../../dtos/theme/ThemeDTO'

export enum ThemeAction {
  List = 'theme:list',
  Create = 'theme:create',
  Update = 'theme:update',
  Delete = 'theme:delete'
}

export enum ThemeResourceType {
  Theme = 'Theme'
}

export interface ListThemesAuthorizationAttributes {}

export interface CreateThemeAuthorizationAttributes {}

export interface UpdateThemeAuthorizationAttributes {
  theme: ThemeDTO
}

export interface DeleteThemeAuthorizationAttributes {
  theme: ThemeDTO
}

const listThemesRule = defineRule<ListThemesAuthorizationAttributes>()({
  action: ThemeAction.List,
  resourceType: ThemeResourceType.Theme,
  condition: (request) => {
    const isNotLoggedInOrActiveDenial = requireLoggedInActive(request)
    if (isNotLoggedInOrActiveDenial) return isNotLoggedInOrActiveDenial
    return { allowed: true }
  }
})

const createThemeRule = defineRule<CreateThemeAuthorizationAttributes>()({
  action: ThemeAction.Create,
  resourceType: ThemeResourceType.Theme,
  condition: (request) => {
    const isNotLoggedInOrActiveDenial = requireLoggedInActive(request)
    if (isNotLoggedInOrActiveDenial) return isNotLoggedInOrActiveDenial
    if (!isAdmin(request)) {
      return {
        allowed: false,
        reason: `User ${requesterDisplayName(request)} does not have permission to create a theme.`
      }
    }
    return { allowed: true }
  }
})

const updateThemeRule = defineRule<UpdateThemeAuthorizationAttributes>()({
  action: ThemeAction.Update,
  resourceType: ThemeResourceType.Theme,
  condition: (request) => {
    const isNotLoggedInOrActiveDenial = requireLoggedInActive(request)
    if (isNotLoggedInOrActiveDenial) return isNotLoggedInOrActiveDenial
    if (!isAdmin(request)) {
      return {
        allowed: false,
        reason: `User ${requesterDisplayName(request)} does not have permission to update theme ${request.resource?.id}.`
      }
    }
    return { allowed: true }
  }
})

const deleteThemeRule = defineRule<DeleteThemeAuthorizationAttributes>()({
  action: ThemeAction.Delete,
  resourceType: ThemeResourceType.Theme,
  condition: (request) => {
    const isNotLoggedInOrActiveDenial = requireLoggedInActive(request)
    if (isNotLoggedInOrActiveDenial) return isNotLoggedInOrActiveDenial
    if (!isAdmin(request)) {
      return {
        allowed: false,
        reason: `User ${requesterDisplayName(request)} does not have permission to delete theme ${request.resource?.id}.`
      }
    }
    return { allowed: true }
  }
})

export const themeRuleMap = {
  [ThemeAction.List]: listThemesRule,
  [ThemeAction.Create]: createThemeRule,
  [ThemeAction.Update]: updateThemeRule,
  [ThemeAction.Delete]: deleteThemeRule
}

export interface ThemeAuthorizationPayloadMap {
  [ThemeAction.List]: undefined
  [ThemeAction.Create]: undefined
  [ThemeAction.Update]: { theme: ThemeDTO }
  [ThemeAction.Delete]: { theme: ThemeDTO }
}

export const themeRequestBuilderMap = {
  [ThemeAction.List]: (requester: IRequester | null) => ({
    requester,
    action: ThemeAction.List,
    resource: { type: ThemeResourceType.Theme }
  }),
  [ThemeAction.Create]: (requester: IRequester | null) => ({
    requester,
    action: ThemeAction.Create,
    resource: { type: ThemeResourceType.Theme }
  }),
  [ThemeAction.Update]: (requester: IRequester | null, payload: { theme: ThemeDTO }) => ({
    requester,
    action: ThemeAction.Update,
    resource: { type: ThemeResourceType.Theme, id: payload.theme.id, attributes: { theme: payload.theme } }
  }),
  [ThemeAction.Delete]: (requester: IRequester | null, payload: { theme: ThemeDTO }) => ({
    requester,
    action: ThemeAction.Delete,
    resource: { type: ThemeResourceType.Theme, id: payload.theme.id, attributes: { theme: payload.theme } }
  })
}

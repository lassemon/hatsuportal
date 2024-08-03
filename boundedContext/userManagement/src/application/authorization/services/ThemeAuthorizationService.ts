import { AuthorizationServiceBase, IAuthorizationDecision, IUserForAuthorization } from '@hatsuportal/platform'
import { ThemeAction, ThemeAuthorizationPayloadMap } from '../rules/theme.rules'
import { ThemeDTO } from '../../dtos/theme/ThemeDTO'

export interface IThemeAuthorizationService {
  canListThemes(user: IUserForAuthorization): IAuthorizationDecision
  canCreateTheme(user: IUserForAuthorization): IAuthorizationDecision
  canUpdateTheme(user: IUserForAuthorization, theme: ThemeDTO): IAuthorizationDecision
  canDeleteTheme(user: IUserForAuthorization, theme: ThemeDTO): IAuthorizationDecision
}

export class ThemeAuthorizationService
  extends AuthorizationServiceBase<ThemeAction, ThemeAuthorizationPayloadMap>
  implements IThemeAuthorizationService
{
  canListThemes(user: IUserForAuthorization) {
    return this.authorize(ThemeAction.List, user)
  }

  canCreateTheme(user: IUserForAuthorization) {
    return this.authorize(ThemeAction.Create, user)
  }

  canUpdateTheme(user: IUserForAuthorization, theme: ThemeDTO) {
    return this.authorize(ThemeAction.Update, user, { theme })
  }

  canDeleteTheme(user: IUserForAuthorization, theme: ThemeDTO) {
    return this.authorize(ThemeAction.Delete, user, { theme })
  }
}

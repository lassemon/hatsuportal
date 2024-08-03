import { IAuthService, ISessionExpiredNotifier } from 'application/interfaces'

export interface IAuthServiceContext {
  authService: IAuthService
  sessionExpiredNotifier: ISessionExpiredNotifier
}

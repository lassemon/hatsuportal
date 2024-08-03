import { IAuthorizationDecision, IAuthorizationRequest } from './types'

export interface Rule<Attrs = unknown> {
  readonly action: string | RegExp
  readonly resourceType?: string
  condition(req: IAuthorizationRequest<Attrs>): IAuthorizationDecision
}

export const defineRule =
  <Attrs = unknown>() =>
  (r: {
    readonly action: string | RegExp
    readonly resourceType?: string
    readonly reason?: string
    condition(req: IAuthorizationRequest<Attrs>): IAuthorizationDecision
  }): Rule<Attrs> =>
    r

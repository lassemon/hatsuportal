export interface IRequesterAttributes extends Record<string, unknown> {
  active: boolean
}

export interface IRequester {
  readonly userId: string
  readonly name: string
  readonly roles: string[]
  readonly attributes?: IRequesterAttributes
}

export interface IResourceDescriptor<ResourceAttributes = unknown> {
  readonly type: string // e.g., 'Story', kept as string
  readonly id?: string
  readonly attributes?: ResourceAttributes
}

export interface IAuthorizationRequest<ResourceAttributes = unknown> {
  readonly requester: IRequester | null
  readonly action: string // e.g., 'story:update'
  readonly resource?: IResourceDescriptor<ResourceAttributes> | null
  readonly context?: Record<string, unknown>
}

export interface IAuthorizationDecision {
  readonly allowed: boolean
  readonly reason?: string
}

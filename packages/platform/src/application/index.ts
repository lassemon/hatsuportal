export { UseCaseWithValidation } from './useCases/UseCaseWithValidation'
export type { IUseCase, IUseCaseOptions } from './useCases/IUseCase'

export { ErrorHandlingUseCaseDecorator } from './decorators/ErrorHandlingUseCaseDecorator'

export { createAbacEngine } from './accessControl/abac/engine'
export type { IAuthorizationEngine } from './accessControl/abac/engine'
export { type Rule, defineRule } from './accessControl/abac/rule'
export type { IAuthorizationRequest, IAuthorizationDecision, IRequester, IResourceDescriptor } from './accessControl/abac/types'
export { UserToRequesterMapper, type IUserToRequesterMapper } from './accessControl/abac/mappers/UserToRequesterMapper'

export { default as ApplicationError } from './errors/ApplicationError'
export { default as AuthenticationError } from './errors/AuthenticationError'
export { default as AuthorizationError } from './errors/AuthorizationError'
export { default as ForbiddenError } from './errors/ForbiddenError'
export { default as NotFoundError } from './errors/NotFoundError'
export { default as NotImplementedError } from './errors/NotImplementedError'
export { default as InvalidInputError } from './errors/InvalidInputError'

export type { IHttpErrorMapper } from './dataAccess/http/IHttpErrorMapper'

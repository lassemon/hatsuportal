export { UseCaseWithValidation } from './useCases/UseCaseWithValidation'
export type { IUseCase, IUseCaseOptions } from './useCases/IUseCase'

export { ErrorHandlingUseCaseDecorator } from './decorators/ErrorHandlingUseCaseDecorator'

export { AbacEngine } from './accessControl/abac/engine'
export type { IAuthorizationEngine, AuthorizationPayloadMap, RequestBuilderMap } from './accessControl/abac/engine'
export {
  isLoggedIn,
  isActive,
  isAdmin,
  isSuperAdmin,
  isSelf,
  hasRole,
  requireLoggedInActive,
  isAuthorOf,
  requireAuthorOrAdmin,
  requesterDisplayName
} from './accessControl/predicates'
export { type Rule, defineRule } from './accessControl/abac/rule'
export type { IAuthorizationRequest, IAuthorizationDecision, IRequester, IResourceDescriptor } from './accessControl/abac/types'
export {
  UserToRequesterMapper,
  type IUserToRequesterMapper,
  type IUserForAuthorization
} from './accessControl/abac/mappers/UserToRequesterMapper'
export { AuthorizationServiceBase } from './accessControl/AuthorizationServiceBase'

export { default as ApplicationError } from './errors/ApplicationError'
export { default as AuthenticationError } from './errors/AuthenticationError'
export { default as AuthorizationError } from './errors/AuthorizationError'
export { default as NotFoundError } from './errors/NotFoundError'
export { default as NotImplementedError } from './errors/NotImplementedError'
export { default as InvalidInputError } from './errors/InvalidInputError'
export { default as ConflictError } from './errors/ConflictError'

export type { IHttpErrorMapper } from './dataAccess/http/IHttpErrorMapper'

export type { IDomainEventService } from './services/IDomainEventService'

export { EntityLoadResult } from './dataAccess/outcomes/EntityLoadResult'
export { EntityLoadError } from './dataAccess/errors/EntityLoadError'
export { EntityLoadErrorDTO } from './dtos/EntityLoadErrorDTO'

export type { ICache } from './cache/ICache'

export type { ITransaction } from './dataAccess/ITransaction'
export type { IUnitOfWork } from './dataAccess/IUnitOfWork'
export type { IDataConnectionProvider } from './dataAccess/IDataConnectionProvider'
export type { ITransactionContext, ITransactionScope, RollbackCallback } from './dataAccess/ITransactionContext'
export type { IDataAccessProvider } from './dataAccess/IDataAccessProvider'
export type { IQueryBuilder } from './dataAccess/IQueryBuilder'
export type { IRawQueryBuilder } from './dataAccess/IRawQueryBuilder'
export type { IAdvisoryLock } from './dataAccess/IAdvisoryLock'

export type { IRepositoryHelpers } from './repositories/IRepositoryHelpers'
export type { IDomainEventRepository } from './repositories/IDomainEventRepository'

export type { ICronJob } from './cron/ICronJob'

export type { IDomainEventInfrastructureMapper } from './mappers/IDomainEventInfrastructureMapper'

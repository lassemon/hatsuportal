import { TTLCache } from '@hatsuportal/platform'
import { AbacEngine, UserToRequesterMapper } from '@hatsuportal/platform'
import { vi } from 'vitest'
import { User } from '../../../domain'
import { UserReadModelDTO } from '../../../application/dtos/user/UserReadModelDTO'
import { PasswordFactory } from '../../../application/authentication/PasswordFactory'
import { StrictPasswordPolicy } from '../../../infrastructure/authentication/StrictPasswordPolicy'
import { UserAuthenticationService } from '../../../infrastructure/services/UserAuthenticationService'
import { UserApplicationMapper } from '../../../application/mappers/UserApplicationMapper'
import { UserAuthorizationService } from '../../../application/authorization/services/UserAuthorizationService'
import {
  UserAction,
  UserAuthorizationPayloadMap,
  userRequestBuilderMap,
  userRuleMap
} from '../../../application/authorization/rules/user.rules'
import { CreateUserUseCase } from '../../../application/useCases/user/CreateUserUseCase/CreateUserUseCase'
import { UpdateUserUseCase } from '../../../application/useCases/user/UpdateUserUseCase/UpdateUserUseCase'
import { DeactivateUserUseCase } from '../../../application/useCases/user/DeactivateUserUseCase/DeactivateUserUseCase'
import { FindUserUseCase } from '../../../application/useCases/user/FindUserUseCase/FindUserUseCase'
import { GetAllUsersUseCase } from '../../../application/useCases/user/GetAllUsersUseCase/GetAllUsersUseCase'
import { GetAllUsersUseCaseWithValidation } from '../../../application/useCases/user/GetAllUsersUseCase/GetAllUsersUseCaseWithValidation'
import { LoginUserUseCase } from '../../../application/useCases/auth/LoginUserUseCase/LoginUserUseCase'
import { UserLookupService } from '../../../application/services/UserLookupService'
import { ITokenService } from '../../../application/services/ITokenService'
import { UserWriteRepository } from '../../../infrastructure/repositories/UserWriteRepository'
import { UserWriteRepositoryWithCache } from '../../../infrastructure/repositories/UserWriteRepositoryWithCache'
import { UserReadRepository } from '../../../infrastructure/repositories/UserReadRepository'
import { UserReadRepositoryWithCache } from '../../../infrastructure/repositories/UserReadRepositoryWithCache'
import { UserInfrastructureMapper } from '../../../infrastructure/mappers/UserInfrastructureMapper'
import { PersistenceHarness } from '../persistence/PersistenceHarness'

export function createSystemWiring(persistenceHarness: PersistenceHarness) {
  const userApplicationMapper = new UserApplicationMapper()
  const userWriteRepo = new UserWriteRepository(
    persistenceHarness.dataAccessProvider,
    persistenceHarness.repositoryHelpers,
    persistenceHarness.transactionContext,
    new UserInfrastructureMapper()
  )
  const userWriteRepositoryCache = new TTLCache<User>({ ttlSeconds: 60 })
  const userWriteRepository = new UserWriteRepositoryWithCache(userWriteRepo, userWriteRepositoryCache)

  const userReadRepo = new UserReadRepository(
    persistenceHarness.dataAccessProvider,
    persistenceHarness.repositoryHelpers,
    persistenceHarness.transactionContext,
    new UserInfrastructureMapper()
  )
  const userReadRepositoryCache = new TTLCache<UserReadModelDTO>({ ttlSeconds: 60 })
  const userReadRepository = new UserReadRepositoryWithCache(userReadRepo, userReadRepositoryCache)

  const userLookupService = new UserLookupService(userReadRepository)
  const passwordFactory = new PasswordFactory(new StrictPasswordPolicy())
  const userAuthenticationService = new UserAuthenticationService(userWriteRepository, passwordFactory)
  const unitOfWork = persistenceHarness.createUnitOfWork()
  const authorizationService = new UserAuthorizationService(
    new UserToRequesterMapper(),
    new AbacEngine<UserAction, UserAuthorizationPayloadMap>(userRuleMap, userRequestBuilderMap)
  )
  const innerGetAllUsersUseCase = new GetAllUsersUseCase(userReadRepository, userApplicationMapper)

  const tokenService: ITokenService = {
    createAuthToken: vi.fn().mockReturnValue('test-auth-token'),
    createRefreshToken: vi.fn().mockReturnValue('test-refresh-token'),
    verifyRefreshToken: vi.fn()
  }

  return {
    persistenceHarness,
    userWriteRepository,
    userReadRepository,
    userLookupService,
    passwordFactory,
    unitOfWork,
    tokenService,
    userApplicationMapper,
    clearRepositoryCache: () => {
      userWriteRepositoryCache.invalidateByPrefix('findById:')
      userWriteRepositoryCache.invalidateByPrefix('findByName:')
      userReadRepositoryCache.invalidateByPrefix('findById:')
    },
    createCreateUserUseCase: () =>
      new CreateUserUseCase(userWriteRepository, userLookupService, userApplicationMapper, unitOfWork, passwordFactory),
    createUpdateUserUseCase: () =>
      new UpdateUserUseCase(
        userWriteRepository,
        userLookupService,
        userApplicationMapper,
        userAuthenticationService,
        passwordFactory,
        unitOfWork
      ),
    createDeactivateUserUseCase: () => new DeactivateUserUseCase(userWriteRepository, userLookupService, userApplicationMapper, unitOfWork),
    createFindUserUseCase: () => new FindUserUseCase(userReadRepository, userApplicationMapper),
    createLoginUserUseCase: () => new LoginUserUseCase(userApplicationMapper, userWriteRepository, tokenService),
    getAllUsersUseCase: innerGetAllUsersUseCase,
    createGetAllUsersUseCaseWithValidation: () =>
      new GetAllUsersUseCaseWithValidation(innerGetAllUsersUseCase, userReadRepository, authorizationService)
  }
}

import {
  DomainEventInfrastructureMapper,
  DomainEventRepository,
  DomainEventService,
  NodeAsyncLocalTransactionContext
} from '@hatsuportal/platform'
import {
  TagInfrastructureMapper,
  TagRepository
} from '@hatsuportal/post-management'
import {
  Password,
  UserInfrastructureMapper,
  UserWriteRepository
} from '@hatsuportal/user-management'
import Connection from '../../../infrastructure/dataAccess/database/connection'
import { KnexDataAccessProvider } from '../../../infrastructure/dataAccess/adapters/KnexDataAccessProvider'
import { PostgresRepositoryHelpers } from '../../../infrastructure/repositories/PostgresRepositoryHelpers'
import { UnitOfWork } from '../../../infrastructure/dataAccess/database/UnitOfWork'

export function createIntegrationWiring() {
  const transactionContext = new NodeAsyncLocalTransactionContext()
  const knex = Connection.getConnection()
  const dataAccessProvider = new KnexDataAccessProvider(knex)
  const helpers = new PostgresRepositoryHelpers()
  const domainEventRepository = new DomainEventRepository(
    dataAccessProvider,
    helpers,
    transactionContext,
    new DomainEventInfrastructureMapper()
  )
  const domainEventService = new DomainEventService(domainEventRepository)
  const unitOfWork = new UnitOfWork(domainEventService, Connection, transactionContext)
  const tagRepository = new TagRepository(
    dataAccessProvider,
    helpers,
    transactionContext,
    new TagInfrastructureMapper()
  )
  const userWriteRepository = new UserWriteRepository(
    dataAccessProvider,
    helpers,
    transactionContext,
    new UserInfrastructureMapper()
  )

  return {
    unitOfWork,
    tagRepository,
    userWriteRepository,
    domainEventRepository,
    dataAccessProvider
  }
}

export type IntegrationWiring = ReturnType<typeof createIntegrationWiring>

export { Password, UserInfrastructureMapper, UserWriteRepository }

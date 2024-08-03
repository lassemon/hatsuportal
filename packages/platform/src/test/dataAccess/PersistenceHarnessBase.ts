import { Knex } from 'knex'
import {
  ConnectionError,
  DomainEventInfrastructureMapper,
  DomainEventRepository,
  DomainEventService,
  IDataAccessProvider,
  IDataConnectionProvider,
  IUnitOfWork,
  NodeAsyncLocalTransactionContext,
  type IDomainEventService,
  type ITransactionContext
} from '../../index'
import { DomainEventDatabaseSchema } from '../../infrastructure/schemas/DomainEventDatabaseSchema'
import { TestUnitOfWork } from './TestUnitOfWork'
import { TestKnexDataAccessProvider } from './adapters/knex/TestKnexDataAccessProvider'
import { TestConnection } from './adapters/knex/TestConnection'
import { TestPostgresRepositoryHelpers } from '../repositories/TestPostgresRepositoryHelpers'

export function wirePersistenceHarness(databaseUrl: string): {
  dataAccessProvider: IDataAccessProvider
  repositoryHelpers: TestPostgresRepositoryHelpers
  transactionContext: ITransactionContext
  domainEventService: IDomainEventService
  unitOfWork: IUnitOfWork
} {
  const knex: Knex = TestConnection.connect(databaseUrl)

  const connectionProvider: IDataConnectionProvider<Knex> = {
    getConnection: () => knex
  }
  const transactionContext = new NodeAsyncLocalTransactionContext()
  const dataAccessProvider = new TestKnexDataAccessProvider(knex)
  const repositoryHelpers = new TestPostgresRepositoryHelpers()

  const domainEventRepository = new DomainEventRepository(
    dataAccessProvider,
    repositoryHelpers,
    transactionContext,
    new DomainEventInfrastructureMapper()
  )
  const domainEventService = new DomainEventService(domainEventRepository)
  const unitOfWork = new TestUnitOfWork(domainEventService, connectionProvider, transactionContext)

  return {
    dataAccessProvider,
    repositoryHelpers,
    transactionContext,
    domainEventService,
    unitOfWork
  }
}

export abstract class PersistenceHarnessBase {
  readonly dataAccessProvider: IDataAccessProvider
  readonly repositoryHelpers: TestPostgresRepositoryHelpers
  readonly transactionContext: ITransactionContext
  readonly domainEventService: IDomainEventService

  private readonly unitOfWork: IUnitOfWork

  protected constructor(
    dataAccessProvider: IDataAccessProvider,
    repositoryHelpers: TestPostgresRepositoryHelpers,
    transactionContext: ITransactionContext,
    domainEventService: IDomainEventService,
    unitOfWork: IUnitOfWork
  ) {
    this.dataAccessProvider = dataAccessProvider
    this.repositoryHelpers = repositoryHelpers
    this.transactionContext = transactionContext
    this.domainEventService = domainEventService
    this.unitOfWork = unitOfWork
  }

  async clearTables(tableNames: readonly string[]): Promise<void> {
    for (const tableName of tableNames) {
      await this.dataAccessProvider.table(tableName).delete()
    }
  }

  createUnitOfWork(): IUnitOfWork {
    return this.unitOfWork
  }

  async findOutboxEventsForAggregate(aggregateId: string): Promise<DomainEventDatabaseSchema[]> {
    return await this.dataAccessProvider
      .table<DomainEventDatabaseSchema>('domain_event_outbox')
      .andWhereRaw("serialized_event_data::jsonb ->> 'id' = ?", [aggregateId])
  }

  static async assertReachable(databaseUrl: string): Promise<void> {
    const knex = TestConnection.connect(databaseUrl)
    try {
      await knex.raw('SELECT 1')
    } catch (error) {
      throw new ConnectionError({
        message: 'Test Postgres is not reachable. Start test-docker manually: docker compose -f test-docker/docker-compose.yml up -d',
        cause: error
      })
    }
  }
}

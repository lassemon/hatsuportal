import { DomainEvent, UnixTimestamp } from '@hatsuportal/shared-kernel'
import { RepositoryBase } from './RepositoryBase'
import {
  IDomainEventRepository,
  IDataAccessProvider,
  IRepositoryHelpers,
  ITransactionContext,
  IDomainEventInfrastructureMapper
} from '../../application'
import { DomainEventDatabaseSchema } from '../schemas/DomainEventDatabaseSchema'

export class DomainEventRepository extends RepositoryBase implements IDomainEventRepository {
  constructor(
    dataAccessProvider: IDataAccessProvider,
    helpers: IRepositoryHelpers,
    transactionContext: ITransactionContext,
    private readonly domainEventInfrastructureMapper: IDomainEventInfrastructureMapper
  ) {
    super(dataAccessProvider, helpers, transactionContext, 'domain_event_outbox')
  }

  async insert(domainEvent: DomainEvent): Promise<void> {
    const record = this.domainEventInfrastructureMapper.toInsertRecord(domainEvent)
    await this.table<DomainEventDatabaseSchema>().insert(record)
  }

  async findUnpublished(limit: number): Promise<DomainEventDatabaseSchema[]> {
    return await this.table<DomainEventDatabaseSchema>().where({ publishedOn: null }).limit(limit)
  }

  async markAsPublished(id: string, publishedOn: UnixTimestamp): Promise<void> {
    await this.table<DomainEventDatabaseSchema>().where({ id }).update({ publishedOn: publishedOn.value })
  }

  async deleteOlderThan(cutoffTimestamp: UnixTimestamp): Promise<number> {
    const deleted = await this.table<DomainEventDatabaseSchema>().where('occurredOn', '<', cutoffTimestamp.value).delete()
    return deleted.length
  }
}

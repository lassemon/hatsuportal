import {
  IDataAccessProvider,
  IDomainEventRepository,
  IRepositoryHelpers,
  ITransactionAware,
  DomainEventDatabaseSchema,
  RepositoryBase,
  IDomainEventInfrastructureMapper
} from '@hatsuportal/platform'
import { IDomainEvent, UnixTimestamp } from '@hatsuportal/shared-kernel'

export class DomainEventRepository extends RepositoryBase implements IDomainEventRepository, ITransactionAware {
  constructor(
    dataAccessProvider: IDataAccessProvider,
    helpers: IRepositoryHelpers,
    private readonly domainEventInfrastructureMapper: IDomainEventInfrastructureMapper
  ) {
    super(dataAccessProvider, helpers, 'domain_event_outbox')
  }

  async insert(domainEvent: IDomainEvent<UnixTimestamp>): Promise<void> {
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

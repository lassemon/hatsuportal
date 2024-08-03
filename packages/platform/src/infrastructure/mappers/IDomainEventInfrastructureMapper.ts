import { IDomainEvent, UnixTimestamp } from '@hatsuportal/shared-kernel'
import { DomainEventDatabaseSchema } from '../schemas/DomainEventDatabaseSchema'

export interface IDomainEventInfrastructureMapper {
  toInsertRecord(event: IDomainEvent<UnixTimestamp>): DomainEventDatabaseSchema
  toDomainEvent(databaseSchema: DomainEventDatabaseSchema): IDomainEvent<UnixTimestamp>
}

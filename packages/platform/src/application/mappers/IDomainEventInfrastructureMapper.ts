import { DomainEvent } from '@hatsuportal/shared-kernel'
import { DomainEventDatabaseSchema } from '../../infrastructure/schemas/DomainEventDatabaseSchema'

export interface IDomainEventInfrastructureMapper {
  toInsertRecord(event: DomainEvent): DomainEventDatabaseSchema
  toDomainEvent(databaseSchema: DomainEventDatabaseSchema): DomainEvent
}
